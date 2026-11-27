import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../backup/backup_engine.dart';
import '../chat/chat_screen.dart';
import '../memories/memories_screen.dart';

class FilesScreen extends StatefulWidget {
  final String initialCategory;

  const FilesScreen({super.key, this.initialCategory = 'all'});

  @override
  State<FilesScreen> createState() => _FilesScreenState();
}

class _FilesScreenState extends State<FilesScreen> {
  final ApiClient _api = ApiClient();
  final BackupEngine _backupEngine = BackupEngine();
  List<dynamic> _files = [];
  bool _isLoading = false;
  late String _selectedCategory;
  bool _isGridMode = true;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    _fetchFiles();
    _backupEngine.addListener(_onBackupEngineUpdate);
  }

  @override
  void didUpdateWidget(covariant FilesScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialCategory != widget.initialCategory &&
        widget.initialCategory != _selectedCategory) {
      setState(() => _selectedCategory = widget.initialCategory);
      _fetchFiles();
    }
  }

  @override
  void dispose() {
    _backupEngine.removeListener(_onBackupEngineUpdate);
    super.dispose();
  }

  void _onBackupEngineUpdate() {
    if (mounted && _backupEngine.status == BackupStatus.completed) {
      _fetchFiles();
    }
  }

  Future<void> _fetchFiles() async {
    setState(() => _isLoading = true);
    try {
      final Map<String, dynamic> query = {};
      if (_selectedCategory == 'favorites') {
        query['is_favorite'] = 'true';
      } else if (_selectedCategory != 'all') {
        query['category'] = _selectedCategory;
      }

      final res = await _api.dio.get('/api/v2/files', queryParameters: query);
      if (res.statusCode == 200 && mounted) {
        setState(() {
          _files = res.data['files'] ?? [];
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load library: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  bool _isImageFile(Map<String, dynamic> file) {
    final category = file['category']?.toString() ?? '';
    final mime = file['mime_type']?.toString() ?? '';
    final name = (file['original_name'] ?? file['name'] ?? '').toString().toLowerCase();
    return (file['thumbnail_url']?.toString().isNotEmpty ?? false) &&
        (category == 'photos' ||
            category == 'screenshots' ||
            mime.startsWith('image/') ||
            RegExp(r'\.(png|jpe?g|webp|gif|bmp|avif)$').hasMatch(name));
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
        _fetchFiles();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Favorite toggle failed: $e')),
        );
      }
    }
  }

  Future<void> _renameFile(String id, String currentName) async {
    final controller = TextEditingController(text: currentName);
    final newName = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Rename File'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(labelText: 'File Name'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accent, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx, controller.text.trim()),
            child: const Text('Rename'),
          ),
        ],
      ),
    );

    if (newName != null && newName.isNotEmpty && newName != currentName) {
      try {
        final res = await _api.dio.patch('/api/v2/files/$id', data: {'original_name': newName});
        if (res.statusCode == 200 && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Renamed to "$newName"')),
          );
          _fetchFiles();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Rename failed: $e')),
          );
        }
      }
    }
  }

  Future<void> _deleteFile(String id, String fileName) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Move to Trash?'),
        content: Text('Move "$fileName" to Trash? You can restore it anytime on web.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Move to Trash'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final res = await _api.dio.delete('/api/v2/files/$id');
      if (res.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Moved "$fileName" to Trash')),
        );
        _fetchFiles();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Delete failed: $e')),
        );
      }
    }
  }

  void _showFileDetails(Map<String, dynamic> file) {
    final id = file['id']?.toString() ?? '';
    final name = file['original_name']?.toString() ?? file['name']?.toString() ?? 'File';
    final size = file['size_bytes'] != null ? '${((file['size_bytes'] as num) / 1024).toStringAsFixed(1)} KB' : 'Unknown';
    final mime = file['mime_type']?.toString() ?? 'Unknown';
    final category = file['category']?.toString() ?? 'documents';
    final hash = file['sha256_hash']?.toString() ?? 'N/A';
    final text = file['extracted_text']?.toString() ?? '';
    final isFavorite = file['is_favorite'] == true;
    final thumbnailUrl = file['thumbnail_url']?.toString() ?? '';
    final baseUrl = _api.dio.options.baseUrl;
    final fullImageUrl = thumbnailUrl.startsWith('http') ? thumbnailUrl : '$baseUrl$thumbnailUrl';

    final surface = AppTheme.surfaceOf(context);
    final elevated = AppTheme.elevatedOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(22))),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.92,
        minChildSize: 0.4,
        expand: false,
        builder: (_, scrollCtrl) => Padding(
          padding: const EdgeInsets.all(20),
          child: ListView(
            controller: scrollCtrl,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: brand.withOpacity(0.14),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(_getCategoryIcon(category), color: brand, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: primaryText)),
                        Text('$category • $size', style: TextStyle(color: secondaryText, fontSize: 12)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(isFavorite ? Icons.star : Icons.star_border, color: isFavorite ? Colors.amber : secondaryText),
                    tooltip: isFavorite ? 'Starred' : 'Star file',
                    onPressed: () {
                      Navigator.pop(ctx);
                      _toggleFavorite(id, isFavorite, name);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 16),

              if (_isImageFile(file)) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    height: 220,
                    width: double.infinity,
                    color: elevated,
                    child: Image.network(
                      fullImageUrl,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.broken_image_outlined, color: secondaryText, size: 36),
                            const SizedBox(height: 4),
                            Text('Preview unavailable', style: TextStyle(color: secondaryText, fontSize: 11)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              Divider(color: border),
              const SizedBox(height: 10),
              _DetailRow(label: 'MIME Type', value: mime),
              _DetailRow(label: 'SHA-256', value: hash.length > 24 ? '${hash.substring(0, 24)}...' : hash),

              if (text.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text('Indexed Text Excerpt', style: TextStyle(color: secondaryText, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: elevated,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: border),
                  ),
                  child: Text(
                    text.length > 350 ? '${text.substring(0, 350)}...' : text,
                    style: TextStyle(fontSize: 12.5, color: primaryText, height: 1.45),
                  ),
                ),
              ],
              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => ChatScreen(initialFileId: id, initialFileName: name)),
                        );
                      },
                      icon: const Icon(Icons.auto_awesome, size: 16),
                      label: const Text('Ask AI', style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      _renameFile(id, name);
                    },
                    icon: const Icon(Icons.edit_outlined, size: 16),
                    label: const Text('Rename', style: TextStyle(fontSize: 12)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      _deleteFile(id, name);
                    },
                    icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 16),
                    label: const Text('Trash', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.redAccent),
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
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
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(22))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Add Files to Vault', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: primaryText)),
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
                  _backupEngine.pickAndUploadPhotos();
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
                  _backupEngine.pickAndUploadDocuments();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getCategoryIcon(String category) {
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

  @override
  Widget build(BuildContext context) {
    final surface = AppTheme.surfaceOf(context);
    final elevated = AppTheme.elevatedOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);
    final baseUrl = _api.dio.options.baseUrl;

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
            icon: Icon(_isGridMode ? Icons.view_list_rounded : Icons.grid_view_rounded, size: 20),
            tooltip: _isGridMode ? 'List view' : 'Photo grid view',
            onPressed: () => setState(() => _isGridMode = !_isGridMode),
          ),
          IconButton(
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
        icon: const Icon(Icons.cloud_upload_outlined),
        label: const Text('Upload', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: ['all', 'photos', 'screenshots', 'documents', 'favorites', 'videos'].map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    avatar: cat == 'favorites'
                        ? Icon(Icons.star, size: 14, color: isSelected ? Colors.amber : secondaryText)
                        : null,
                    label: Text(cat[0].toUpperCase() + cat.substring(1)),
                    selected: isSelected,
                    onSelected: (_) {
                      setState(() => _selectedCategory = cat);
                      _fetchFiles();
                    },
                    backgroundColor: surface,
                    selectedColor: brand.withOpacity(0.16),
                    checkmarkColor: brand,
                    side: BorderSide(color: isSelected ? brand : border),
                    labelStyle: TextStyle(
                      color: isSelected ? brand : secondaryText,
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                );
              }).toList(),
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
                            SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                            Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.folder_open, size: 58, color: secondaryText.withOpacity(0.5)),
                                  const SizedBox(height: 12),
                                  Text(
                                    _selectedCategory == 'all'
                                        ? 'No files backed up yet'
                                        : _selectedCategory == 'favorites'
                                            ? 'No starred favorite files yet'
                                            : 'No files in "$_selectedCategory"',
                                    style: TextStyle(color: secondaryText),
                                  ),
                                  const SizedBox(height: 16),
                                  ElevatedButton.icon(
                                    onPressed: _showUploadPicker,
                                    icon: const Icon(Icons.add, size: 16),
                                    label: const Text('Upload Your First File'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.voltLime,
                                      foregroundColor: const Color(0xFF101211),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        )
                      : _isGridMode
                          ? GridView.builder(
                              padding: const EdgeInsets.fromLTRB(12, 6, 12, 88),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 3,
                                crossAxisSpacing: 6,
                                mainAxisSpacing: 6,
                              ),
                              itemCount: _files.length,
                              itemBuilder: (context, index) {
                                final f = Map<String, dynamic>.from(_files[index] as Map);
                                final isImg = _isImageFile(f);
                                final thumbUrl = f['thumbnail_url']?.toString() ?? '';
                                final fullUrl = thumbUrl.startsWith('http') ? thumbUrl : '$baseUrl$thumbUrl';
                                final name = f['original_name']?.toString() ?? 'File';
                                final cat = f['category']?.toString() ?? 'documents';
                                final isFav = f['is_favorite'] == true;

                                return GestureDetector(
                                  onTap: () => _showFileDetails(f),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(10),
                                    child: Stack(
                                      fit: StackFit.expand,
                                      children: [
                                        if (isImg)
                                          Image.network(
                                            fullUrl,
                                            fit: BoxFit.cover,
                                            errorBuilder: (_, __, ___) => Container(
                                              color: elevated,
                                              child: Icon(_getCategoryIcon(cat), color: brand),
                                            ),
                                          )
                                        else
                                          Container(
                                            color: surface,
                                            padding: const EdgeInsets.all(8),
                                            child: Column(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                Icon(_getCategoryIcon(cat), color: brand, size: 26),
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
                              padding: const EdgeInsets.fromLTRB(16, 8, 16, 88),
                              itemCount: _files.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 8),
                              itemBuilder: (context, index) {
                                final f = Map<String, dynamic>.from(_files[index] as Map);
                                final id = f['id']?.toString() ?? '';
                                final name = f['original_name']?.toString() ?? 'File';
                                final cat = f['category']?.toString() ?? 'documents';
                                final isFav = f['is_favorite'] == true;
                                final size = f['size_bytes'] != null
                                    ? '${((f['size_bytes'] as num) / 1024).toStringAsFixed(1)} KB'
                                    : '';
                                return ListTile(
                                  onTap: () => _showFileDetails(f),
                                  tileColor: surface,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                    side: BorderSide(color: border),
                                  ),
                                  leading: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: brand.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Icon(_getCategoryIcon(cat), color: brand, size: 20),
                                  ),
                                  title: Text(
                                    name,
                                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: primaryText),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  subtitle: Text(
                                    '$cat ${size.isNotEmpty ? '• $size' : ''}',
                                    style: TextStyle(fontSize: 11, color: secondaryText),
                                  ),
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: Icon(
                                          isFav ? Icons.star : Icons.star_border,
                                          size: 18,
                                          color: isFav ? Colors.amber : secondaryText,
                                        ),
                                        onPressed: () => _toggleFavorite(id, isFav, name),
                                      ),
                                      IconButton(
                                        icon: Icon(Icons.more_vert, size: 18, color: secondaryText),
                                        onPressed: () => _showFileDetails(f),
                                      ),
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

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 12, color: AppTheme.textSecondaryOf(context))),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              fontFamily: 'monospace',
              color: AppTheme.textPrimaryOf(context),
            ),
          ),
        ],
      ),
    );
  }
}
