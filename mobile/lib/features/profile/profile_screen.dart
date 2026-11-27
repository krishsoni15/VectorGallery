import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/brand_mark.dart';
import '../auth/auth_provider.dart';
import '../auth/auth_sheet.dart';
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
  String _userEmail = 'Not signed in · Tap Sign In to sync';
  String? _geminiApiKey;
  List<dynamic> _devices = [];
  bool _isTestingConnection = false;
  String? _connectionStatus;
  bool _connectionOk = true;

  @override
  void initState() {
    super.initState();
    _wifiOnly = _backupEngine.wifiOnly;
    _loadApiKey();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final auth = ref.read(authProvider);
      if (!auth.isCheckingSession && auth.isAuthenticated) {
        _fetchProfile();
        _fetchDevices();
      }
    });
  }

  Future<void> _loadApiKey() async {
    final key = await _storage.read(key: 'vm_ai_api_key') ?? await _storage.read(key: 'vm_gemini_api_key');
    if (mounted) setState(() => _geminiApiKey = key);
  }

  Future<void> _saveApiKey(String key) async {
    final clean = key.trim();
    if (clean.isEmpty) {
      await _storage.delete(key: 'vm_ai_api_key');
    } else {
      await _storage.write(key: 'vm_ai_api_key', value: clean);
      if (ref.read(authProvider).isAuthenticated) {
        final inferred = clean.startsWith('gsk_')
            ? 'groq'
            : (clean.startsWith('sk-') ? 'openai' : 'gemini');
        try {
          await _api.dio.post('/api/auth/provider-keys', data: {
            'provider': inferred,
            'apiKey': clean,
          });
        } catch (_) {}
      }
    }
    if (mounted) {
      setState(() => _geminiApiKey = clean);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(clean.isEmpty ? 'Reverted to Server Default AI' : 'Personal AI API key saved cleanly')),
      );
    }
  }

  Future<void> _fetchDevices() async {
    if (!ref.read(authProvider).isAuthenticated) {
      if (mounted) setState(() => _devices = []);
      return;
    }
    try {
      final res = await _api.dio.get('/api/v2/devices');
      if (res.statusCode == 200 && res.data is Map && mounted) {
        setState(() {
          _devices = (res.data['devices'] as List?) ?? [];
        });
      }
    } catch (_) {}
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
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.voltLime, foregroundColor: const Color(0xFF101211)),
            onPressed: () {
              Navigator.pop(ctx);
              _saveApiKey(controller.text);
            },
            child: const Text('Save Key', style: TextStyle(fontWeight: FontWeight.bold)),
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
        final data = res.data is Map ? res.data as Map : {};
        final db = data['database'] is Map ? data['database'] as Map : {};
        final storage = data['storage'] is Map ? data['storage'] as Map : {};
        final configured = db['configured'] == true;
        final reachable = db['reachable'] == true;
        setState(() {
          _connectionOk = configured && reachable;
          _connectionStatus = _connectionOk
              ? 'Connected · v${data['version'] ?? '2.0'} (${storage['driver'] ?? 'supabase'} / DB Ready)'
              : 'Reachable, DB issue: ${db['notice'] ?? 'Run supabase/SETUP_ALL_IN_ONE.sql in Supabase'}';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _connectionOk = false;
          _connectionStatus = ApiClient.extractErrorMessage(e);
        });
      }
    } finally {
      if (mounted) setState(() => _isTestingConnection = false);
    }
  }

  Future<void> _syncNow() async {
    final notifier = ref.read(authProvider.notifier);
    await notifier.registerDevice();
    await _fetchProfile();
    await _fetchDevices();
    notifier.bumpSyncVersion();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vault & device paired with cloud')),
      );
    }
  }

  Future<void> _fetchProfile() async {
    if (!ref.read(authProvider).isAuthenticated) {
      if (mounted) {
        setState(() {
          _userName = 'Personal Vault';
          _userEmail = 'Not signed in · Tap Sign In to sync';
        });
      }
      return;
    }
    try {
      final res = await _api.dio.get('/api/v2/auth/profile');
      if (res.statusCode == 200 && res.data['profile'] != null && mounted) {
        final profile = res.data['profile'];
        setState(() {
          _userName = profile['full_name'] ?? 'Personal Vault';
          _userEmail = profile['email'] ?? 'Synced Account';
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
    if (!ref.read(authProvider).isAuthenticated) return;
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
    ref.listen<AuthState>(authProvider, (prev, next) {
      final authChanged = prev?.isAuthenticated != next.isAuthenticated;
      final syncChanged = prev?.syncVersion != next.syncVersion;
      final sessionReady = (prev?.isCheckingSession ?? true) && !next.isCheckingSession;
      if (authChanged || syncChanged || (sessionReady && next.isAuthenticated)) {
        _fetchProfile();
        _fetchDevices();
      }
    });

    final surface = AppTheme.surfaceOf(context);
    final elevated = AppTheme.elevatedOf(context);
    final border = AppTheme.borderOf(context);
    final primaryText = AppTheme.textPrimaryOf(context);
    final secondaryText = AppTheme.textSecondaryOf(context);
    final brand = AppTheme.brandOf(context);
    final warn = AppTheme.warnOf(context);

    final shownName = auth.isAuthenticated ? (auth.displayName ?? _userName) : 'VectorGallery Guest';
    final shownEmail = auth.isAuthenticated ? (auth.email ?? _userEmail) : 'Sign in with your website account';

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Row(
          children: [
            VectorGalleryBrandMark(size: 26),
            SizedBox(width: 10),
            Text('Settings'),
          ],
        ),
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
                      backgroundColor: auth.isAuthenticated ? AppTheme.voltLime : elevated,
                      child: Text(
                        shownName.isNotEmpty ? shownName[0].toUpperCase() : 'V',
                        style: TextStyle(
                          color: auth.isAuthenticated ? const Color(0xFF101211) : primaryText,
                          fontWeight: FontWeight.bold,
                        ),
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
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                      decoration: BoxDecoration(
                        color: auth.isAuthenticated ? brand.withOpacity(0.14) : warn.withOpacity(0.14),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        auth.isAuthenticated ? 'Synced' : 'Local Only',
                        style: TextStyle(
                          color: auth.isAuthenticated ? brand : warn,
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                if (!auth.isAuthenticated)
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
                          onPressed: () => showVaultAuthSheet(context, ref, initialSignUp: true),
                          child: const Text('Create Account', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          onPressed: () => showVaultAuthSheet(context, ref, initialSignUp: false),
                          child: const Text('Sign In', style: TextStyle(fontSize: 12)),
                        ),
                      ),
                    ],
                  )
                else
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _syncNow,
                      icon: Icon(Icons.sync_rounded, size: 16, color: brand),
                      label: Text('Sync Now & Pair Device', style: TextStyle(fontSize: 12.5, color: primaryText, fontWeight: FontWeight.w600)),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: border),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Connected Devices Summary (when signed in)
          if (auth.isAuthenticated) ...[
            Container(
              padding: const EdgeInsets.all(14),
              margin: const EdgeInsets.only(bottom: 14),
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
                    child: Icon(Icons.devices_rounded, color: brand, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Connected Devices (${_devices.length})',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: primaryText),
                        ),
                        Text(
                          _devices.isEmpty
                              ? 'Tap Sync Now above to pair this phone cleanly'
                              : _devices.map((d) => d['device_name']?.toString() ?? 'Android').join(', '),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontSize: 12, color: secondaryText),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],

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
                return Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 12,
                  runSpacing: 10,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
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
                          icon: Icon(Icons.dark_mode, size: 15),
                          label: Text('Dark', style: TextStyle(fontSize: 11.5)),
                        ),
                        ButtonSegment(
                          value: ThemeMode.light,
                          icon: Icon(Icons.light_mode, size: 15),
                          label: Text('Light', style: TextStyle(fontSize: 11.5)),
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
                      ? 'Personal API key is stored on device & synced cleanly.'
                      : 'Uses server AI keys when configured or add your own free Groq/Gemini key.',
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
                      color: _connectionOk ? brand : AppTheme.error,
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
                              decoration: const InputDecoration(labelText: 'Base URL', hintText: 'https://vectorgallery.vercel.app'),
                              keyboardType: TextInputType.url,
                            ),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.voltLime, foregroundColor: const Color(0xFF101211)),
                                onPressed: () async {
                                  await _api.saveBaseUrl(urlController.text);
                                  ref.read(authProvider.notifier).bumpSyncVersion();
                                  if (ctx.mounted) Navigator.pop(ctx);
                                  if (mounted) {
                                    setState(() => _connectionStatus = null);
                                    _testConnection();
                                  }
                                },
                                child: const Text('Save', style: TextStyle(fontWeight: FontWeight.bold)),
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
                  messenger.showSnackBar(const SnackBar(content: Text('Signed out cleanly')));
                }
              },
              icon: const Icon(Icons.logout, size: 16, color: AppTheme.error),
              label: const Text('Sign Out', style: TextStyle(color: AppTheme.error)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppTheme.error),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ],
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
