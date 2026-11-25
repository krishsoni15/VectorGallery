import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:vectorgallery_mobile/core/network/api_client.dart';
import 'package:vectorgallery_mobile/core/storage/local_database.dart';
import 'package:vectorgallery_mobile/features/backup/backup_engine.dart';

void main() {
  group('BackupEngine Pure Domain Logic', () {
    test('computeBackoffSeconds applies exponential backoff capped at ceiling', () {
      expect(BackupEngine.computeBackoffSeconds(0), equals(2));
      expect(BackupEngine.computeBackoffSeconds(1), equals(4));
      expect(BackupEngine.computeBackoffSeconds(2), equals(8));
      expect(BackupEngine.computeBackoffSeconds(3), equals(16));
      expect(BackupEngine.computeBackoffSeconds(4), equals(32));
      expect(BackupEngine.computeBackoffSeconds(5), equals(60));
      expect(BackupEngine.computeBackoffSeconds(10), equals(60));
      expect(BackupEngine.computeBackoffSeconds(5, maxSeconds: 30), equals(30));
    });

    test('computeSha256Bytes produces deterministic 64-char hex digests', () {
      final hashA = BackupEngine.computeSha256Bytes(utf8.encode('vectorgallery-payload'));
      final hashB = BackupEngine.computeSha256Bytes(utf8.encode('vectorgallery-payload'));
      final hashC = BackupEngine.computeSha256Bytes(utf8.encode('different-payload'));

      expect(hashA, hasLength(64));
      expect(hashA, equals(hashB));
      expect(hashA, isNot(equals(hashC)));
    });

    test('inferMimeType resolves standard document and media types', () {
      expect(BackupEngine.inferMimeType('IMG_20261117.jpg'), equals('image/jpeg'));
      expect(BackupEngine.inferMimeType('Screenshot_2026.png'), equals('image/png'));
      expect(BackupEngine.inferMimeType('document.pdf'), equals('application/pdf'));
      expect(BackupEngine.inferMimeType('video.mp4'), equals('video/mp4'));
      expect(BackupEngine.inferMimeType('notes.md'), equals('text/markdown'));
      expect(BackupEngine.inferMimeType('archive.tar.gz'), equals('application/octet-stream'));
    });

    test('inferCategory classifies photos, screenshots, videos, and documents', () {
      expect(BackupEngine.inferCategory('Camera/20261117_102030.jpg'), equals('photos'));
      expect(BackupEngine.inferCategory('Screenshots/Screenshot_20261117-0900.png'), equals('screenshots'));
      expect(BackupEngine.inferCategory('Downloads/Tax_Return_2025.pdf'), equals('documents'));
      expect(BackupEngine.inferCategory('Movies/Family_Trip.mp4'), equals('videos'));
      expect(BackupEngine.inferCategory('Archive/backup.bin'), equals('other'));
    });
  });

  group('LocalDatabase QueueItem & QueueStatus State Machine', () {
    test('QueueItem round-trips cleanly through SQLite map serialization', () {
      final item = QueueItem(
        id: 7,
        localPath: '/storage/emulated/0/DCIM/Camera/IMG_001.jpg',
        sha256Hash: 'a' * 64,
        fileSize: 204800,
        category: 'photos',
        status: QueueStatus.queued,
        retryCount: 1,
        errorMessage: null,
        createdAt: '2026-11-25T10:00:00Z',
      );

      final restored = QueueItem.fromMap(item.toMap());
      expect(restored.id, equals(7));
      expect(restored.localPath, equals(item.localPath));
      expect(restored.sha256Hash, equals(item.sha256Hash));
      expect(restored.fileSize, equals(204800));
      expect(restored.status, equals(QueueStatus.queued));
      expect(restored.retryCount, equals(1));

      final retried = restored.copyWith(status: QueueStatus.failed, retryCount: 2);
      expect(retried.status, equals(QueueStatus.failed));
      expect(retried.retryCount, equals(2));
    });

    test('QueueStatus enforces valid upload lifecycle transitions', () {
      expect(QueueStatus.canTransition(QueueStatus.queued, QueueStatus.uploading), isTrue);
      expect(QueueStatus.canTransition(QueueStatus.uploading, QueueStatus.completed), isTrue);
      expect(QueueStatus.canTransition(QueueStatus.uploading, QueueStatus.failed), isTrue);
      expect(QueueStatus.canTransition(QueueStatus.failed, QueueStatus.queued), isTrue);
      expect(QueueStatus.canTransition(QueueStatus.completed, QueueStatus.uploading), isFalse);
    });
  });

  group('ApiClient URL Normalization', () {
    test('strips whitespace and trailing slashes from host URLs', () {
      expect(ApiClient.normalizeBaseUrl('http://192.168.1.10:3000/'), equals('http://192.168.1.10:3000'));
      expect(ApiClient.normalizeBaseUrl('  https://vault.example.com  '), equals('https://vault.example.com'));
      expect(ApiClient.normalizeBaseUrl('   '), equals(ApiClient.defaultBaseUrl));
    });
  });
}
