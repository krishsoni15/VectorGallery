# Testing & Verification Guide

VectorGallery enforces automated test coverage across both the Next.js backend/intelligence tier and the Flutter mobile client.

## Test Suites

### 1. Web & Backend (`tests/`, Vitest)
Run all TypeScript unit, intelligence, integration, and lifecycle tests:
```bash
npm test
```

| Directory | Scope | Modules Covered |
|---|---|---|
| `tests/unit/` | Pure module invariants | `chunker`, `encryption`, `storage`, `validateRequest`, `rateLimiter`, `smartMatcher` |
| `tests/intelligence/` | Document & visual extraction | `documentParser`, `screenshot` |
| `tests/integration/` | API handlers, security & RAG SSE | `/api/v2/files/*`, `/api/v2/search`, `/api/v2/chat`, `/api/v2/collections/*`, `/api/health` |
| `tests/e2e/` | Multi-step vault lifecycle flows | Ingestion, deduplication, soft-delete/restore, offline retrieval |

### 2. Mobile Client (`mobile/test/`, Flutter Test)
Run static analysis and unit/widget tests for the mobile backup engine and UI shell:
```bash
cd mobile
flutter analyze
flutter test
```

## Continuous Integration
Every push and pull request to `main` runs `.github/workflows/ci.yml`:
1. `npm run typecheck` (`tsc --noEmit`)
2. `npm run lint` (`next lint`)
3. `npm test` (`vitest run`)
4. `npm run build` (`next build`)
5. `flutter analyze && flutter test`
