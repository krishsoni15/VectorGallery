import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/brand_mark.dart';
import '../auth/auth_provider.dart';
import '../auth/auth_sheet.dart';
import '../backup/backup_engine.dart';
import '../files/file_detail_sheet.dart';
import '../guide/guide_sheet.dart';
import '../memories/memories_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  final void Function(String category)? onOpenCategory;
  final void Function(int tabIndex)? onOpenTab;

  const HomeScreen({super.key, this.onOpenCategory, this.onOpenTab});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> with SingleTickerProviderStateMixin {
  final BackupEngine _backupEngine = BackupEngine();
  final ApiClient _api = ApiClient();

  Map<String, dynamic>? _stats;
  bool _isLoading = false;
  String? _statsError;
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
    if (!mounted) return;
    setState(() {});
    if (_backupEngine.status == BackupStatus.completed) {
      _fetchStats();
      ref.read(authProvider.notifier).bumpSyncVersion();
    }
  }

  Future<void> _fetchStats() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _statsError = null;
    });
    try {
      final res = await _api.dio.get('/api/v2/dashboard/stats');
      if (res.statusCode == 200 && mounted) {
        setState(() {
          _stats = res.data is Map ? Map<String, dynamic>.from(res.data as Map) : null;
        });
      }
    } catch (e) {
      if (mounted) {
        final auth = ref.read(authProvider);
        if (auth.isAuthenticated) {
          setState(() => _statsError = ApiClient.extractErrorMessage(e));
        } else {
          setState(() => _stats = null);
        }
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleBackupAction(Future<int> Function() action) async {
    final code = await action();
    if (code == -1 && mounted) {
      final ok = await showVaultAuthSheet(context, ref);
      if (ok && mounted) {
        await action();
      }
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
            final formattedUsed = storage['formatted_used'] ?? '0 B';
            final formattedQuota = storage['formatted_quota'] ?? '15.00 GB';
            final percentUsed = ((storage['percent_used'] as num?)?.toDouble() ?? 0.0) / 100.0;

            final isUploading = _backupEngine.status == BackupStatus.uploading;
            final isScanning = _backupEngine.status == BackupStatus.scanning;
            final isDone = _backupEngine.status == BackupStatus.completed;
            final isErr = _backupEngine.status == BackupStatus.error;

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
                      const VectorGalleryBrandMark(size: 40),
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
                  const SizedBox(height: 18),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: isErr
                            ? AppTheme.error.withOpacity(0.5)
                            : (isUploading || isScanning ? brand.withOpacity(0.45) : AppTheme.borderOf(ctx)),
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
                            else if (isErr)
                              const Icon(Icons.error_outline, color: AppTheme.error, size: 20)
                            else if (isDone)
                              Icon(Icons.check_circle, color: brand, size: 20)
                            else
                              Icon(Icons.cloud_upload_outlined, color: brand, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                isUploading
                                    ? 'Syncing (${_backupEngine.uploadedCount}/${_backupEngine.totalQueued})'
                                    : isScanning
                                        ? 'Scanning device files...'
                                        : isErr
                                            ? 'Sync Notice'
                                            : isDone
                                                ? 'Vault synchronized'
                                                : 'Ready to sync',
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
                          style: TextStyle(fontSize: 12, color: isErr ? AppTheme.error : subtextColor),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Select Source to Sync to Vault',
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
                          onTap: () {
                            Navigator.pop(ctx);
                            _handleBackupAction(_backupEngine.pickAndUploadPhotos);
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
                          onTap: () {
                            Navigator.pop(ctx);
                            _handleBackupAction(_backupEngine.pickAndUploadDocuments);
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
                          onTap: () {
                            Navigator.pop(ctx);
                            _handleBackupAction(_backupEngine.pickFolderAndBackup);
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
                          onTap: () {
                            Navigator.pop(ctx);
                            _handleBackupAction(_backupEngine.scanAndBackupDevice);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
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
    final auth = ref.watch(authProvider);
    ref.listen<AuthState>(authProvider, (prev, next) {
      if (prev?.syncVersion != next.syncVersion || prev?.isAuthenticated != next.isAuthenticated) {
        _fetchStats();
      }
    });

    final surface = AppTheme.surfaceOf(context);
    final elevated = AppTheme.elevatedOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);
    final isDark = AppTheme.isDark(context);

    final storage = _stats?['storage'] ?? {};
    final counts = _stats?['counts'] ?? {};
    final backupHealth = _stats?['backup_health'] ?? {};
    final recentFiles = (_stats?['recent_files'] as List?) ?? [];
    final baseUrl = _api.dio.options.baseUrl;

    final formattedUsed = storage['formatted_used'] ?? '0 B';
    final formattedQuota = storage['formatted_quota'] ?? '15.00 GB';
    final percentUsed = ((storage['percent_used'] as num?)?.toDouble() ?? 0.0) / 100.0;
    final devicesCount = (backupHealth['connected_devices'] as num?)?.toInt() ?? 0;

    final isUploading = _backupEngine.status == BackupStatus.uploading;
    final isScanning = _backupEngine.status == BackupStatus.scanning;
    final isDone = _backupEngine.status == BackupStatus.completed;
    final isErr = _backupEngine.status == BackupStatus.error;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const VectorGalleryBrandLockup(markSize: 30, showSubtitle: false),
        actions: [
          IconButton(
            visualDensity: VisualDensity.compact,
            icon: const Icon(Icons.help_outline_rounded, size: 20),
            tooltip: 'User Guide',
            onPressed: () => showMobileUserGuideSheet(context),
          ),
          GestureDetector(
            onTap: () => _showBackupSheet(context),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: isErr ? AppTheme.error.withOpacity(0.14) : brand.withOpacity(0.14),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isErr ? AppTheme.error.withOpacity(0.4) : brand.withOpacity(0.32),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (isUploading || isScanning)
                    RotationTransition(
                      turns: _spinController,
                      child: Icon(Icons.sync, color: brand, size: 14),
                    )
                  else
                    Icon(
                      isErr
                          ? Icons.warning_amber_rounded
                          : (isDone ? Icons.cloud_done : Icons.cloud_upload_outlined),
                      color: isErr ? AppTheme.error : brand,
                      size: 14,
                    ),
                  const SizedBox(width: 5),
                  Text(
                    isUploading
                        ? '${_backupEngine.totalQueued - _backupEngine.uploadedCount}'
                        : isDone
                            ? 'Synced'
                            : 'Sync',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isErr ? AppTheme.error : brand,
                    ),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            visualDensity: VisualDensity.compact,
            icon: _isLoading
                ? SizedBox(
                    width: 15,
                    height: 15,
                    child: CircularProgressIndicator(strokeWidth: 2, color: brand),
                  )
                : const Icon(Icons.refresh_rounded, size: 20),
            tooltip: 'Refresh Vault',
            onPressed: _fetchStats,
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchStats,
        color: brand,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            // Sign-In Banner when unauthenticated
            if (!auth.isCheckingSession && !auth.isAuthenticated) ...[
              Container(
                padding: const EdgeInsets.all(18),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: surface,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: brand.withOpacity(0.4)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 7,
                          height: 7,
                          decoration: const BoxDecoration(color: AppTheme.voltLime, shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 7),
                        Text(
                          'CLOUD SYNC REQUIRED',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                            color: brand,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Sign in to sync across Phone & Web',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: primaryText, letterSpacing: -0.3),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Use the same VectorGallery email & password as the website so uploads and library sync automatically.',
                      style: TextStyle(fontSize: 12.5, height: 1.4, color: secondaryText),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => showVaultAuthSheet(context, ref, initialSignUp: false),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.voltLime,
                              foregroundColor: const Color(0xFF101211),
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
                              padding: const EdgeInsets.symmetric(vertical: 11),
                            ),
                            child: const Text('Sign In →', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => showVaultAuthSheet(context, ref, initialSignUp: true),
                            style: OutlinedButton.styleFrom(
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
                              side: BorderSide(color: border),
                              padding: const EdgeInsets.symmetric(vertical: 11),
                            ),
                            child: Text('Create Account', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: primaryText)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],

            // Live Backup Status / Error Strip on Home
            if (isUploading || isScanning || isErr || (isDone && _backupEngine.lastStatusMessage != null)) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: isErr ? AppTheme.error.withOpacity(0.1) : brand.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isErr ? AppTheme.error.withOpacity(0.4) : brand.withOpacity(0.35)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          isErr ? Icons.error_outline_rounded : (isDone ? Icons.check_circle_outline : Icons.sync),
                          size: 18,
                          color: isErr ? AppTheme.error : brand,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _backupEngine.lastStatusMessage ?? '',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                              color: isErr ? AppTheme.error : primaryText,
                            ),
                          ),
                        ),
                        if (isErr)
                          TextButton(
                            onPressed: () {
                              if (!auth.isAuthenticated) {
                                showVaultAuthSheet(context, ref);
                              } else {
                                _backupEngine.startQueueProcessing(retryPreviousFailures: true);
                              }
                            },
                            child: Text(
                              auth.isAuthenticated ? 'Retry' : 'Sign In',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ),
                      ],
                    ),
                    if (isUploading) ...[
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: LinearProgressIndicator(
                          value: _backupEngine.progress.clamp(0.05, 1.0),
                          minHeight: 5,
                          backgroundColor: elevated,
                          valueColor: AlwaysStoppedAnimation<Color>(brand),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],

            if (_statsError != null) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppTheme.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.error.withOpacity(0.35)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.wifi_off_rounded, color: AppTheme.error, size: 17),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _statsError!,
                        style: const TextStyle(fontSize: 12, color: AppTheme.error),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Main Vault Telemetry Card matching Website DashboardView
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: surface,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                    color: auth.isAuthenticated
                                        ? (isDark ? AppTheme.voltLime : AppTheme.accent)
                                        : secondaryText,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    auth.isAuthenticated
                                        ? 'SYNCED · ${(auth.displayName ?? auth.email ?? 'VAULT').toUpperCase()}'
                                        : 'OFFLINE PREVIEW',
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 1.1,
                                      color: brand,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Personal Cloud Vault',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: primaryText),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '$formattedUsed / $formattedQuota · $devicesCount Device${devicesCount == 1 ? '' : 's'}',
                              style: TextStyle(fontSize: 12, color: secondaryText, fontFamily: 'monospace'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        onPressed: () => _showBackupSheet(context),
                        icon: const Icon(Icons.cloud_upload_rounded, size: 15),
                        label: const Text('Backup', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.voltLime,
                          foregroundColor: const Color(0xFF101211),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: percentUsed.clamp(0.02, 1.0),
                      minHeight: 7,
                      backgroundColor: elevated,
                      valueColor: AlwaysStoppedAnimation<Color>(isDark ? AppTheme.voltLime : AppTheme.accent),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    alignment: WrapAlignment.spaceBetween,
                    spacing: 10,
                    runSpacing: 6,
                    children: [
                      Text(
                        '${counts['total_files'] ?? 0} total items backed up',
                        style: TextStyle(fontSize: 12, color: secondaryText),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.shield_outlined, size: 13, color: brand),
                          const SizedBox(width: 4),
                          Text('SHA-256 Protected', style: TextStyle(fontSize: 11, color: brand, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Quick Actions Row
            Row(
              children: [
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.photo_library_outlined,
                    label: 'Photos',
                    color: const Color(0xFFE11D48),
                    onTap: () => _handleBackupAction(_backupEngine.pickAndUploadPhotos),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.upload_file_outlined,
                    label: 'Docs',
                    color: const Color(0xFF0284C7),
                    onTap: () => _handleBackupAction(_backupEngine.pickAndUploadDocuments),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.folder_open_outlined,
                    label: 'Folder',
                    color: const Color(0xFFD97706),
                    onTap: () => _handleBackupAction(_backupEngine.pickFolderAndBackup),
                  ),
                ),
                const SizedBox(width: 8),
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

            Text(
              'Library Categories',
              style: TextStyle(fontSize: 15.5, fontWeight: FontWeight.w800, color: primaryText, letterSpacing: -0.2),
            ),
            const SizedBox(height: 10),
            GridView.count(
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 2.15,
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

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Memories',
                  style: TextStyle(fontSize: 15.5, fontWeight: FontWeight.w800, color: primaryText, letterSpacing: -0.2),
                ),
                TextButton(
                  onPressed: () => widget.onOpenCategory?.call('all'),
                  child: Text('View all →', style: TextStyle(color: brand, fontSize: 12.5, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
            const SizedBox(height: 4),
            if (recentFiles.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: surface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: border),
                ),
                child: Column(
                  children: [
                    Icon(Icons.cloud_upload_outlined, size: 32, color: secondaryText),
                    const SizedBox(height: 10),
                    Text(
                      auth.isAuthenticated ? 'No files in your cloud vault yet' : 'Sign in to view synced files',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: primaryText),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      auth.isAuthenticated
                          ? 'Upload photos or PDFs from here or the website — they sync instantly.'
                          : 'Sign in above to pull your files from the website.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: secondaryText),
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton(
                      onPressed: () => auth.isAuthenticated
                          ? _showBackupSheet(context)
                          : showVaultAuthSheet(context, ref),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.voltLime,
                        foregroundColor: const Color(0xFF101211),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      child: Text(
                        auth.isAuthenticated ? 'Upload First File' : 'Sign In to Sync',
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12.5),
                      ),
                    ),
                  ],
                ),
              )
            else
              ...recentFiles.take(8).map((item) {
                final f = Map<String, dynamic>.from(item as Map);
                final cat = (f['category'] ?? 'documents').toString();
                final thumb = f['thumbnail_url']?.toString() ?? '';
                final fullUrl = thumb.startsWith('http') ? thumb : '$baseUrl$thumb';
                final isImg = isRenderableImageFile(f);

                return InkWell(
                  onTap: () => showVaultFileDetailSheet(
                    context: context,
                    file: f,
                    api: _api,
                    onChanged: () {
                      _fetchStats();
                      ref.read(authProvider.notifier).bumpSyncVersion();
                    },
                  ),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: border),
                    ),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            width: 44,
                            height: 44,
                            color: elevated,
                            child: isImg
                                ? Image.network(
                                    fullUrl,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Icon(categoryIconFor(cat), color: brand, size: 20),
                                  )
                                : Icon(categoryIconFor(cat), color: brand, size: 20),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                f['name'] ?? f['original_name'] ?? 'File',
                                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5, color: primaryText),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '$cat${f['formatted_size'] != null ? ' • ${f['formatted_size']}' : ''}',
                                style: TextStyle(fontSize: 11.5, color: secondaryText),
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.chevron_right_rounded, color: secondaryText, size: 19),
                      ],
                    ),
                  ),
                );
              }),
          ],
        ),
      ),
    );
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
            const SizedBox(height: 5),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textPrimaryOf(context)),
            ),
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
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5, color: AppTheme.textPrimaryOf(context)),
                  ),
                  Text(
                    '$count items',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondaryOf(context)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
