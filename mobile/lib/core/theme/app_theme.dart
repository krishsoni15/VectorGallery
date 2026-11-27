import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppTheme {
  static const String _themePrefKey = 'vm_theme_mode';

  // Obsidian Volt Dark Theme Design Tokens
  static const Color background = Color(0xFF090B0D);
  static const Color surface = Color(0xFF111416);
  static const Color surfaceElevated = Color(0xFF191D20);
  static const Color borderSubtle = Color(0x1AFFFFFF);
  static const Color textPrimary = Color(0xFFF4F6F2);
  static const Color textSecondary = Color(0xFFA4AEA9);
  static const Color textMuted = Color(0xFF7C8782);

  // Liquid Titanium Light Theme Design Tokens
  static const Color lightBackground = Color(0xFFF4F5F2);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceElevated = Color(0xFFE9EDE8);
  static const Color lightBorderSubtle = Color(0xFFDBE0DA);
  static const Color lightTextPrimary = Color(0xFF101211);
  static const Color lightTextSecondary = Color(0xFF606961);
  static const Color lightTextMuted = Color(0xFF606961);

  // Shared Brand Accents (High-contrast in both Light & Dark)
  static const Color accent = Color(0xFF087F5B);
  static const Color accentDark = Color(0xFF46D6A4);
  static const Color voltLime = Color(0xFFCDFF45);
  static const Color accentHover = Color(0xFF066649);
  static const Color accentMuted = Color(0x22087F5B);
  static const Color error = Color(0xFFEF4444);

  // Global Theme Mode Notifier for Instant Dark / Light Switching
  static final ValueNotifier<ThemeMode> themeModeNotifier = ValueNotifier<ThemeMode>(ThemeMode.dark);

  static Future<void> loadSavedTheme() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_themePrefKey);
      if (saved == 'light') {
        themeModeNotifier.value = ThemeMode.light;
      } else if (saved == 'dark') {
        themeModeNotifier.value = ThemeMode.dark;
      }
    } catch (_) {}
  }

  static Future<void> toggleTheme(ThemeMode mode) async {
    themeModeNotifier.value = mode;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_themePrefKey, mode == ThemeMode.light ? 'light' : 'dark');
    } catch (_) {}
  }

  static bool isDark(BuildContext context) => Theme.of(context).brightness == Brightness.dark;

  static Color bgOf(BuildContext context) => isDark(context) ? background : lightBackground;
  static Color surfaceOf(BuildContext context) => isDark(context) ? surface : lightSurface;
  static Color elevatedOf(BuildContext context) => isDark(context) ? surfaceElevated : lightSurfaceElevated;
  static Color borderOf(BuildContext context) => isDark(context) ? borderSubtle : lightBorderSubtle;
  static Color textPrimaryOf(BuildContext context) => isDark(context) ? textPrimary : lightTextPrimary;
  static Color textSecondaryOf(BuildContext context) => isDark(context) ? textSecondary : lightTextSecondary;
  static Color textMutedOf(BuildContext context) => isDark(context) ? textMuted : lightTextMuted;
  static Color brandOf(BuildContext context) => isDark(context) ? accentDark : accent;
  static Color warnOf(BuildContext context) => isDark(context) ? const Color(0xFFFBBF24) : const Color(0xFFB45309);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme.dark(
        primary: accentDark,
        onPrimary: Color(0xFF090B0D),
        surface: surface,
        onSurface: textPrimary,
        error: error,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: background,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: voltLime,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
        unselectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
      ),
      dialogTheme: DialogTheme(
        backgroundColor: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: borderSubtle),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: surfaceElevated,
        contentTextStyle: const TextStyle(color: textPrimary, fontSize: 13),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        behavior: SnackBarBehavior.floating,
      ),
      cardTheme: CardTheme(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderSubtle),
        ),
      ),
      dividerTheme: const DividerThemeData(color: borderSubtle),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceElevated,
        hintStyle: const TextStyle(color: textMuted, fontSize: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: voltLime, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBackground,
      colorScheme: const ColorScheme.light(
        primary: accent,
        onPrimary: Colors.white,
        surface: lightSurface,
        onSurface: lightTextPrimary,
        error: error,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: lightBackground,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: lightTextPrimary),
        titleTextStyle: TextStyle(
          color: lightTextPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: lightSurface,
        selectedItemColor: lightTextPrimary,
        unselectedItemColor: lightTextSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
        unselectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
      ),
      dialogTheme: DialogTheme(
        backgroundColor: lightSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: lightBorderSubtle),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: lightTextPrimary,
        contentTextStyle: const TextStyle(color: Colors.white, fontSize: 13),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        behavior: SnackBarBehavior.floating,
      ),
      cardTheme: CardTheme(
        color: lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: lightBorderSubtle),
        ),
      ),
      dividerTheme: const DividerThemeData(color: lightBorderSubtle),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightSurface,
        hintStyle: const TextStyle(color: lightTextSecondary, fontSize: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: lightBorderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: lightBorderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: accent, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    );
  }
}
