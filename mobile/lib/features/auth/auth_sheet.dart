import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/brand_mark.dart';
import 'auth_provider.dart';

/// Opens a website-matched Sign In / Create Account modal sheet that pairs
/// this device and syncs every tab immediately upon authentication.
Future<bool> showVaultAuthSheet(
  BuildContext context,
  WidgetRef ref, {
  bool initialSignUp = false,
}) async {
  final nameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final passCtrl = TextEditingController();
  bool isSignUp = initialSignUp;
  bool showPassword = false;
  bool submitting = false;
  String? errorMsg;

  final result = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => StatefulBuilder(
      builder: (modalCtx, setSheetState) {
        final surface = AppTheme.surfaceOf(modalCtx);
        final border = AppTheme.borderOf(modalCtx);
        final primary = AppTheme.textPrimaryOf(modalCtx);
        final secondary = AppTheme.textSecondaryOf(modalCtx);
        final brand = AppTheme.brandOf(modalCtx);

        Future<void> handleSubmit() async {
          final email = emailCtrl.text.trim();
          final pass = passCtrl.text;
          if (!email.contains('@') || !email.contains('.')) {
            setSheetState(() => errorMsg = 'Please enter a valid email address.');
            return;
          }
          if (pass.length < 6) {
            setSheetState(() => errorMsg = 'Password must be at least 6 characters.');
            return;
          }

          setSheetState(() {
            submitting = true;
            errorMsg = null;
          });

          final notifier = ref.read(authProvider.notifier);
          final ok = isSignUp
              ? await notifier.signUp(nameCtrl.text, email, pass)
              : await notifier.signIn(email, pass);

          if (!modalCtx.mounted) return;
          if (ok) {
            Navigator.pop(modalCtx, true);
          } else {
            setSheetState(() {
              submitting = false;
              errorMsg = ref.read(authProvider).error ?? 'Authentication failed. Check server & credentials.';
            });
          }
        }

        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(modalCtx).viewInsets.bottom),
          child: Container(
            decoration: BoxDecoration(
              color: surface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
              border: Border(top: BorderSide(color: border)),
            ),
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(22, 12, 22, 28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 42,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 18),
                      decoration: BoxDecoration(
                        color: secondary.withOpacity(0.32),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const VectorGalleryBrandLockup(markSize: 30, showSubtitle: true),
                      IconButton(
                        onPressed: () => Navigator.pop(modalCtx, false),
                        icon: Icon(Icons.close_rounded, color: secondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: brand,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 7),
                      Text(
                        isSignUp ? 'CREATE SPACE' : 'VAULT SIGN IN',
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.3,
                          color: brand,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    isSignUp ? 'Create your vault' : 'Welcome back',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.6,
                      color: primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isSignUp
                        ? 'Create a cloud account that syncs photos & PDFs directly with your web workspace.'
                        : 'Sign in with the same email & password as your website vault to sync everything.',
                    style: TextStyle(fontSize: 13, height: 1.4, color: secondary),
                  ),
                  const SizedBox(height: 18),
                  if (errorMsg != null) ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      decoration: BoxDecoration(
                        color: AppTheme.error.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: const Border(left: BorderSide(color: AppTheme.error, width: 3)),
                      ),
                      child: Text(
                        errorMsg!,
                        style: const TextStyle(color: AppTheme.error, fontSize: 12.5, fontWeight: FontWeight.w500),
                      ),
                    ),
                    const SizedBox(height: 14),
                  ],
                  if (isSignUp) ...[
                    TextField(
                      controller: nameCtrl,
                      textInputAction: TextInputAction.next,
                      style: TextStyle(color: primary, fontSize: 14),
                      decoration: const InputDecoration(
                        labelText: 'Name',
                        hintText: 'Your name',
                        prefixIcon: Icon(Icons.person_outline_rounded, size: 19),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  TextField(
                    controller: emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    style: TextStyle(color: primary, fontSize: 14),
                    decoration: const InputDecoration(
                      labelText: 'Email address',
                      hintText: 'you@example.com',
                      prefixIcon: Icon(Icons.mail_outline_rounded, size: 19),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: passCtrl,
                    obscureText: !showPassword,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => submitting ? null : handleSubmit(),
                    style: TextStyle(color: primary, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Password',
                      hintText: 'Min 6 characters',
                      prefixIcon: const Icon(Icons.lock_outline_rounded, size: 19),
                      suffixIcon: IconButton(
                        icon: Icon(showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 19),
                        onPressed: () => setSheetState(() => showPassword = !showPassword),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.voltLime,
                        foregroundColor: const Color(0xFF101211),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                      ),
                      onPressed: submitting ? null : handleSubmit,
                      child: submitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF101211)),
                            )
                          : Text(
                              isSignUp ? 'Create account →' : 'Sign in & sync →',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                            ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Center(
                    child: TextButton(
                      onPressed: submitting
                          ? null
                          : () => setSheetState(() {
                                isSignUp = !isSignUp;
                                errorMsg = null;
                              }),
                      child: Text(
                        isSignUp
                            ? 'Already have an account? Sign in'
                            : 'New to VectorGallery? Create account',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: brand),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    ),
  );

  return result == true;
}

