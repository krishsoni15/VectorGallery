import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../auth/auth_provider.dart';
import '../backup/backup_engine.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final BackupEngine _backupEngine = BackupEngine();
  final ApiClient _api = ApiClient();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  bool _wifiOnly = false;
  bool _autoBackup = true;
  String _userName = 'Personal Vault';
  String _userEmail = 'local@vectorgallery.app';
  String? _geminiApiKey;
  bool _isTestingConnection = false;
  String? _connectionStatus;

  @override
  void initState() {
    super.initState();
    _wifiOnly = _backupEngine.wifiOnly;
    _fetchProfile();
    _loadApiKey();
  }

  Future<void> _loadApiKey() async {
    final key = await _storage.read(key: 'vm_ai_api_key') ?? await _storage.read(key: 'vm_gemini_api_key');
    if (mounted) {
      setState(() => _geminiApiKey = key);
    }
  }

  Future<void> _saveApiKey(String key) async {
    await _storage.write(key: 'vm_ai_api_key', value: key.trim());
    if (mounted) {
      setState(() => _geminiApiKey = key.trim());
      final providerName = key.trim().startsWith('gsk_') ? 'Groq Llama 3.3' : 'Google Gemini';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$providerName API key saved successfully')),
      );
    }
  }

  void _showApiKeyDialog() {
    final controller = TextEditingController(text: _geminiApiKey ?? '');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Free AI Key (Groq or Gemini)'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter your free Groq API key (starts with gsk_) or Google Gemini API key (starts with AIzaSy) to enable real conversational AI answers grounded in your files.',
              style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'API Key',
                hintText: 'gsk_... or AIzaSy...',
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
              _saveApiKey(controller.text);
            },
            child: const Text('Save Key'),
          ),
        ],
      ),
    );
  }

  Future<void> _testConnection() async {
    setState(() {
      _isTestingConnection = true;
      _connectionStatus = null;
    });

    try {
      final res = await _api.dio.get('/api/health');
      if (res.statusCode == 200 && mounted) {
        final data = res.data;
        setState(() {
          _connectionStatus = 'Connected: VectorGallery v${data['version'] ?? '2.0'} (Storage: ${data['storage']?['driver'] ?? 'local'})';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _connectionStatus = 'Connection failed: $e';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isTestingConnection = false);
      }
    }
  }

  Future<void> _fetchProfile() async {
    try {
      final res = await _api.dio.get('/api/v2/auth/profile');
      if (res.statusCode == 200 && res.data['profile'] != null) {
        final profile = res.data['profile'];
        setState(() {
          _userName = profile['full_name'] ?? 'Personal Vault';
          _userEmail = profile['email'] ?? 'local@vectorgallery.app';
          final settings = profile['backup_settings'];
          if (settings != null) {
            if (settings['wifi_only'] != null) _wifiOnly = settings['wifi_only'];
            if (settings['auto_backup'] != null) _autoBackup = settings['auto_backup'];
          }
        });
      }
    } catch (_) {}
  }

  Future<void> _saveSettings() async {
    try {
      await _api.dio.put('/api/v2/auth/profile', data: {
        'backup_settings': {
          'wifi_only': _wifiOnly,
          'auto_backup': _autoBackup,
          'categories': ['photos', 'documents', 'screenshots'],
        },
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings & Preferences'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // User Profile Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  backgroundColor: AppTheme.accentMuted,
                  child: Text('VM', style: TextStyle(color: AppTheme.accent, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_userName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 2),
                    Text(auth.email ?? _userEmail, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // ─── Appearance (Dark / Light Mode) ───
          const Text('Appearance', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: ValueListenableBuilder<ThemeMode>(
              valueListenable: AppTheme.themeModeNotifier,
              builder: (context, currentMode, _) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.palette_outlined, color: AppTheme.accent, size: 20),
                        SizedBox(width: 10),
                        Text('Theme', style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                      ],
                    ),
                    SegmentedButton<ThemeMode>(
                      segments: const [
                        ButtonSegment(
                          value: ThemeMode.dark,
                          icon: Icon(Icons.dark_mode, size: 16),
                          label: Text('Dark', style: TextStyle(fontSize: 11)),
                        ),
                        ButtonSegment(
                          value: ThemeMode.light,
                          icon: Icon(Icons.light_mode, size: 16),
                          label: Text('Light', style: TextStyle(fontSize: 11)),
                        ),
                      ],
                      selected: {currentMode},
                      onSelectionChanged: (newSelection) {
                        AppTheme.toggleTheme(newSelection.first);
                      },
                    ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 20),

          // ─── AI Model Configuration ───
          const Text('AI Digital Memory Model', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Model Provider', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: (_geminiApiKey != null && _geminiApiKey!.isNotEmpty)
                            ? AppTheme.accent.withOpacity(0.15)
                            : Colors.amberAccent.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        (_geminiApiKey != null && _geminiApiKey!.isNotEmpty)
                            ? (_geminiApiKey!.startsWith('gsk_') ? 'GROQ LLAMA 3.3 ACTIVE' : 'GEMINI 1.5 ACTIVE')
                            : 'LOCAL GROUNDED',
                        style: TextStyle(
                          color: (_geminiApiKey != null && _geminiApiKey!.isNotEmpty) ? AppTheme.accent : Colors.amberAccent,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  (_geminiApiKey != null && _geminiApiKey!.isNotEmpty)
                      ? (_geminiApiKey!.startsWith('gsk_')
                          ? 'Groq Llama 3.3 70B is active. Ultra-fast conversational AI synthesis is running.'
                          : 'Google Gemini API Key is configured. Natural conversational synthesis is active.')
                      : 'Running in offline grounded mode. Responses match and cite stored files directly. Add a free Groq or Gemini key to enable generative synthesis.',
                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: _showApiKeyDialog,
                  icon: const Icon(Icons.key, size: 16),
                  label: Text(
                    (_geminiApiKey != null && _geminiApiKey!.isNotEmpty) ? 'Update AI Key' : 'Enter Free Groq / Gemini API Key',
                    style: const TextStyle(fontSize: 12),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.accent,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // ─── Backup Preferences ───
          const Text('Backup Preferences', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Wi-Fi Only Backup', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                  subtitle: const Text('Pause backup when on cellular data', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                  value: _wifiOnly,
                  activeColor: AppTheme.accent,
                  onChanged: (val) {
                    setState(() => _wifiOnly = val);
                    _backupEngine.wifiOnly = val;
                    _saveSettings();
                  },
                ),
                const Divider(height: 1, color: AppTheme.borderSubtle),
                SwitchListTile(
                  title: const Text('Automatic Backup', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                  subtitle: const Text('Scan camera roll and screenshots', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                  value: _autoBackup,
                  activeColor: AppTheme.accent,
                  onChanged: (val) {
                    setState(() => _autoBackup = val);
                    _saveSettings();
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // ─── Server & Network Connection ───
          const Text('Backend Connection', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Host Server URL', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                const SizedBox(height: 4),
                Text(
                  _api.dio.options.baseUrl,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, fontFamily: 'monospace'),
                ),
                if (_connectionStatus != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    _connectionStatus!,
                    style: TextStyle(
                      fontSize: 12,
                      color: _connectionStatus!.startsWith('Connected') ? AppTheme.accent : Colors.redAccent,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                Wrap(
                  spacing: 10,
                  runSpacing: 8,
                  children: [
                    OutlinedButton.icon(
                      onPressed: _isTestingConnection ? null : _testConnection,
                      icon: _isTestingConnection
                          ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.network_check, size: 16),
                      label: const Text('Test Connection', style: TextStyle(fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    OutlinedButton.icon(
                      onPressed: () {
                        final urlController = TextEditingController(text: _api.dio.options.baseUrl);
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Host Server URL'),
                            content: TextField(
                              controller: urlController,
                              decoration: const InputDecoration(
                                labelText: 'Base URL',
                                hintText: 'http://192.168.x.x:3000',
                              ),
                              keyboardType: TextInputType.url,
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx),
                                child: const Text('Cancel'),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.accent,
                                  foregroundColor: Colors.white,
                                ),
                                onPressed: () async {
                                  await _api.saveBaseUrl(urlController.text);
                                  if (ctx.mounted) Navigator.pop(ctx);
                                  if (mounted) setState(() => _connectionStatus = null);
                                },
                                child: const Text('Save'),
                              ),
                            ],
                          ),
                        );
                      },
                      icon: const Icon(Icons.edit, size: 16),
                      label: const Text('Configure URL', style: TextStyle(fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Sign Out Button
          OutlinedButton.icon(
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              await ref.read(authProvider.notifier).signOut();
              if (mounted) {
                messenger.showSnackBar(
                  const SnackBar(content: Text('Signed out successfully')),
                );
              }
            },
            icon: const Icon(Icons.logout, size: 16, color: Colors.redAccent),
            label: const Text('Sign Out', style: TextStyle(color: Colors.redAccent)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.redAccent),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ],
      ),
    );
  }
}
