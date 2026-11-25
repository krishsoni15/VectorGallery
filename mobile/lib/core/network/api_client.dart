import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  static const String defaultBaseUrl = String.fromEnvironment(
    'VECTORGALLERY_API_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );
  static const String _baseUrlStorageKey = 'vm_api_base_url';

  late final Dio dio;
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();

  ApiClient._internal() {
    dio = Dio(BaseOptions(
      baseUrl: normalizeBaseUrl(defaultBaseUrl),
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 60),
      headers: {
        'Accept': 'application/json',
      },
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await secureStorage.read(key: 'vm_access_token');
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException error, handler) async {
        if (error.response?.statusCode == 401) {
          await secureStorage.delete(key: 'vm_access_token');
        }
        return handler.next(error);
      },
    ));
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
