import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class MobileGuideStep {
  final String number;
  final String title;
  final String subtitle;
  final IconData icon;

  const MobileGuideStep({
    required this.number,
    required this.title,
    required this.subtitle,
    required this.icon,
  });
}

const List<MobileGuideStep> _mobileGuideSteps = [
  MobileGuideStep(
    number: '01',
    title: 'Connect & Sign In',
    subtitle:
        'Open Settings → Host Server URL to point to your VectorGallery server, run Test Connection, and sign in or create an account so backups sync to your private vault.',
    icon: Icons.verified_user_outlined,
  ),
  MobileGuideStep(
    number: '02',
    title: 'Back Up Safely (Read-Only)',
    subtitle:
        'Tap Backup on Home (or Add Photos / Docs / Folder). Files are SHA-256 hashed locally so duplicates never upload twice and phone originals stay untouched.',
    icon: Icons.cloud_upload_outlined,
  ),
  MobileGuideStep(
    number: '03',
    title: 'Browse Like Google Photos',
    subtitle:
        'Open Library to switch between a clean Photos Grid and List view, filter Camera, Screenshots, Documents, or Favorites, and tap any item to preview OCR text.',
    icon: Icons.photo_library_outlined,
  ),
  MobileGuideStep(
    number: '04',
    title: 'Search Naturally & Ask AI',
    subtitle:
        'Use Search for instant semantic + OCR lookup ("Kyoto ticket", "tuition PDF"), or open Assistant to chat across your library with clickable file citations.',
    icon: Icons.auto_awesome_outlined,
  ),
  MobileGuideStep(
    number: '05',
    title: 'Themes & Personal AI Keys',
    subtitle:
        'Toggle Light (Liquid Titanium) or Dark (Obsidian Volt) anytime in Settings, and optionally add a personal Gemini or Groq API key for fast generative answers.',
    icon: Icons.palette_outlined,
  ),
];

void showMobileUserGuideSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) {
      final surface = AppTheme.surfaceOf(ctx);
      final elevated = AppTheme.elevatedOf(ctx);
      final border = AppTheme.borderOf(ctx);
      final primaryText = AppTheme.textPrimaryOf(ctx);
      final secondaryText = AppTheme.textSecondaryOf(ctx);
      final brand = AppTheme.brandOf(ctx);

      return DraggableScrollableSheet(
        initialChildSize: 0.78,
        maxChildSize: 0.92,
        minChildSize: 0.45,
        builder: (_, controller) => Container(
          decoration: BoxDecoration(
            color: surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border(top: BorderSide(color: border)),
          ),
          child: ListView(
            controller: controller,
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: secondaryText.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: brand.withOpacity(0.14),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.menu_book_rounded, color: brand, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'VectorGallery User Guide',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: primaryText),
                        ),
                        Text(
                          'How to back up, search, and chat with your vault',
                          style: TextStyle(fontSize: 12, color: secondaryText),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: Icon(Icons.close, color: secondaryText),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ..._mobileGuideSteps.map(
                (step) => Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: elevated,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: border),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: brand.withOpacity(0.14),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          step.number,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                            color: brand,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(step.icon, size: 15, color: brand),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    step.title,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                      color: primaryText,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 5),
                            Text(
                              step.subtitle,
                              style: TextStyle(fontSize: 12.5, height: 1.45, color: secondaryText),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

