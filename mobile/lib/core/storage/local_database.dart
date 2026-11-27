import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

/// Lifecycle states for the offline upload queue.
class QueueStatus {
  static const String queued = 'QUEUED';
  static const String uploading = 'UPLOADING';
  static const String completed = 'COMPLETED';
  static const String failed = 'FAILED';

  static const Map<String, List<String>> _validTransitions = {
    queued: [uploading, failed, completed],
    uploading: [completed, failed, queued],
    failed: [queued, uploading, completed],
    completed: [],
  };

  /// Validates whether a queue item can transition between states.
  static bool canTransition(String from, String to) {
    return _validTransitions[from]?.contains(to) ?? false;
  }
}

class QueueItem {
  final int? id;
  final String localPath;
  final String sha256Hash;
  final int fileSize;
  final String category;
  final String status;
  final int retryCount;
  final String? errorMessage;
  final String createdAt;
  final String userEmail;

  QueueItem({
    this.id,
    required this.localPath,
    required this.sha256Hash,
    required this.fileSize,
    required this.category,
    required this.status,
    this.retryCount = 0,
    this.errorMessage,
    required this.createdAt,
    this.userEmail = '',
  });

  QueueItem copyWith({
    int? id,
    String? localPath,
    String? sha256Hash,
    int? fileSize,
    String? category,
    String? status,
    int? retryCount,
    String? errorMessage,
    String? createdAt,
    String? userEmail,
  }) {
    return QueueItem(
      id: id ?? this.id,
      localPath: localPath ?? this.localPath,
      sha256Hash: sha256Hash ?? this.sha256Hash,
      fileSize: fileSize ?? this.fileSize,
      category: category ?? this.category,
      status: status ?? this.status,
      retryCount: retryCount ?? this.retryCount,
      errorMessage: errorMessage ?? this.errorMessage,
      createdAt: createdAt ?? this.createdAt,
      userEmail: userEmail ?? this.userEmail,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'local_path': localPath,
      'sha256_hash': sha256Hash,
      'file_size': fileSize,
      'category': category,
      'status': status,
      'retry_count': retryCount,
      'error_message': errorMessage,
      'created_at': createdAt,
      'user_email': userEmail,
    };
  }

  factory QueueItem.fromMap(Map<String, dynamic> map) {
    return QueueItem(
      id: map['id'] as int?,
      localPath: map['local_path'] as String,
      sha256Hash: map['sha256_hash'] as String,
      fileSize: map['file_size'] as int,
      category: map['category'] as String,
      status: map['status'] as String,
      retryCount: (map['retry_count'] as int?) ?? 0,
      errorMessage: map['error_message'] as String?,
      createdAt: map['created_at'] as String,
      userEmail: (map['user_email'] as String?) ?? '',
    );
  }
}

class LocalDatabase {
  static final LocalDatabase _instance = LocalDatabase._internal();
  factory LocalDatabase() => _instance;
  LocalDatabase._internal();

  Database? _db;

  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'vectorgallery_local.db');

    return await openDatabase(
      path,
      version: 2,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE upload_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            local_path TEXT NOT NULL,
            sha256_hash TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            category TEXT NOT NULL,
            status TEXT NOT NULL,
            retry_count INTEGER DEFAULT 0,
            error_message TEXT,
            created_at TEXT NOT NULL,
            user_email TEXT DEFAULT ''
          )
        ''');
        await db.execute('CREATE INDEX idx_queue_hash ON upload_queue(sha256_hash)');
        await db.execute('CREATE INDEX idx_queue_status ON upload_queue(status)');
        await db.execute('CREATE INDEX idx_queue_user ON upload_queue(user_email)');
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          try {
            await db.execute("ALTER TABLE upload_queue ADD COLUMN user_email TEXT DEFAULT ''");
            await db.execute('CREATE INDEX IF NOT EXISTS idx_queue_user ON upload_queue(user_email)');
          } catch (_) {}
        }
      },
    );
  }

  Future<int> enqueue(QueueItem item) async {
    final db = await database;
    final existing = await db.query(
      'upload_queue',
      where: 'sha256_hash = ? AND user_email = ? AND status != ?',
      whereArgs: [item.sha256Hash, item.userEmail, QueueStatus.failed],
    );
    if (existing.isNotEmpty) {
      return existing.first['id'] as int;
    }
    return await db.insert('upload_queue', item.toMap());
  }

  Future<List<QueueItem>> getPending({String userEmail = ''}) async {
    final db = await database;
    final maps = await db.query(
      'upload_queue',
      where: 'status IN (?, ?) AND (user_email = ? OR user_email = ?)',
      whereArgs: [QueueStatus.queued, QueueStatus.failed, userEmail, ''],
      orderBy: 'id ASC',
      limit: 50,
    );
    return maps.map((m) => QueueItem.fromMap(m)).toList();
  }

  Future<void> updateStatus(int id, String status, {String? errorMessage, int? retryCount}) async {
    final db = await database;
    final values = <String, dynamic>{'status': status};
    if (errorMessage != null) values['error_message'] = errorMessage;
    if (retryCount != null) values['retry_count'] = retryCount;

    await db.update('upload_queue', values, where: 'id = ?', whereArgs: [id]);
  }

  Future<void> resetFailedForRetry({String userEmail = ''}) async {
    final db = await database;
    await db.update(
      'upload_queue',
      {'status': QueueStatus.queued, 'retry_count': 0, 'error_message': null},
      where: 'status = ? AND (user_email = ? OR user_email = ?)',
      whereArgs: [QueueStatus.failed, userEmail, ''],
    );
  }

  Future<void> deleteQueueItem(int id) async {
    final db = await database;
    await db.delete('upload_queue', where: 'id = ?', whereArgs: [id]);
  }

  Future<bool> isHashUploaded(String hash, {String userEmail = ''}) async {
    final db = await database;
    final maps = await db.query(
      'upload_queue',
      where: 'sha256_hash = ? AND user_email = ? AND status = ?',
      whereArgs: [hash, userEmail, QueueStatus.completed],
      limit: 1,
    );
    return maps.isNotEmpty;
  }
}
