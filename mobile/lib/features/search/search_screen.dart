import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _controller = TextEditingController();
  final ApiClient _api = ApiClient();
  List<dynamic> _results = [];
  bool _isLoading = false;
  String _selectedCategory = 'all';

  Future<void> _search(String query) async {
    if (query.trim().isEmpty) return;
    setState(() => _isLoading = true);

    try {
      final res = await _api.dio.get(
        '/api/v2/search',
        queryParameters: {'q': query.trim(), 'category': _selectedCategory},
      );
      if (res.statusCode == 200 && mounted) {
        setState(() {
          _results = res.data['results'] ?? [];
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Search failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final surface = AppTheme.surfaceOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Natural Language Search'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _controller,
              textInputAction: TextInputAction.search,
              onSubmitted: _search,
              style: TextStyle(color: primaryText),
              decoration: InputDecoration(
                hintText: "Ask: 'AWS pricing', 'college admission'...",
                prefixIcon: Icon(Icons.search, color: brand),
                suffixIcon: _isLoading
                    ? Padding(
                        padding: const EdgeInsets.all(12),
                        child: SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: brand),
                        ),
                      )
                    : IconButton(
                        icon: Icon(Icons.arrow_forward, color: brand),
                        onPressed: () => _search(_controller.text),
                      ),
              ),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: ['all', 'photos', 'documents', 'screenshots', 'videos'].map((cat) {
                final active = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(cat[0].toUpperCase() + cat.substring(1)),
                    selected: active,
                    onSelected: (_) {
                      setState(() => _selectedCategory = cat);
                      if (_controller.text.trim().isNotEmpty) _search(_controller.text);
                    },
                    backgroundColor: surface,
                    selectedColor: brand.withOpacity(0.16),
                    checkmarkColor: brand,
                    side: BorderSide(color: active ? brand : border),
                    labelStyle: TextStyle(
                      color: active ? brand : secondaryText,
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: _results.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.manage_search, size: 58, color: secondaryText.withOpacity(0.55)),
                        const SizedBox(height: 12),
                        Text(
                          'Search across photos, OCR notes & PDFs',
                          style: TextStyle(color: secondaryText, fontSize: 13.5),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _results.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final item = _results[index];
                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    item['file_name'] ?? 'File',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: primaryText),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: brand.withOpacity(0.14),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    item['why_matched'] ?? item['match_type'] ?? 'Match',
                                    style: TextStyle(color: brand, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              item['snippet'] ?? '',
                              style: TextStyle(fontSize: 12, color: secondaryText, height: 1.45),
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
