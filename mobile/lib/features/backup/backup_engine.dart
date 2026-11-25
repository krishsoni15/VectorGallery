import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:crypto/crypto.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
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
  bool isPaused = false;
  bool wifiOnly = false; // Default to false so user backup works immediately

  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;

  void initialize({bool wifiOnlySetting = false}) {
    wifiOnly = wifiOnlySetting;
    _connectivitySub = _connectivity.onConnectivityChanged.listen(_handleConnectivityChanged);
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

  // 1. Calculate SHA-256 of local file
  Future<String> computeFileHash(File file) async {
    final bytes = await file.readAsBytes();
    return computeSha256Bytes(bytes);
  }

  // 2. Scan and enqueue local media candidate
  Future<bool> enqueueCandidate(File file, String category) async {
    if (!await file.exists()) return false;

    final hash = await computeFileHash(file);
    final isUploaded = await _localDb.isHashUploaded(hash);
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
      status: 'QUEUED',
      createdAt: DateTime.now().toIso8601String(),
    ));

    return true;
  }

  // 3. User Action: Pick and upload photos from Gallery
  Future<int> pickAndUploadPhotos() async {
    try {
      final List<XFile> images = await _imagePicker.pickMultiImage();
      if (images.isEmpty) return 0;

      status = BackupStatus.scanning;
      lastStatusMessage = 'Selected ${images.length} photos. Preparing queue...';
      notifyListeners();

      int enqueued = 0;
      for (final img in images) {
        final file = File(img.path);
        final category = img.path.toLowerCase().contains('screenshot') ? 'screenshots' : 'photos';
        final added = await enqueueCandidate(file, category);
        if (added) enqueued++;
      }

      lastStatusMessage = 'Enqueued $enqueued new photos (${images.length - enqueued} duplicates skipped).';
      notifyListeners();

      await startQueueProcessing();
      return enqueued;
    } catch (e) {
      status = BackupStatus.error;
      lastStatusMessage = 'Failed to pick photos: $e';
      notifyListeners();
      return 0;
    }
  }

  // 4. User Action: Pick and upload documents
  Future<int> pickAndUploadDocuments() async {
    try {
      final FilePickerResult? result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'xls', 'json', 'md'],
      );

      if (result == null || result.files.isEmpty) return 0;

      status = BackupStatus.scanning;
      lastStatusMessage = 'Selected ${result.files.length} documents. Preparing queue...';
      notifyListeners();

      int enqueued = 0;
      for (final item in result.files) {
        if (item.path == null) continue;
        final file = File(item.path!);
        final added = await enqueueCandidate(file, 'documents');
        if (added) enqueued++;
      }

      lastStatusMessage = 'Enqueued $enqueued documents (${result.files.length - enqueued} duplicates skipped).';
      notifyListeners();

      await startQueueProcessing();
      return enqueued;
    } catch (e) {
      status = BackupStatus.error;
      lastStatusMessage = 'Failed to pick documents: $e';
      notifyListeners();
      return 0;
    }
  }

  // 4b. User Action: Pick any folder via Storage Access Framework and back up all contents
  Future<int> pickFolderAndBackup() async {
    try {
      final String? selectedDirectory = await FilePicker.platform.getDirectoryPath();
      if (selectedDirectory == null) return 0;
      return await backupFolder(selectedDirectory);
    } catch (e) {
      status = BackupStatus.error;
      lastStatusMessage = 'Folder selection notice: $e';
      notifyListeners();
      return 0;
    }
  }

  Future<int> backupFolder(String dirPath) async {
    status = BackupStatus.scanning;
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
      lastStatusMessage = 'Error scanning folder: $e';
      notifyListeners();
      return 0;
    }

    if (foundFiles.isEmpty) {
      status = BackupStatus.idle;
      lastStatusMessage = 'No compatible media or documents found in this folder.';
      notifyListeners();
      return 0;
    }

    lastStatusMessage = 'Found ${foundFiles.length} file(s) in folder. Enqueuing...';
    notifyListeners();

    int enqueued = 0;
    for (final file in foundFiles) {
      final cat = inferCategory(file.path);
      final added = await enqueueCandidate(file, cat);
      if (added) enqueued++;
    }

    lastStatusMessage = 'Enqueued $enqueued new file(s) from folder for backup.';
    notifyListeners();

    await startQueueProcessing();
    return enqueued;
  }

  // 5. Automatic Device Scan: Scans standard Android media and download folders
  Future<int> scanAndBackupDevice() async {
    status = BackupStatus.scanning;
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
                if (foundFiles.length >= 100) break; // Cap per batch to avoid overload
              }
            }
          }
        }
      } catch (_) {
        // Scoped storage security exception on Android 13+ is caught gracefully
      }
      if (foundFiles.length >= 100) break;
    }

    if (foundFiles.isEmpty) {
      // Scoped storage prevented direct directory reading: guide user to gallery picker
      lastStatusMessage = 'Device folders are restricted by Android Scoped Storage. Opening photo gallery...';
      notifyListeners();
      return await pickAndUploadPhotos();
    }

    lastStatusMessage = 'Found ${foundFiles.length} files. Enqueuing for backup...';
    notifyListeners();

    int enqueued = 0;
    for (final file in foundFiles) {
      final cat = inferCategory(file.path);
      final added = await enqueueCandidate(file, cat);
      if (added) enqueued++;
    }

    lastStatusMessage = 'Enqueued $enqueued new files for backup.';
    notifyListeners();

    await startQueueProcessing();
    return enqueued;
  }

  // 6. Process the persistent upload queue with Exponential Backoff
  Future<void> startQueueProcessing() async {
    if (status == BackupStatus.uploading || isPaused) return;

    status = BackupStatus.uploading;
    uploadedCount = 0;
    failedCount = 0;
    progress = 0.0;
    notifyListeners();

    try {
      while (!isPaused) {
        final pending = await _localDb.getPending();
        totalQueued = pending.length;

        if (pending.isEmpty) {
          status = BackupStatus.completed;
          lastStatusMessage = uploadedCount > 0
              ? 'Backup finished: $uploadedCount file(s) backed up successfully!'
              : 'Backup up to date. No new files to upload.';
          currentUploadingFile = null;
          progress = 1.0;
          notifyListeners();
          break;
        }

        // Check Wi-Fi restriction if enabled
        if (wifiOnly) {
          final conn = await _connectivity.checkConnectivity();
          if (!conn.contains(ConnectivityResult.wifi)) {
            status = BackupStatus.paused;
            lastStatusMessage = 'Backup paused: Waiting for Wi-Fi connection.';
            notifyListeners();
            break;
          }
        }

        for (int i = 0; i < pending.length; i++) {
          if (isPaused) break;

          final item = pending[i];
          final file = File(item.localPath);
          final fileName = file.uri.pathSegments.isNotEmpty ? file.uri.pathSegments.last : 'file_${item.id}';

          if (!await file.exists()) {
            await _localDb.updateStatus(item.id!, 'FAILED', errorMessage: 'File not found on device');
            failedCount++;
            continue;
          }

          currentUploadingFile = fileName;
          lastStatusMessage = 'Uploading ${i + 1} of ${pending.length}: $fileName';
          progress = (i + 1) / pending.length;
          notifyListeners();

          bool uploaded = false;
          int retries = item.retryCount;

          while (!uploaded && retries < 3 && !isPaused) {
            try {
              final bytes = await file.readAsBytes();
              final base64Payload = base64Encode(bytes);

              final response = await _apiClient.dio.post(
                '/api/v2/files/upload',
                data: {
                  'filename': fileName,
                  'base64': base64Payload,
                  'mimeType': inferMimeType(file.path),
                },
              );

              if (response.statusCode == 200) {
                uploaded = true;
                uploadedCount++;
                await _localDb.updateStatus(item.id!, QueueStatus.completed);
              } else {
                retries++;
                final backoffSec = computeBackoffSeconds(retries, maxSeconds: 30);
                await Future.delayed(Duration(seconds: backoffSec));
              }
            } catch (e) {
              retries++;
              final backoffSec = computeBackoffSeconds(retries, maxSeconds: 30);
              await _localDb.updateStatus(
                item.id!,
                QueueStatus.failed,
                errorMessage: e.toString(),
                retryCount: retries,
              );
              if (retries >= 3) {
                failedCount++;
              } else {
                await Future.delayed(Duration(seconds: backoffSec));
              }
            }
          }
        }
      }
    } catch (e) {
      status = BackupStatus.error;
      lastStatusMessage = 'Backup error: $e';
      notifyListeners();
    } finally {
      if (!isPaused && status != BackupStatus.error) {
        status = BackupStatus.completed;
        lastStatusMessage = 'Backup completed! $uploadedCount file(s) backed up.';
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
