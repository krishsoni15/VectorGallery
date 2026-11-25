# ⚡ VectorGallery
### Personal AI Cloud & Intelligent Digital Memory Platform

<div align="center">
  <img src="https://raw.githubusercontent.com/krishsoni15/VectorGallery/main/public/vectorgallery-icon.svg" alt="VectorGallery Logo" width="120" style="border-radius: 20%; filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.45));" />
  <br /><br />

  [![Next.js](https://img.shields.io/badge/Next.js-13.2.4-emerald?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Flutter](https://img.shields.io/badge/Flutter-3.x-blue?style=flat-square&logo=flutter&logoColor=white)](https://flutter.dev/)
  [![Supabase](https://img.shields.io/badge/PostgreSQL-pgvector-emerald?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Strict-emerald?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![CI](https://img.shields.io/badge/CI-GitHub%20Actions-emerald?style=flat-square&logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
  [![License](https://img.shields.io/badge/License-Apache--2.0-emerald?style=flat-square)](LICENSE)

  <p>
    A unified personal storage platform where you can automatically back up, organize, search, retrieve, understand, and interact with all your digital files and memories.
  </p>

  <p>
    <a href="#-architecture--data-flows">Architecture</a> •
    <a href="#1-end-to-end-system-topology">System Topology</a> •
    <a href="#2-ingestion-deduplication--worker-pipeline">Ingestion Pipeline</a> •
    <a href="#3-mobile-offline-backup--sync-state-machine">Mobile Sync</a> •
    <a href="#4-hybrid-search--grounded-sse-chat-flow">Search & AI Flow</a> •
    <a href="#5-database-schema--rls-data-model">Data Model</a> •
    <a href="#-quickstart--local-development">Quickstart</a>
  </p>
</div>

---

## 📖 What is VectorGallery?

VectorGallery replaces fragmented cloud storage, lost screenshot folders, and scattered notes with a **single, unified, AI-powered personal cloud**:

> **"You don't need to remember where you saved something. You simply ask VectorGallery."**

### Real-World Use Cases:
- *"Find the screenshot where I saved AWS EC2 pricing."* → Returns the image preview with highlighted OCR pricing tables.
- *"Find my college admission PDF."* → Returns the original letter with cited page numbers.
- *"Find all bills and receipts saved last month."* → Dynamically displays detected receipts.
- *"Summarize my notes about Docker containers."* → Generates a synthesis strictly grounded in your files.

Every answer is **grounded in retrieved content** with real clickable citations. VectorGallery **never hallucinates or fabricates citations**.

---

## 🧠 Architecture & Data Flows

VectorGallery is built around a **dual-mode architecture** (full cloud PostgreSQL + pgvector with Supabase RLS, or zero-config local filesystem + JSON metadata fallback) shared across both the Next.js web app and the Flutter mobile client.

### 1. End-to-End System Topology

```mermaid
flowchart TB
    subgraph Clients["Client Applications"]
        WEB["Next.js 13 Web App (Dashboard, Photos Timeline, Albums, Assistant, Cmd+K Search)"]
        MOB["Flutter 3 Mobile App (Home, Files, AI Chat, Search, Profile)"]
        SQLITE[("Mobile SQLite (upload_queue) & FlutterSecureStorage")]
        MOB <--> SQLITE
    end

    subgraph Gateway["Next.js API Gateway (pages/api/v2/*)"]
        AUTH["Supabase JWT Auth (getServerUser) & Service Role Check"]
        GUARD["withValidation (Zod + XSS Sanitizer) & withRateLimit (Upstash Redis)"]
        FILES_API["Files, Folders & Collections APIs (/files/*, /collections/*)"]
        SEARCH_API["Search API (/api/v2/search)"]
        CHAT_API["SSE Chat API (/api/v2/chat)"]
        CRED["Credential Resolver (AES-256-GCM Decrypt)"]
    end

    subgraph Intelligence["Intelligence & Ingestion Layer"]
        PIPE["Ingestion Pipeline (lib/intelligence/pipeline.ts)"]
        PARSE["Document Parser (PDF, DOCX, CSV, JSON, Text)"]
        OCR["Dual OCR Engine & Screenshot Classifier"]
        MATCH["Smart Matcher (Unicode English & Indic Tokenizer + Ranker)"]
        LLM["Provider Router (Gemini, Groq, Cohere, OpenAI)"]
        WORKER["Async Background Worker (worker/index.ts polling loop)"]
    end

    subgraph Persistence["Storage & Data Tier"]
        DRIVER["Pluggable Storage Adapter (getStorageDriver)"]
        LOCAL_FS[("LocalStorageDriver (public/uploads/)")]
        SUPA_FS[("SupabaseStorageDriver (documents bucket)")]
        LOCAL_META[("Local Metadata Store (data/local_files.json)")]
        PG[("PostgreSQL + pgvector (RLS, GIN fts, hybrid_search RPC)")]
    end

    WEB --> AUTH
    MOB --> AUTH
    AUTH --> GUARD
    GUARD --> FILES_API
    GUARD --> SEARCH_API
    GUARD --> CHAT_API

    FILES_API --> PIPE
    PIPE --> PARSE
    PARSE --> OCR
    PIPE --> DRIVER
    PIPE --> LLM
    WORKER --> PG
    WORKER --> DRIVER
    WORKER --> PARSE
    WORKER --> LLM

    SEARCH_API --> MATCH
    SEARCH_API --> LLM
    SEARCH_API --> PG
    SEARCH_API --> LOCAL_META

    CHAT_API --> CRED
    CHAT_API --> MATCH
    CHAT_API --> LLM
    CHAT_API --> PG
    CHAT_API --> LOCAL_META

    DRIVER --> LOCAL_FS
    DRIVER --> SUPA_FS
    PIPE --> PG
    PIPE --> LOCAL_META
```

---

### 2. Ingestion, Deduplication & Worker Pipeline

Every binary upload passes through extension blocklists, payload bounds (`50MB`), SHA-256 deduplication, storage abstraction, multimodal extraction, and optional vector indexing or async worker processing:

```mermaid
sequenceDiagram
    autonumber
    participant Client as Web UI or Mobile BackupEngine
    participant Upload as POST /api/v2/files/upload
    participant Guard as Security & Pipeline
    participant Store as Storage Driver (Supabase or Local FS)
    participant Parser as Document Parser & OCR
    participant DB as PostgreSQL + pgvector / local_files.json
    participant Embed as Embedding Provider
    participant Worker as worker/index.ts (Async Loop)

    Client->>Upload: POST { filename, base64, mimeType, folderId }
    Upload->>Guard: Verify JWT (if Supabase configured) + Block executable extensions + Size <= 50MB
    Guard->>Guard: Compute SHA-256 digest of decoded buffer
    Guard->>DB: Query existing non-trashed record by sha256_hash
    alt Duplicate hash found
        DB-->>Client: 200 OK { fileId, isDuplicate: true, sha256, storageUrl }
    else New unique binary
        Guard->>Store: upload(userId/timestamp_sanitizedName, buffer)
        Store-->>Guard: { key, url, sizeBytes }
        Guard->>Parser: parseDocument(filename, buffer, mimeType) + analyzeScreenshot
        Parser-->>Guard: { rawText, chunks, metadata: category, tags }
        Guard->>DB: Insert files row (processing_status) or saveLocalFile()
        alt AI embedding key configured & chunks > 0
            Guard->>Embed: generateEmbeddingsBatch(chunks, provider)
            Embed-->>Guard: 768d vectors
            Guard->>DB: Insert nods_page + nods_page_section vectors + tags
        else Offline / no embedding key
            Note over Guard,DB: Persists extracted_text for FTS & smartMatcher retrieval
        end
        DB-->>Client: 200 OK { fileId, isDuplicate: false, status: READY }
    end

    loop Every 5 seconds (when Supabase service role configured)
        Worker->>DB: Fetch files with processing_status in [PENDING, VALIDATING]
        Worker->>Store: download(file.storage_key)
        Worker->>Parser: parseDocument() -> update extracted_text
        Worker->>Embed: generateEmbeddingsBatch() -> set indexing_status INDEXED or SKIPPED
        Worker->>DB: Mark processing_status = READY (or FAILED with processing_error)
    end
```

---

### 3. Mobile Offline Backup & Sync State Machine

`mobile/lib/features/backup/backup_engine.dart` coordinates non-destructive device scanning, SHA-256 deduplication against local SQLite (`mobile/lib/core/storage/local_database.dart`), Wi-Fi connectivity gating, and exponential backoff retries:

```mermaid
flowchart LR
    SCAN["Device Scan / Folder Picker / Photo Gallery"] --> HASH["Compute SHA-256 (BackupEngine.computeSha256Bytes)"]
    HASH --> CHECK{"Hash already COMPLETED in SQLite?"}
    CHECK -- Yes --> SKIP["Increment duplicateCount & skip upload"]
    CHECK -- No --> ENQ["Insert into SQLite upload_queue (status: QUEUED)"]
    ENQ --> CONN{"wifiOnly enabled & not on Wi-Fi?"}
    CONN -- Yes --> PAUSE["Pause Queue (status: paused) until ConnectivityResult.wifi"]
    CONN -- No --> POST["POST /api/v2/files/upload via ApiClient (Dio + JWT Interceptor)"]
```

```mermaid
stateDiagram-v2
    [*] --> QUEUED: Enqueue unique SHA-256 candidate
    QUEUED --> UPLOADING: Worker loop picks pending batch (limit 50)
    UPLOADING --> COMPLETED: HTTP 200 OK stored on server
    UPLOADING --> FAILED: Network timeout or non-200 error (retryCount++)
    FAILED --> QUEUED: retryCount < 3 after exponential backoff min(30s, 2^retry * 2)
    UPLOADING --> QUEUED: Paused mid-batch (app resume / Wi-Fi reconnect)
    COMPLETED --> [*]
```

---

### 4. Hybrid Search & Grounded SSE Chat Flow

VectorGallery guarantees retrieval works both **with cloud AI keys** (pgvector RRF + SSE token streaming) and **completely offline** (multilingual keyword + Unicode Indic `\p{L}\p{M}` token ranking + deterministic cited summaries):

```mermaid
sequenceDiagram
    autonumber
    participant UI as Web Assistant / Search Modal / Mobile
    participant Search as GET /api/v2/search
    participant Chat as POST /api/v2/chat (SSE)
    participant Matcher as smartMatcher (Intent & Ranker)
    participant Cred as credentialResolver (AES-256-GCM)
    participant DB as PostgreSQL (FTS + hybrid_search RPC) / Local Store
    participant LLM as Provider Router (Groq / Gemini / Cohere / OpenAI)

    UI->>Search: Query ?q=...&category=...
    alt Local Mode (No Supabase Service Role)
        Search->>DB: getLocalFiles()
        Search->>Matcher: rankFilesByRelevance(files, query) [Exact Phrase -> Bigrams -> Tokens -> Category]
        Matcher-->>UI: Ranked JSON results with excerpts & relevance scores
    else Cloud Mode (Supabase + pgvector)
        Search->>DB: Full-text ILIKE / GIN query on files table
        opt Embedding Key Configured
            Search->>LLM: generateEmbedding(query)
            Search->>DB: rpc("hybrid_search", query_embedding, query_text)
        end
        DB-->>UI: Deduplicated keyword + semantic vector hits
    end

    UI->>Chat: POST { query, conversationId, chatHistory }
    Chat->>DB: Persist user message + retrieve top relevant files
    Chat->>Cred: Decrypt user provider key (or fallback to server env key)
    alt Active LLM Provider Key Available
        Chat->>LLM: streamChatResponse(strictGroundingPrompt + contextDocs)
        loop Token Stream
            LLM-->>Chat: Token chunk
            Chat-->>UI: SSE data: {"type":"token","content":"..."}
        end
        Chat->>Chat: Filter finalCitations to verified context sources
        Chat-->>UI: SSE citations + confidence (HIGH/LOW) + done
        Chat->>DB: Persist assistant message & citations rows
    else Offline Fallback Mode (No AI Key)
        Chat-->>UI: SSE grounded file excerpts & media previews + done
    end
```

---

### 5. Database Schema & RLS Data Model

All tenant tables in [supabase/migrations/20261117_vectormind_v2_core.sql](supabase/migrations/20261117_vectormind_v2_core.sql) and [supabase/migrations/20261117_vectormind_v2_extensions.sql](supabase/migrations/20261117_vectormind_v2_extensions.sql) enforce PostgreSQL Row-Level Security (`auth.uid() = user_id`):

```mermaid
erDiagram
    USERS ||--o| USER_PROFILES : "configures"
    USERS ||--o| STORAGE_USAGE : "tracks quota"
    USERS ||--o{ FOLDERS : "organizes"
    USERS ||--o{ FILES : "owns (RLS)"
    USERS ||--o{ COLLECTIONS : "curates"
    USERS ||--o{ DEVICES : "syncs"
    USERS ||--o{ CONVERSATIONS : "queries"
    USERS ||--o{ SEARCH_HISTORY : "logs"
    USERS ||--o{ AUDIT_LOGS : "audits"

    FOLDERS ||--o{ FOLDERS : "parent_id"
    FOLDERS ||--o{ FILES : "contains"
    FILES ||--o{ FILE_TAGS : "labeled"
    TAGS ||--o{ FILE_TAGS : "tags"
    COLLECTIONS ||--o{ COLLECTION_FILES : "groups"
    FILES ||--o{ COLLECTION_FILES : "member_of"
    DEVICES ||--o{ BACKUP_JOBS : "queues"
    FILES ||--o{ BACKUP_JOBS : "targets"
    CONVERSATIONS ||--o{ CONVERSATION_MESSAGES : "has"
    CONVERSATION_MESSAGES ||--o{ CITATIONS : "cites"
    FILES ||--o{ CITATIONS : "grounded_in"

    FILES {
        uuid id PK
        uuid user_id FK
        text original_name
        text category
        bigint size_bytes
        text storage_key
        text sha256_hash
        text processing_status
        text indexing_status
        tsvector fts
        boolean is_favorite
        boolean is_trashed
    }
```

---

## ✨ Key Capabilities

### 1. Unified File Storage & Management
- Supports **PDF, DOCX, DOC, XLSX, XLS, CSV, TXT, MD, JSON, PNG, JPG, JPEG, WEBP, GIF, HEIC, MP4, MOV, MP3, WAV, M4A**.
- Actions: Upload, Download, Preview, Rename, Move, Favorite, Soft-delete (Trash), Restore, Permanent purge.
- Fast cursor-based pagination and category filters.

### 2. Apple iCloud / Linear Design System
- Minimal, calm, and elegant interface with subtle glassmorphism surfaces.
- **Desktop Navigation:** 12-item sidebar (Home, AI Search, Assistant, Photos, Videos, Documents, Audio, Downloads, Collections, Recent, Favorites, Trash) + real-time storage bar, device status, and settings.
- **Mobile Navigation:** Bottom navigation (Home, Search, Memories, Files, Profile).

### 3. Real Storage Dashboard
- **No hardcoded stats:** Live byte calculations for used storage, quota, file count, photo count, screenshot count, document count, and video count.
- Device backup health indicator with sync timestamps.

### 4. Automatic Mobile Backup Engine (Flutter)
- Located in `mobile/`.
- Incremental camera roll, screenshot, and document scanning.
- **SHA-256 duplicate detection:** Identical files are recognized immediately and never re-uploaded.
- **Offline queue persistence:** Handled via SQLite (`sqflite`).
- **Resilient retry:** Exponential backoff ($T = \min(60, 2^{\text{retry}} \times 2)$).
- **Wi-Fi only mode:** Saves cellular mobile data.
- **Never deletes local phone files:** Backup is strictly non-destructive.

### 5. Multi-Format Intelligence & Offline OCR
- **Dual-Engine OCR:** Local zero-cost heuristic extraction + Google Gemini 2.0 Flash Vision multimodal fallback.
- **Screenshot Analyzer:** Automatically classifies error screens, code snippets, receipts, and AWS/tech consoles.
- **Spreadsheet Parser:** Extracts sheet names, column headers, and structured cell rows for CSV/XLSX.

### 6. Grounded AI Assistant & Citations
- Streaming Server-Sent Events (SSE) chat.
- Every claim referencing personal files includes a source link with file name, page number, and excerpt.
- If content does not exist, VectorGallery clearly states so.

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm 9+
- Optional: Flutter 3.x (for mobile application)
- Optional: Supabase project (or runs locally out-of-the-box with `LocalStorageDriver`)

### 1. Clone & Install
```bash
git clone https://github.com/krishsoni15/VectorGallery.git
cd VectorGallery

# Install web dependencies
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
# Supabase Configuration (Optional for full cloud DB, runs with local mock if empty)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Encryption Key for Stored API Credentials (32-byte hex)
CREDENTIAL_ENCRYPTION_KEY=your_32_byte_hex_key

# Storage Driver: 'local' | 'supabase' | 'r2'
STORAGE_PROVIDER=local

# Optional AI Providers (Basic keyword search and file management work without keys)
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
COHERE_API_KEY=your_cohere_key
OPENAI_API_KEY=your_openai_key
```

### 3. Run Web Application & Worker
```bash
# Terminal 1: Run Web Application
npm run dev

# Terminal 2: Run Background Intelligence Worker
npm run worker
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Mobile Application
```bash
cd mobile
flutter pub get
flutter run
```

---

## 📁 Repository Structure

```text
VectorGallery/
├── components/              # Modular React views (assistant, collections, dashboard, files, layout, search, settings)
├── lib/
│   ├── intelligence/        # Multi-format parser, dual-engine OCR & screenshot analyzer
│   ├── search/              # Multilingual intent parser & relevance ranker
│   ├── storage/             # Pluggable storage drivers (Local FS, Supabase, R2/S3)
│   ├── encryption.ts        # AES-256-GCM key vault encryption
│   ├── rateLimiter.ts       # Sliding-window Redis / fail-open rate limiting
│   └── validateRequest.ts   # Zod schemas & XSS/null-byte sanitization
├── pages/
│   ├── api/v2/              # Versioned REST & SSE streaming API endpoints
│   ├── app/                 # Authenticated & local workspace application shell
│   └── install.tsx          # Android APK distribution & setup page
├── mobile/                  # Flutter 3 cross-platform mobile client + backup engine
├── worker/                  # Background file ingestion & embedding worker
├── supabase/migrations/     # Incremental PostgreSQL + pgvector migrations
├── tests/                   # Vitest unit, intelligence, integration & lifecycle suites
└── docs/                    # Architecture, API, database, security & deployment specs
```

---

## 🧪 Testing & Verification

VectorGallery includes automated tests across the backend/intelligence tier, API security routes, and Flutter mobile client:

```bash
# Run web typecheck, lint & Vitest suite
npm run check

# Or execute individually
npm run typecheck
npm run lint
npm test
npm run build

# Run mobile static analysis & unit/widget tests
cd mobile && flutter analyze && flutter test
```

---

## 🔒 Security & Privacy

1. **Server-Side Authentication:** Requests verify Supabase JWT tokens (`auth.getUser(token)`) with Row Level Security enforced at the database layer.
2. **Input Sanitization & Guardrails:** Upload routes block executable extensions, enforce 50MB payload limits, validate payloads via Zod schemas, and strip HTML/script tags from queries.
3. **Application-Level Encryption:** Provider API credentials are encrypted at rest with **AES-256-GCM** using per-record random IVs.
4. **Tenant Isolation:** Personal files, embeddings, and chat history remain strictly scoped to the owning user.

---

## 📚 Engineering Documentation

Technical specifications are organized in [`docs/`](docs/):
- [`docs/API_DESIGN.md`](docs/API_DESIGN.md) & [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) — REST & SSE API contracts.
- [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) & [`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md) — ER diagrams and PostgreSQL + pgvector schemas.
- [`docs/ENVIRONMENT_SETUP.md`](docs/ENVIRONMENT_SETUP.md) & [`docs/LOCAL_SERVER_SETUP.md`](docs/LOCAL_SERVER_SETUP.md) — Environment configuration and local development.
- [`docs/PRODUCTION_DEPLOYMENT.md`](docs/PRODUCTION_DEPLOYMENT.md) — Production topology and deployment targets.
- [`docs/SECURITY.md`](docs/SECURITY.md) — Threat model, encryption specifications, and RLS policies.
- [`docs/TESTING_PLAN.md`](docs/TESTING_PLAN.md) — Automated verification strategy across web and mobile.
- [`mobile/README.md`](mobile/README.md) — Flutter client architecture and Android APK build guide.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for contributor guidelines and pull request checks.

---

## 📄 License
Apache License 2.0 — see [`LICENSE`](LICENSE).
