import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../auth/auth_provider.dart';
import '../files/file_detail_sheet.dart';

class MemoriesScreen extends ConsumerStatefulWidget {
  const MemoriesScreen({super.key});

  @override
  ConsumerState<MemoriesScreen> createState() => _MemoriesScreenState();
}

class _MemoriesScreenState extends ConsumerState<MemoriesScreen> {
  final ApiClient _api = ApiClient();
  List<dynamic> _collections = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchCollections();
  }

  Future<void> _fetchCollections() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.dio.get('/api/v2/collections');
      if (res.statusCode == 200 && res.data['collections'] != null && mounted) {
        setState(() {
          _collections = res.data['collections'];
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _collections = [
            {'id': 'smart-diwali', 'name': 'Diwali & New Year Wishes', 'description': 'Festive greeting cards, diyas & blessings', 'type': 'diwali', 'is_smart': true},
            {'id': 'smart-screenshots', 'name': 'Recent Screenshots', 'description': 'Receipts, code snippets & UI captures', 'type': 'screenshots', 'is_smart': true},
            {'id': 'smart-important', 'name': 'Important Documents', 'description': 'Starred contracts, IDs & certificates', 'type': 'important', 'is_smart': true},
            {'id': 'smart-bills', 'name': 'Bills & Invoices', 'description': 'Payment receipts & financial records', 'type': 'bills', 'is_smart': true},
            {'id': 'smart-large-files', 'name': 'Large Files (>20MB)', 'description': 'High-resolution videos & archives', 'type': 'large_files', 'is_smart': true},
          ];
        });
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _openCollectionDetail(Map<String, dynamic> col) async {
    final surface = AppTheme.surfaceOf(context);
    final elevated = AppTheme.elevatedOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);
    final colId = col['id']?.toString() ?? '';
    final isSmart = col['is_smart'] == true;
    final baseUrl = _api.dio.options.baseUrl;

    List<dynamic> items = [];
    try {
      final res = await _api.dio.get('/api/v2/collections/$colId/files');
      if (res.statusCode == 200 && res.data is Map && res.data['files'] is List) {
        items = res.data['files'] as List;
      }
    } catch (_) {
      // Fallback to client filter if offline/v2 fallback
      try {
        final res = await _api.dio.get('/api/v2/files', queryParameters: {'category': 'all', 'is_trashed': 'false'});
        final all = (res.data is Map ? res.data['files'] : []) as List? ?? [];
        final type = col['type']?.toString() ?? 'custom';
        final ids = ((col['file_ids'] as List?) ?? []).map((e) => e.toString()).toSet();
        items = all.where((f) {
          if (type == 'screenshots') return f['category'] == 'screenshots';
          if (type == 'important') return f['is_favorite'] == true;
          if (type == 'bills') {
            final txt = '${f['original_name'] ?? ''} ${f['extracted_text'] ?? ''}'.toLowerCase();
            return RegExp(r'receipt|bill|invoice|tax|payment').hasMatch(txt);
          }
          if (type == 'large_files') return ((f['size_bytes'] as num?) ?? 0) >= 20971520;
          if (type == 'diwali') {
            final txt = '${f['original_name'] ?? ''} ${f['extracted_text'] ?? ''}'.toLowerCase();
            return RegExp(r'diwali|new year|nutan|varshabhinandan|greeting|wish').hasMatch(txt);
          }
          return ids.contains(f['id']?.toString());
        }).toList();
      } catch (_) {}
    }

    if (!mounted) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.68,
        maxChildSize: 0.92,
        minChildSize: 0.4,
        builder: (_, ctrl) => Container(
          decoration: BoxDecoration(
            color: surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border(top: BorderSide(color: border)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          col['name']?.toString() ?? 'Album',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: primaryText),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${items.length} file${items.length == 1 ? '' : 's'} matching',
                          style: TextStyle(fontSize: 12, color: secondaryText),
                        ),
                      ],
                    ),
                  ),
                  if (!isSmart && colId.isNotEmpty)
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: AppTheme.error),
                      tooltip: 'Delete album',
                      onPressed: () async {
                        Navigator.pop(ctx);
                        try {
                          await _api.dio.delete('/api/v2/collections/$colId');
                          _fetchCollections();
                        } catch (e) {
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(ApiClient.extractErrorMessage(e))),
                            );
                          }
                        }
                      },
                    ),
                ],
              ),
              const SizedBox(height: 14),
              Expanded(
                child: items.isEmpty
                    ? Center(
                        child: Text(
                          'No matching files in this album yet.',
                          style: TextStyle(color: secondaryText, fontSize: 13),
                        ),
                      )
                    : ListView.separated(
                        controller: ctrl,
                        itemCount: items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, idx) {
                          final f = Map<String, dynamic>.from(items[idx] as Map);
                          final isImg = isRenderableImageFile(f);
                          final thumbUrl = f['thumbnail_url']?.toString() ?? '';
                          final fullUrl = thumbUrl.startsWith('http') ? thumbUrl : '$baseUrl$thumbUrl';
                          final cat = f['category']?.toString() ?? 'documents';

                          return ListTile(
                            onTap: () {
                              Navigator.pop(ctx);
                              showVaultFileDetailSheet(
                                context: context,
                                file: f,
                                api: _api,
                                onChanged: _fetchCollections,
                              );
                            },
                            tileColor: elevated,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                              side: BorderSide(color: border),
                            ),
                            leading: ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                width: 42,
                                height: 42,
                                color: surface,
                                child: isImg
                                    ? Image.network(
                                        fullUrl,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => Icon(categoryIconFor(cat), color: brand, size: 20),
                                      )
                                    : Icon(categoryIconFor(cat), color: brand, size: 20),
                              ),
                            ),
                            title: Text(
                              f['original_name']?.toString() ?? 'File',
                              style: TextStyle(color: primaryText, fontSize: 13.5, fontWeight: FontWeight.w600),
                              overflow: TextOverflow.ellipsis,
                            ),
                            subtitle: Text(
                              cat,
                              style: TextStyle(color: secondaryText, fontSize: 11.5),
                            ),
                            trailing: Icon(Icons.chevron_right_rounded, color: secondaryText, size: 18),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _createAlbumDialog() async {
    final nameCtrl = TextEditingController();
    final created = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New Collection'),
        content: TextField(
          controller: nameCtrl,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Album Name',
            hintText: 'e.g., Kyoto Trip, Tax Receipts',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.voltLime, foregroundColor: const Color(0xFF101211)),
            onPressed: () => Navigator.pop(ctx, nameCtrl.text.trim()),
            child: const Text('Create', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (created != null && created.isNotEmpty) {
      try {
        await _api.dio.post('/api/v2/collections', data: {'name': created, 'type': 'custom'});
        await _fetchCollections();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(ApiClient.extractErrorMessage(e))),
          );
        }
      }
    }
  }

  IconData _getIcon(String type) {
    switch (type) {
      case 'diwali':
        return Icons.celebration_outlined;
      case 'screenshots':
        return Icons.screenshot_outlined;
      case 'important':
        return Icons.star_border;
      case 'bills':
        return Icons.receipt_long_outlined;
      case 'large_files':
        return Icons.inventory_2_outlined;
      default:
        return Icons.folder_special_outlined;
    }
  }

  Color _getColor(BuildContext context, String type) {
    switch (type) {
      case 'diwali':
        return const Color(0xFFF59E0B);
      case 'screenshots':
        return AppTheme.brandOf(context);
      case 'important':
        return AppTheme.warnOf(context);
      case 'bills':
        return const Color(0xFF0284C7);
      case 'large_files':
        return const Color(0xFF7C3AED);
      default:
        return AppTheme.brandOf(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authProvider, (prev, next) {
      if (prev?.syncVersion != next.syncVersion) {
        _fetchCollections();
      }
    });

    final surface = AppTheme.surfaceOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Albums & Collections'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded),
            tooltip: 'New Album',
            onPressed: _createAlbumDialog,
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: brand))
          : RefreshIndicator(
              onRefresh: _fetchCollections,
              color: brand,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _collections.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final c = Map<String, dynamic>.from(_collections[index] as Map);
                  final type = c['type']?.toString() ?? 'custom';
                  final color = _getColor(context, type);
                  final icon = _getIcon(type);
                  final countList = (c['file_ids'] as List?) ?? [];

                  return InkWell(
                    onTap: () => _openCollectionDetail(c),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: color.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(icon, color: color, size: 22),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        c['name']?.toString() ?? 'Collection',
                                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: primaryText),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (c['is_smart'] == true)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: brand.withOpacity(0.14),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          'Smart',
                                          style: TextStyle(color: brand, fontSize: 10, fontWeight: FontWeight.bold),
                                        ),
                                      )
                                    else if (countList.isNotEmpty)
                                      Text(
                                        '${countList.length}',
                                        style: TextStyle(fontFamily: 'monospace', fontSize: 11, color: secondaryText),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  c['description']?.toString().isNotEmpty == true
                                      ? c['description'].toString()
                                      : 'Album in personal vault',
                                  style: TextStyle(color: secondaryText, fontSize: 12),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.chevron_right, color: secondaryText),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
