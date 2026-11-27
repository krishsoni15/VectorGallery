import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';

class AuthState {
  final bool isAuthenticated;
  final String? email;
  final String? displayName;
  final String? token;
  final bool isLoading;
  final String? error;

  AuthState({
    this.isAuthenticated = false,
    this.email,
    this.displayName,
    this.token,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    String? email,
    String? displayName,
    String? token,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _api = ApiClient();

  AuthNotifier() : super(AuthState()) {
    checkInitialSession();
  }

  Future<void> checkInitialSession() async {
    try {
      final token = await _api.secureStorage.read(key: 'vm_access_token');
      final email = await _api.secureStorage.read(key: 'vm_user_email');
      final name = await _api.secureStorage.read(key: 'vm_user_name');
      if (token != null && token.isNotEmpty) {
        state = state.copyWith(
          isAuthenticated: true,
          token: token,
          email: email,
          displayName: name,
        );
        // Validate against live server when reachable (clears forged/expired tokens cleanly)
        try {
          final res = await _api.dio.get('/api/auth/session');
          final userMap = res.data is Map ? res.data['user'] : null;
          if (userMap is Map) {
            final meta = userMap['user_metadata'] is Map ? userMap['user_metadata'] as Map : null;
            state = state.copyWith(
              isAuthenticated: true,
              email: userMap['email']?.toString() ?? email,
              displayName: userMap['name']?.toString() ?? meta?['full_name']?.toString() ?? name,
              token: token,
            );
          } else {
            await signOut(notifyServer: false);
          }
        } on DioException catch (e) {
          if (e.response?.statusCode == 401) {
            await signOut(notifyServer: false);
          }
        }
      }
    } catch (_) {}
  }

  String _extractDioError(Object error) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map && data['error'] != null) {
        return data['error'].toString();
      }
      if (error.message != null) return error.message!;
    }
    return error.toString();
  }

  Future<bool> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final cleanEmail = email.trim().toLowerCase();
      final res = await _api.dio.post(
        '/api/auth/login',
        data: {'email': cleanEmail, 'password': password},
      );
      final data = res.data is Map ? res.data as Map : {};
      final sessionMap = data['session'] is Map ? data['session'] as Map : null;
      final token = data['sessionToken']?.toString() ?? sessionMap?['access_token']?.toString() ?? '';
      final userMap = data['user'] is Map ? data['user'] as Map : {};
      final userMeta = userMap['user_metadata'] is Map ? userMap['user_metadata'] as Map : null;
      final resolvedEmail = userMap['email']?.toString() ?? cleanEmail;
      final resolvedName = userMap['name']?.toString() ??
          userMeta?['full_name']?.toString() ??
          resolvedEmail.split('@').first;

      if (token.isEmpty) {
        state = state.copyWith(isLoading: false, error: 'Server did not return a valid session token');
        return false;
      }

      await _api.secureStorage.write(key: 'vm_access_token', value: token);
      await _api.secureStorage.write(key: 'vm_user_email', value: resolvedEmail);
      await _api.secureStorage.write(key: 'vm_user_name', value: resolvedName);
      state = state.copyWith(
        isAuthenticated: true,
        email: resolvedEmail,
        displayName: resolvedName,
        token: token,
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _extractDioError(e));
      return false;
    }
  }

  Future<bool> signUp(String name, String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final cleanEmail = email.trim().toLowerCase();
      final cleanName = name.trim().isEmpty ? cleanEmail.split('@').first : name.trim();
      final res = await _api.dio.post(
        '/api/auth/signup',
        data: {'name': cleanName, 'email': cleanEmail, 'password': password},
      );
      final data = res.data is Map ? res.data as Map : {};
      final sessionMap = data['session'] is Map ? data['session'] as Map : null;
      final token = data['sessionToken']?.toString() ?? sessionMap?['access_token']?.toString() ?? '';
      final userMap = data['user'] is Map ? data['user'] as Map : {};
      final userMeta = userMap['user_metadata'] is Map ? userMap['user_metadata'] as Map : null;
      final resolvedEmail = userMap['email']?.toString() ?? cleanEmail;
      final resolvedName = userMap['name']?.toString() ??
          userMeta?['full_name']?.toString() ??
          cleanName;

      if (token.isEmpty) {
        state = state.copyWith(isLoading: false, error: 'Signup succeeded without session token');
        return false;
      }

      await _api.secureStorage.write(key: 'vm_access_token', value: token);
      await _api.secureStorage.write(key: 'vm_user_email', value: resolvedEmail);
      await _api.secureStorage.write(key: 'vm_user_name', value: resolvedName);
      state = state.copyWith(
        isAuthenticated: true,
        email: resolvedEmail,
        displayName: resolvedName,
        token: token,
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _extractDioError(e));
      return false;
    }
  }

  Future<void> signOut({bool notifyServer = true}) async {
    if (notifyServer) {
      try {
        await _api.dio.post('/api/auth/logout');
      } catch (_) {}
    }
    await _api.secureStorage.delete(key: 'vm_access_token');
    await _api.secureStorage.delete(key: 'vm_user_email');
    await _api.secureStorage.delete(key: 'vm_user_name');
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());
