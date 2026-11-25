import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';

class ChatMessage {
  final String role; // 'user' or 'assistant'
  final String content;
  final List<dynamic>? citations;
  final bool isLoading;

  ChatMessage({
    required this.role,
    required this.content,
    this.citations,
    this.isLoading = false,
  });

  ChatMessage copyWith({
    String? role,
    String? content,
    List<dynamic>? citations,
    bool? isLoading,
  }) {
    return ChatMessage(
      role: role ?? this.role,
      content: content ?? this.content,
      citations: citations ?? this.citations,
      isLoading: isLoading ?? this.isLoading,
    );
  }
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

    // Welcome message
    _messages.add(ChatMessage(
      role: 'assistant',
      content: 'Hello! I am your VectorGallery AI Digital Memory Assistant.\n\n'
          'You can ask me anything about your uploaded documents, screenshots, and photos. '
          'I retrieve and ground answers directly in your stored files.',
    ));
  }

  Future<void> _loadCustomApiKey() async {
    final key = await _storage.read(key: 'vm_ai_api_key') ?? await _storage.read(key: 'vm_gemini_api_key');
    if (mounted) {
      setState(() => _customApiKey = key);
    }
  }

  Future<void> _saveCustomApiKey(String key) async {
    await _storage.write(key: 'vm_ai_api_key', value: key.trim());
    if (mounted) {
      setState(() => _customApiKey = key.trim());
      final modelName = key.trim().startsWith('gsk_') ? 'Groq Llama 3.3' : 'Google Gemini';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$modelName API key saved! Full AI reasoning activated.')),
      );
    }
  }

  String _getModelLabel() {
    if (_customApiKey == null || _customApiKey!.isEmpty) {
      return 'Cloud AI Ready (Gemini / Groq)';
    }
    if (_customApiKey!.startsWith('gsk_')) {
      return 'Groq LPU (Active)';
    }
    if (_customApiKey!.startsWith('AQ.') || _customApiKey!.startsWith('AIzaSy')) {
      return 'Google Gemini 2.5 Flash (Active)';
    }
    if (_customApiKey!.startsWith('sk-')) {
      return 'OpenAI GPT-4o (Active)';
    }
    return 'Gemini AI (Active)';
  }

  void _showApiKeyDialog() {
    final controller = TextEditingController(text: _customApiKey ?? '');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.auto_awesome, color: AppTheme.accent),
            SizedBox(width: 8),
            Text('Configure Free AI Key', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Paste your free Google Gemini API key (AQ... or AIzaSy...) or Groq API key (starts with gsk_) to activate real generative AI answers.',
              style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'Gemini or Groq API Key',
                hintText: 'AQ... or gsk_...',
              ),
              obscureText: true,
            ),
            const SizedBox(height: 8),
            const Text(
              '• Groq Free Key: console.groq.com/keys\n• Gemini Free Key: aistudio.google.com/app/apikey',
              style: TextStyle(fontSize: 11, color: AppTheme.accent, height: 1.4),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
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

    final payload = {
      'query': trimmed,
      if (_selectedFileId != null) 'selectedFileIds': [_selectedFileId],
      if (_customApiKey != null && _customApiKey!.isNotEmpty) 'apiKey': _customApiKey,
      'provider': 'gemini',
    };

    try {
      final response = await _api.dio.post(
        '/api/v2/chat',
        data: payload,
      );

      final rawData = response.data.toString();
      String aggregatedContent = '';
      List<dynamic> citations = [];

      // Parse Server-Sent Events (SSE) stream
      final lines = const LineSplitter().convert(rawData);
      for (final line in lines) {
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
            isLoading: false,
          );
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages[_messages.length - 1] = ChatMessage(
            role: 'assistant',
            content: 'Failed to contact AI assistant: $e\n\n'
                'Please check that your VectorGallery backend server is running and reachable.',
            isLoading: false,
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
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.auto_awesome, color: AppTheme.accent, size: 18),
                SizedBox(width: 8),
                Text('AI Memory Assistant', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            Text(
              _getModelLabel(),
              style: TextStyle(
                fontSize: 11,
                color: (_customApiKey != null && _customApiKey!.isNotEmpty)
                    ? AppTheme.accent
                    : Colors.amberAccent,
              ),
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
          // Selected File Context Banner (if any)
          if (_selectedFileName != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: AppTheme.accent.withOpacity(0.12),
              child: Row(
                children: [
                  const Icon(Icons.attach_file, color: AppTheme.accent, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Focusing on: $_selectedFileName',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.accent),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 16, color: AppTheme.accent),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    onPressed: () {
                      setState(() {
                        _selectedFileId = null;
                        _selectedFileName = null;
                      });
                    },
                  ),
                ],
              ),
            ),

          // Message List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg.role == 'user';

                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Column(
                    crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                    children: [
                      Container(
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.85),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isUser ? AppTheme.accent : const Color(0xFF131822),
                          borderRadius: BorderRadius.circular(16).copyWith(
                            bottomRight: isUser ? const Radius.circular(2) : const Radius.circular(16),
                            bottomLeft: !isUser ? const Radius.circular(2) : const Radius.circular(16),
                          ),
                          border: isUser ? null : Border.all(color: AppTheme.borderSubtle),
                        ),
                        child: msg.isLoading
                            ? const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  SizedBox(
                                    width: 14,
                                    height: 14,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.accent),
                                  ),
                                  SizedBox(width: 10),
                                  Text('Searching memory & reasoning...', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                ],
                              )
                            : SelectableText(
                                msg.content,
                                style: TextStyle(
                                  color: isUser ? Colors.white : AppTheme.textPrimary,
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                      ),

                      // Grounded Citations
                      if (msg.citations != null && msg.citations!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Padding(
                          padding: const EdgeInsets.only(left: 4),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Sources & Citations:', style: TextStyle(fontSize: 11, color: AppTheme.textMuted, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              ...msg.citations!.map((c) => Container(
                                    margin: const EdgeInsets.only(bottom: 4),
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0F141C),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppTheme.borderSubtle),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.description_outlined, size: 14, color: AppTheme.accent),
                                        const SizedBox(width: 6),
                                        Text(
                                          c['file_name'] ?? 'File',
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.accent),
                                        ),
                                      ],
                                    ),
                                  )),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),

          // Suggested Starter Chips (only when short history)
          if (_messages.length <= 2)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                children: [
                  _SuggestionChip(
                    label: '📄 What files do I have?',
                    onTap: () => _sendMessage('What files and documents do I have in my library?'),
                  ),
                  _SuggestionChip(
                    label: '🔍 Search my notes',
                    onTap: () => _sendMessage('Summarize my notes and key information'),
                  ),
                  _SuggestionChip(
                    label: '📸 What photos are saved?',
                    onTap: () => _sendMessage('List all photos and screenshots saved on my device'),
                  ),
                ],
              ),
            ),

          // Input Bar
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: AppTheme.surface,
              border: Border(top: BorderSide(color: AppTheme.borderSubtle)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _inputController,
                      textInputAction: TextInputAction.send,
                      onSubmitted: _sendMessage,
                      decoration: InputDecoration(
                        hintText: 'Ask VectorGallery about your files...',
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.send_rounded, color: AppTheme.accent),
                          onPressed: () => _sendMessage(_inputController.text),
                        ),
                      ),
                    ),
                  ),
                ],
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
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        label: Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.accent)),
        backgroundColor: AppTheme.accent.withOpacity(0.1),
        side: BorderSide(color: AppTheme.accent.withOpacity(0.3)),
        onPressed: onTap,
      ),
    );
  }
}

