import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../auth/auth_provider.dart';
import '../auth/auth_sheet.dart';
import '../files/file_detail_sheet.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _controller = TextEditingController();
  final ApiClient _api = ApiClient();
  List<dynamic> _results = [];
  List<String> _history = [];
  bool _isLoading = false;
  bool _hasSearched = false;
  String? _searchError;
  String _selectedCategory = 'all';

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    if (!ref.read(authProvider).isAuthenticated) {
      if (mounted) setState(() => _history = []);
      return;
    }
    try {
      final res = await _api.dio.get('/api/v2/search/history');
      if (res.statusCode == 200 && res.data is Map && mounted) {
        final raw = (res.data['history'] as List?) ?? [];
        setState(() {
          _history = raw
              .map((h) => (h is Map ? h['query'] : h)?.toString() ?? '')
              .where((q) => q.trim().isNotEmpty)
              .toSet()
              .take(6)
              .toList();
        });
      }
    } catch (_) {}
  }

  Future<void> _search(String query) async {
    final clean = query.trim();
    if (clean.isEmpty) return;

    if (!ref.read(authProvider).isAuthenticated) {
      final ok = await showVaultAuthSheet(context, ref);
      if (!ok || !mounted) return;
    }

    setState(() {
      _isLoading = true;
      _hasSearched = true;
      _searchError = null;
    });

    try {
      final res = await _api.dio.get(
        '/api/v2/search',
        queryParameters: {'q': clean, 'category': _selectedCategory},
      );
      if (res.statusCode == 200 && mounted) {
        setState(() {
          _results = (res.data is Map ? res.data['results'] : null) ?? [];
        });
        // Persist query silently to cloud history for Web & Android parity
        _persistHistory(clean, _results.length);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _searchError = ApiClient.extractErrorMessage(e));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _persistHistory(String queryText, int count) async {
    try {
      await _api.dio.post('/api/v2/search/history', data: {
        'query': queryText,
        'result_count': count,
      });
      await _fetchHistory();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    ref.listen<AuthState>(authProvider, (prev, next) {
      if (prev?.syncVersion != next.syncVersion) {
        if (!next.isAuthenticated) {
          setState(() {
            _results = [];
            _history = [];
            _hasSearched = false;
            _searchError = null;
          });
        } else {
          _fetchHistory();
          if (_controller.text.trim().isNotEmpty) {
            _search(_controller.text);
          }
        }
      }
    });

    final surface = AppTheme.surfaceOf(context);
    final elevated = AppTheme.elevatedOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);
    final baseUrl = _api.dio.options.baseUrl;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Natural Language Search'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
            child: TextField(
              controller: _controller,
              textInputAction: TextInputAction.search,
              onSubmitted: _search,
              style: TextStyle(color: primaryText, fontSize: 14),
              decoration: InputDecoration(
                hintText: "Ask: 'train ticket', 'receipt', 'notes'...",
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
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (_controller.text.isNotEmpty)
                            IconButton(
                              icon: Icon(Icons.clear_rounded, size: 18, color: secondaryText),
                              onPressed: () {
                                _controller.clear();
                                setState(() {
                                  _results = [];
                                  _hasSearched = false;
                                });
                              },
                            ),
                          IconButton(
                            icon: Icon(Icons.arrow_forward_rounded, color: brand),
                            onPressed: () => _search(_controller.text),
                          ),
                        ],
                      ),
              ),
              onChanged: (_) => setState(() {}),
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
          if (_searchError != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.error.withOpacity(0.35)),
                ),
                child: Text(_searchError!, style: const TextStyle(fontSize: 12, color: AppTheme.error)),
              ),
            ),
          const SizedBox(height: 4),
          Expanded(
            child: _results.isEmpty
                ? ListView(
                    padding: const EdgeInsets.all(24),
                    children: [
                      const SizedBox(height: 24),
                      Center(
                        child: Column(
                          children: [
                            Icon(Icons.manage_search, size: 54, color: secondaryText.withOpacity(0.55)),
                            const SizedBox(height: 12),
                            Text(
                              !auth.isAuthenticated
                                  ? 'Sign in to search your cloud photos, receipts & PDFs'
                                  : _hasSearched
                                      ? 'No matching memories for "${_controller.text.trim()}"'
                                      : 'Search across photos, OCR notes & PDFs',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: primaryText, fontWeight: FontWeight.w600, fontSize: 14),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Uses pgvector semantic similarity + OCR full-text indexing.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: secondaryText, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      if (!auth.isAuthenticated) ...[
                        const SizedBox(height: 16),
                        Center(
                          child: ElevatedButton(
                            onPressed: () => showVaultAuthSheet(context, ref),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.voltLime,
                              foregroundColor: const Color(0xFF101211),
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            ),
                            child: const Text('Sign In to Search', style: TextStyle(fontWeight: FontWeight.w800)),
                          ),
                        ),
                      ] else if (_history.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        Text(
                          'Recent Searches',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: secondaryText),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _history.map((q) => ActionChip(
                            avatar: Icon(Icons.history_rounded, size: 15, color: brand),
                            label: Text(q, style: TextStyle(fontSize: 12, color: primaryText)),
                            backgroundColor: surface,
                            side: BorderSide(color: border),
                            onPressed: () {
                              _controller.text = q;
                              _search(q);
                            },
                          )).toList(),
                        ),
                      ],
                    ],
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _results.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final item = Map<String, dynamic>.from(_results[index] as Map);
                      final isImg = isRenderableImageFile(item);
                      final thumbUrl = item['thumbnail_url']?.toString() ?? '';
                      final fullUrl = thumbUrl.startsWith('http') ? thumbUrl : '$baseUrl$thumbUrl';
                      final cat = item['category']?.toString() ?? 'documents';

                      return InkWell(
                        onTap: () => showVaultFileDetailSheet(
                          context: context,
                          file: item,
                          api: _api,
                          onChanged: () => _search(_controller.text),
                        ),
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: surface,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: border),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  width: 48,
                                  height: 48,
                                  color: elevated,
                                  child: isImg
                                      ? Image.network(
                                          fullUrl,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => Icon(categoryIconFor(cat), color: brand, size: 22),
                                        )
                                      : Icon(categoryIconFor(cat), color: brand, size: 22),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            item['file_name'] ?? item['original_name'] ?? 'File',
                                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: primaryText),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
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
                                    const SizedBox(height: 5),
                                    Text(
                                      item['snippet'] ?? '',
                                      style: TextStyle(fontSize: 12, color: secondaryText, height: 1.4),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
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
