import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vectorgallery_mobile/core/network/api_client.dart';
import 'package:vectorgallery_mobile/core/theme/app_theme.dart';
import 'package:vectorgallery_mobile/features/auth/auth_provider.dart';
import 'package:vectorgallery_mobile/main.dart';

void main() {
  setUpAll(() {
    // Stub API calls synchronously in widget tests so IndexedStack screens do not open sockets.
    ApiClient().dio.interceptors.insert(
      0,
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (options.path.contains('/dashboard/stats')) {
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'storage': {
                    'total_bytes_used': 0,
                    'total_bytes_quota': 16106127360,
                    'formatted_used': '0 B',
                    'formatted_quota': '15.00 GB',
                    'percent_used': 0,
                  },
                  'counts': {'total_files': 0, 'photos': 0, 'documents': 0, 'screenshots': 0},
                  'backup_health': {'connected_devices': 0, 'sync_status': 'IDLE'},
                  'recent_files': <dynamic>[],
                },
              ),
            );
          }
          if (options.path.contains('/api/v2/files')) {
            return handler.resolve(
              Response(requestOptions: options, statusCode: 200, data: {'files': <dynamic>[]}),
            );
          }
          return handler.resolve(
            Response(requestOptions: options, statusCode: 200, data: <String, dynamic>{}),
          );
        },
      ),
    );
  });

  testWidgets('VectorGalleryApp renders primary bottom navigation shell', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: VectorGalleryApp(),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.byType(BottomNavigationBar), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Files'), findsOneWidget);
    expect(find.text('AI Chat'), findsOneWidget);
    expect(find.text('Search'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);
  });

  test('AppTheme toggles between dark and light theme modes cleanly', () {
    AppTheme.toggleTheme(ThemeMode.light);
    expect(AppTheme.themeModeNotifier.value, equals(ThemeMode.light));

    AppTheme.toggleTheme(ThemeMode.dark);
    expect(AppTheme.themeModeNotifier.value, equals(ThemeMode.dark));
  });

  test('AuthState copyWith preserves immutable defaults', () {
    final initial = AuthState();
    expect(initial.isAuthenticated, isFalse);

    final signedIn = initial.copyWith(isAuthenticated: true, email: 'user@example.com');
    expect(signedIn.isAuthenticated, isTrue);
    expect(signedIn.email, equals('user@example.com'));
  });
}
