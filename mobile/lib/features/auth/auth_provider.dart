import 'dart:io';
import 'dart:math';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isCheckingSession;
  final String? userId;
  final String? email;
  final String? displayName;
  final String? token;
  final bool isLoading;
  final String? error;
  final int syncVersion;

  AuthState({
    this.isAuthenticated = false,
    this.isCheckingSession = true,
    this.userId,
    this.email,
    this.displayName,
    this.token,
    this.isLoading = false,
    this.error,
    this.syncVersion = 0,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isCheckingSession,
    String? userId,
    String? email,
    String? displayName,
    String? token,
    bool? isLoading,
    String? error,
    int? syncVersion,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isCheckingSession: isCheckingSession ?? this.isCheckingSession,
      userId: userId ?? this.userId,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      syncVersion: syncVersion ?? this.syncVersion,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _api = ApiClient();
  bool _isCheckingInitialSession = false;

  AuthNotifier() : super(AuthState()) {
    _api.setUnauthorizedHandler(() => signOut(notifyServer: false));
    checkInitialSession();
  }

  Future<String> _getOrCreateDeviceIdentifier() async {
    try {
      final existing = await _api.secureStorage.read(key: ApiClient.deviceIdentifierKey);
      if (existing != null && existing.trim().isNotEmpty) {
        return existing;
      }
      final rand = Random();
      final suffix = List.generate(12, (_) => rand.nextInt(16).toRadixString(16)).join();
      final id = 'vg-android-$suffix';
      await _api.secureStorage.write(key: ApiClient.deviceIdentifierKey, value: id);
      return id;
    } catch (_) {
      return 'vg-android-device';
    }
  }

  /// Registers or updates this Android device in `public.devices` so Website & Mobile stay paired.
  Future<void> registerDevice({String syncStatus = 'IDLE'}) async {
    if (!state.isAuthenticated) return;
    try {
      final deviceId = await _getOrCreateDeviceIdentifier();
      final hostName = Platform.localHostname.trim();
      final deviceName = Platform.isAndroid
          ? 'Android Phone (${hostName.isNotEmpty && hostName != 'localhost' ? hostName : 'VectorGallery'})'
          : 'Mobile Client';

      await _api.dio.post(
        '/api/v2/devices',
        data: {
          'device_name': deviceName,
          'platform': Platform.isIOS ? 'ios' : 'android',
          'device_identifier': deviceId,
          'app_version': '2.0.0',
          'settings': {
            'wifi_only': false,
            'auto_backup': true,
            'categories': ['photos', 'documents', 'screenshots'],
          },
        },
      );
    } catch (_) {
      // Non-fatal if device table not yet initialized
    }
  }

  void bumpSyncVersion() {
    state = state.copyWith(syncVersion: state.syncVersion + 1);
  }

  Future<void> checkInitialSession() async {
    if (_isCheckingInitialSession) return;
    _isCheckingInitialSession = true;
    try {
      final token = await _api.secureStorage.read(key: ApiClient.accessTokenKey);
      final email = await _api.secureStorage.read(key: ApiClient.userEmailKey);
      final name = await _api.secureStorage.read(key: ApiClient.userNameKey);

      if (token != null && token.isNotEmpty) {
        try {
          final res = await _api.dio.get('/api/auth/session');
          final userMap = res.data is Map ? res.data['user'] : null;
          if (userMap is Map) {
            final meta = userMap['user_metadata'] is Map ? userMap['user_metadata'] as Map : null;
            final latestToken = await _api.getAccessToken() ?? token;
            state = state.copyWith(
              isAuthenticated: true,
              isCheckingSession: false,
              userId: userMap['id']?.toString(),
              email: userMap['email']?.toString() ?? email,
              displayName: userMap['name']?.toString() ?? meta?['full_name']?.toString() ?? name,
              token: latestToken,
            );
            await registerDevice();
            return;
          } else {
            await signOut(notifyServer: false);
            return;
          }
        } on DioException catch (e) {
          if (e.response?.statusCode == 401) {
            await signOut(notifyServer: false);
            return;
          }
          // Transient offline/network error: restore cached identity once cleanly.
          state = state.copyWith(
            isAuthenticated: true,
            isCheckingSession: false,
            token: token,
            email: email,
            displayName: name,
          );
          return;
        }
      }
    } catch (_) {
    } finally {
      _isCheckingInitialSession = false;
    }

    if (mounted) {
      state = state.copyWith(isCheckingSession: false);
    }
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
      final refreshToken = sessionMap?['refresh_token']?.toString() ?? '';
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

      await _api.secureStorage.write(key: ApiClient.accessTokenKey, value: token);
      if (refreshToken.isNotEmpty) {
        await _api.secureStorage.write(key: ApiClient.refreshTokenKey, value: refreshToken);
      }
      await _api.secureStorage.write(key: ApiClient.userEmailKey, value: resolvedEmail);
      await _api.secureStorage.write(key: ApiClient.userNameKey, value: resolvedName);

      state = state.copyWith(
        isAuthenticated: true,
        isCheckingSession: false,
        userId: userMap['id']?.toString(),
        email: resolvedEmail,
        displayName: resolvedName,
        token: token,
        isLoading: false,
        syncVersion: state.syncVersion + 1,
      );
      await registerDevice();
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: ApiClient.extractErrorMessage(e));
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
      final refreshToken = sessionMap?['refresh_token']?.toString() ?? '';
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

      await _api.secureStorage.write(key: ApiClient.accessTokenKey, value: token);
      if (refreshToken.isNotEmpty) {
        await _api.secureStorage.write(key: ApiClient.refreshTokenKey, value: refreshToken);
      }
      await _api.secureStorage.write(key: ApiClient.userEmailKey, value: resolvedEmail);
      await _api.secureStorage.write(key: ApiClient.userNameKey, value: resolvedName);

      state = state.copyWith(
        isAuthenticated: true,
        isCheckingSession: false,
        userId: userMap['id']?.toString(),
        email: resolvedEmail,
        displayName: resolvedName,
        token: token,
        isLoading: false,
        syncVersion: state.syncVersion + 1,
      );
      await registerDevice();
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: ApiClient.extractErrorMessage(e));
      return false;
    }
  }

  Future<void> signOut({bool notifyServer = true}) async {
    final wasAuthenticated = state.isAuthenticated;
    if (notifyServer && wasAuthenticated) {
      try {
        await _api.dio.post('/api/auth/logout');
      } catch (_) {}
    }
    await _api.clearStoredTokens();
    await _api.secureStorage.delete(key: ApiClient.userEmailKey);
    await _api.secureStorage.delete(key: ApiClient.userNameKey);
    state = AuthState(
      isAuthenticated: false,
      isCheckingSession: false,
      syncVersion: wasAuthenticated ? state.syncVersion + 1 : state.syncVersion,
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());
