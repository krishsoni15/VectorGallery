# VectorGallery — Recruiter & Technical Interview Playbook (Architecture & Q&A)

Use this guide before technical interviews or portfolio walkthroughs. Every explanation below uses **simple, confident engineering language** backed directly by the real implementation in this repository.

---

## 1. Your 30-Second Elevator Pitch (Non-Technical / Recruiter Friendly)
> *"I built **VectorGallery**, an open-source, privacy-first personal AI cloud across Web (Next.js/TypeScript) and Android (Flutter/Dart). People save photos, screenshots, receipts, and PDFs everywhere and forget where they put them. VectorGallery automatically backs up mobile photos over Wi-Fi without touching originals, extracts text using OCR and document parsers, and lets you search or ask an AI assistant questions in natural language—giving answers grounded in your actual files with clickable citations. It also works 100% offline in zero-config Local Mode without requiring cloud databases or AI API keys."*

---

## 2. Two-Minute Architecture Walkthrough (For System Design Rounds)
1. **Two Clients, One Versioned API:** A Next.js web workspace (`/app`) and a native Flutter Android app (`mobile/`) both talk to `/api/v2/*` endpoints over HTTPS + Bearer JWT / signed cookies.
2. **Dual Storage & DB Abstraction:** A clean adapter (`getStorageDriver()` + `isServiceRoleConfigured()`) runs either **Cloud Mode** (PostgreSQL + `pgvector` + Row-Level Security + private Supabase buckets) or **Local Mode** (`data/local_*.json` + `public/uploads/<userId>` + HMAC tokens) transparently.
3. **Ingestion Pipeline:** File bytes pass extension/size guards (`50 MB`) → **SHA-256 content hash** deduplication → storage write → document/OCR text extraction → recursive semantic chunking (`400` tokens, `80` overlap) → optional vector embeddings.
4. **Hybrid Search Engine:** Fuses dense vector cosine similarity with a multilingual Unicode lexical matcher (`smartMatcher`) using **Reciprocal Rank Fusion (`RRF`)** and per-file diversity caps so exact IDs/dates AND semantic concepts both rank cleanly.
5. **Grounded Streaming AI:** SSE streaming chat retrieves only the user's verified chunks, checks sentence grounding with N-gram overlap, and streams verified source citations—with a deterministic offline fallback if no LLM key is set.

---

## 3. Top Interview Questions & Ready Answers

### Architecture & System Design

**Q1. Why did you support BOTH Local Mode and Supabase Cloud Mode instead of just using PostgreSQL?**
> *Answer:* In real developer tools and personal clouds, asking users to provision PostgreSQL, `pgvector`, and API keys before trying the app creates huge onboarding friction. I abstracted storage (`LocalStorageDriver` vs `SupabaseStorageDriver`) and metadata behind a unified check (`isServiceRoleConfigured()`). Locally, users can clone and run everything immediately (`scrypt` auth, HMAC sessions, JSON stores, lexical/local vector search) with zero external services, while deploying to Vercel/cloud only requires adding Supabase environment variables.

**Q2. What happens if someone tries to run Local Mode on a serverless host like Vercel?**
> *Answer:* Good catch—serverless platforms like Vercel have an ephemeral, read-only filesystem between invocations, so local JSON files and `public/uploads/` would reset. That's why Local Mode is meant for VPS/Docker/local machines with persistent disks, while Vercel deployments automatically activate Supabase PostgreSQL + private Supabase Storage (`STORAGE_DRIVER=supabase`).

**Q3. Why is there a separate `worker/index.ts` alongside Next.js API routes?**
> *Answer:* Serverless HTTP handlers have strict execution timeouts (often 10–60s). Heavy PDF parsing, OCR vision calls, and batch embedding generation can exceed timeouts on large files. Moving async polling (`PENDING` → `EXTRACTING` → `INDEXED` → `READY`) into a standalone Node worker decouples slow AI ingestion from fast HTTP upload acknowledgment.

---

### Search, Chunking & AI Algorithms

**Q4. Explain how your chunking algorithm works and why you used 400 tokens with 80 overlap.**
> *Answer:* In `lib/chunker.ts`, `recursiveCharacterChunker` splits text recursively along natural boundaries first—double newlines (`\n\n` paragraphs), then sentences (`. `, `! `, `? `), clauses, spaces, and finally 50-char fallback—tracking Markdown headings as metadata. A `400`-token window keeps chunks focused enough for high vector similarity precision, while an `80`-token sentence-aware overlap ensures facts split across boundaries aren't lost. To avoid blocking Node's single-threaded event loop during large PDFs, I used a fast `~4 chars/token` heuristic rather than loading a heavy synchronous BPE tokenizer per chunk.

**Q5. Why use Hybrid Search (Vector + Keyword) instead of pure Vector Embeddings?**
> *Answer:* Dense vector search is great for meaning (*"dinner under olive trees"* matches `"courtyard supper"`), whereas pure vectors often miss **exact identifiers** like receipt number `#10482`, seat `14A`, or filenames. So vector search and keyword search complement each other cleanly.

**Q6. How do you combine Vector Scores and Keyword Scores fairly? Explain Reciprocal Rank Fusion (RRF).**
> *Answer:* Vector cosine similarity lives in `[0, 1]` while lexical keyword scores might be `0` to `200+`, so adding raw scores directly lets one dominate. Instead, in `lib/localVectorStore.ts` (and `hybrid_search` SQL), I sort vector matches and lexical matches independently and combine their **ranks** using RRF with smoothing constant `k = 60`:
> `score = 1.2 / (60 + vectorRank) + 1.0 / (60 + lexicalRank)`
> Afterward, I cap results to max **3 chunks per file** (MMR-style diversity) so one long PDF doesn't push other relevant files off page 1.

**Q7. How does search still work when the user has NO AI / Embedding API key configured?**
> *Answer:* `lib/search/smartMatcher.ts` parses query intent locally: it removes conversational stopwords in English, Gujarati, and Hindi, detects media intent synonyms (*"photo"`, `"screenshot"`, `"receipt"`, `"ફોટો"`), extracts Unicode `\p{L}\p{M}\p{N}` tokens (so Indic scripts keep their vowel signs), and scores files hierarchically (+120 exact phrase match, +60 word bigrams, +40 filename match, +prefix stems).

**Q8. How do you prevent the AI Assistant from hallucinating facts or fake file names?**
> *Answer:* Three layers in `pages/api/v2/chat/index.ts` and `lib/groundingScore.ts`:
> 1. Strict retrieval scoping: context is fetched exclusively from that authenticated user's verified files/chunks (`eq('user_id', userId)`).
> 2. Strict grounding system prompt requiring answers solely from retrieved context snippets.
> 3. Post-generation verification: `calculateGroundingScore` breaks the response into sentences and computes 3-gram lexical overlap against the retrieved chunks (`high`/`medium`/`low`), and outgoing `citations` are filtered to IDs actually present in retrieved context. *(Note: I deliberately swapped per-sentence Cohere Rerank API calls for local 3-gram overlap to avoid 30–40s latency spikes and API rate-limit failures.)*

**Q9. Why did you stream AI chat responses with Server-Sent Events (SSE) instead of WebSockets?**
> *Answer:* Chat generation is unidirectional streaming (server pushes tokens → citations → `done` to the client for one HTTP POST request). SSE works natively over standard HTTP/1.1 & HTTP/2, requires zero WebSocket handshake state or sticky sessions behind reverse proxies/CDNs, and handles Nginx `proxy_buffering off` cleanly.

---

### Deduplication, Storage & Mobile Sync

**Q10. How does deduplication work, and why is it scoped per user?**
> *Answer:* Both the backend (`pipeline.ts`) and Android (`BackupEngine.computeSha256Bytes`) compute the **SHA-256** hash of raw file bytes. If a matching non-trashed hash exists **for that same `user_id`**, upload short-circuits (`isDuplicate: true`), saving storage and redundant OCR/embedding costs. Scoping per user (`eq('user_id', userId)`) is critical for privacy—two different users uploading the same public PDF shouldn't expose each other's existence, ownership, or break independent deletion.

**Q11. How does Android automatic backup handle offline states, flaky mobile data, and cellular costs?**
> *Answer:* `BackupEngine` in `mobile/` is an offline-first queue backed by local SQLite (`upload_queue`):
> - Computes SHA-256 on-device first (`LocalDatabase.isHashUploaded`) before even touching the network.
> - Monitors OS connectivity (`connectivity_plus`) and pauses/resumes automatically when `wifiOnly` is enabled.
> - On failure, increments retry count and waits with **capped exponential backoff**: `min(60, 2^retry * 2)` seconds (`4s, 8s, 16s... 60s`), preventing battery drain and server thundering herds.
> - Strictly read-only access: never deletes original photos on the phone.

---

### Security & AppSec

**Q12. How do you protect user API keys (Gemini/Groq/OpenAI) stored on the server?**
> *Answer:* They are never saved in plaintext. `lib/encryption.ts` encrypts each key using **AES-256-GCM** with a fresh random `16`-byte IV per entry and stores `ivHex:authTagHex:ciphertextHex`. GCM provides both confidentiality and integrity verification via the authentication tag. Keys are decrypted server-side only inside `credentialResolver.ts` during an authenticated request and never echoed back to the browser.

**Q13. What security vulnerabilities did you harden across file previews and external URL fetching?**
> *Answer:*
> - **File Preview (`/api/preview/[filename]`):** Previously an unauthenticated route could leak filenames/files. Hardened it to verify `getServerUser(req)` (`401`), reject `..`/`/` path traversal (`400`), check ownership against that user's records, add `X-Content-Type-Options: nosniff`, and downgrade active content types (`.html`, `.svg`, `.xml`) to `text/plain` to prevent stored XSS.
> - **Proxy (`/api/proxy` — SSRF Defense):** Requires user auth (`401`), resolves the hostname via DNS (`dns.lookup(..., { all: true })`) before connecting and blocks loopback (`127.0.0.1`, `::1`), RFC1918 private networks (`10/8`, `172.16/12`, `192.168/16`), link-local metadata IPs (`169.254.169.254`), and CGNAT ranges (`403`), disables HTTP redirects (`redirect: 'manual'`), caps payload at 5 MB, enforces an 8s `AbortSignal` timeout, and allowlists safe media MIME types.
> - **HTTP Security Headers (`next.config.js`):** Sets `Content-Security-Policy` (`frame-ancestors 'self'; object-src 'none'`), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`, and `poweredByHeader: false`.

**Q14. How do you handle password authentication in Local Mode safely?**
> *Answer:* `lib/localAuthStore.ts` hashes passwords with Node's built-in `crypto.scryptSync(password, salt, 64)` (memory-hard KDF resistant to GPU brute forcing) with per-user random salt, checks credentials with constant-time `crypto.timingSafeEqual` to avoid timing side channels, and issues HMAC-SHA256 signed tokens (`SameSite=Lax` cookie + Bearer header) verified on every API call.

**Q15. How would you scale VectorGallery from 1,000 users to 1,000,000+ users?**
> *Answer:*
> 1. Replace `data/local_*.json` single-host files (already bypassed in Cloud Mode) strictly with managed PostgreSQL + read replicas + connection pooling (PgBouncer/Supavisor).
> 2. Move binary storage from Next.js base64 JSON payloads (`50 MB`) to **direct pre-signed S3/R2/Supabase uploads** so file bytes stream directly from mobile/browser to object storage instead of passing through API server RAM, then emit a job to a message queue (BullMQ / SQS) for workers.
> 3. Use `pgvector` HNSW indexes partitioned or pre-filtered by `user_id` (or dedicated multi-tenant vector namespaces like Qdrant/Turbopuffer) for sub-50ms ANN latency at scale.
> 4. Serve thumbnails through a CDN signed-cookie / edge-resized pipeline (`webp`/`avif`).

