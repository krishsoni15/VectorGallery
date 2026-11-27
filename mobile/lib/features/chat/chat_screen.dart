import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';

class ChatMessage {
  final String role;
  final String content;
  final List<dynamic>? citations;
  final bool isLoading;

  ChatMessage({
    required this.role,
    required this.content,
    this.citations,
    this.isLoading = false,
  });
}

class ChatScreen extends StatefulWidget {
  final String? initialFileId;
  final String? initialFileName;

  const ChatScreen({super.key, this.initialFileId, this.initialFileName});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ApiClient _api = ApiClient();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  final List<ChatMessage> _messages = [];
  bool _isSending = false;
  String? _selectedFileId;
  String? _selectedFileName;
  String? _customApiKey;

  @override
  void initState() {
    super.initState();
    _selectedFileId = widget.initialFileId;
    _selectedFileName = widget.initialFileName;
    _loadCustomApiKey();

    _messages.add(ChatMessage(
      role: 'assistant',
      content: 'Hello! I am your VectorGallery AI Digital Memory Assistant.\n\n'
          'Ask anything about your uploaded photos, receipts, screenshots, or documents. '
          'Every answer is grounded in your personal vault files.',
    ));
  }

  Future<void> _loadCustomApiKey() async {
    final key = await _storage.read(key: 'vm_ai_api_key') ?? await _storage.read(key: 'vm_gemini_api_key');
    if (mounted) setState(() => _customApiKey = key);
  }

  Future<void> _saveCustomApiKey(String key) async {
    await _storage.write(key: 'vm_ai_api_key', value: key.trim());
    if (mounted) {
      setState(() => _customApiKey = key.trim());
      final modelName = key.trim().startsWith('gsk_') ? 'Groq Llama 3.3' : 'Google Gemini';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$modelName API key saved cleanly')),
      );
    }
  }

  String _getModelLabel() {
    if (_customApiKey == null || _customApiKey!.isEmpty) {
      return 'System AI Ready (Gemini / Groq)';
    }
    if (_customApiKey!.startsWith('gsk_')) return 'Groq Llama 3.3 (Personal)';
    if (_customApiKey!.startsWith('sk-')) return 'OpenAI GPT-4o (Personal)';
    return 'Google Gemini (Personal)';
  }

  void _showApiKeyDialog() {
    final controller = TextEditingController(text: _customApiKey ?? '');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Personal AI Key (Optional)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Optional: enter a Gemini (AIzaSy...) or Groq (gsk_...) key, or leave blank to use your configured server defaults.',
              style: TextStyle(fontSize: 12, color: AppTheme.textSecondaryOf(ctx)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(labelText: 'API Key', hintText: 'AIzaSy... or gsk_...'),
              obscureText: true,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accent, foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(ctx);
              _saveCustomApiKey(controller.text);
            },
            child: const Text('Save Key'),
          ),
        ],
      ),
    );
  }

  Future<void> _sendMessage(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty || _isSending) return;

    _inputController.clear();
    setState(() {
      _messages.add(ChatMessage(role: 'user', content: trimmed));
      _messages.add(ChatMessage(role: 'assistant', content: '', isLoading: true));
      _isSending = true;
    });
    _scrollToBottom();

    final provider = (_customApiKey != null && _customApiKey!.startsWith('gsk_'))
        ? 'groq'
        : (_customApiKey != null && _customApiKey!.startsWith('sk-'))
            ? 'openai'
            : 'gemini';

    final payload = {
      'query': trimmed,
      if (_selectedFileId != null) 'selectedFileIds': [_selectedFileId],
      if (_customApiKey != null && _customApiKey!.isNotEmpty) 'apiKey': _customApiKey,
      'provider': provider,
    };

    try {
      final response = await _api.dio.post('/api/v2/chat', data: payload);
      final rawData = response.data.toString();
      String aggregatedContent = '';
      List<dynamic> citations = [];

      for (final line in const LineSplitter().convert(rawData)) {
        if (line.startsWith('data: ')) {
          final jsonStr = line.substring(6).trim();
          if (jsonStr.isEmpty || jsonStr == '[DONE]') continue;
          try {
            final parsed = jsonDecode(jsonStr);
            if (parsed['type'] == 'token') {
              aggregatedContent += parsed['content'] ?? '';
            } else if (parsed['type'] == 'citations') {
              citations = parsed['citations'] ?? [];
            }
          } catch (_) {}
        }
      }

      if (aggregatedContent.isEmpty) {
        aggregatedContent = 'Response received, but content was empty.';
      }

      if (mounted) {
        setState(() {
          _messages[_messages.length - 1] = ChatMessage(
            role: 'assistant',
            content: aggregatedContent,
            citations: citations.isNotEmpty ? citations : null,
          );
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages[_messages.length - 1] = ChatMessage(
            role: 'assistant',
            content: 'Unable to reach VectorGallery AI server: $e\n\nCheck Settings → Host Server URL or Sign In.',
          );
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isSending = false);
        _scrollToBottom();
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 280),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _showCitationPreview(Map<String, dynamic> cite) {
    final surface = AppTheme.surfaceOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);

    showModalBottomSheet(
      context: context,
      backgroundColor: surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.description_outlined, color: brand),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    cite['file_name']?.toString() ?? 'Verified File',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: primaryText),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              cite['excerpt']?.toString() ?? 'Matched file chunk in your vault.',
              style: TextStyle(fontSize: 13, height: 1.5, color: secondaryText),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppTheme.isDark(context);
    final surface = AppTheme.surfaceOf(context);
    final elevated = AppTheme.elevatedOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.auto_awesome, color: brand, size: 18),
                const SizedBox(width: 8),
                Text('AI Assistant', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: primaryText)),
              ],
            ),
            Text(
              _getModelLabel(),
              style: TextStyle(fontSize: 11, color: brand),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.key_outlined),
            tooltip: 'Configure AI Key',
            onPressed: _showApiKeyDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          if (_selectedFileName != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: brand.withOpacity(0.12),
              child: Row(
                children: [
                  Icon(Icons.attach_file, color: brand, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Focusing on: $_selectedFileName',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: brand),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.close, size: 16, color: brand),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    onPressed: () => setState(() {
                      _selectedFileId = null;
                      _selectedFileName = null;
                    }),
                  ),
                ],
              ),
            ),

          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg.role == 'user';
                final userBg = isDark ? AppTheme.voltLime : AppTheme.lightTextPrimary;
                final userFg = isDark ? const Color(0xFF090B0D) : Colors.white;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Column(
                    crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                    children: [
                      Container(
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.85),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isUser ? userBg : surface,
                          borderRadius: BorderRadius.circular(18).copyWith(
                            bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(18),
                            bottomLeft: !isUser ? const Radius.circular(4) : const Radius.circular(18),
                          ),
                          border: isUser ? null : Border.all(color: border),
                        ),
                        child: msg.isLoading
                            ? Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  SizedBox(
                                    width: 14,
                                    height: 14,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: brand),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    'Searching vault & synthesizing...',
                                    style: TextStyle(fontSize: 12, color: secondaryText),
                                  ),
                                ],
                              )
                            : SelectableText(
                                msg.content,
                                style: TextStyle(
                                  color: isUser ? userFg : primaryText,
                                  fontSize: 13.5,
                                  height: 1.45,
                                  fontWeight: isUser ? FontWeight.w600 : FontWeight.normal,
                                ),
                              ),
                      ),

                      if (msg.citations != null && msg.citations!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: msg.citations!.map((c) {
                            final citeMap = c is Map<String, dynamic> ? c : Map<String, dynamic>.from(c as Map);
                            return InkWell(
                              onTap: () => _showCitationPreview(citeMap),
                              borderRadius: BorderRadius.circular(20),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: elevated,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: border),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.description_outlined, size: 13, color: brand),
                                    const SizedBox(width: 5),
                                    Text(
                                      citeMap['file_name']?.toString() ?? 'File',
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: primaryText),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),

          if (_messages.length <= 2)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                children: [
                  _SuggestionChip(
                    label: 'What files do I have?',
                    onTap: () => _sendMessage('What files and documents do I have in my vault?'),
                  ),
                  _SuggestionChip(
                    label: 'Summarize notes & receipts',
                    onTap: () => _sendMessage('Summarize my receipts and important notes'),
                  ),
                  _SuggestionChip(
                    label: 'Recent photos',
                    onTap: () => _sendMessage('List recent photos and screenshots saved in my vault'),
                  ),
                ],
              ),
            ),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: surface,
              border: Border(top: BorderSide(color: border)),
            ),
            child: SafeArea(
              child: TextField(
                controller: _inputController,
                style: TextStyle(color: primaryText),
                textInputAction: TextInputAction.send,
                onSubmitted: _sendMessage,
                decoration: InputDecoration(
                  hintText: 'Ask VectorGallery about your vault...',
                  suffixIcon: IconButton(
                    icon: Icon(Icons.send_rounded, color: brand),
                    onPressed: () => _sendMessage(_inputController.text),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SuggestionChip extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _SuggestionChip({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final brand = AppTheme.brandOf(context);
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        label: Text(label, style: TextStyle(fontSize: 11.5, color: brand, fontWeight: FontWeight.w600)),
        backgroundColor: AppTheme.surfaceOf(context),
        side: BorderSide(color: AppTheme.borderOf(context)),
        onPressed: onTap,
      ),
    );
  }
}
