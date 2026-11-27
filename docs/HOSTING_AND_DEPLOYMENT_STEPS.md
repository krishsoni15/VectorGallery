# VectorGallery — Hosting & Production Launch Guide (`https://vectorgallery.vercel.app`)

Exact step-by-step instructions to make your live Vercel deployment (`https://vectorgallery.vercel.app`) work end-to-end for all Web and Android users—including **every required credential, AI API key, Supabase table setup, and APK distribution details**.

---

## Quick Checklist: What You Need to Do Next for `https://vectorgallery.vercel.app`

Because Vercel runs **serverless functions** (ephemeral filesystem — no persistent `data/*.json` disk!), **all users on `https://vectorgallery.vercel.app` require Supabase Cloud + Environment Variables**. Follow these 4 steps once:

### 1. Create Your Free Supabase Project & Tables
1. Go to [supabase.com](https://supabase.com/) → **New Project** (e.g., `vectorgallery-prod`).
2. Wait ~2 minutes for the database to start, then open **SQL Editor** in the left sidebar.
3. Paste and run the unified all-in-one setup script **[supabase/SETUP_ALL_IN_ONE.sql](../supabase/SETUP_ALL_IN_ONE.sql)** once (it idempotently creates `pgvector`, all core + v2 tables, triggers, `hybrid_search` RPC, RLS policies, and the private `documents` storage bucket).
   *(Alternatively, run the incremental migration files in `supabase/migrations/` in chronological order.)*
4. Open **Storage** in Supabase → verify a private bucket named **`documents`** exists (**Public bucket = OFF**; VectorGallery generates per-user signed URLs automatically).
5. Open **Project Settings → API** and copy these 3 credentials:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon / public key**
   - **service_role / secret key** *(keep strictly server-side — never expose in client code)*

### 2. Get AI API Keys (What Each Key Powers)
Open the dashboard links below to create keys:
- **Required for Vision OCR + Embeddings + Default AI Assistant (`GEMINI_API_KEY`):**
  - Free/paid key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
  - Powers image/receipt/screenshot text extraction (OCR), dense semantic embeddings (`pgvector`), and Gemini chat responses.
- **Recommended Ultra-Fast Backup LLM (`GROQ_API_KEY`):**
  - Key from [console.groq.com/keys](https://console.groq.com/keys)
  - Fast fallback LLM chat provider when users switch model in Assistant or rate limits trigger.
- **Optional Providers (`COHERE_API_KEY`, `OPENAI_API_KEY`):**
  - [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys) / [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  - Users can also enter their **own personal keys** inside **Settings → AI Providers** in the app (encrypted at rest via `CREDENTIAL_ENCRYPTION_KEY`). If you don't add global server keys on Vercel, users still get **offline keyword search & offline grounded excerpts**, or can paste their own Gemini/Groq key!
- **Optional Production Rate Limiting (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`):**
  - Free Redis database from [console.upstash.com](https://console.upstash.com/) to prevent API abuse across Vercel serverless instances.

### 3. Generate Your Encryption Secret & Set All Vercel Environment Variables
On your terminal, run:
```bash
openssl rand -hex 32
```
Open **Vercel Dashboard → `vectorgallery` project → Settings → Environment Variables** and add these for **Production & Preview**:

| Variable Name | Value / Where to Get It | Required? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings → API → Project URL | **Yes** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase API Keys → Publishable key (`sb_publishable_...`) | **Yes** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same Publishable/`anon` key (for full compatibility) | Recommended |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase API Keys → Secret / `service_role` key *(keep server-only)* | **Yes** |
| `STORAGE_DRIVER` | `supabase` | **Yes** |
| `SUPABASE_STORAGE_BUCKET` | `documents` | **Yes** |
| `CREDENTIAL_ENCRYPTION_KEY` | Your 64-hex string from `openssl rand -hex 32` | **Yes** |
| `GEMINI_API_KEY` | From Google AI Studio (shared app Vision OCR + embeddings + AI) | **Recommended** |
| `GROQ_API_KEY` | From Groq Console (fast AI chat backup) | Recommended |
| `COHERE_API_KEY` | From Cohere Dashboard (optional embeddings/chat) | Optional |
| `OPENAI_API_KEY` | From OpenAI Platform (optional GPT chat) | Optional |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Optional |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | Optional |

### 4. Push to GitHub & Redeploy Vercel (Includes Pre-Configured Android APK!)
1. Push your local `main` commits to GitHub:
   ```bash
   git push origin main
   ```
2. Trigger **Redeploy** in Vercel after saving the Environment Variables (important: `NEXT_PUBLIC_*` vars are baked at build time!).
3. Once deployed, verify live health immediately:
   ```bash
   curl https://vectorgallery.vercel.app/api/health
   ```
   Confirm:
   - `"database": { "configured": true, "clientConfigured": true }`
   - `"storage": { "driver": "supabase", "ready": true }`
   - `"aiProviders": { "gemini": true, ... }`
4. Test `https://vectorgallery.vercel.app/vectorgallery.apk` (`200 OK`) & `/install`!
   - The compiled `public/vectorgallery.apk` ships pre-configured with **`https://vectorgallery.vercel.app`** (`mobile/lib/core/network/api_client.dart`), so **anyone on any Android phone can tap "Download APK" on your website, install it, sign up/log in, and sync straight to your live website with zero IP setup!**

---

## How to Prevent Supabase Free Tier from Auto-Pausing (Zero Cost, Automatic)

Supabase pauses free-tier projects only after **7 days with zero database traffic**. You do **NOT** need to rewrite the app for MongoDB:

- **Why keep Supabase instead of switching to MongoDB?** VectorGallery relies on PostgreSQL `pgvector` vector similarity, full-text GIN (`tsvector`) indexes, Row-Level Security (`RLS`), and built-in Auth + Storage buckets. Moving to MongoDB would require rewriting ~20 API routes, replacing Auth, and provisioning separate vector search and file storage.
- **Built-in automatic keep-alive included in this repo:**
  - `.github/workflows/supabase-keepalive.yml` runs every 3 days on GitHub Actions and calls `https://vectorgallery.vercel.app/api/health`.
  - `/api/health` executes a tiny read-only 1-row Supabase ping (`user_profiles`), resetting Supabase's inactivity timer automatically forever at \$0/month!
  - *(If your project is already paused right now: open Supabase Dashboard → click **Restore / Resume project** once, push to `main`, and the GitHub workflow keeps it awake from then on.)*

## Why "Create Account" Fails Without Supabase Env Vars (And How It's Fixed)
1. **Before Supabase keys are added on Vercel:** Vercel's serverless filesystem is read-only (`EROFS`), so local JSON signup fails unless Supabase keys are set in Vercel Project Settings. `/api/auth/signup` now detects Vercel and gives an explicit error instead of crashing silently.
2. **Email confirmation / rate limits bypassed cleanly:** Web & Mobile signup now share `/api/auth/signup` (which confirms accounts server-side via `SUPABASE_SERVICE_ROLE_KEY`), avoiding Supabase's default empty `session: null` response and the 4 emails/hour free SMTP limit.

---

## Important Note on Vercel File Upload Sizes
- Vercel Serverless Functions enforce a **4.5 MB** platform HTTP body limit per request. Photos and PDFs up to ~3 MB upload smoothly via base64 API routes; for larger videos or raw camera backups (> 3 MB per file) without hitting Vercel's 4.5 MB body cap, deploy on a persistent Node VPS/container (Option B below) or upgrade ingestion to direct pre-signed Supabase Storage URLs.

---

## Alternative — Self-Hosted VPS / Ubuntu Server (No 4.5 MB Limit, Works with Local Disk Mode)

Best if you want **50 MB direct uploads** and optional zero-Supabase local storage (`data/*.json` + `public/uploads/`):

1. Install **Node.js 22 LTS**, **nginx**, and **pm2** on Ubuntu:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs git nginx
   sudo npm install -g pm2
   ```
2. Clone, configure `.env.local` (leave Supabase empty for Local Disk Mode or fill Supabase for Cloud Mode), build, and launch:
   ```bash
   git clone https://github.com/krishsoni15/VectorGallery.git && cd VectorGallery
   npm ci && cp .env.example .env.local
   npm run build
   pm2 start npm --name "vectorgallery-web" -- start
   pm2 save
   ```
3. Configure Nginx HTTPS proxy (`client_max_body_size 55M;` for 50 MB uploads and `proxy_buffering off;` for live SSE AI chat) + `certbot --nginx -d yourdomain.com`.
4. To point the Android APK to a custom self-hosted domain:
   ```bash
   cd mobile
   flutter build apk --release --dart-define=VECTORGALLERY_API_URL=https://yourdomain.com
   cp build/app/outputs/flutter-apk/app-release.apk ../public/vectorgallery.apk
   sha256sum ../public/vectorgallery.apk
   ```
   *(Or users can update the server URL inside Android **Settings → Configure URL** anytime without rebuilding the APK.)*
