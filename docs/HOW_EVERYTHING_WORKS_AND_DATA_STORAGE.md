# How VectorGallery Works & Where Every Piece of User Data Lives

A plain-English technical walkthrough of **where user data is stored**, **how Local Mode vs Cloud Mode switch automatically**, and **every algorithm running under the hood**.

---

## 1. Where Every Piece of User Data Is Stored

VectorGallery runs on a **dual-mode storage architecture** controlled by `isServiceRoleConfigured()` (`lib/supabase.ts`):
- **Local Mode:** Activated automatically when Supabase service credentials (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are empty or unset. Zero cloud setup required.
- **Cloud Mode:** Activated automatically when Supabase credentials are configured (`STORAGE_DRIVER=supabase`).

### Exact Data Storage Map

| What Data? | Web — Local Mode (On Your Disk) | Web — Cloud Mode (Supabase) | Android App (`mobile/`) |
| :--- | :--- | :--- | :--- |
| **User Accounts & Passwords** | `data/local_users.json` (`scrypt` salted hash — never plaintext) + guest sandbox defaults | Supabase Auth (`auth.users`) + `user_profiles` table | Session token (`vm_access_token`) in encrypted `FlutterSecureStorage` (Android Keystore) |
| **Original Photos, PDFs & Videos** | `public/uploads/<userId>/<timestamp>_<sanitizedName>` (Local FS via `LocalStorageDriver`) | Private Supabase Storage bucket `documents` (`userId/timestamp_name`) | Stays untouched in Android Gallery/Storage (`BackupEngine` never deletes phone originals) |
| **File Metadata & Extracted OCR Text** | `data/local_files.json` (`id`, `user_id`, `sha256_hash`, `extracted_text`, `is_favorite`, `is_trashed`) | PostgreSQL `files` table (`tsvector` full-text index + RLS `auth.uid() = user_id`) | Cached sync status + hash history in local SQLite (`upload_queue` table) |
| **Document Chunks & Embeddings** | `data/local_vectors.json` (chunks + optional float embedding arrays + headings) | PostgreSQL `nods_page` + `nods_page_section` (`pgvector` column + HNSW index) | Retrieved from server via API on demand |
| **Albums / Collections** | `data/local_collections.json` (scoped per `user_id`) | `collections` & `collection_files` tables | Fetched from `/api/v2/collections` |
| **AI Assistant Chats & Citations** | `data/local_conversations.json` | `conversations`, `conversation_messages`, `citations` tables | Fetched from `/api/v2/conversations` |
| **Search History & Devices** | `data/local_search_history.json` & `data/local_devices.json` | `search_history` & `devices` tables | Device registration persisted on backend + local server URL in `FlutterSecureStorage` |
| **User Personal AI API Keys** | `data/user_keys.json` (encrypted with **AES-256-GCM**) | User key table (encrypted with **AES-256-GCM**) | Never stored on phone; sent to backend over HTTPS (`Settings` screen) |

> **Per-User Isolation Rule:** Even in Local Sandbox Mode, deleting an account (`DELETE /api/v2/auth/profile`) purges that user's records from every `data/local_*.json` file, deletes their binary files via `getStorageDriver().delete(...)`, and removes their empty `public/uploads/<userId>` directory cleanly.

---

## 2. How Each Core Pipeline & Algorithm Works (Simple Explanation)

### A. Authentication & Security Isolation
1. **Password Hashing (`lib/localAuthStore.ts`):** When a user signs up in Local Mode, Node's `crypto.scryptSync(password, salt, 64)` generates a memory-hard salted hash. Login compares hashes using constant-time `crypto.timingSafeEqual` to defeat timing attacks.
2. **Signed Stateless Session Cookie:** On login/signup, the server signs a payload (`{ sub, email, name, iat, exp }`, 7-day TTL) using HMAC-SHA256 (`vg_local_<base64url>.<sig>`) and stores it in cookie `sb-access-token` (`SameSite=Lax`, plus Bearer token support for mobile).
3. **API Key Vault (`lib/encryption.ts`):** User BYOK keys (Gemini/Groq/Cohere/OpenAI) are encrypted using **AES-256-GCM** with a fresh random `16`-byte Initialization Vector (`IV`) per record (`ivHex:authTagHex:ciphertextHex`). The authentication tag ensures tampering with stored ciphertext fails decryption safely.
4. **Protected File Preview & Proxy (`pages/api/preview/[filename].ts`, `pages/api/proxy.ts`):**
   - `/api/preview/[filename]` requires authentication (`401`), strips path traversal (`../` blocked with `400`), checks file ownership for that `user.id`, forces `X-Content-Type-Options: nosniff`, and neutralizes `.html`/`.svg`/`.xml` previews as `text/plain` so stored XSS cannot run.
   - `/api/proxy` requires authentication (`401`), resolves DNS first (`dns.lookup(..., { all: true })`) and blocks private/loopback/link-local/CGNAT IPs (`403` against SSRF & DNS rebinding), disables redirects, caps reads at 5 MB (`8s` timeout), and only allows safe media/document MIME types.

---

### B. Ingestion, Deduplication & Parsing (`lib/intelligence/pipeline.ts`)
Every upload goes through **6 deterministic steps**:
1. **Extension & Size Guardrail:** Rejects dangerous binaries (`.exe`, `.dll`, `.sh`, `.bat`, `.php`, `.apk`, etc. -> `400`) and enforces a `50 MB` payload bound.
2. **SHA-256 Content Hashing & Deduplication:** Computes `sha256` of the raw file bytes. If that **same user** already uploaded a non-trashed file with that exact hash, VectorGallery skips duplicate disk writes, OCR, and embeddings, returning the existing record (`isDuplicate: true`).
3. **Storage Write:** Writes `userId/timestamp_sanitizedFilename` to `LocalStorageDriver` (`public/uploads/`) or `SupabaseStorageDriver` (`documents` bucket).
4. **Multimodal Parsing & Dual OCR:**
   - Text/Code/JSON/Markdown/PDF/DOCX/CSV are parsed directly into clean text + heading metadata.
   - Images/Screenshots run through local heuristic/screenshot analysis + optional **Gemini Vision OCR** using the user's decrypted key (`extractTextFromImage` in `lib/intelligence/ocr.ts`), automatically classifying receipts, tickets, notes, or tech screenshots.
5. **Recursive Character Chunking (`lib/chunker.ts`):**
   - Splits extracted text cleanly into semantic chunks targeting `400` tokens (`~4 chars/token` fast heuristic so large PDFs don't block the Node.js event loop) with `80` tokens of sentence-aware overlap.
   - Tries coarse boundaries first (`\n\n` paragraphs), then sentences (`. `, `! `, `? `), clauses, words, down to `50`-char slices, preserving the active Markdown heading per chunk.
6. **Optional Dense Vector Embeddings:** If a user/server embedding key is available, batches chunks into vector embeddings and stores them (`data/local_vectors.json` or PostgreSQL `pgvector`); otherwise search & RAG continue seamlessly offline using lexical/BM25-style ranking.

---

### C. Hybrid Search & Multilingual `smartMatcher` (`pages/api/v2/search/index.ts`, `lib/search/smartMatcher.ts`, `lib/localVectorStore.ts`)
Search works **both offline (zero AI cost)** and **with vector AI**:
1. **Intent & Multilingual Tokenization (`parseQueryIntent`):**
   - Strips natural conversational filler words in English, Gujarati, and Hindi (`"find"`, `"please"`, `"show"`, `"મને"`, `"શોધો"`, `"બતાવો"`).
   - Detects category intent words (`"photo"`, `"ફોટો"` → `photos`; `"screenshot"` → `screenshots`; `"receipt"`, `"pdf"`, `"દસ્તાવેજ"` → `documents`).
   - Uses Unicode-aware matching (`/[^\p{L}\p{M}\p{N}]+/gu`) so Indic vowel diacritics and mixed scripts never break word boundaries.
2. **Lexical Scoring (`rankFilesByRelevance`):**
   - Exact phrase match: `+120` points
   - Adjacent two-word bigram match (`"train ticket"`): `+60` points per bigram
   - Filename / word / 4+ char prefix match: `+40` / `+20` points
3. **Hybrid Vector + Lexical Fusion (`Reciprocal Rank Fusion — RRF`):**
   - When embeddings exist (`hasUserVectorEmbeddings`), computes cosine similarity between the query vector and chunk vectors (`>= 0.28` threshold).
   - Combines ranked vector list (`weight 1.2`) and lexical list (`weight 1.0`) via **RRF**:
     $$\text{RRF}(d) = \sum_{r \in \text{rankers}} \frac{w_r}{60 + \text{rank}_r(d)}$$
   - Applies **MMR-style diversity capping** (maximum `3` chunks per file) so one 50-page manual never hides 5 other relevant files.

---

### D. Grounded RAG Chat & Anti-Hallucination Guardrails (`pages/api/v2/chat/index.ts`, `lib/groundingScore.ts`)
When you ask the AI Assistant a question:
1. Retrieves only **your** non-trashed files & top hybrid chunks (`contextDocs`).
2. Streams tokens live over **Server-Sent Events (`text/event-stream`)** (`type: "token"` → `type: "citations"` → `type: "done"`).
3. If no LLM API key is configured, falls back to **Offline Deterministic Grounded Synthesis** directly returning matched file excerpts and thumbnails instead of crashing.
4. **Post-Generation Grounding Check (`calculateGroundingScore`):** Splits the response into sentences and measures 3-gram word overlap against retrieved chunks (`high`, `medium`, `low` confidence). Filters emitted `citations` strictly to verified context sources.

---

### E. Mobile Offline Backup & Sync Engine (`mobile/lib/features/backup/backup_engine.dart`)
1. Scans picked/gallery photos and documents without ever modifying or deleting originals.
2. Computes SHA-256 on the phone **before** queuing; skips duplicates immediately if SQLite (`LocalDatabase.isHashUploaded`) already recorded that hash (`duplicateCount++`).
3. Enqueues unique candidates into local SQLite (`upload_queue` table, status `QUEUED`).
4. Listens to `connectivity_plus` — if `wifiOnly` is enabled and Wi-Fi drops, pauses immediately (`paused`) and resumes automatically on Wi-Fi reconnect.
5. Uploads with **capped exponential backoff** (`computeBackoffSeconds`: $\min(60, 2^{\text{retry}} \times 2)$ seconds — e.g. `4s, 8s, 16s, 32s, 60s`), persisting progress across app restarts.

