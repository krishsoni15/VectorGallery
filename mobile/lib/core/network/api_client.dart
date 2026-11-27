import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  static const String defaultBaseUrl = String.fromEnvironment(
    'VECTORGALLERY_API_URL',
    defaultValue: 'https://vectorgallery.vercel.app',
  );
  static const String _baseUrlStorageKey = 'vm_api_base_url';
  static const String accessTokenKey = 'vm_access_token';
  static const String refreshTokenKey = 'vm_refresh_token';
  static const String userEmailKey = 'vm_user_email';
  static const String userNameKey = 'vm_user_name';
  static const String deviceIdentifierKey = 'vm_device_identifier';

  late final Dio dio;
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();
  Future<void> Function()? _onUnauthorized;
  Future<bool>? _inFlightRefresh;

  void setUnauthorizedHandler(Future<void> Function() handler) {
    _onUnauthorized = handler;
  }

  ApiClient._internal() {
    dio = Dio(BaseOptions(
      baseUrl: normalizeBaseUrl(defaultBaseUrl),
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 90),
      headers: {
        'Accept': 'application/json',
      },
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException error, handler) async {
        final status = error.response?.statusCode;
        final reqPath = error.requestOptions.path;
        final alreadyRetried = error.requestOptions.extra['_retriedAfterRefresh'] == true;

        if (status == 401 &&
            !alreadyRetried &&
            !reqPath.contains('/api/auth/login') &&
            !reqPath.contains('/api/auth/signup') &&
            !reqPath.contains('/api/auth/refresh')) {
          final refreshed = await _tryRefreshToken();
          if (refreshed) {
            final newToken = await getAccessToken();
            if (newToken != null && newToken.isNotEmpty) {
              error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              error.requestOptions.extra['_retriedAfterRefresh'] = true;
              try {
                final retryResponse = await dio.fetch(error.requestOptions);
                return handler.resolve(retryResponse);
              } on DioException catch (retryErr) {
                return handler.next(retryErr);
              }
            }
          }

          await clearStoredTokens();
          if (_onUnauthorized != null) {
            unawaited(_onUnauthorized!());
          }
        }
        return handler.next(error);
      },
    ));
  }

  Future<String?> getAccessToken() async {
    try {
      return await secureStorage.read(key: accessTokenKey);
    } catch (_) {
      return null;
    }
  }

  Future<void> clearStoredTokens() async {
    try {
      await secureStorage.delete(key: accessTokenKey);
      await secureStorage.delete(key: refreshTokenKey);
    } catch (_) {}
  }

  Future<bool> _tryRefreshToken() {
    if (_inFlightRefresh != null) return _inFlightRefresh!;
    _inFlightRefresh = _performRefresh().whenComplete(() {
      _inFlightRefresh = null;
    });
    return _inFlightRefresh!;
  }

  Future<bool> _performRefresh() async {
    try {
      final refreshToken = await secureStorage.read(key: refreshTokenKey);
      if (refreshToken == null || refreshToken.trim().isEmpty) {
        return false;
      }
      final refreshDio = Dio(BaseOptions(
        baseUrl: dio.options.baseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 20),
        headers: {'Accept': 'application/json'},
      ));
      final res = await refreshDio.post(
        '/api/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      final data = res.data is Map ? res.data as Map : {};
      final sessionMap = data['session'] is Map ? data['session'] as Map : null;
      final newAccess = data['sessionToken']?.toString() ?? sessionMap?['access_token']?.toString() ?? '';
      final newRefresh = sessionMap?['refresh_token']?.toString() ?? refreshToken;

      if (newAccess.isEmpty) return false;
      await secureStorage.write(key: accessTokenKey, value: newAccess);
      await secureStorage.write(key: refreshTokenKey, value: newRefresh);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Extracts a human-readable error message from Dio responses.
  static String extractErrorMessage(Object error) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map && data['error'] != null) {
        return data['error'].toString();
      }
      if (error.response?.statusCode == 413) {
        return 'File payload exceeded serverless limit (413). Enable Supabase Storage for direct large uploads.';
      }
      if (error.response?.statusCode == 401) {
        return 'Session expired or not signed in. Please sign in from Settings.';
      }
      if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.receiveTimeout) {
        return 'Server request timed out. Check your internet connection or Host URL.';
      }
      if (error.type == DioExceptionType.connectionError) {
        return 'Cannot connect to server. Verify internet & Settings → Host Server URL.';
      }
      if (error.message != null) return error.message!;
    }
    return error.toString();
  }

  /// Normalizes user-supplied server URLs by trimming whitespace and trailing slashes.
  static String normalizeBaseUrl(String url) {
    final trimmed = url.trim();
    if (trimmed.isEmpty) return defaultBaseUrl;
    return trimmed.endsWith('/') ? trimmed.substring(0, trimmed.length - 1) : trimmed;
  }

  /// Loads any user-configured host URL from secure storage on startup.
  Future<void> loadSavedBaseUrl() async {
    try {
      final saved = await secureStorage.read(key: _baseUrlStorageKey);
      if (saved != null && saved.trim().isNotEmpty) {
        updateBaseUrl(saved);
      }
    } catch (_) {}
  }

  Future<void> saveBaseUrl(String url) async {
    final normalized = normalizeBaseUrl(url);
    updateBaseUrl(normalized);
    await secureStorage.write(key: _baseUrlStorageKey, value: normalized);
  }

  void updateBaseUrl(String url) {
    dio.options.baseUrl = normalizeBaseUrl(url);
  }
}
