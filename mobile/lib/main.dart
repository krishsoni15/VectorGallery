import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/network/api_client.dart';
import 'core/theme/app_theme.dart';
import 'features/navigation/bottom_nav_shell.dart';
import 'features/backup/backup_engine.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize background backup engine
  final backupEngine = BackupEngine();
  backupEngine.initialize(wifiOnlySetting: false);
  await ApiClient().loadSavedBaseUrl();

  runApp(
    const ProviderScope(
      child: VectorGalleryApp(),
    ),
  );
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const BottomNavShell(),
    ),
  ],
);

class VectorGalleryApp extends StatelessWidget {
  const VectorGalleryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: AppTheme.themeModeNotifier,
      builder: (context, currentMode, _) {
        return MaterialApp.router(
          title: 'VectorGallery',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: currentMode,
          routerConfig: _router,
        );
      },
    );
  }
}
