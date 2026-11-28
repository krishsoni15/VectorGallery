import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/services.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import '../network/api_client.dart';

class VaultFileActionsService {
  static const MethodChannel _channel = MethodChannel('vectorgallery/files');

  /// Fetches full file metadata + fresh signed download URL from `/api/v2/files/:id` when possible.
  static Future<Map<String, dynamic>> hydrateFileMetadata(
    ApiClient api,
    Map<String, dynamic> file,
  ) async {
    final id = (file['id'] ?? file['file_id'])?.toString() ?? '';
    if (id.isEmpty) return file;
    try {
      final res = await api.dio.get('/api/v2/files/$id');
      if (res.statusCode == 200 && res.data is Map && res.data['file'] is Map) {
        final merged = Map<String, dynamic>.from(file);
        merged.addAll(Map<String, dynamic>.from(res.data['file'] as Map));
        return merged;
      }
    } catch (_) {}
    return file;
  }

  static String _sanitizeFileName(String raw) {
    final cleaned = raw.replaceAll(RegExp(r'[\\/:*?"<>|]'), '_').trim();
    return cleaned.isEmpty ? 'vectorgallery_file' : cleaned;
  }

  static String inferMimeType(Map<String, dynamic> file) {
    final mime = file['mime_type']?.toString().trim() ?? '';
    if (mime.isNotEmpty && mime != 'application/octet-stream') return mime;
    final name = (file['original_name'] ?? file['file_name'] ?? file['name'] ?? '').toString().toLowerCase();
    if (name.endsWith('.pdf')) return 'application/pdf';
    if (name.endsWith('.png')) return 'image/png';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
    if (name.endsWith('.webp')) return 'image/webp';
    if (name.endsWith('.gif')) return 'image/gif';
    if (name.endsWith('.mp4')) return 'video/mp4';
    if (name.endsWith('.mp3')) return 'audio/mpeg';
    if (name.endsWith('.txt')) return 'text/plain';
    if (name.endsWith('.csv')) return 'text/csv';
    if (name.endsWith('.json')) return 'application/json';
    if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return 'application/octet-stream';
  }

  /// Downloads the vault file into a temporary cache path, returning the local File.
  static Future<File> downloadToTemp(
    ApiClient api,
    Map<String, dynamic> file, {
    void Function(double progress)? onProgress,
  }) async {
    final hydrated = await hydrateFileMetadata(api, file);
    final rawUrl = (hydrated['download_url'] ?? hydrated['thumbnail_url'] ?? '').toString().trim();
    if (rawUrl.isEmpty) {
      throw Exception('Download URL is not available for this file.');
    }

    final baseUrl = api.dio.options.baseUrl;
    final isRelative = !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://');
    final fullUrl = isRelative ? '$baseUrl$rawUrl' : rawUrl;
    final fileName = _sanitizeFileName(
      (hydrated['original_name'] ?? hydrated['file_name'] ?? hydrated['name'] ?? 'file').toString(),
    );

    final tempDir = await getTemporaryDirectory();
    final cacheDir = Directory(p.join(tempDir.path, 'vault_cache'));
    if (!await cacheDir.exists()) {
      await cacheDir.create(recursive: true);
    }
    final localPath = p.join(cacheDir.path, fileName);

    final isSameHost = isRelative || fullUrl.startsWith(baseUrl);
    if (isSameHost) {
      await api.dio.download(
        fullUrl,
        localPath,
        onReceiveProgress: (received, total) {
          if (total > 0 && onProgress != null) {
            onProgress((received / total).clamp(0.0, 1.0));
          }
        },
      );
    } else {
      final rawDio = Dio(BaseOptions(
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(minutes: 3),
      ));
      await rawDio.download(
        fullUrl,
        localPath,
        onReceiveProgress: (received, total) {
          if (total > 0 && onProgress != null) {
            onProgress((received / total).clamp(0.0, 1.0));
          }
        },
      );
    }

    return File(localPath);
  }

  /// Saves the file into Android Downloads/VectorGallery and returns the saved display path.
  static Future<String> saveToDownloads(
    ApiClient api,
    Map<String, dynamic> file, {
    void Function(double progress)? onProgress,
  }) async {
    final hydrated = await hydrateFileMetadata(api, file);
    final localFile = await downloadToTemp(api, hydrated, onProgress: onProgress);
    final fileName = _sanitizeFileName(
      (hydrated['original_name'] ?? hydrated['file_name'] ?? hydrated['name'] ?? 'file').toString(),
    );
    final mimeType = inferMimeType(hydrated);

    final savedPath = await _channel.invokeMethod<String>('saveToDownloads', {
      'sourcePath': localFile.path,
      'fileName': fileName,
      'mimeType': mimeType,
    });
    return savedPath ?? 'Downloads/VectorGallery/$fileName';
  }

  /// Downloads and opens the file in the device's native viewer (PDF, image, doc, video).
  static Future<void> openExternally(
    ApiClient api,
    Map<String, dynamic> file, {
    void Function(double progress)? onProgress,
  }) async {
    final hydrated = await hydrateFileMetadata(api, file);
    final localFile = await downloadToTemp(api, hydrated, onProgress: onProgress);
    final mimeType = inferMimeType(hydrated);
    await _channel.invokeMethod('openFile', {
      'filePath': localFile.path,
      'mimeType': mimeType,
    });
  }

  /// Downloads and opens the native Android Share sheet.
  static Future<void> shareVaultFile(
    ApiClient api,
    Map<String, dynamic> file, {
    void Function(double progress)? onProgress,
  }) async {
    final hydrated = await hydrateFileMetadata(api, file);
    final localFile = await downloadToTemp(api, hydrated, onProgress: onProgress);
    final fileName = _sanitizeFileName(
      (hydrated['original_name'] ?? hydrated['file_name'] ?? hydrated['name'] ?? 'file').toString(),
    );
    final mimeType = inferMimeType(hydrated);
    await _channel.invokeMethod('shareFile', {
      'filePath': localFile.path,
      'mimeType': mimeType,
      'title': fileName,
    });
  }
}

