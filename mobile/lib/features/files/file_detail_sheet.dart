import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../chat/chat_screen.dart';

bool isRenderableImageFile(Map<String, dynamic> file) {
  final category = file['category']?.toString() ?? '';
  final mime = file['mime_type']?.toString() ?? '';
  final name = (file['original_name'] ?? file['name'] ?? '').toString().toLowerCase();
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

/// Shared website-aligned file preview sheet with pinch-to-zoom image viewer,
/// OCR excerpt copy, Ask AI deep-link, Star, Rename, Add-to-Album, and Trash/Restore.
void showVaultFileDetailSheet({
  required BuildContext context,
  required Map<String, dynamic> file,
  required ApiClient api,
  bool isTrashItem = false,
  VoidCallback? onChanged,
}) {
  final id = (file['id'] ?? file['file_id'])?.toString() ?? '';
  final name = file['original_name']?.toString() ?? file['file_name']?.toString() ?? file['name']?.toString() ?? 'File';
  final sizeBytes = (file['size_bytes'] as num?)?.toDouble();
  final sizeLabel = sizeBytes != null
      ? (sizeBytes >= 1024 * 1024
          ? '${(sizeBytes / (1024 * 1024)).toStringAsFixed(2)} MB'
          : '${(sizeBytes / 1024).toStringAsFixed(1)} KB')
      : (file['formatted_size']?.toString() ?? 'Unknown');
  final mime = file['mime_type']?.toString() ?? 'application/octet-stream';
  final category = file['category']?.toString() ?? 'documents';
  final hash = file['sha256_hash']?.toString() ?? '';
  final text = file['extracted_text']?.toString() ?? file['snippet']?.toString() ?? '';
  final isFavorite = file['is_favorite'] == true;
  final thumbnailUrl = file['thumbnail_url']?.toString() ?? '';
  final baseUrl = api.dio.options.baseUrl;
  final fullImageUrl = thumbnailUrl.startsWith('http') ? thumbnailUrl : '$baseUrl$thumbnailUrl';

  final surface = AppTheme.surfaceOf(context);
  final elevated = AppTheme.elevatedOf(context);
  final border = AppTheme.borderOf(context);
  final primaryText = AppTheme.textPrimaryOf(context);
  final secondaryText = AppTheme.textSecondaryOf(context);
  final brand = AppTheme.brandOf(context);

  Future<void> toggleFavorite() async {
    try {
      final res = await api.dio.patch('/api/v2/files/$id', data: {'is_favorite': !isFavorite});
      if (res.statusCode == 200 && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(!isFavorite ? 'Starred "$name"' : 'Removed star from "$name"')),
        );
        onChanged?.call();
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiClient.extractErrorMessage(e))),
        );
      }
    }
  }

  Future<void> renameFile() async {
    final controller = TextEditingController(text: name);
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
    if (newName != null && newName.isNotEmpty && newName != name) {
      try {
        final res = await api.dio.patch('/api/v2/files/$id', data: {'original_name': newName});
        if (res.statusCode == 200 && context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Renamed to "$newName"')));
          onChanged?.call();
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ApiClient.extractErrorMessage(e))));
        }
      }
    }
  }

  Future<void> restoreFile() async {
    try {
      final res = await api.dio.post('/api/v2/files/restore', data: {'fileIds': [id]});
      if (res.statusCode == 200 && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Restored "$name"')));
        onChanged?.call();
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ApiClient.extractErrorMessage(e))));
      }
    }
  }

  Future<void> deleteFile({required bool permanent}) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(permanent ? 'Delete Forever?' : 'Move to Trash?'),
        content: Text(
          permanent
              ? 'Permanently delete "$name" from cloud storage? This cannot be undone.'
              : 'Move "$name" to Trash? You can restore it anytime from Trash on mobile or web.',
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
      final res = await api.dio.delete('/api/v2/files/$id${permanent ? '?permanent=true' : ''}');
      if (res.statusCode == 200 && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(permanent ? 'Permanently deleted "$name"' : 'Moved "$name" to Trash')),
        );
        onChanged?.call();
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ApiClient.extractErrorMessage(e))));
      }
    }
  }

  Future<void> addToAlbum() async {
    try {
      final res = await api.dio.get('/api/v2/collections');
      final all = (res.data is Map ? res.data['collections'] : []) as List? ?? [];
      final customCols = all.where((c) => c['is_smart'] != true).toList();
      if (!context.mounted) return;
      if (customCols.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Create a custom album in Library → Albums first.')),
        );
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
                          Icon(Icons.folder_special_outlined, color: brand, size: 19),
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
      if (pickedId != null) {
        await api.dio.post('/api/v2/collections/$pickedId/files', data: {'file_id': id});
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Added "$name" to album')));
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ApiClient.extractErrorMessage(e))));
      }
    }
  }

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: surface,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (ctx) => DraggableScrollableSheet(
      initialChildSize: 0.74,
      maxChildSize: 0.94,
      minChildSize: 0.42,
      expand: false,
      builder: (_, scrollCtrl) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: ListView(
          controller: scrollCtrl,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(
                  color: secondaryText.withOpacity(0.3),
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
                  child: Icon(categoryIconFor(category), color: brand, size: 21),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15.5, color: primaryText),
                      ),
                      const SizedBox(height: 2),
                      Text('$category • $sizeLabel', style: TextStyle(color: secondaryText, fontSize: 12)),
                    ],
                  ),
                ),
                if (!isTrashItem && id.isNotEmpty)
                  IconButton(
                    icon: Icon(isFavorite ? Icons.star_rounded : Icons.star_border_rounded,
                        color: isFavorite ? Colors.amber : secondaryText),
                    onPressed: () {
                      Navigator.pop(ctx);
                      toggleFavorite();
                    },
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (isRenderableImageFile(file)) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  height: 240,
                  width: double.infinity,
                  color: elevated,
                  child: InteractiveViewer(
                    minScale: 1,
                    maxScale: 4,
                    child: Image.network(
                      fullImageUrl,
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
                            Text('Preview unavailable', style: TextStyle(color: secondaryText, fontSize: 11.5)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
            Divider(color: border),
            const SizedBox(height: 8),
            _DetailRow(label: 'MIME Type', value: mime),
            if (hash.isNotEmpty)
              _DetailRow(label: 'SHA-256', value: hash.length > 22 ? '${hash.substring(0, 22)}...' : hash),
            if (text.isNotEmpty) ...[
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
                      Clipboard.setData(ClipboardData(text: text));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Copied extracted text')),
                      );
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
                  text.length > 600 ? '${text.substring(0, 600)}...' : text,
                  style: TextStyle(fontSize: 12.5, color: primaryText, height: 1.45),
                ),
              ),
            ],
            if (id.isNotEmpty) ...[
              const SizedBox(height: 18),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: isTrashItem
                    ? [
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            restoreFile();
                          },
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
                          onPressed: () {
                            Navigator.pop(ctx);
                            deleteFile(permanent: true);
                          },
                          icon: const Icon(Icons.delete_forever_outlined, color: AppTheme.error, size: 16),
                          label: const Text('Delete Forever', style: TextStyle(color: AppTheme.error, fontSize: 12.5)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.error),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                        ),
                      ]
                    : [
                        ElevatedButton.icon(
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
                          label: const Text('Ask AI', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.voltLime,
                            foregroundColor: const Color(0xFF101211),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            renameFile();
                          },
                          icon: const Icon(Icons.edit_outlined, size: 16),
                          label: const Text('Rename', style: TextStyle(fontSize: 12.5)),
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            addToAlbum();
                          },
                          icon: const Icon(Icons.collections_bookmark_outlined, size: 16),
                          label: const Text('Album', style: TextStyle(fontSize: 12.5)),
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            deleteFile(permanent: false);
                          },
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
    ),
  );
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

