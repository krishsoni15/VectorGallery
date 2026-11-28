import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/network/api_client.dart';
import '../../core/services/file_actions_service.dart';
import '../../core/theme/app_theme.dart';
import '../chat/chat_screen.dart';

bool isRenderableImageFile(Map<String, dynamic> file) {
  final category = file['category']?.toString() ?? '';
  final mime = file['mime_type']?.toString() ?? '';
  final name = (file['original_name'] ?? file['file_name'] ?? file['name'] ?? '').toString().toLowerCase();
  final thumb = file['thumbnail_url']?.toString() ?? '';
  return thumb.isNotEmpty &&
      (category == 'photos' ||
          category == 'screenshots' ||
          mime.startsWith('image/') ||
          RegExp(r'\.(png|jpe?g|webp|gif|bmp|avif)$').hasMatch(name));
}

IconData categoryIconFor(String category) {
  switch (category) {
    case 'photos':
      return Icons.photo_outlined;
    case 'screenshots':
      return Icons.screenshot_outlined;
    case 'videos':
      return Icons.videocam_outlined;
    case 'audio':
      return Icons.audiotrack_outlined;
    default:
      return Icons.insert_drive_file_outlined;
  }
}

/// Shared website-aligned file preview sheet with full-screen pinch-to-zoom image viewer,
/// native Open, Download to Phone, Share, OCR excerpt copy, Ask AI, Star, Rename, Album, and Trash/Restore.
void showVaultFileDetailSheet({
  required BuildContext context,
  required Map<String, dynamic> file,
  required ApiClient api,
  bool isTrashItem = false,
  VoidCallback? onChanged,
}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => _VaultFileDetailSheet(
      initialFile: file,
      api: api,
      isTrashItem: isTrashItem,
      onChanged: onChanged,
    ),
  );
}

class _VaultFileDetailSheet extends StatefulWidget {
  final Map<String, dynamic> initialFile;
  final ApiClient api;
  final bool isTrashItem;
  final VoidCallback? onChanged;

  const _VaultFileDetailSheet({
    required this.initialFile,
    required this.api,
    required this.isTrashItem,
    this.onChanged,
  });

  @override
  State<_VaultFileDetailSheet> createState() => _VaultFileDetailSheetState();
}

class _VaultFileDetailSheetState extends State<_VaultFileDetailSheet> {
  late Map<String, dynamic> _file;
  bool _isHydrating = false;
  bool _isBusyAction = false;
  String? _busyLabel;
  double? _downloadProgress;

  @override
  void initState() {
    super.initState();
    _file = Map<String, dynamic>.from(widget.initialFile);
    final id = (_file['id'] ?? _file['file_id'])?.toString() ?? '';
    if (id.isNotEmpty && (_file['download_url'] == null || _file['size_bytes'] == null)) {
      _hydrate();
    }
  }

  Future<void> _hydrate() async {
    setState(() => _isHydrating = true);
    final updated = await VaultFileActionsService.hydrateFileMetadata(widget.api, _file);
    if (!mounted) return;
    setState(() {
      _file = updated;
      _isHydrating = false;
    });
  }

  String get _id => (_file['id'] ?? _file['file_id'])?.toString() ?? '';
  String get _name =>
      _file['original_name']?.toString() ??
      _file['file_name']?.toString() ??
      _file['name']?.toString() ??
      'File';
  String get _category => _file['category']?.toString() ?? 'documents';
  String get _mime => VaultFileActionsService.inferMimeType(_file);
  String get _hash => _file['sha256_hash']?.toString() ?? '';
  String get _text =>
      _file['extracted_text']?.toString() ??
      _file['snippet']?.toString() ??
      _file['excerpt']?.toString() ??
      '';
  bool get _isFavorite => _file['is_favorite'] == true;

  String get _fullImageUrl {
    final thumb = _file['thumbnail_url']?.toString() ?? '';
    if (thumb.isEmpty) return '';
    return thumb.startsWith('http') ? thumb : '${widget.api.dio.options.baseUrl}$thumb';
  }

  String get _sizeLabel {
    final sizeBytes = (_file['size_bytes'] as num?)?.toDouble();
    if (sizeBytes != null) {
      return sizeBytes >= 1024 * 1024
          ? '${(sizeBytes / (1024 * 1024)).toStringAsFixed(2)} MB'
          : '${(sizeBytes / 1024).toStringAsFixed(1)} KB';
    }
    return _file['formatted_size']?.toString() ?? (_isHydrating ? 'Loading...' : 'Unknown');
  }

  void _showSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _handleDownload() async {
    if (_isBusyAction) return;
    setState(() {
      _isBusyAction = true;
      _busyLabel = 'Saving to Downloads...';
      _downloadProgress = 0.0;
    });
    try {
      final saved = await VaultFileActionsService.saveToDownloads(
        widget.api,
        _file,
        onProgress: (p) {
          if (mounted) setState(() => _downloadProgress = p);
        },
      );
      _showSnack('Saved "$_name" to $saved');
    } catch (e) {
      _showSnack(ApiClient.extractErrorMessage(e));
    } finally {
      if (mounted) {
        setState(() {
          _isBusyAction = false;
          _busyLabel = null;
          _downloadProgress = null;
        });
      }
    }
  }

  Future<void> _handleOpen() async {
    if (isRenderableImageFile(_file) && _fullImageUrl.isNotEmpty) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => _FullScreenImageViewer(
            title: _name,
            imageUrl: _fullImageUrl,
            file: _file,
            api: widget.api,
          ),
        ),
      );
      return;
    }
    if (_isBusyAction) return;
    setState(() {
      _isBusyAction = true;
      _busyLabel = 'Opening "$_name"...';
      _downloadProgress = 0.0;
    });
    try {
      await VaultFileActionsService.openExternally(
        widget.api,
        _file,
        onProgress: (p) {
          if (mounted) setState(() => _downloadProgress = p);
        },
      );
    } on PlatformException catch (e) {
      _showSnack(e.message ?? 'No app found to open this file type.');
    } catch (e) {
      _showSnack(ApiClient.extractErrorMessage(e));
    } finally {
      if (mounted) {
        setState(() {
          _isBusyAction = false;
          _busyLabel = null;
          _downloadProgress = null;
        });
      }
    }
  }

  Future<void> _handleShare() async {
    if (_isBusyAction) return;
    setState(() {
      _isBusyAction = true;
      _busyLabel = 'Preparing to share...';
      _downloadProgress = 0.0;
    });
    try {
      await VaultFileActionsService.shareVaultFile(
        widget.api,
        _file,
        onProgress: (p) {
          if (mounted) setState(() => _downloadProgress = p);
        },
      );
    } catch (e) {
      _showSnack(ApiClient.extractErrorMessage(e));
    } finally {
      if (mounted) {
        setState(() {
          _isBusyAction = false;
          _busyLabel = null;
          _downloadProgress = null;
        });
      }
    }
  }

  Future<void> _toggleFavorite() async {
    try {
      final nextFav = !_isFavorite;
      final res = await widget.api.dio.patch('/api/v2/files/$_id', data: {'is_favorite': nextFav});
      if (res.statusCode == 200 && mounted) {
        setState(() => _file['is_favorite'] = nextFav);
        _showSnack(nextFav ? 'Starred "$_name"' : 'Removed star from "$_name"');
        widget.onChanged?.call();
      }
    } catch (e) {
      _showSnack(ApiClient.extractErrorMessage(e));
    }
  }

  Future<void> _renameFile() async {
    final controller = TextEditingController(text: _name);
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
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.voltLime, foregroundColor: const Color(0xFF101211)),
            onPressed: () => Navigator.pop(ctx, controller.text.trim()),
            child: const Text('Rename', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (newName != null && newName.isNotEmpty && newName != _name) {
      try {
        final res = await widget.api.dio.patch('/api/v2/files/$_id', data: {'original_name': newName});
        if (res.statusCode == 200 && mounted) {
          setState(() => _file['original_name'] = newName);
          _showSnack('Renamed to "$newName"');
          widget.onChanged?.call();
        }
      } catch (e) {
        _showSnack(ApiClient.extractErrorMessage(e));
      }
    }
  }

  Future<void> _restoreFile() async {
    try {
      final res = await widget.api.dio.post('/api/v2/files/restore', data: {'fileIds': [_id]});
      if (res.statusCode == 200 && mounted) {
        Navigator.pop(context);
        _showSnack('Restored "$_name"');
        widget.onChanged?.call();
      }
    } catch (e) {
      _showSnack(ApiClient.extractErrorMessage(e));
    }
  }

  Future<void> _deleteFile({required bool permanent}) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(permanent ? 'Delete Forever?' : 'Move to Trash?'),
        content: Text(
          permanent
              ? 'Permanently delete "$_name" from cloud storage? This cannot be undone.'
              : 'Move "$_name" to Trash? You can restore it anytime from Trash on mobile or web.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.error, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(permanent ? 'Delete Forever' : 'Move to Trash'),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      final res = await widget.api.dio.delete('/api/v2/files/$_id${permanent ? '?permanent=true' : ''}');
      if (res.statusCode == 200 && mounted) {
        Navigator.pop(context);
        _showSnack(permanent ? 'Permanently deleted "$_name"' : 'Moved "$_name" to Trash');
        widget.onChanged?.call();
      }
    } catch (e) {
      _showSnack(ApiClient.extractErrorMessage(e));
    }
  }

  Future<void> _addToAlbum() async {
    try {
      final res = await widget.api.dio.get('/api/v2/collections');
      final all = (res.data is Map ? res.data['collections'] : []) as List? ?? [];
      final customCols = all.where((c) => c['is_smart'] != true).toList();
      if (!mounted) return;
      if (customCols.isEmpty) {
        _showSnack('Create a custom album in Library → Albums first.');
        return;
      }
      final pickedId = await showDialog<String>(
        context: context,
        builder: (ctx) => SimpleDialog(
          title: const Text('Add to Album'),
          children: customCols
              .map((c) => SimpleDialogOption(
                    onPressed: () => Navigator.pop(ctx, c['id']?.toString()),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        children: [
                          Icon(Icons.folder_special_outlined, color: AppTheme.brandOf(context), size: 19),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              c['name']?.toString() ?? 'Album',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ))
              .toList(),
        ),
      );
      if (pickedId != null && pickedId.isNotEmpty) {
        await widget.api.dio.post('/api/v2/collections/$pickedId/files', data: {'fileId': _id});
        if (mounted) {
          _showSnack('Added "$_name" to album');
          widget.onChanged?.call();
        }
      }
    } catch (e) {
      _showSnack(ApiClient.extractErrorMessage(e));
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
    final hasImage = isRenderableImageFile(_file) && _fullImageUrl.isNotEmpty;

    return DraggableScrollableSheet(
      initialChildSize: 0.72,
      minChildSize: 0.45,
      maxChildSize: 0.94,
      builder: (_, scrollCtrl) => Container(
        decoration: BoxDecoration(
          color: surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border(top: BorderSide(color: border)),
        ),
        child: ListView(
          controller: scrollCtrl,
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          children: [
            Center(
              child: Container(
                width: 42,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: secondaryText.withOpacity(0.32),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: brand.withOpacity(0.14),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(categoryIconFor(_category), color: brand, size: 21),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15.5, color: primaryText),
                      ),
                      const SizedBox(height: 2),
                      Text('$_category • $_sizeLabel', style: TextStyle(color: secondaryText, fontSize: 12)),
                    ],
                  ),
                ),
                if (!widget.isTrashItem && _id.isNotEmpty)
                  IconButton(
                    icon: Icon(_isFavorite ? Icons.star_rounded : Icons.star_border_rounded,
                        color: _isFavorite ? Colors.amber : secondaryText),
                    onPressed: _toggleFavorite,
                  ),
              ],
            ),
            const SizedBox(height: 14),

            // Primary Open / Download / Share Bar
            if (!widget.isTrashItem)
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _isBusyAction ? null : _handleOpen,
                      icon: Icon(hasImage ? Icons.fullscreen_rounded : Icons.open_in_new_rounded, size: 17),
                      label: Text(hasImage ? 'View' : 'Open', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.voltLime,
                        foregroundColor: const Color(0xFF101211),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isBusyAction ? null : _handleDownload,
                      icon: Icon(Icons.download_rounded, size: 17, color: brand),
                      label: Text('Download', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: primaryText)),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: border),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isBusyAction ? null : _handleShare,
                      icon: Icon(Icons.share_outlined, size: 16, color: brand),
                      label: Text('Share', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: primaryText)),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: border),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ),
                ],
              ),

            if (_isBusyAction) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: brand.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: brand.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _busyLabel ?? 'Working...',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: primaryText),
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: (_downloadProgress != null && _downloadProgress! > 0) ? _downloadProgress : null,
                        minHeight: 4,
                        backgroundColor: elevated,
                        valueColor: AlwaysStoppedAnimation<Color>(brand),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),
            if (hasImage) ...[
              GestureDetector(
                onTap: _handleOpen,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Stack(
                    children: [
                      Container(
                        height: 240,
                        width: double.infinity,
                        color: elevated,
                        child: Image.network(
                          _fullImageUrl,
                          fit: BoxFit.contain,
                          cacheWidth: 1080,
                          filterQuality: FilterQuality.medium,
                          gaplessPlayback: true,
                          loadingBuilder: (_, child, progress) {
                            if (progress == null) return child;
                            return Center(child: CircularProgressIndicator(strokeWidth: 2, color: brand));
                          },
                          errorBuilder: (_, __, ___) => Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.broken_image_outlined, color: secondaryText, size: 36),
                                const SizedBox(height: 6),
                                Text('Tap Open or Download to view', style: TextStyle(color: secondaryText, fontSize: 11.5)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        right: 10,
                        bottom: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.65),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.zoom_out_map_rounded, color: Colors.white, size: 13),
                              SizedBox(width: 4),
                              Text('Tap to zoom', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
            Divider(color: border),
            const SizedBox(height: 8),
            _DetailRow(label: 'MIME Type', value: _mime),
            if (_hash.isNotEmpty)
              _DetailRow(label: 'SHA-256', value: _hash.length > 22 ? '${_hash.substring(0, 22)}...' : _hash),
            if (_text.isNotEmpty) ...[
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Indexed Text Excerpt',
                    style: TextStyle(color: secondaryText, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: _text));
                      _showSnack('Copied extracted text');
                    },
                    icon: Icon(Icons.copy_rounded, size: 14, color: brand),
                    label: Text('Copy', style: TextStyle(fontSize: 11.5, color: brand)),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: elevated,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: border),
                ),
                child: Text(
                  _text.length > 800 ? '${_text.substring(0, 800)}...' : _text,
                  style: TextStyle(fontSize: 12.5, color: primaryText, height: 1.45),
                ),
              ),
            ],
            if (_id.isNotEmpty) ...[
              const SizedBox(height: 18),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: widget.isTrashItem
                    ? [
                        ElevatedButton.icon(
                          onPressed: _restoreFile,
                          icon: const Icon(Icons.restore_rounded, size: 16),
                          label: const Text('Restore File', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.voltLime,
                            foregroundColor: const Color(0xFF101211),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: () => _deleteFile(permanent: true),
                          icon: const Icon(Icons.delete_forever_outlined, color: AppTheme.error, size: 16),
                          label: const Text('Delete Forever', style: TextStyle(color: AppTheme.error, fontSize: 12.5)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.error),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                        ),
                      ]
                    : [
                        OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pop(context);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ChatScreen(initialFileId: _id, initialFileName: _name),
                              ),
                            );
                          },
                          icon: Icon(Icons.auto_awesome, size: 16, color: brand),
                          label: const Text('Ask AI', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: _renameFile,
                          icon: const Icon(Icons.edit_outlined, size: 16),
                          label: const Text('Rename', style: TextStyle(fontSize: 12.5)),
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: _addToAlbum,
                          icon: const Icon(Icons.collections_bookmark_outlined, size: 16),
                          label: const Text('Album', style: TextStyle(fontSize: 12.5)),
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: () => _deleteFile(permanent: false),
                          icon: const Icon(Icons.delete_outline, color: AppTheme.error, size: 16),
                          label: const Text('Trash', style: TextStyle(color: AppTheme.error, fontSize: 12.5)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.error),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                        ),
                      ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _FullScreenImageViewer extends StatelessWidget {
  final String title;
  final String imageUrl;
  final Map<String, dynamic> file;
  final ApiClient api;

  const _FullScreenImageViewer({
    required this.title,
    required this.imageUrl,
    required this.file,
    required this.api,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black.withOpacity(0.75),
        foregroundColor: Colors.white,
        title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 15)),
        actions: [
          IconButton(
            tooltip: 'Download to Phone',
            icon: const Icon(Icons.download_rounded),
            onPressed: () async {
              try {
                final saved = await VaultFileActionsService.saveToDownloads(api, file);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Saved to $saved')));
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ApiClient.extractErrorMessage(e))));
                }
              }
            },
          ),
          IconButton(
            tooltip: 'Share',
            icon: const Icon(Icons.share_outlined),
            onPressed: () async {
              try {
                await VaultFileActionsService.shareVaultFile(api, file);
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ApiClient.extractErrorMessage(e))));
                }
              }
            },
          ),
        ],
      ),
      body: Center(
        child: InteractiveViewer(
          minScale: 0.8,
          maxScale: 5.0,
          child: Image.network(
            imageUrl,
            fit: BoxFit.contain,
            loadingBuilder: (_, child, progress) {
              if (progress == null) return child;
              return const Center(child: CircularProgressIndicator(color: AppTheme.voltLime));
            },
            errorBuilder: (_, __, ___) => const Center(
              child: Text('Unable to load image preview', style: TextStyle(color: Colors.white70)),
            ),
          ),
        ),
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
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                fontFamily: 'monospace',
                color: AppTheme.textPrimaryOf(context),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
