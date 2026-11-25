# VectorGallery — Security & Threat Model

## 1. Security Principles & Threat Analysis

Security is paramount in VectorGallery because users entrust the platform with sensitive personal digital memories: tax documents, bank statements, personal photos, private notes, and screenshots.

### Threat Model Matrix

| Threat | Impact | VectorGallery Mitigation |
|---|---|---|
| **Unauthorized File Access** | Critical | Strict RLS on all tables, server-side JWT verification, ephemeral signed storage URLs. |
| **Client Identity Spoofing** | High | Deprecated client `x-user-email` headers; all identity is derived from Supabase cryptographically verified JWT tokens. |
| **Malicious File Uploads** | High | Size limits (50MB), filename sanitization, MIME-type verification, and sandboxed text extraction. |
| **Data Leaks via AI Prompts** | High | Prompts only contain user-owned chunks; user files are never shared across tenant boundaries or used for public model training. |
| **Compromised Provider API Keys** | Critical | User personal keys are encrypted at rest using AES-256-GCM with environment-isolated encryption keys. |
| **Denial of Service (DoS)** | Medium | Sliding-window rate limiting on API endpoints via Upstash Redis with fail-open fallback. |

---

## 2. Authentication & Authorization

1. **Cryptographic JWT Validation:**
   Every incoming HTTP request must include an `Authorization: Bearer <token>` header or `sb-access-token` cookie. The backend verifies the token directly with `supabase.auth.getUser(token)`.
2. **Elimination of Mock Bypass:**
   The fallback to mock tokens (`guest-session-token`, `local-user-session`) is completely eliminated in production code paths.
3. **Multi-Tenancy Enforcement:**
   Every row in `files`, `folders`, `collections`, `devices`, `conversations`, and `user_provider_keys` carries a `user_id uuid REFERENCES auth.users(id)`. Queries always constrain results to `WHERE user_id = auth.uid()`.

---

## 3. Storage Security & Signed URLs

1. **Private Storage Buckets:**
   All storage buckets (`documents`, `photos`, `backups`) are strictly private.
2. **Ephemeral Signed URLs:**
   File downloads and thumbnail previews require an authenticated API call that generates a time-limited signed URL (e.g. valid for 15 minutes) or streams the authorized buffer through the backend.
3. **No Direct Public Object Access:**
   Original files cannot be accessed anonymously via static public bucket URLs.

---

## 4. Encryption Specifications

VectorGallery strictly distinguishes between encryption layers:
1. **Transport Encryption:** TLS 1.3 for all client-to-server and server-to-provider communications.
2. **Encryption at Rest:** Storage volumes and PostgreSQL disk blocks are encrypted via AES-256 by the infrastructure provider.
3. **Application-Level Key Encryption:**
   Personal AI provider API keys (Gemini, Groq, Cohere, OpenAI) stored in `user_provider_keys` are encrypted using **AES-256-GCM** with a unique 16-byte initialization vector (IV) and authentication tag per entry:
   $$\text{ciphertext} = \text{AES-GCM}_{K}(\text{IV}, \text{plaintext})$$
   Stored format: `ivHex:authTagHex:ciphertextHex`.
4. **End-to-End Encryption Clarification:**
   VectorGallery does not falsely claim zero-knowledge E2EE for standard cloud search, because server-side OCR and embeddings require server-side plaintext access. A dedicated zero-knowledge client-side encrypted vault mode is designated for future releases.

---

## 5. Input Validation & File Sanitization

1. **File Names:** Stripped of directory traversal sequences (`../`, `..\`), control characters, and dangerous null bytes (`\x00`).
2. **MIME Verification:** Extensions and MIME headers are validated against an explicit whitelist of supported formats.
3. **Text Sanitization:** Extracted text is stripped of null characters and excessive whitespace before embedding generation to prevent vector search poisoning.

---

## 6. Audit Logging

Sensitive actions (file deletions, permission updates, API key changes, account exports) trigger an asynchronous entry into the `audit_logs` table containing:
- `user_id`
- `action` (e.g., `FILE_PERMANENT_DELETE`, `KEY_UPDATE`, `BACKUP_REGISTER`)
- `resource_id`
- `ip_address`
- `timestamp`

