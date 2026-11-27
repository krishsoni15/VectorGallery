import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../auth/auth_provider.dart';
import '../auth/auth_sheet.dart';
import '../backup/backup_engine.dart';
import '../memories/memories_screen.dart';
import 'file_detail_sheet.dart';

class FilesScreen extends ConsumerStatefulWidget {
  final String initialCategory;

  const FilesScreen({super.key, this.initialCategory = 'all'});

  @override
  ConsumerState<FilesScreen> createState() => _FilesScreenState();
}

class _FilesScreenState extends ConsumerState<FilesScreen> {
  final ApiClient _api = ApiClient();
  final BackupEngine _backupEngine = BackupEngine();
  List<dynamic> _files = [];
  bool _isLoading = false;
  String? _loadError;
  late String _selectedCategory;
  bool _isGridMode = true;
  BackupStatus _lastEngineStatus = BackupStatus.idle;
  int _lastUploadedCount = -1;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    _lastEngineStatus = _backupEngine.status;
    _lastUploadedCount = _backupEngine.uploadedCount;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final auth = ref.read(authProvider);
      if (!auth.isCheckingSession && auth.isAuthenticated) {
        _fetchFiles();
      }
    });
    _backupEngine.addListener(_onBackupEngineUpdate);
  }

  @override
  void didUpdateWidget(covariant FilesScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialCategory != widget.initialCategory &&
        widget.initialCategory != _selectedCategory) {
      setState(() => _selectedCategory = widget.initialCategory);
      _fetchFiles(force: true);
    }
  }

  @override
  void dispose() {
    _backupEngine.removeListener(_onBackupEngineUpdate);
    super.dispose();
  }

  void _onBackupEngineUpdate() {
    if (!mounted) return;
    final nextStatus = _backupEngine.status;
    final nextUploaded = _backupEngine.uploadedCount;
    final becameCompleted = nextStatus == BackupStatus.completed &&
        (_lastEngineStatus != BackupStatus.completed || _lastUploadedCount != nextUploaded);
    _lastEngineStatus = nextStatus;
    _lastUploadedCount = nextUploaded;
    if (becameCompleted) {
      _fetchFiles(force: true);
    }
  }

  Future<void> _fetchFiles({bool force = false}) async {
    if (!mounted) return;
    if (_isLoading && !force) return;
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      if (_files.isNotEmpty || _loadError != null || _isLoading) {
        setState(() {
          _files = [];
          _loadError = null;
          _isLoading = false;
        });
      }
      return;
    }
    setState(() {
      _isLoading = true;
      _loadError = null;
    });
    try {
      final Map<String, dynamic> query = {
        'is_trashed': _selectedCategory == 'trash' ? 'true' : 'false',
      };
      if (_selectedCategory == 'favorites') {
        query['is_favorite'] = 'true';
      } else if (_selectedCategory != 'all' && _selectedCategory != 'trash') {
        query['category'] = _selectedCategory;
      }

      final res = await _api.dio.get('/api/v2/files', queryParameters: query);
      if (res.statusCode == 200 && mounted) {
        setState(() {
          _files = (res.data is Map ? res.data['files'] : null) ?? [];
        });
      }
    } catch (e) {
      if (mounted) {
        final auth = ref.read(authProvider);
        if (!auth.isAuthenticated) {
          setState(() {
            _files = [];
            _loadError = null;
          });
        } else {
          setState(() => _loadError = ApiClient.extractErrorMessage(e));
        }
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleFavorite(String id, bool currentFavorite, String fileName) async {
    try {
      final res = await _api.dio.patch('/api/v2/files/$id', data: {
        'is_favorite': !currentFavorite,
      });
      if (res.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(!currentFavorite ? 'Starred "$fileName"' : 'Unstarred "$fileName"')),
        );
        ref.read(authProvider.notifier).bumpSyncVersion();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiClient.extractErrorMessage(e))),
        );
      }
    }
  }

  Future<void> _startUpload(Future<int> Function() action) async {
    final code = await action();
    if (code == -1 && mounted) {
      final ok = await showVaultAuthSheet(context, ref);
      if (ok && mounted) {
        await action();
      }
    }
  }

  void _showUploadPicker() {
    final surface = AppTheme.surfaceOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);

    showModalBottomSheet(
      context: context,
      backgroundColor: surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Add Files to Cloud Vault', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: primaryText)),
              const SizedBox(height: 14),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: brand.withOpacity(0.14), borderRadius: BorderRadius.circular(10)),
                  child: Icon(Icons.photo_library_outlined, color: brand),
                ),
                title: Text('Upload Photos & Screenshots', style: TextStyle(fontWeight: FontWeight.w600, color: primaryText)),
                subtitle: Text('Pick images from device gallery', style: TextStyle(fontSize: 12, color: secondaryText)),
                onTap: () {
                  Navigator.pop(ctx);
                  _startUpload(_backupEngine.pickAndUploadPhotos);
                },
              ),
              Divider(color: border),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Colors.blueAccent.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.upload_file_outlined, color: Colors.blueAccent),
                ),
                title: Text('Upload Documents', style: TextStyle(fontWeight: FontWeight.w600, color: primaryText)),
                subtitle: Text('Pick PDF, TXT, DOCX, XLSX files', style: TextStyle(fontSize: 12, color: secondaryText)),
                onTap: () {
                  Navigator.pop(ctx);
                  _startUpload(_backupEngine.pickAndUploadDocuments);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    ref.listen<AuthState>(authProvider, (prev, next) {
      final authChanged = prev?.isAuthenticated != next.isAuthenticated;
      final syncChanged = prev?.syncVersion != next.syncVersion;
      final sessionReady = (prev?.isCheckingSession ?? true) && !next.isCheckingSession;
      if (authChanged || syncChanged || (sessionReady && next.isAuthenticated)) {
        _fetchFiles();
      }
    });

    final surface = AppTheme.surfaceOf(context);
    final elevated = AppTheme.elevatedOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);
    final baseUrl = _api.dio.options.baseUrl;
    final gridColumns = MediaQuery.of(context).size.width > 640 ? 4 : 3;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Library'),
        actions: [
          TextButton.icon(
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const MemoriesScreen()));
            },
            icon: Icon(Icons.collections_bookmark_outlined, size: 17, color: brand),
            label: Text('Albums', style: TextStyle(color: brand, fontSize: 12.5, fontWeight: FontWeight.w600)),
          ),
          IconButton(
            visualDensity: VisualDensity.compact,
            icon: Icon(_isGridMode ? Icons.view_list_rounded : Icons.grid_view_rounded, size: 20),
            tooltip: _isGridMode ? 'List view' : 'Photo grid view',
            onPressed: () => setState(() => _isGridMode = !_isGridMode),
          ),
          IconButton(
            visualDensity: VisualDensity.compact,
            icon: const Icon(Icons.refresh, size: 20),
            tooltip: 'Refresh Library',
            onPressed: _fetchFiles,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showUploadPicker,
        backgroundColor: AppTheme.voltLime,
        foregroundColor: const Color(0xFF101211),
        elevation: 2,
        icon: const Icon(Icons.cloud_upload_outlined),
        label: const Text('Upload', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: ['all', 'photos', 'screenshots', 'documents', 'favorites', 'videos', 'trash'].map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    avatar: cat == 'favorites'
                        ? Icon(Icons.star, size: 14, color: isSelected ? Colors.amber : secondaryText)
                        : cat == 'trash'
                            ? Icon(Icons.delete_outline, size: 14, color: isSelected ? AppTheme.error : secondaryText)
                            : null,
                    label: Text(cat[0].toUpperCase() + cat.substring(1)),
                    selected: isSelected,
                    onSelected: (_) {
                      setState(() => _selectedCategory = cat);
                      _fetchFiles();
                    },
                    backgroundColor: surface,
                    selectedColor: cat == 'trash' ? AppTheme.error.withOpacity(0.14) : brand.withOpacity(0.16),
                    checkmarkColor: cat == 'trash' ? AppTheme.error : brand,
                    side: BorderSide(color: isSelected ? (cat == 'trash' ? AppTheme.error : brand) : border),
                    labelStyle: TextStyle(
                      color: isSelected ? (cat == 'trash' ? AppTheme.error : brand) : secondaryText,
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          if (_loadError != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.error.withOpacity(0.35)),
                ),
                child: Text(_loadError!, style: const TextStyle(fontSize: 12, color: AppTheme.error)),
              ),
            ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _fetchFiles,
              color: brand,
              child: _isLoading
                  ? Center(child: CircularProgressIndicator(color: brand))
                  : _files.isEmpty
                      ? ListView(
                          children: [
                            SizedBox(height: MediaQuery.of(context).size.height * 0.16),
                            Center(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 28),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      auth.isAuthenticated ? Icons.folder_open : Icons.lock_outline_rounded,
                                      size: 54,
                                      color: secondaryText.withOpacity(0.6),
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      !auth.isAuthenticated
                                          ? 'Sign in to access your synced cloud library'
                                          : _selectedCategory == 'all'
                                              ? 'No files backed up yet'
                                              : _selectedCategory == 'favorites'
                                                  ? 'No starred favorite files yet'
                                                  : _selectedCategory == 'trash'
                                                      ? 'Trash is empty'
                                                      : 'No files in "$_selectedCategory"',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(color: primaryText, fontWeight: FontWeight.w600, fontSize: 14),
                                    ),
                                    const SizedBox(height: 16),
                                    ElevatedButton.icon(
                                      onPressed: () => auth.isAuthenticated
                                          ? _showUploadPicker()
                                          : showVaultAuthSheet(context, ref),
                                      icon: Icon(auth.isAuthenticated ? Icons.add : Icons.login_rounded, size: 16),
                                      label: Text(
                                        auth.isAuthenticated ? 'Upload Your First File' : 'Sign In & Sync',
                                        style: const TextStyle(fontWeight: FontWeight.w800),
                                      ),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppTheme.voltLime,
                                        foregroundColor: const Color(0xFF101211),
                                        elevation: 0,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        )
                      : _isGridMode
                          ? GridView.builder(
                              padding: const EdgeInsets.fromLTRB(12, 6, 12, 92),
                              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: gridColumns,
                                crossAxisSpacing: 6,
                                mainAxisSpacing: 6,
                              ),
                              itemCount: _files.length,
                              itemBuilder: (context, index) {
                                final f = Map<String, dynamic>.from(_files[index] as Map);
                                final isImg = isRenderableImageFile(f);
                                final thumbUrl = f['thumbnail_url']?.toString() ?? '';
                                final fullUrl = thumbUrl.startsWith('http') ? thumbUrl : '$baseUrl$thumbUrl';
                                final name = f['original_name']?.toString() ?? 'File';
                                final cat = f['category']?.toString() ?? 'documents';
                                final isFav = f['is_favorite'] == true;

                                return GestureDetector(
                                  onTap: () => showVaultFileDetailSheet(
                                    context: context,
                                    file: f,
                                    api: _api,
                                    isTrashItem: _selectedCategory == 'trash',
                                    onChanged: () {
                                      ref.read(authProvider.notifier).bumpSyncVersion();
                                    },
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Stack(
                                      fit: StackFit.expand,
                                      children: [
                                        if (isImg)
                                          Image.network(
                                            fullUrl,
                                            fit: BoxFit.cover,
                                            cacheWidth: 320,
                                            filterQuality: FilterQuality.low,
                                            gaplessPlayback: true,
                                            errorBuilder: (_, __, ___) => Container(
                                              color: elevated,
                                              child: Icon(categoryIconFor(cat), color: brand),
                                            ),
                                          )
                                        else
                                          Container(
                                            color: surface,
                                            padding: const EdgeInsets.all(8),
                                            child: Column(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                Icon(categoryIconFor(cat), color: brand, size: 26),
                                                const SizedBox(height: 6),
                                                Text(
                                                  name,
                                                  maxLines: 2,
                                                  overflow: TextOverflow.ellipsis,
                                                  textAlign: TextAlign.center,
                                                  style: TextStyle(fontSize: 10, color: primaryText, fontWeight: FontWeight.w500),
                                                ),
                                              ],
                                            ),
                                          ),
                                        if (isFav)
                                          const Positioned(
                                            top: 5,
                                            right: 5,
                                            child: CircleAvatar(
                                              radius: 10,
                                              backgroundColor: Colors.black54,
                                              child: Icon(Icons.star, size: 12, color: Colors.amber),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.fromLTRB(16, 8, 16, 92),
                              itemCount: _files.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 8),
                              itemBuilder: (context, index) {
                                final f = Map<String, dynamic>.from(_files[index] as Map);
                                final id = f['id']?.toString() ?? '';
                                final name = f['original_name']?.toString() ?? 'File';
                                final cat = f['category']?.toString() ?? 'documents';
                                final isFav = f['is_favorite'] == true;
                                final isImg = isRenderableImageFile(f);
                                final thumbUrl = f['thumbnail_url']?.toString() ?? '';
                                final fullUrl = thumbUrl.startsWith('http') ? thumbUrl : '$baseUrl$thumbUrl';
                                final size = f['size_bytes'] != null
                                    ? '${((f['size_bytes'] as num) / 1024).toStringAsFixed(1)} KB'
                                    : '';

                                return ListTile(
                                  onTap: () => showVaultFileDetailSheet(
                                    context: context,
                                    file: f,
                                    api: _api,
                                    isTrashItem: _selectedCategory == 'trash',
                                      onChanged: () {
                                        ref.read(authProvider.notifier).bumpSyncVersion();
                                      },
                                    ),
                                    tileColor: surface,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(14),
                                      side: BorderSide(color: border),
                                    ),
                                    leading: ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Container(
                                        width: 42,
                                        height: 42,
                                        color: elevated,
                                        child: isImg
                                            ? Image.network(
                                                fullUrl,
                                                fit: BoxFit.cover,
                                                cacheWidth: 160,
                                                filterQuality: FilterQuality.low,
                                                gaplessPlayback: true,
                                              errorBuilder: (_, __, ___) => Icon(categoryIconFor(cat), color: brand, size: 20),
                                            )
                                          : Icon(categoryIconFor(cat), color: brand, size: 20),
                                    ),
                                  ),
                                  title: Text(
                                    name,
                                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5, color: primaryText),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  subtitle: Text(
                                    '$cat ${size.isNotEmpty ? '• $size' : ''}',
                                    style: TextStyle(fontSize: 11.5, color: secondaryText),
                                  ),
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (_selectedCategory != 'trash')
                                        IconButton(
                                          icon: Icon(
                                            isFav ? Icons.star_rounded : Icons.star_border_rounded,
                                            size: 19,
                                            color: isFav ? Colors.amber : secondaryText,
                                          ),
                                          onPressed: () => _toggleFavorite(id, isFav, name),
                                        ),
                                      Icon(Icons.more_vert, size: 18, color: secondaryText),
                                    ],
                                  ),
                                );
                              },
                            ),
            ),
          ),
        ],
      ),
    );
  }
}
