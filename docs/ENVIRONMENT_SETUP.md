# VectorGallery — Environment Setup & Configuration Guide

This document details every environment variable required to configure VectorGallery in local development and production environments.

---

## 1. Classification of Environment Variables

VectorGallery variables are categorized into two tiers:
1. **Public Frontend Variables (`NEXT_PUBLIC_*`)**: Bundled into the client-side JavaScript for browser access.
2. **Server-Only Secrets**: Accessible only by Next.js API routes and the Node.js background worker. Never exposed to browser bundles.

---

## 2. Environment Variables Reference Table

| Variable Name | Scope | Required / Optional | Description & Default Value |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | Required for Cloud | The HTTPS URL of your Supabase project (e.g., `https://xyz.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | Required for Cloud | The public anonymous API key for client-side Supabase Auth. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Secret | Required for Cloud | The privileged admin service role key. Used by server API routes to bypass RLS for administrative indexing. |
| `STORAGE_DRIVER` | Server | Optional (`local` / `supabase`) | Storage backend. Defaults to `local` (in `public/uploads`) or `supabase` (in Supabase Storage bucket). |
| `SUPABASE_STORAGE_BUCKET` | Server | Optional (Default: `documents`) | Target bucket name in Supabase Storage. |
| `CREDENTIAL_ENCRYPTION_KEY` | Server Secret | Required for User Keys | 32-byte hex string (64 hex characters) used for AES-256-GCM encryption of personal AI keys. Generate via `openssl rand -hex 32`. |
| `GEMINI_API_KEY` | Server Secret | Recommended | Google Gemini API key for `gemini-1.5-flash` streaming chat and `text-embedding-004` vectors. |
| `GROQ_API_KEY` | Server Secret | Optional | Groq API key for low-latency LLaMA 3.3 70B assistant fallback. |
| `COHERE_API_KEY` | Server Secret | Optional | Cohere API key for `command-r-plus` and `embed-english-v3.0`. |
| `OPENAI_API_KEY` | Server Secret | Optional | OpenAI API key for `gpt-4o-mini` and `text-embedding-3-small`. |
| `UPSTASH_REDIS_REST_URL` | Server Secret | Optional | Upstash Redis URL for edge rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN`| Server Secret | Optional | Upstash Redis REST token. |
| `UPSTASH_VECTOR_REST_URL` | Server Secret | Optional | Upstash Vector index endpoint for semantic caching. |
| `UPSTASH_VECTOR_REST_TOKEN`| Server Secret| Optional | Upstash Vector token. |

---

## 3. Quickstart Local Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Generate an encryption key:
   ```bash
   openssl rand -hex 32
   ```
   Paste the output into `CREDENTIAL_ENCRYPTION_KEY` in `.env.local`.

3. Configure AI API Key:
   Obtain a free key at [Google AI Studio](https://ai.google.dev/) and set `GEMINI_API_KEY=AIzaSy...`.

4. Local Storage Default:
   If testing offline without Supabase, set:
   ```env
   STORAGE_DRIVER=local
   ```
   Files will be stored in `public/uploads/` on the local filesystem.

