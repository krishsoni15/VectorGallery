# VectorGallery Mobile (Flutter)

Cross-platform Android and iOS mobile client for **VectorGallery**, communicating directly with the Next.js `/api/v2/*` backend and running an offline-resilient backup engine.

## Architecture

```
mobile/lib/
├── main.dart                         # App entry, GoRouter & ProviderScope initialization
├── core/
│   ├── network/api_client.dart       # Dio HTTP client, JWT interceptor & configurable host URL
│   ├── storage/local_database.dart   # SQLite upload queue, SHA-256 hash store & QueueStatus
│   └── theme/app_theme.dart          # Dark & Warm Light theme tokens
└── features/
    ├── auth/                         # Session token state (Riverpod + FlutterSecureStorage)
    ├── backup/                       # Automatic folder/gallery scanner & exponential backoff queue
    ├── chat/                         # Streaming AI assistant with file citations
    ├── files/                        # Google Photos-style media & document browser
    ├── home/                         # Storage telemetry, category tiles & sync controls
    ├── memories/                     # Curated smart memory views
    ├── navigation/                   # Bottom navigation shell
    ├── profile/                      # Host URL settings, AI provider key config & theme switch
    └── search/                       # Hybrid semantic + OCR search UI
```

## Development Setup

```bash
cd mobile
flutter pub get

# Run static analyzer and unit/widget tests
flutter analyze
flutter test

# Launch on Android emulator (default host resolves to 10.0.2.2:3000)
flutter run

# Launch pointing at a custom LAN host
flutter run --dart-define=VECTORGALLERY_API_URL=http://<LAN_IP>:3000
```

## Building an Android APK

```bash
cd mobile
flutter build apk --release
```

Automated APK release builds are also configured via `.github/workflows/release-apk.yml`.
