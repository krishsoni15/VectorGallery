import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vectorgallery_mobile/core/network/api_client.dart';
import 'package:vectorgallery_mobile/core/theme/app_theme.dart';
import 'package:vectorgallery_mobile/features/auth/auth_provider.dart';
import 'package:vectorgallery_mobile/features/chat/chat_screen.dart';
import 'package:vectorgallery_mobile/main.dart';

void main() {
  final Map<String, String> secureStoreMemory = <String, String>{};
  final Map<String, int> requestCounts = <String, int>{};

  void countRequest(String path) {
    requestCounts[path] = (requestCounts[path] ?? 0) + 1;
  }

  setUpAll(() {
    TestWidgetsFlutterBinding.ensureInitialized();

    const MethodChannel channel = MethodChannel('plugins.it_nomads.com/flutter_secure_storage');
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
      channel,
      (MethodCall call) async {
        final args = (call.arguments as Map?) ?? {};
        final key = args['key']?.toString();
        if (call.method == 'write' && key != null) {
          secureStoreMemory[key] = args['value']?.toString() ?? '';
          return null;
        }
        if (call.method == 'read' && key != null) {
          return secureStoreMemory[key];
        }
        if (call.method == 'delete' && key != null) {
          secureStoreMemory.remove(key);
          return null;
        }
        return null;
      },
    );

    // Stub API calls synchronously in widget tests so IndexedStack screens do not open sockets.
    ApiClient().dio.interceptors.insert(
      0,
      InterceptorsWrapper(
        onRequest: (options, handler) {
          countRequest(options.path);
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
                  'counts': {'total_files': 0, 'photos': 0, 'documents': 0, 'screenshots': 0, 'videos': 0},
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
          if (options.path.contains('/api/auth/login') || options.path.contains('/api/auth/signup')) {
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'sessionToken': 'vg_local_verified_token.sig',
                  'user': {
                    'id': 'u-test-1',
                    'email': options.data['email'],
                    'name': options.data['name'] ?? 'Mobile Test User',
                  },
                },
              ),
            );
          }
          if (options.path.contains('/api/auth/session')) {
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'user': {'id': 'u-test-1', 'email': 'test@example.com', 'name': 'Mobile Test User'},
                },
              ),
            );
          }
          return handler.resolve(
            Response(requestOptions: options, statusCode: 200, data: <String, dynamic>{}),
          );
        },
      ),
    );
  });

  testWidgets('VectorGalleryApp renders Google-Photos style navigation shell & opens User Guide',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: VectorGalleryApp(),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.byType(BottomNavigationBar), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Library'), findsOneWidget);
    expect(find.text('Assistant'), findsOneWidget);
    expect(find.text('Search'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);

    // Open in-app User Guide sheet from AppBar help button
    await tester.tap(find.byIcon(Icons.help_outline_rounded));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 350));
    expect(find.text('VectorGallery User Guide'), findsOneWidget);
    expect(find.text('Connect & Sign In'), findsOneWidget);
  });

  test('AppTheme switches cleanly between Obsidian Volt (dark) and Liquid Titanium (light)', () {
    AppTheme.toggleTheme(ThemeMode.light);
    expect(AppTheme.themeModeNotifier.value, equals(ThemeMode.light));
    expect(AppTheme.lightTheme.scaffoldBackgroundColor, equals(AppTheme.lightBackground));

    AppTheme.toggleTheme(ThemeMode.dark);
    expect(AppTheme.themeModeNotifier.value, equals(ThemeMode.dark));
    expect(AppTheme.darkTheme.scaffoldBackgroundColor, equals(AppTheme.background));
  });

  test('AuthNotifier authenticates cleanly via real /api/auth/signup and /api/auth/login', () async {
    final notifier = AuthNotifier();
    final signedUp = await notifier.signUp('Krish Mobile', 'krish@example.com', 'Secret123!');
    expect(signedUp, isTrue);
    expect(notifier.state.isAuthenticated, isTrue);
    expect(notifier.state.token, equals('vg_local_verified_token.sig'));
    expect(notifier.state.displayName, equals('Krish Mobile'));

    await notifier.signOut();
    expect(notifier.state.isAuthenticated, isFalse);

    final loggedIn = await notifier.signIn('krish@example.com', 'Secret123!');
    expect(loggedIn, isTrue);
    expect(notifier.state.email, equals('krish@example.com'));
  });

  testWidgets('VectorGalleryApp does not loop API requests or leave infinite tickers spinning at rest',
      (WidgetTester tester) async {
    secureStoreMemory.clear();
    requestCounts.clear();

    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      const ProviderScope(
        child: VectorGalleryApp(),
      ),
    );

    // Proves no continuous ..repeat() ticker is left active while idle.
    await tester.pumpAndSettle(const Duration(milliseconds: 50));

    // When unauthenticated on initial launch, protected cloud tabs stay silent instead of spamming 401s.
    expect(requestCounts['/api/v2/dashboard/stats'] ?? 0, equals(0));
    expect(requestCounts['/api/v2/files'] ?? 0, equals(0));
    expect(requestCounts['/api/v2/auth/profile'] ?? 0, equals(0));
    expect(tester.takeException(), isNull);
  });

  testWidgets('Authenticated VectorGalleryApp fetches each endpoint once and settles without loops',
      (WidgetTester tester) async {
    secureStoreMemory
      ..clear()
      ..[ApiClient.accessTokenKey] = 'vg_local_verified_token.sig'
      ..[ApiClient.userEmailKey] = 'test@example.com'
      ..[ApiClient.userNameKey] = 'Mobile Test User';
    requestCounts.clear();

    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      const ProviderScope(
        child: VectorGalleryApp(),
      ),
    );
    await tester.pumpAndSettle(const Duration(milliseconds: 50));

    expect(requestCounts['/api/auth/session'] ?? 0, equals(1));
    expect(requestCounts['/api/v2/dashboard/stats'] ?? 0, equals(1));
    expect(requestCounts['/api/v2/files'] ?? 0, equals(1));
    expect(requestCounts['/api/v2/auth/profile'] ?? 0, equals(1));
    expect(tester.takeException(), isNull);
  });

  testWidgets('ChatScreen opens grounded citation in detail sheet with Open, Download, and Share',
      (WidgetTester tester) async {
    secureStoreMemory
      ..clear()
      ..[ApiClient.accessTokenKey] = 'vg_local_verified_token.sig'
      ..[ApiClient.userEmailKey] = 'test@example.com';

    ApiClient().dio.interceptors.insert(
      0,
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (options.path == '/api/v2/chat') {
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: 'data: {"type":"token","content":"Found your exam PDF."}\n'
                    'data: {"type":"citations","citations":[{"id":1,"file_id":"f-exam-1","file_name":"Exam_Syllabus.pdf","category":"documents","excerpt":"Compiler Design 3170701"}]}\n'
                    'data: [DONE]\n',
              ),
            );
          }
          if (options.path == '/api/v2/files/f-exam-1') {
            return handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'file': {
                    'id': 'f-exam-1',
                    'original_name': 'Exam_Syllabus.pdf',
                    'category': 'documents',
                    'mime_type': 'application/pdf',
                    'size_bytes': 204800,
                    'download_url': 'https://example.com/Exam_Syllabus.pdf',
                    'extracted_text': 'Compiler Design 3170701',
                  },
                },
              ),
            );
          }
          return handler.next(options);
        },
      ),
    );

    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: ChatScreen()),
      ),
    );
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), 'Find my exam syllabus');
    await tester.tap(find.byIcon(Icons.send_rounded));
    await tester.pumpAndSettle();

    expect(find.text('Exam_Syllabus.pdf'), findsOneWidget);
    expect(find.text('Open'), findsOneWidget);

    await tester.tap(find.text('Exam_Syllabus.pdf'));
    await tester.pumpAndSettle();

    expect(find.text('Download'), findsOneWidget);
    expect(find.text('Share'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
