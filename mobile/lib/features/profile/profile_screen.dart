import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../auth/auth_provider.dart';
import '../backup/backup_engine.dart';
import '../guide/guide_sheet.dart';

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
  String _userEmail = 'Local Sandbox Session';
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
    if (mounted) setState(() => _geminiApiKey = key);
  }

  Future<void> _saveApiKey(String key) async {
    await _storage.write(key: 'vm_ai_api_key', value: key.trim());
    if (mounted) {
      setState(() => _geminiApiKey = key.trim());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Personal AI API key saved cleanly')),
      );
    }
  }

  void _showAuthDialog({required bool isSignUp}) {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final passCtrl = TextEditingController();
    bool submitSignUp = isSignUp;
    String? dialogError;
    bool submitting = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (modalCtx, setDialogState) => AlertDialog(
          title: Text(submitSignUp ? 'Create Account' : 'Sign In to Sync'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (submitSignUp) ...[
                  TextField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(labelText: 'Full Name', hintText: 'Your name'),
                  ),
                  const SizedBox(height: 10),
                ],
                TextField(
                  controller: emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email Address', hintText: 'you@example.com'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: passCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Password', hintText: 'Min 6 characters'),
                ),
                if (dialogError != null) ...[
                  const SizedBox(height: 10),
                  Text(dialogError!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                ],
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => setDialogState(() {
                    submitSignUp = !submitSignUp;
                    dialogError = null;
                  }),
                  child: Text(submitSignUp ? 'Already have an account? Sign in' : 'New to VectorGallery? Create account'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accent, foregroundColor: Colors.white),
              onPressed: submitting
                  ? null
                  : () async {
                      setDialogState(() {
                        submitting = true;
                        dialogError = null;
                      });
                      final notifier = ref.read(authProvider.notifier);
                      final ok = submitSignUp
                          ? await notifier.signUp(nameCtrl.text, emailCtrl.text, passCtrl.text)
                          : await notifier.signIn(emailCtrl.text, passCtrl.text);

                      if (!modalCtx.mounted) return;
                      if (ok) {
                        Navigator.pop(ctx);
                        await _fetchProfile();
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(submitSignUp ? 'Account created & vault synced!' : 'Signed in successfully!')),
                          );
                        }
                      } else {
                        setDialogState(() {
                          submitting = false;
                          dialogError = ref.read(authProvider).error ?? 'Authentication failed';
                        });
                      }
                    },
              child: Text(submitting ? 'Please wait...' : (submitSignUp ? 'Create Account' : 'Sign In')),
            ),
          ],
        ),
      ),
    );
  }

  void _showApiKeyDialog() {
    final controller = TextEditingController(text: _geminiApiKey ?? '');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Personal AI Key (Groq or Gemini)'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter a Groq API key (gsk_...) or Gemini key (AIzaSy...) to override the server default key.',
              style: TextStyle(fontSize: 12, color: AppTheme.textSecondaryOf(ctx)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(labelText: 'API Key', hintText: 'gsk_... or AIzaSy...'),
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
          _connectionStatus = 'Connected: VectorGallery v${data['version'] ?? '2.0'} (${data['storage']?['driver'] ?? 'local'})';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _connectionStatus = 'Connection failed: $e';
        });
      }
    } finally {
      if (mounted) setState(() => _isTestingConnection = false);
    }
  }

  Future<void> _fetchProfile() async {
    try {
      final res = await _api.dio.get('/api/v2/auth/profile');
      if (res.statusCode == 200 && res.data['profile'] != null && mounted) {
        final profile = res.data['profile'];
        setState(() {
          _userName = profile['full_name'] ?? 'Personal Vault';
          _userEmail = profile['email'] ?? 'Local Sandbox Session';
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
    final surface = AppTheme.surfaceOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);
    final warn = AppTheme.warnOf(context);

    final shownName = auth.displayName ?? _userName;
    final shownEmail = auth.email ?? _userEmail;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Account Identity & Sign-In/Sign-Up Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: border),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: AppTheme.voltLime,
                      child: Text(
                        shownName.isNotEmpty ? shownName[0].toUpperCase() : 'V',
                        style: const TextStyle(color: Color(0xFF101211), fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(shownName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: primaryText)),
                          const SizedBox(height: 2),
                          Text(shownEmail, style: TextStyle(color: secondaryText, fontSize: 12), overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                    if (auth.isAuthenticated)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: brand.withOpacity(0.14),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text('Synced', style: TextStyle(color: brand, fontSize: 10.5, fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
                if (!auth.isAuthenticated) ...[
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.voltLime,
                            foregroundColor: const Color(0xFF101211),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          onPressed: () => _showAuthDialog(isSignUp: true),
                          child: const Text('Create Account', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          onPressed: () => _showAuthDialog(isSignUp: false),
                          child: const Text('Sign In', style: TextStyle(fontSize: 12)),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // User Guide Entry Card
          InkWell(
            onTap: () => showMobileUserGuideSheet(context),
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: border),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(color: brand.withOpacity(0.14), borderRadius: BorderRadius.circular(10)),
                    child: Icon(Icons.menu_book_rounded, color: brand, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('User Guide · How to use', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: primaryText)),
                        Text('Account setup, safe Wi-Fi backup, OCR & AI tips', style: TextStyle(fontSize: 12, color: secondaryText)),
                      ],
                    ),
                  ),
                  Icon(Icons.chevron_right, color: secondaryText),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          Text('Appearance', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: primaryText)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: border),
            ),
            child: ValueListenableBuilder<ThemeMode>(
              valueListenable: AppTheme.themeModeNotifier,
              builder: (context, currentMode, _) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.palette_outlined, color: brand, size: 20),
                        const SizedBox(width: 10),
                        Text('Theme', style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14, color: primaryText)),
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
                      onSelectionChanged: (newSelection) => AppTheme.toggleTheme(newSelection.first),
                    ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 20),

          Text('AI Digital Memory Model', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: primaryText)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Model Provider', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: primaryText)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: (_geminiApiKey != null && _geminiApiKey!.isNotEmpty)
                            ? brand.withOpacity(0.14)
                            : warn.withOpacity(0.14),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        (_geminiApiKey != null && _geminiApiKey!.isNotEmpty)
                            ? (_geminiApiKey!.startsWith('gsk_') ? 'GROQ LLAMA 3.3' : 'GEMINI ACTIVE')
                            : 'SERVER DEFAULT',
                        style: TextStyle(
                          color: (_geminiApiKey != null && _geminiApiKey!.isNotEmpty) ? brand : warn,
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
                      ? 'Personal API key is stored securely on this device.'
                      : 'Uses server AI keys when available or add your own free Groq/Gemini key.',
                  style: TextStyle(fontSize: 12, color: secondaryText),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: _showApiKeyDialog,
                  icon: const Icon(Icons.key, size: 16),
                  label: Text(
                    (_geminiApiKey != null && _geminiApiKey!.isNotEmpty) ? 'Update Personal Key' : 'Add Groq / Gemini Key',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.voltLime,
                    foregroundColor: const Color(0xFF101211),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text('Backup Preferences', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: primaryText)),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: border),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  title: Text('Wi-Fi Only Backup', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: primaryText)),
                  subtitle: Text('Pause backup when on cellular data', style: TextStyle(fontSize: 12, color: secondaryText)),
                  value: _wifiOnly,
                  activeColor: brand,
                  onChanged: (val) {
                    setState(() => _wifiOnly = val);
                    _backupEngine.wifiOnly = val;
                    _saveSettings();
                  },
                ),
                Divider(height: 1, color: border),
                SwitchListTile(
                  title: Text('Automatic Backup', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: primaryText)),
                  subtitle: Text('Scan camera roll and screenshots', style: TextStyle(fontSize: 12, color: secondaryText)),
                  value: _autoBackup,
                  activeColor: brand,
                  onChanged: (val) {
                    setState(() => _autoBackup = val);
                    _saveSettings();
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text('Backend Connection', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: primaryText)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Host Server URL', style: TextStyle(fontSize: 12, color: secondaryText)),
                const SizedBox(height: 4),
                Text(
                  _api.dio.options.baseUrl,
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, fontFamily: 'monospace', color: primaryText),
                ),
                if (_connectionStatus != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    _connectionStatus!,
                    style: TextStyle(
                      fontSize: 12,
                      color: _connectionStatus!.startsWith('Connected') ? brand : Colors.redAccent,
                      fontWeight: FontWeight.w600,
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
                      style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
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
                              decoration: const InputDecoration(labelText: 'Base URL', hintText: 'http://192.168.x.x:3000'),
                              keyboardType: TextInputType.url,
                            ),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accent, foregroundColor: Colors.white),
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
                      style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
                    ),
                  ],
                ),
              ],
            ),
          ),

          if (auth.isAuthenticated) ...[
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                await ref.read(authProvider.notifier).signOut();
                if (mounted) {
                  messenger.showSnackBar(const SnackBar(content: Text('Signed out successfully')));
                }
              },
              icon: const Icon(Icons.logout, size: 16, color: Colors.redAccent),
              label: const Text('Sign Out', style: TextStyle(color: Colors.redAccent)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.redAccent),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
