import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';

class MemoriesScreen extends StatefulWidget {
  const MemoriesScreen({super.key});

  @override
  State<MemoriesScreen> createState() => _MemoriesScreenState();
}

class _MemoriesScreenState extends State<MemoriesScreen> {
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
      if (res.statusCode == 200 && res.data['collections'] != null) {
        setState(() {
          _collections = res.data['collections'];
        });
      }
    } catch (e) {
      // Offline fallback
      setState(() {
        _collections = [
          {'name': 'Recent Screenshots', 'description': 'Receipts, code snippets & UI errors', 'type': 'screenshots', 'is_smart': true},
          {'name': 'Important Documents', 'description': 'Starred contracts, IDs & certificates', 'type': 'important', 'is_smart': true},
          {'name': 'Bills & Invoices', 'description': 'Automated payment receipts & statements', 'type': 'bills', 'is_smart': true},
          {'name': 'Large Files (>20MB)', 'description': 'High-resolution videos, archives & datasets', 'type': 'large_files', 'is_smart': true},
        ];
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  IconData _getIcon(String type) {
    switch (type) {
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

  Color _getColor(String type) {
    switch (type) {
      case 'screenshots':
        return AppTheme.accent;
      case 'important':
        return Colors.amberAccent;
      case 'bills':
        return Colors.blueAccent;
      case 'large_files':
        return Colors.purpleAccent;
      default:
        return Colors.tealAccent;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Memories & Collections'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.accent))
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _collections.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final c = _collections[index];
                final type = c['type'] ?? 'custom';
                final color = _getColor(type);
                final icon = _getIcon(type);

                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderSubtle),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(icon, color: color, size: 24),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    c['name'] ?? 'Collection',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (c['is_smart'] == true)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppTheme.accent.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text('Smart', style: TextStyle(color: AppTheme.accent, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              c['description'] ?? 'Album in digital vault',
                              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: AppTheme.textMuted),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
