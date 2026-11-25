# Contributing to VectorGallery

Thank you for your interest in contributing to **VectorGallery**. We welcome bug fixes, documentation improvements, test coverage additions, and feature pull requests across both the Next.js web platform and the Flutter mobile client.

## Development Setup

### Web Platform
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and configure optional Supabase / AI provider keys (local mode works out-of-the-box with `STORAGE_PROVIDER=local`).
3. Start the dev server and background worker:
   ```bash
   npm run dev
   npm run worker
   ```

### Mobile Client (`mobile/`)
1. Verify Flutter SDK `>= 3.16.0` is installed.
2. Fetch packages and run tests:
   ```bash
   cd mobile
   flutter pub get
   flutter analyze
   flutter test
   ```

## Quality Checks

Before opening a pull request, ensure all checks pass locally:

```bash
# Web checks
npm run typecheck
npm run lint
npm test
npm run build

# Mobile checks
cd mobile && flutter analyze && flutter test
```

## Coding Standards
- **TypeScript**: Strict mode enabled; avoid `any` in shared library interfaces where concrete types apply.
- **Formatting**: Run `npm run format` before committing.
- **Security**: Never commit `.env*` secrets, `data/*.json` credential stores, or compiled `.apk` binaries.
- **Tests**: Add or update Vitest unit/integration tests or Flutter tests for every behavior change.

