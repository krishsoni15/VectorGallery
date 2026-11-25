import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';

class AuthState {
  final bool isAuthenticated;
  final String? email;
  final String? token;
  final bool isLoading;
  final String? error;

  AuthState({
    this.isAuthenticated = false,
    this.email,
    this.token,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    String? email,
    String? token,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      email: email ?? this.email,
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
    final token = await _api.secureStorage.read(key: 'vm_access_token');
    final email = await _api.secureStorage.read(key: 'vm_user_email');
    if (token != null && token.isNotEmpty) {
      state = state.copyWith(isAuthenticated: true, token: token, email: email);
    }
  }

  Future<bool> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // In production, hits Supabase Auth or backend proxy
      await _api.secureStorage.write(key: 'vm_access_token', value: 'session_token_$email');
      await _api.secureStorage.write(key: 'vm_user_email', value: email);
      state = state.copyWith(isAuthenticated: true, email: email, token: 'session_token_$email', isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> signOut() async {
    await _api.secureStorage.delete(key: 'vm_access_token');
    await _api.secureStorage.delete(key: 'vm_user_email');
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());

