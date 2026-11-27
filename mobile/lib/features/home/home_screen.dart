import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../backup/backup_engine.dart';
import '../guide/guide_sheet.dart';
import '../memories/memories_screen.dart';

class HomeScreen extends StatefulWidget {
  final void Function(String category)? onOpenCategory;
  final void Function(int tabIndex)? onOpenTab;

  const HomeScreen({super.key, this.onOpenCategory, this.onOpenTab});

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
      // Fallback cleanly when offline
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showBackupSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            final sheetBg = AppTheme.surfaceOf(ctx);
            final cardBg = AppTheme.elevatedOf(ctx);
            final textColor = AppTheme.textPrimaryOf(ctx);
            final subtextColor = AppTheme.textSecondaryOf(ctx);
            final brand = AppTheme.brandOf(ctx);

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
                border: Border(top: BorderSide(color: AppTheme.borderOf(ctx))),
              ),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 5,
                      margin: const EdgeInsets.only(bottom: 18),
                      decoration: BoxDecoration(
                        color: subtextColor.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),

                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: brand.withOpacity(0.16),
                        ),
                        child: Icon(Icons.cloud_done, color: brand, size: 22),
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
                            Text('$formattedUsed of $formattedQuota used', style: TextStyle(fontSize: 12, color: subtextColor)),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: percentUsed.clamp(0.02, 1.0),
                      minHeight: 8,
                      backgroundColor: cardBg,
                      valueColor: AlwaysStoppedAnimation<Color>(brand),
                    ),
                  ),

                  const SizedBox(height: 20),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: isUploading || isScanning ? brand.withOpacity(0.45) : AppTheme.borderOf(ctx),
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
                                child: Icon(Icons.sync, color: brand, size: 20),
                              )
                            else if (isDone)
                              Icon(Icons.check_circle, color: brand, size: 20)
                            else
                              Icon(Icons.cloud_upload_outlined, color: brand, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                isUploading
                                    ? 'Backing up (${_backupEngine.uploadedCount}/${_backupEngine.totalQueued})'
                                    : isScanning
                                        ? 'Scanning device files...'
                                        : isDone
                                            ? 'Backup up to date'
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
                                child: Text(
                                  _backupEngine.isPaused ? 'Resume' : 'Pause',
                                  style: TextStyle(fontSize: 12, color: brand, fontWeight: FontWeight.bold),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _backupEngine.lastStatusMessage ?? 'Originals stay untouched using SHA-256 deduplication.',
                          style: TextStyle(fontSize: 12, color: subtextColor),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  Text(
                    'Select Source to Back Up',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: subtextColor),
                  ),
                  const SizedBox(height: 10),

                  Row(
                    children: [
                      Expanded(
                        child: _BackupActionCard(
                          icon: Icons.photo_library_outlined,
                          iconColor: const Color(0xFFE11D48),
                          title: 'Photos',
                          subtitle: 'Camera & Gallery',
                          onTap: () async {
                            Navigator.pop(ctx);
                            await _backupEngine.pickAndUploadPhotos();
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _BackupActionCard(
                          icon: Icons.description_outlined,
                          iconColor: const Color(0xFF0284C7),
                          title: 'Documents',
                          subtitle: 'PDFs & Notes',
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
                      Expanded(
                        child: _BackupActionCard(
                          icon: Icons.folder_open_outlined,
                          iconColor: const Color(0xFFD97706),
                          title: 'Folder',
                          subtitle: 'WhatsApp, Downloads',
                          onTap: () async {
                            Navigator.pop(ctx);
                            await _backupEngine.pickFolderAndBackup();
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _BackupActionCard(
                          icon: Icons.auto_awesome,
                          iconColor: brand,
                          title: 'Auto Scan',
                          subtitle: 'Device storage',
                          onTap: () async {
                            Navigator.pop(ctx);
                            await _backupEngine.scanAndBackupDevice();
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.wifi, size: 18, color: subtextColor),
                            const SizedBox(width: 8),
                            Text('Wi-Fi only backup', style: TextStyle(fontSize: 12.5, color: textColor)),
                          ],
                        ),
                        Switch(
                          value: _backupEngine.wifiOnly,
                          activeColor: brand,
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
    final surface = AppTheme.surfaceOf(context);
    final elevated = AppTheme.elevatedOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);

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
            Text(
              'VectorGallery',
              style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.5, color: primaryText),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline_rounded, size: 21),
            tooltip: 'User Guide',
            onPressed: () => showMobileUserGuideSheet(context),
          ),
          GestureDetector(
            onTap: () => _showBackupSheet(context),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: brand.withOpacity(0.14),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: brand.withOpacity(0.32)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (isUploading || isScanning)
                    RotationTransition(
                      turns: _spinController,
                      child: Icon(Icons.sync, color: brand, size: 15),
                    )
                  else
                    Icon(isDone ? Icons.cloud_done : Icons.cloud_upload_outlined, color: brand, size: 15),
                  const SizedBox(width: 5),
                  Text(
                    isUploading
                        ? '${_backupEngine.totalQueued - _backupEngine.uploadedCount}'
                        : isDone
                            ? 'Saved'
                            : 'Backup',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: brand),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            icon: _isLoading
                ? SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: brand),
                  )
                : const Icon(Icons.refresh, size: 20),
            tooltip: 'Refresh',
            onPressed: _fetchStats,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchStats,
        color: brand,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Clean Theme-Adaptive Vault Summary Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: surface,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: border),
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
                            decoration: BoxDecoration(color: brand.withOpacity(0.14), shape: BoxShape.circle),
                            child: Icon(Icons.cloud_queue, color: brand, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Personal Cloud Memory',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: primaryText),
                              ),
                              Text('$formattedUsed / $formattedQuota', style: TextStyle(fontSize: 12, color: secondaryText)),
                            ],
                          ),
                        ],
                      ),
                      ElevatedButton.icon(
                        onPressed: () => _showBackupSheet(context),
                        icon: const Icon(Icons.backup, size: 14),
                        label: const Text('Backup', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.voltLime,
                          foregroundColor: const Color(0xFF101211),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: percentUsed.clamp(0.02, 1.0),
                      minHeight: 7,
                      backgroundColor: elevated,
                      valueColor: AlwaysStoppedAnimation<Color>(brand),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${counts['total_files'] ?? 0} total items backed up', style: TextStyle(fontSize: 12, color: secondaryText)),
                      Row(
                        children: [
                          Icon(Icons.shield_outlined, size: 13, color: brand),
                          const SizedBox(width: 4),
                          Text('SHA-256 Protected', style: TextStyle(fontSize: 11, color: brand, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Quick Actions Row
            Row(
              children: [
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.photo_library_outlined,
                    label: 'Photos',
                    color: const Color(0xFFE11D48),
                    onTap: () => _backupEngine.pickAndUploadPhotos(),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.upload_file_outlined,
                    label: 'Docs',
                    color: const Color(0xFF0284C7),
                    onTap: () => _backupEngine.pickAndUploadDocuments(),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.collections_bookmark_outlined,
                    label: 'Albums',
                    color: brand,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const MemoriesScreen()));
                    },
                  ),
                ),
              ],
            ),

            const SizedBox(height: 22),

            Text('Library Categories', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: primaryText)),
            const SizedBox(height: 10),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 2.2,
              children: [
                _CategoryTile(
                  icon: Icons.photo_outlined,
                  title: 'Photos',
                  count: counts['photos'] ?? 0,
                  color: const Color(0xFFE11D48),
                  onTap: () => widget.onOpenCategory?.call('photos'),
                ),
                _CategoryTile(
                  icon: Icons.screenshot_outlined,
                  title: 'Screenshots',
                  count: counts['screenshots'] ?? 0,
                  color: brand,
                  onTap: () => widget.onOpenCategory?.call('screenshots'),
                ),
                _CategoryTile(
                  icon: Icons.description_outlined,
                  title: 'Documents',
                  count: counts['documents'] ?? 0,
                  color: const Color(0xFF0284C7),
                  onTap: () => widget.onOpenCategory?.call('documents'),
                ),
                _CategoryTile(
                  icon: Icons.videocam_outlined,
                  title: 'Videos',
                  count: counts['videos'] ?? 0,
                  color: const Color(0xFF7C3AED),
                  onTap: () => widget.onOpenCategory?.call('videos'),
                ),
              ],
            ),

            const SizedBox(height: 22),

            if (recentFiles.isNotEmpty) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Recent Memories', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: primaryText)),
                  TextButton(
                    onPressed: () => widget.onOpenCategory?.call('all'),
                    child: Text('View all', style: TextStyle(color: brand, fontSize: 12.5, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ...recentFiles.take(6).map((f) {
                final cat = (f['category'] ?? 'documents').toString();
                return InkWell(
                  onTap: () => widget.onOpenCategory?.call(cat == 'photos' || cat == 'screenshots' || cat == 'documents' ? cat : 'all'),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: border),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: brand.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
                          child: Icon(_getFileIcon(cat), color: brand, size: 18),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                f['name'] ?? f['original_name'] ?? 'File',
                                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: primaryText),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '$cat • ${f['formatted_size'] ?? ''}',
                                style: TextStyle(fontSize: 11, color: secondaryText),
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.check_circle_outline, color: brand, size: 16),
                      ],
                    ),
                  ),
                );
              }),
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
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.elevatedOf(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderOf(context)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: iconColor.withOpacity(0.14), shape: BoxShape.circle),
              child: Icon(icon, color: iconColor, size: 19),
            ),
            const SizedBox(height: 10),
            Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimaryOf(context))),
            const SizedBox(height: 2),
            Text(
              subtitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 10.5, color: AppTheme.textSecondaryOf(context)),
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

  const _QuickActionButton({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: AppTheme.surfaceOf(context),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.borderOf(context)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppTheme.textPrimaryOf(context))),
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
  final VoidCallback? onTap;

  const _CategoryTile({
    required this.icon,
    required this.title,
    required this.count,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.surfaceOf(context),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.borderOf(context)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 19),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppTheme.textPrimaryOf(context))),
                  Text('$count items', style: TextStyle(fontSize: 11, color: AppTheme.textSecondaryOf(context))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
