import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../backup/backup_engine.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  final BackupEngine _backupEngine = BackupEngine();
  final ApiClient _api = ApiClient();

  Map<String, dynamic>? _stats;
  bool _isLoading = false;
  late AnimationController _spinController;

  @override
  void initState() {
    super.initState();
    _spinController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    _fetchStats();
    _backupEngine.addListener(_onBackupEngineUpdate);
  }

  @override
  void dispose() {
    _spinController.dispose();
    _backupEngine.removeListener(_onBackupEngineUpdate);
    super.dispose();
  }

  void _onBackupEngineUpdate() {
    if (mounted) {
      setState(() {});
      if (_backupEngine.status == BackupStatus.completed) {
        _fetchStats();
      }
    }
  }

  Future<void> _fetchStats() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.dio.get('/api/v2/dashboard/stats');
      if (res.statusCode == 200 && mounted) {
        setState(() {
          _stats = res.data;
        });
      }
    } catch (_) {
      // Fallback gracefully
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ─── Google Photos Style Backup Bottom Sheet ───
  void _showBackupSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            final isDark = Theme.of(context).brightness == Brightness.dark;
            final sheetBg = isDark ? const Color(0xFF161922) : Colors.white;
            final cardBg = isDark ? const Color(0xFF1F2430) : const Color(0xFFF1F5F9);
            final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
            final subtextColor = isDark ? Colors.grey[400]! : const Color(0xFF64748B);

            final storage = _stats?['storage'] ?? {};
            final formattedUsed = storage['formatted_used'] ?? '0 KB';
            final formattedQuota = storage['formatted_quota'] ?? '15.00 GB';
            final percentUsed = ((storage['percent_used'] as num?)?.toDouble() ?? 0.0) / 100.0;

            final isUploading = _backupEngine.status == BackupStatus.uploading;
            final isScanning = _backupEngine.status == BackupStatus.scanning;
            final isDone = _backupEngine.status == BackupStatus.completed;

            return Container(
              decoration: BoxDecoration(
                color: sheetBg,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.35), blurRadius: 20, offset: const Offset(0, -4)),
                ],
              ),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Drag Handle
                  Center(
                    child: Container(
                      width: 44,
                      height: 5,
                      margin: const EdgeInsets.only(bottom: 18),
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),

                  // Header: Account & Storage Overview
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [AppTheme.accent, Color(0xFF38BDF8)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(color: AppTheme.accent.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: const Icon(Icons.cloud_done, color: Colors.white, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'VectorGallery Cloud Backup',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '$formattedUsed of $formattedQuota used',
                              style: TextStyle(fontSize: 12, color: subtextColor),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Storage Meter
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: percentUsed.clamp(0.01, 1.0),
                      minHeight: 8,
                      backgroundColor: isDark ? const Color(0xFF282F3E) : const Color(0xFFE2E8F0),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accent),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // ─── Live Active Status Card ───
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: isUploading || isScanning
                            ? AppTheme.accent.withOpacity(0.4)
                            : Colors.transparent,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            if (isUploading || isScanning)
                              RotationTransition(
                                turns: _spinController,
                                child: const Icon(Icons.sync, color: AppTheme.accent, size: 20),
                              )
                            else if (isDone)
                              const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 20)
                            else
                              const Icon(Icons.cloud_upload_outlined, color: AppTheme.accent, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                isUploading
                                    ? 'Backing up items (${_backupEngine.uploadedCount}/${_backupEngine.totalQueued})'
                                    : isScanning
                                        ? 'Scanning device files...'
                                        : isDone
                                            ? 'Backup is up to date'
                                            : 'Ready to back up',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor),
                              ),
                            ),
                            if (isUploading)
                              TextButton(
                                onPressed: () {
                                  if (_backupEngine.isPaused) {
                                    _backupEngine.resumeBackup();
                                  } else {
                                    _backupEngine.pauseBackup();
                                  }
                                  setModalState(() {});
                                },
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: Text(
                                  _backupEngine.isPaused ? 'Resume' : 'Pause',
                                  style: const TextStyle(fontSize: 12, color: AppTheme.accent, fontWeight: FontWeight.bold),
                                ),
                              ),
                          ],
                        ),

                        if (isUploading) ...[
                          const SizedBox(height: 10),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: _backupEngine.progress.clamp(0.01, 1.0),
                              minHeight: 6,
                              backgroundColor: Colors.grey.withOpacity(0.2),
                              valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accent),
                            ),
                          ),
                          if (_backupEngine.currentUploadingFile != null) ...[
                            const SizedBox(height: 8),
                            Text(
                              'Current: ${_backupEngine.currentUploadingFile}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(fontSize: 11, color: subtextColor, fontFamily: 'monospace'),
                            ),
                          ],
                        ] else ...[
                          const SizedBox(height: 6),
                          Text(
                            _backupEngine.lastStatusMessage ?? 'All files deduplicated using SHA-256 cloud indexing.',
                            style: TextStyle(fontSize: 12, color: subtextColor),
                          ),
                        ],

                        if (_backupEngine.duplicateCount > 0) ...[
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.verified_outlined, size: 14, color: Color(0xFF10B981)),
                              const SizedBox(width: 4),
                              Text(
                                '${_backupEngine.duplicateCount} duplicate file(s) saved from re-uploading',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF10B981), fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // ─── Backup Action Options (Google Photos Style Grid) ───
                  Text(
                    'What would you like to back up?',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: subtextColor),
                  ),
                  const SizedBox(height: 10),

                  Row(
                    children: [
                      // Option 1: Photos & Gallery
                      Expanded(
                        child: _BackupActionCard(
                          icon: Icons.photo_library_outlined,
                          iconColor: const Color(0xFFF43F5E),
                          title: 'Photos',
                          subtitle: 'Camera & Gallery',
                          onTap: () async {
                            Navigator.pop(ctx);
                            await _backupEngine.pickAndUploadPhotos();
                          },
                        ),
                      ),
                      const SizedBox(width: 10),

                      // Option 2: Documents & PDFs
                      Expanded(
                        child: _BackupActionCard(
                          icon: Icons.description_outlined,
                          iconColor: const Color(0xFF0284C7),
                          title: 'Documents',
                          subtitle: 'PDFs, Docs & Notes',
                          onTap: () async {
                            Navigator.pop(ctx);
                            await _backupEngine.pickAndUploadDocuments();
                          },
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  Row(
                    children: [
                      // Option 3: Choose Any Folder (WhatsApp, Downloads)
                      Expanded(
                        child: _BackupActionCard(
                          icon: Icons.folder_open_outlined,
                          iconColor: const Color(0xFFEAB308),
                          title: 'Choose Folder',
                          subtitle: 'WhatsApp, Downloads...',
                          onTap: () async {
                            Navigator.pop(ctx);
                            await _backupEngine.pickFolderAndBackup();
                          },
                        ),
                      ),
                      const SizedBox(width: 10),

                      // Option 4: Auto Scan Storage
                      Expanded(
                        child: _BackupActionCard(
                          icon: Icons.auto_awesome,
                          iconColor: AppTheme.accent,
                          title: 'Auto Scan',
                          subtitle: 'Full device storage',
                          onTap: () async {
                            Navigator.pop(ctx);
                            await _backupEngine.scanAndBackupDevice();
                          },
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),

                  // Wi-Fi Only Switch
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: cardBg.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.wifi, size: 18, color: subtextColor),
                            const SizedBox(width: 8),
                            Text('Back up over Wi-Fi only', style: TextStyle(fontSize: 12, color: textColor)),
                          ],
                        ),
                        Switch(
                          value: _backupEngine.wifiOnly,
                          activeColor: AppTheme.accent,
                          onChanged: (val) {
                            _backupEngine.initialize(wifiOnlySetting: val);
                            setModalState(() {});
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final storage = _stats?['storage'] ?? {};
    final counts = _stats?['counts'] ?? {};
    final recentFiles = (_stats?['recent_files'] as List?) ?? [];

    final formattedUsed = storage['formatted_used'] ?? '0 KB';
    final formattedQuota = storage['formatted_quota'] ?? '15.00 GB';
    final percentUsed = ((storage['percent_used'] as num?)?.toDouble() ?? 0.0) / 100.0;

    final isUploading = _backupEngine.status == BackupStatus.uploading;
    final isScanning = _backupEngine.status == BackupStatus.scanning;
    final isDone = _backupEngine.status == BackupStatus.completed;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset('assets/icon.png', width: 28, height: 28),
            ),
            const SizedBox(width: 10),
            const Text('VectorGallery', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          ],
        ),
        actions: [
          // ─── Google Photos Style Cloud Sync Avatar Button ───
          GestureDetector(
            onTap: () => _showBackupSheet(context),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: isUploading || isScanning
                    ? AppTheme.accent.withOpacity(0.18)
                    : isDone
                        ? const Color(0xFF10B981).withOpacity(0.15)
                        : Colors.grey.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isUploading || isScanning
                      ? AppTheme.accent.withOpacity(0.4)
                      : isDone
                          ? const Color(0xFF10B981).withOpacity(0.3)
                          : Colors.grey.withOpacity(0.2),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (isUploading || isScanning)
                    RotationTransition(
                      turns: _spinController,
                      child: const Icon(Icons.sync, color: AppTheme.accent, size: 16),
                    )
                  else if (isDone)
                    const Icon(Icons.cloud_done, color: Color(0xFF10B981), size: 16)
                  else
                    const Icon(Icons.cloud_upload_outlined, color: AppTheme.accent, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    isUploading
                        ? '${_backupEngine.totalQueued - _backupEngine.uploadedCount}'
                        : isDone
                            ? 'Saved'
                            : 'Backup',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isUploading
                          ? AppTheme.accent
                          : isDone
                              ? const Color(0xFF10B981)
                              : Colors.grey[300],
                    ),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            icon: _isLoading
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.accent),
                  )
                : const Icon(Icons.refresh, size: 20),
            tooltip: 'Refresh',
            onPressed: _fetchStats,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchStats,
        color: AppTheme.accent,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ─── Google Photos Style Hero Card ───
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E2638), Color(0xFF11141C)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.accent.withOpacity(0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.cloud_queue, color: AppTheme.accent, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Personal Cloud Memory',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                              ),
                              Text(
                                '$formattedUsed / $formattedQuota',
                                style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        ],
                      ),
                      ElevatedButton.icon(
                        onPressed: () => _showBackupSheet(context),
                        icon: const Icon(Icons.backup, size: 14),
                        label: const Text('Backup', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.accent,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Storage Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: percentUsed.clamp(0.01, 1.0),
                      minHeight: 8,
                      backgroundColor: const Color(0xFF2B3347),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accent),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Real-time live backup notification in Hero card
                  if (isUploading || isScanning) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.accent.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          RotationTransition(
                            turns: _spinController,
                            child: const Icon(Icons.sync, size: 14, color: AppTheme.accent),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _backupEngine.lastStatusMessage ?? 'Backing up items...',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 11, color: AppTheme.accent, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${counts['total_files'] ?? 0} total files backed up',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        const Row(
                          children: [
                            Icon(Icons.shield_outlined, size: 12, color: Color(0xFF10B981)),
                            SizedBox(width: 4),
                            Text('Encrypted & Deduplicated', style: TextStyle(fontSize: 11, color: Color(0xFF10B981))),
                          ],
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),

            // ─── Quick Backup Actions ───
            Row(
              children: [
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.photo_library_outlined,
                    label: 'Add Photos',
                    color: const Color(0xFFF43F5E),
                    onTap: () async {
                      await _backupEngine.pickAndUploadPhotos();
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.upload_file_outlined,
                    label: 'Add Docs',
                    color: const Color(0xFF0284C7),
                    onTap: () async {
                      await _backupEngine.pickAndUploadDocuments();
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.folder_open_outlined,
                    label: 'Add Folder',
                    color: const Color(0xFFEAB308),
                    onTap: () async {
                      await _backupEngine.pickFolderAndBackup();
                    },
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ─── Category Quick Browse with Real Counts ───
            const Text(
              'Library Categories',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.2,
              children: [
                _CategoryTile(
                  icon: Icons.photo_outlined,
                  title: 'Photos',
                  count: counts['photos'] ?? 0,
                  color: const Color(0xFFF43F5E),
                ),
                _CategoryTile(
                  icon: Icons.screenshot_outlined,
                  title: 'Screenshots',
                  count: counts['screenshots'] ?? 0,
                  color: AppTheme.accent,
                ),
                _CategoryTile(
                  icon: Icons.description_outlined,
                  title: 'Documents',
                  count: counts['documents'] ?? 0,
                  color: Colors.blueAccent,
                ),
                _CategoryTile(
                  icon: Icons.videocam_outlined,
                  title: 'Videos',
                  count: counts['videos'] ?? 0,
                  color: Colors.purpleAccent,
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ─── Recent Files ───
            if (recentFiles.isNotEmpty) ...[
              const Text(
                'Recent Backed-Up Files',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ...recentFiles.take(6).map((f) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppTheme.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.accent.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            _getFileIcon(f['category'] ?? 'documents'),
                            color: AppTheme.accent,
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                f['name'] ?? 'File',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${f['category'] ?? 'documents'} • ${f['formatted_size'] ?? ''}',
                                style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.check_circle_outline, color: Color(0xFF10B981), size: 16),
                      ],
                    ),
                  )),
            ],
          ],
        ),
      ),
    );
  }

  IconData _getFileIcon(String category) {
    switch (category) {
      case 'photos':
        return Icons.photo_outlined;
      case 'screenshots':
        return Icons.screenshot_outlined;
      case 'videos':
        return Icons.videocam_outlined;
      default:
        return Icons.insert_drive_file_outlined;
    }
  }
}

class _BackupActionCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _BackupActionCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1F2430) : const Color(0xFFF1F5F9);
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtextColor = isDark ? Colors.grey[400]! : const Color(0xFF64748B);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.04)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(height: 10),
            Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
            const SizedBox(height: 2),
            Text(
              subtitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 10, color: subtextColor),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.borderSubtle),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 6),
            Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

class _CategoryTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final int count;
  final Color color;

  const _CategoryTile({
    required this.icon,
    required this.title,
    required this.count,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                Text('$count items', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
