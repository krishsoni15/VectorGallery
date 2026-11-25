import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../backup/backup_engine.dart';
import '../chat/chat_screen.dart';

class FilesScreen extends StatefulWidget {
  const FilesScreen({super.key});

  @override
  State<FilesScreen> createState() => _FilesScreenState();
}

class _FilesScreenState extends State<FilesScreen> {
  final ApiClient _api = ApiClient();
  final BackupEngine _backupEngine = BackupEngine();
  List<dynamic> _files = [];
  bool _isLoading = false;
  String _selectedCategory = 'all';

  @override
  void initState() {
    super.initState();
    _fetchFiles();
    _backupEngine.addListener(_onBackupEngineUpdate);
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
          SnackBar(content: Text('Failed to load files: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
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
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
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
        final res = await _api.dio.patch('/api/v2/files/$id', data: {
          'original_name': newName,
        });
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
        title: const Text('Delete File?'),
        content: Text('Are you sure you want to delete "$fileName"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final res = await _api.dio.delete('/api/v2/files/$id');
      if (res.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Deleted "$fileName"')),
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
    final name = file['original_name'] ?? file['name'] ?? 'File';
    final size = file['size_bytes'] != null ? '${((file['size_bytes'] as num) / 1024).toStringAsFixed(1)} KB' : 'Unknown size';
    final mime = file['mime_type'] ?? 'Unknown';
    final category = file['category'] ?? 'documents';
    final hash = file['sha256_hash'] ?? 'N/A';
    final text = file['extracted_text']?.toString() ?? '';
    final isFavorite = file['is_favorite'] == true;
    final thumbnailUrl = file['thumbnail_url']?.toString() ?? '';

    final baseUrl = _api.dio.options.baseUrl;
    final fullImageUrl = thumbnailUrl.startsWith('http') ? thumbnailUrl : '$baseUrl$thumbnailUrl';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        maxChildSize: 0.9,
        minChildSize: 0.4,
        expand: false,
        builder: (_, scrollCtrl) => Padding(
          padding: const EdgeInsets.all(20),
          child: ListView(
            controller: scrollCtrl,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.accent.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(_getCategoryIcon(category), color: AppTheme.accent, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text('$category • $size', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(isFavorite ? Icons.star : Icons.star_border, color: isFavorite ? Colors.amber : Colors.grey),
                    tooltip: isFavorite ? 'Starred' : 'Star file',
                    onPressed: () {
                      Navigator.pop(ctx);
                      _toggleFavorite(id, isFavorite, name);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Image Preview if Photo / Screenshot
              if ((category == 'photos' || category == 'screenshots' || mime.startsWith('image/')) && thumbnailUrl.isNotEmpty) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    height: 200,
                    width: double.infinity,
                    color: const Color(0xFF131822),
                    child: Image.network(
                      fullImageUrl,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.broken_image_outlined, color: Colors.grey, size: 36),
                            SizedBox(height: 4),
                            Text('Preview unavailable offline', style: TextStyle(color: Colors.grey, fontSize: 11)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              const Divider(color: AppTheme.borderSubtle),
              const SizedBox(height: 10),
              _DetailRow(label: 'MIME Type', value: mime),
              _DetailRow(label: 'SHA-256', value: hash.length > 24 ? '${hash.substring(0, 24)}...' : hash),

              // Extracted Text Preview
              if (text.isNotEmpty) ...[
                const SizedBox(height: 12),
                const Text('Indexed Text Excerpt:', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF13181F),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.borderSubtle),
                  ),
                  child: Text(
                    text.length > 300 ? '${text.substring(0, 300)}...' : text,
                    style: const TextStyle(fontSize: 12, color: Colors.white70, height: 1.4),
                  ),
                ),
              ],
              const SizedBox(height: 20),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ChatScreen(initialFileId: id, initialFileName: name),
                          ),
                        );
                      },
                      icon: const Icon(Icons.auto_awesome, size: 16),
                      label: const Text('Ask AI', style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      _deleteFile(id, name);
                    },
                    icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 16),
                    label: const Text('Delete', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.redAccent),
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Add Files to VectorGallery', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppTheme.accent.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.photo_library_outlined, color: AppTheme.accent),
                ),
                title: const Text('Upload Photos & Screenshots', style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: const Text('Pick images from device gallery', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                onTap: () {
                  Navigator.pop(ctx);
                  _backupEngine.pickAndUploadPhotos();
                },
              ),
              const Divider(color: AppTheme.borderSubtle),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blueAccent.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.upload_file_outlined, color: Colors.blueAccent),
                ),
                title: const Text('Upload Documents', style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: const Text('Pick PDF, TXT, DOCX, XLSX files', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Files & Storage'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Files',
            onPressed: _fetchFiles,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showUploadPicker,
        backgroundColor: AppTheme.accent,
        icon: const Icon(Icons.cloud_upload_outlined, color: Colors.white),
        label: const Text('Upload', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          // Category selector chips with Favorites
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: ['all', 'favorites', 'photos', 'documents', 'screenshots', 'videos'].map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    avatar: cat == 'favorites' ? Icon(Icons.star, size: 14, color: isSelected ? Colors.amber : Colors.grey) : null,
                    label: Text(cat.toUpperCase()),
                    selected: isSelected,
                    onSelected: (val) {
                      setState(() => _selectedCategory = cat);
                      _fetchFiles();
                    },
                    selectedColor: AppTheme.accent.withOpacity(0.2),
                    checkmarkColor: AppTheme.accent,
                    labelStyle: TextStyle(
                      color: isSelected ? AppTheme.accent : AppTheme.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _fetchFiles,
              color: AppTheme.accent,
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.accent))
                  : _files.isEmpty
                      ? ListView(
                          children: [
                            SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                            Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.folder_open, size: 64, color: Colors.grey[700]),
                                  const SizedBox(height: 12),
                                  Text(
                                    _selectedCategory == 'all'
                                        ? 'No files backed up yet'
                                        : _selectedCategory == 'favorites'
                                            ? 'No starred favorite files yet'
                                            : 'No files in "$_selectedCategory"',
                                    style: const TextStyle(color: AppTheme.textSecondary),
                                  ),
                                  const SizedBox(height: 16),
                                  ElevatedButton.icon(
                                    onPressed: _showUploadPicker,
                                    icon: const Icon(Icons.add, size: 16),
                                    label: const Text('Upload Your First File'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.accent,
                                      foregroundColor: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                          itemCount: _files.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (context, index) {
                            final f = _files[index];
                            final id = f['id']?.toString() ?? '';
                            final name = f['original_name'] ?? 'File';
                            final cat = f['category']?.toString() ?? 'documents';
                            final isFav = f['is_favorite'] == true;
                            final size = f['size_bytes'] != null
                                ? '${((f['size_bytes'] as num) / 1024).toStringAsFixed(1)} KB'
                                : '';
                            return ListTile(
                              onTap: () => _showFileDetails(f),
                              tileColor: AppTheme.surface,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: const BorderSide(color: AppTheme.borderSubtle),
                              ),
                              leading: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppTheme.accent.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(_getCategoryIcon(cat), color: AppTheme.accent, size: 20),
                              ),
                              title: Text(
                                name,
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                overflow: TextOverflow.ellipsis,
                              ),
                              subtitle: Text(
                                '$cat ${size.isNotEmpty ? '• $size' : ''}',
                                style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: Icon(
                                      isFav ? Icons.star : Icons.star_border,
                                      size: 18,
                                      color: isFav ? Colors.amber : Colors.grey,
                                    ),
                                    onPressed: () => _toggleFavorite(id, isFav, name),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.more_vert, size: 18),
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
          Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, fontFamily: 'monospace')),
        ],
      ),
    );
  }
}
