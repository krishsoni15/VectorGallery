import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/local_database.dart';

enum BackupStatus { idle, scanning, uploading, paused, completed, error }

class BackupEngine extends ChangeNotifier {
  static final BackupEngine _instance = BackupEngine._internal();
  factory BackupEngine() => _instance;
  BackupEngine._internal();

  final LocalDatabase _localDb = LocalDatabase();
  final ApiClient _apiClient = ApiClient();
  final Connectivity _connectivity = Connectivity();
  final ImagePicker _imagePicker = ImagePicker();

  BackupStatus status = BackupStatus.idle;
  int totalQueued = 0;
  int uploadedCount = 0;
  int duplicateCount = 0;
  int failedCount = 0;
  double progress = 0.0;
  String? currentUploadingFile;
  String? lastStatusMessage;
  String? lastErrorMessage;
  bool isPaused = false;
  bool wifiOnly = false;
  String activeUserEmail = '';

  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;

  void initialize({bool wifiOnlySetting = false, String? userEmail}) {
    wifiOnly = wifiOnlySetting;
    if (userEmail != null) {
      activeUserEmail = userEmail.trim().toLowerCase();
    }
    _connectivitySub ??= _connectivity.onConnectivityChanged.listen(_handleConnectivityChanged);
  }

  void setUserContext(String? email) {
    final nextEmail = (email ?? '').trim().toLowerCase();
    if (nextEmail != activeUserEmail) {
      activeUserEmail = nextEmail;
      status = BackupStatus.idle;
      uploadedCount = 0;
      duplicateCount = 0;
      failedCount = 0;
      progress = 0.0;
      currentUploadingFile = null;
      lastStatusMessage = null;
      lastErrorMessage = null;
      notifyListeners();
    }
  }

  void _handleConnectivityChanged(List<ConnectivityResult> results) {
    if (wifiOnly && !results.contains(ConnectivityResult.wifi)) {
      if (status == BackupStatus.uploading) {
        pauseBackup();
      }
    } else {
      if (isPaused && status == BackupStatus.paused) {
        resumeBackup();
      }
    }
  }

  /// Computes hex-encoded SHA-256 digest for arbitrary byte payloads.
  static String computeSha256Bytes(List<int> bytes) {
    return sha256.convert(bytes).toString();
  }

  /// Calculates capped exponential backoff interval in seconds for retry attempts.
  static int computeBackoffSeconds(int retryAttempt, {int maxSeconds = 60}) {
    if (retryAttempt <= 0) return 2;
    return min(maxSeconds, pow(2, retryAttempt).toInt() * 2);
  }

  /// Supported extensions for automatic device & folder scanning.
  static const Set<String> allowedExtensions = {
    'jpg', 'jpeg', 'png', 'webp', 'mp4', 'pdf', 'txt', 'docx', 'xlsx', 'json', 'csv', 'md'
  };

  Future<bool> _ensureAuthenticatedBeforeBackup() async {
    final token = await _apiClient.getAccessToken();
    if (token == null || token.isEmpty) {
      status = BackupStatus.error;
      lastErrorMessage = 'Sign in with your VectorGallery account in Settings before uploading.';
      lastStatusMessage = lastErrorMessage;
      notifyListeners();
      return false;
    }
    if (activeUserEmail.isEmpty) {
      final stored = await _apiClient.secureStorage.read(key: ApiClient.userEmailKey);
      if (stored != null && stored.isNotEmpty) {
        activeUserEmail = stored.trim().toLowerCase();
      }
    }
    return true;
  }

  // 1. Calculate SHA-256 of local file
  Future<String> computeFileHash(File file) async {
    final bytes = await file.readAsBytes();
    return computeSha256Bytes(bytes);
  }

  // 2. Scan and enqueue local media candidate
  Future<bool> enqueueCandidate(File file, String category) async {
    if (!await file.exists()) return false;

    final hash = await computeFileHash(file);
    final isUploaded = await _localDb.isHashUploaded(hash, userEmail: activeUserEmail);
    if (isUploaded) {
      duplicateCount++;
      return false;
    }

    final length = await file.length();
    await _localDb.enqueue(QueueItem(
      localPath: file.path,
      sha256Hash: hash,
      fileSize: length,
      category: category,
      status: QueueStatus.queued,
      createdAt: DateTime.now().toIso8601String(),
      userEmail: activeUserEmail,
    ));

    return true;
  }

  // 3. User Action: Pick and upload photos from Gallery
  Future<int> pickAndUploadPhotos() async {
    if (!await _ensureAuthenticatedBeforeBackup()) return -1;
    try {
      final List<XFile> images = await _imagePicker.pickMultiImage();
      if (images.isEmpty) return 0;

      status = BackupStatus.scanning;
      duplicateCount = 0;
      lastErrorMessage = null;
      lastStatusMessage = 'Selected ${images.length} photo(s). Checking deduplication...';
      notifyListeners();

      int enqueued = 0;
      for (final img in images) {
        final file = File(img.path);
        final category = img.path.toLowerCase().contains('screenshot') ? 'screenshots' : 'photos';
        final added = await enqueueCandidate(file, category);
        if (added) enqueued++;
      }

      lastStatusMessage = 'Queued $enqueued new photo(s) (${images.length - enqueued} local duplicate(s)).';
      notifyListeners();

      await startQueueProcessing();
      return enqueued;
    } catch (e) {
      status = BackupStatus.error;
      lastErrorMessage = 'Failed to pick photos: $e';
      lastStatusMessage = lastErrorMessage;
      notifyListeners();
      return 0;
    }
  }

  // 4. User Action: Pick and upload documents (PDF, DOCX, TXT, CSV, JSON, MD, XLSX)
  Future<int> pickAndUploadDocuments() async {
    if (!await _ensureAuthenticatedBeforeBackup()) return -1;
    try {
      final FilePickerResult? result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.any,
        withData: true,
      );

      if (result == null || result.files.isEmpty) return 0;

      status = BackupStatus.scanning;
      duplicateCount = 0;
      lastErrorMessage = null;
      lastStatusMessage = 'Selected ${result.files.length} document(s). Preparing queue...';
      notifyListeners();

      final tempDir = await getTemporaryDirectory();
      final pickedDir = Directory(p.join(tempDir.path, 'picked_docs'));
      if (!await pickedDir.exists()) {
        await pickedDir.create(recursive: true);
      }

      int enqueued = 0;
      for (final item in result.files) {
        File? candidate;
        if (item.path != null && item.path!.isNotEmpty) {
          final direct = File(item.path!);
          if (await direct.exists()) {
            candidate = direct;
          }
        }
        if (candidate == null && item.bytes != null && item.bytes!.isNotEmpty) {
          final safeName = item.name.replaceAll(RegExp(r'[\\/:*?"<>|]'), '_');
          final staged = File(p.join(pickedDir.path, '${DateTime.now().millisecondsSinceEpoch}_$safeName'));
          await staged.writeAsBytes(item.bytes!, flush: true);
          candidate = staged;
        }
        if (candidate == null) continue;
        final cat = inferCategory(candidate.path);
        final added = await enqueueCandidate(candidate, cat == 'other' ? 'documents' : cat);
        if (added) enqueued++;
      }

      if (enqueued == 0 && result.files.isNotEmpty) {
        status = BackupStatus.completed;
        lastStatusMessage = 'Selected file(s) already backed up or unreadable from provider.';
        notifyListeners();
        return 0;
      }

      lastStatusMessage = 'Queued $enqueued document(s) (${result.files.length - enqueued} skipped).';
      notifyListeners();

      await startQueueProcessing();
      return enqueued;
    } catch (e) {
      status = BackupStatus.error;
      lastErrorMessage = 'Failed to pick documents: $e';
      lastStatusMessage = lastErrorMessage;
      notifyListeners();
      return 0;
    }
  }

  // 4b. User Action: Pick any folder via Storage Access Framework and back up all contents
  Future<int> pickFolderAndBackup() async {
    if (!await _ensureAuthenticatedBeforeBackup()) return -1;
    try {
      final String? selectedDirectory = await FilePicker.platform.getDirectoryPath();
      if (selectedDirectory == null) return 0;
      return await backupFolder(selectedDirectory);
    } catch (e) {
      status = BackupStatus.error;
      lastErrorMessage = 'Folder selection notice: $e';
      lastStatusMessage = lastErrorMessage;
      notifyListeners();
      return 0;
    }
  }

  Future<int> backupFolder(String dirPath) async {
    if (!await _ensureAuthenticatedBeforeBackup()) return -1;
    status = BackupStatus.scanning;
    duplicateCount = 0;
    lastErrorMessage = null;
    lastStatusMessage = 'Scanning folder: $dirPath...';
    notifyListeners();

    final dir = Directory(dirPath);
    final foundFiles = <File>[];

    try {
      if (await dir.exists()) {
        final list = dir.listSync(recursive: true, followLinks: false);
        for (final entity in list) {
          if (entity is File) {
            final ext = entity.path.split('.').last.toLowerCase();
            if (allowedExtensions.contains(ext)) {
              foundFiles.add(entity);
              if (foundFiles.length >= 250) break;
            }
          }
        }
      }
    } catch (e) {
      status = BackupStatus.error;
      lastErrorMessage = 'Error scanning folder: $e';
      lastStatusMessage = lastErrorMessage;
      notifyListeners();
      return 0;
    }

    if (foundFiles.isEmpty) {
      status = BackupStatus.idle;
      lastStatusMessage = 'No compatible media or documents found in this folder.';
      notifyListeners();
      return 0;
    }

    lastStatusMessage = 'Found ${foundFiles.length} file(s). Enqueuing...';
    notifyListeners();

    int enqueued = 0;
    for (final file in foundFiles) {
      final cat = inferCategory(file.path);
      final added = await enqueueCandidate(file, cat);
      if (added) enqueued++;
    }

    lastStatusMessage = 'Queued $enqueued new file(s) from folder.';
    notifyListeners();

    await startQueueProcessing();
    return enqueued;
  }

  // 5. Automatic Device Scan: Scans standard Android media and download folders
  Future<int> scanAndBackupDevice() async {
    if (!await _ensureAuthenticatedBeforeBackup()) return -1;
    status = BackupStatus.scanning;
    duplicateCount = 0;
    lastErrorMessage = null;
    lastStatusMessage = 'Scanning device storage for photos and documents...';
    notifyListeners();

    final candidateDirs = [
      '/storage/emulated/0/DCIM/Camera',
      '/storage/emulated/0/DCIM/Screenshots',
      '/storage/emulated/0/DCIM',
      '/storage/emulated/0/Pictures',
      '/storage/emulated/0/Pictures/Screenshots',
      '/storage/emulated/0/Pictures/WhatsApp',
      '/storage/emulated/0/Download',
      '/storage/emulated/0/Documents',
      '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Images',
      '/storage/emulated/0/WhatsApp/Media/WhatsApp Images',
      '/sdcard/DCIM/Camera',
      '/sdcard/Pictures',
      '/sdcard/Download',
    ];

    final foundFiles = <File>[];

    for (final dirPath in candidateDirs) {
      final dir = Directory(dirPath);
      try {
        if (await dir.exists()) {
          final list = dir.listSync(recursive: false, followLinks: false);
          for (final entity in list) {
            if (entity is File) {
              final ext = entity.path.split('.').last.toLowerCase();
              if (allowedExtensions.contains(ext)) {
                foundFiles.add(entity);
                if (foundFiles.length >= 100) break;
              }
            }
          }
        }
      } catch (_) {}
      if (foundFiles.length >= 100) break;
    }

    if (foundFiles.isEmpty) {
      lastStatusMessage = 'Android Scoped Storage active — opening gallery picker...';
      notifyListeners();
      return await pickAndUploadPhotos();
    }

    lastStatusMessage = 'Found ${foundFiles.length} files. Checking cloud deduplication...';
    notifyListeners();

    int enqueued = 0;
    for (final file in foundFiles) {
      final cat = inferCategory(file.path);
      final added = await enqueueCandidate(file, cat);
      if (added) enqueued++;
    }

    lastStatusMessage = 'Queued $enqueued new files for cloud sync.';
    notifyListeners();

    await startQueueProcessing();
    return enqueued;
  }

  /// Syncs pending SHA-256 hashes against cloud `/api/v2/backup/sync` so items already
  /// uploaded via Web or previous installs are marked COMPLETED immediately.
  Future<Set<String>> _fetchExistingCloudHashes(List<QueueItem> pending) async {
    if (pending.isEmpty) return {};
    try {
      final res = await _apiClient.dio.post(
        '/api/v2/backup/sync',
        data: {
          'candidates': pending
              .map((p) => {'sha256_hash': p.sha256Hash, 'local_path': p.localPath})
              .toList(),
        },
      );
      final existingList = (res.data is Map ? res.data['existing_hashes'] : null) as List?;
      if (existingList == null) return {};
      return existingList.map((e) => e.toString()).toSet();
    } catch (_) {
      return {};
    }
  }

  /// Uploads a single file using direct pre-signed Supabase Storage when > 2.5MB
  /// (avoiding Vercel's 4.5MB JSON body limit) and falling back to base64 JSON otherwise.
  Future<void> _uploadFileBytes({
    required String fileName,
    required List<int> bytes,
    required String mimeType,
  }) async {
    if (bytes.length > 2.5 * 1024 * 1024) {
      try {
        final signRes = await _apiClient.dio.post(
          '/api/v2/files/signed-upload',
          data: {'filename': fileName},
        );
        final signMap = signRes.data is Map ? signRes.data as Map : {};
        if (signMap['directUpload'] == true &&
            signMap['signedUrl'] != null &&
            signMap['storageKey'] != null) {
          final rawDio = Dio(BaseOptions(
            connectTimeout: const Duration(seconds: 30),
            receiveTimeout: const Duration(seconds: 120),
          ));
          await rawDio.put(
            signMap['signedUrl'].toString(),
            data: Stream.fromIterable([bytes]),
            options: Options(
              headers: {
                'Content-Type': mimeType,
                'Content-Length': bytes.length,
                'x-upsert': 'true',
              },
            ),
          );
          await _apiClient.dio.post(
            '/api/v2/files/upload',
            data: {
              'filename': fileName,
              'mimeType': mimeType,
              'storageKey': signMap['storageKey'].toString(),
            },
          );
          return;
        }
      } catch (e) {
        if (e is DioException && e.response?.statusCode == 401) rethrow;
        if (bytes.length > 4 * 1024 * 1024) {
          rethrow;
        }
      }
    }

    final base64Payload = base64Encode(bytes);
    await _apiClient.dio.post(
      '/api/v2/files/upload',
      data: {
        'filename': fileName,
        'base64': base64Payload,
        'mimeType': mimeType,
      },
    );
  }

  // 6. Process the persistent upload queue with Cloud Hash Sync & Direct Uploads
  Future<void> startQueueProcessing({bool retryPreviousFailures = false}) async {
    if (status == BackupStatus.uploading || isPaused) return;
    if (!await _ensureAuthenticatedBeforeBackup()) return;

    if (retryPreviousFailures) {
      await _localDb.resetFailedForRetry(userEmail: activeUserEmail);
    }

    status = BackupStatus.uploading;
    uploadedCount = 0;
    failedCount = 0;
    progress = 0.0;
    lastErrorMessage = null;
    notifyListeners();

    try {
      while (!isPaused) {
        final pending = await _localDb.getPending(userEmail: activeUserEmail);
        if (pending.isEmpty) {
          status = BackupStatus.completed;
          lastStatusMessage = uploadedCount > 0
              ? 'Synced $uploadedCount file(s) to your VectorGallery vault!'
              : duplicateCount > 0
                  ? 'All selected files already synced ($duplicateCount duplicates skipped).'
                  : 'Vault is up to date.';
          currentUploadingFile = null;
          progress = 1.0;
          notifyListeners();
          break;
        }

        if (wifiOnly) {
          final conn = await _connectivity.checkConnectivity();
          if (!conn.contains(ConnectivityResult.wifi)) {
            status = BackupStatus.paused;
            lastStatusMessage = 'Backup paused: Waiting for Wi-Fi connection.';
            notifyListeners();
            break;
          }
        }

        final cloudHashes = await _fetchExistingCloudHashes(pending);
        final toUpload = <QueueItem>[];
        for (final item in pending) {
          if (cloudHashes.contains(item.sha256Hash)) {
            if (item.id != null) {
              await _localDb.updateStatus(item.id!, QueueStatus.completed);
            }
            duplicateCount++;
          } else {
            toUpload.add(item);
          }
        }

        if (toUpload.isEmpty) {
          continue;
        }

        totalQueued = toUpload.length;

        for (int i = 0; i < toUpload.length; i++) {
          if (isPaused) break;

          final item = toUpload[i];
          final file = File(item.localPath);
          final fileName = file.uri.pathSegments.isNotEmpty ? file.uri.pathSegments.last : 'file_${item.id}';

          if (!await file.exists()) {
            if (item.id != null) {
              await _localDb.updateStatus(item.id!, QueueStatus.failed, errorMessage: 'File removed from device');
            }
            failedCount++;
            continue;
          }

          currentUploadingFile = fileName;
          lastStatusMessage = 'Syncing ${i + 1} of ${toUpload.length}: $fileName';
          progress = i / toUpload.length;
          notifyListeners();

          bool uploaded = false;
          int retries = item.retryCount;

          while (!uploaded && retries < 2 && !isPaused) {
            try {
              final bytes = await file.readAsBytes();
              await _uploadFileBytes(
                fileName: fileName,
                bytes: bytes,
                mimeType: inferMimeType(file.path),
              );

              uploaded = true;
              uploadedCount++;
              if (item.id != null) {
                await _localDb.updateStatus(item.id!, QueueStatus.completed, errorMessage: null);
              }
              progress = (i + 1) / toUpload.length;
              notifyListeners();
            } on DioException catch (e) {
              final code = e.response?.statusCode ?? 0;
              final msg = ApiClient.extractErrorMessage(e);
              lastErrorMessage = msg;

              // Fail immediately on auth/client/schema errors instead of hanging UI with retries
              if (code == 401 || code == 403 || code == 400 || code == 413 || msg.contains('SETUP_ALL_IN_ONE')) {
                if (item.id != null) {
                  await _localDb.updateStatus(item.id!, QueueStatus.failed, errorMessage: msg, retryCount: 2);
                }
                failedCount++;
                status = BackupStatus.error;
                lastStatusMessage = msg;
                currentUploadingFile = null;
                notifyListeners();
                return;
              }

              retries++;
              if (item.id != null) {
                await _localDb.updateStatus(item.id!, QueueStatus.failed, errorMessage: msg, retryCount: retries);
              }
              if (retries >= 2) {
                failedCount++;
              } else {
                await Future.delayed(Duration(seconds: computeBackoffSeconds(retries, maxSeconds: 8)));
              }
            } catch (e) {
              final msg = ApiClient.extractErrorMessage(e);
              lastErrorMessage = msg;
              retries++;
              if (item.id != null) {
                await _localDb.updateStatus(item.id!, QueueStatus.failed, errorMessage: msg, retryCount: retries);
              }
              if (retries >= 2) {
                failedCount++;
              } else {
                await Future.delayed(const Duration(seconds: 2));
              }
            }
          }
        }
      }
    } catch (e) {
      status = BackupStatus.error;
      lastErrorMessage = ApiClient.extractErrorMessage(e);
      lastStatusMessage = 'Sync error: $lastErrorMessage';
      notifyListeners();
    } finally {
      if (!isPaused && status != BackupStatus.error) {
        if (failedCount > 0 && uploadedCount == 0) {
          status = BackupStatus.error;
          lastStatusMessage = lastErrorMessage ?? 'Upload failed for $failedCount file(s).';
        } else {
          status = BackupStatus.completed;
          lastStatusMessage = failedCount > 0
              ? 'Synced $uploadedCount file(s), $failedCount failed: ${lastErrorMessage ?? ''}'
              : 'Synced $uploadedCount file(s) successfully!';
        }
        currentUploadingFile = null;
        progress = 1.0;
        notifyListeners();
      }
    }
  }

  void pauseBackup() {
    isPaused = true;
    status = BackupStatus.paused;
    lastStatusMessage = 'Backup paused.';
    notifyListeners();
  }

  void resumeBackup() {
    isPaused = false;
    startQueueProcessing();
  }

  /// Maps file extension and path hints into VectorGallery media categories.
  static String inferCategory(String path) {
    final ext = path.split('.').last.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'heic'].contains(ext)) {
      if (path.toLowerCase().contains('screenshot')) return 'screenshots';
      return 'photos';
    }
    if (['mp4', 'mov', 'avi', 'mkv'].contains(ext)) return 'videos';
    if (['pdf', 'docx', 'xlsx', 'txt', 'md', 'json', 'csv'].contains(ext)) return 'documents';
    return 'other';
  }

  /// Resolves MIME content-type header from a local file path.
  static String inferMimeType(String path) {
    final ext = path.split('.').last.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';
      case 'pdf':
        return 'application/pdf';
      case 'txt':
        return 'text/plain';
      case 'md':
        return 'text/markdown';
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }

  @override
  void dispose() {
    _connectivitySub?.cancel();
    super.dispose();
  }
}
