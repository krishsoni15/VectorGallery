import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../auth/auth_provider.dart';
import '../backup/backup_engine.dart';
import '../home/home_screen.dart';
import '../files/files_screen.dart';
import '../chat/chat_screen.dart';
import '../search/search_screen.dart';
import '../profile/profile_screen.dart';

class BottomNavShell extends ConsumerStatefulWidget {
  const BottomNavShell({super.key});

  @override
  ConsumerState<BottomNavShell> createState() => _BottomNavShellState();
}

class _BottomNavShellState extends ConsumerState<BottomNavShell> {
  int _currentIndex = 0;
  String _filesCategoryFilter = 'all';

  void _openTabWithCategory(int tabIndex, [String category = 'all']) {
    setState(() {
      _currentIndex = tabIndex;
      _filesCategoryFilter = category;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Keep BackupEngine user-context scoped to the currently authenticated user
    ref.listen<AuthState>(authProvider, (prev, next) {
      BackupEngine().setUserContext(next.email);
    });

    final border = AppTheme.borderOf(context);
    final screens = [
      HomeScreen(
        onOpenCategory: (cat) => _openTabWithCategory(1, cat),
        onOpenTab: (idx) => _openTabWithCategory(idx),
      ),
      FilesScreen(initialCategory: _filesCategoryFilter),
      const ChatScreen(),
      const SearchScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: border)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home_rounded),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.photo_library_outlined),
              activeIcon: Icon(Icons.photo_library_rounded),
              label: 'Library',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.auto_awesome_outlined),
              activeIcon: Icon(Icons.auto_awesome),
              label: 'Assistant',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.search_rounded),
              activeIcon: Icon(Icons.manage_search_rounded),
              label: 'Search',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.settings_outlined),
              activeIcon: Icon(Icons.settings_rounded),
              label: 'Settings',
            ),
          ],
        ),
      ),
    );
  }
}
