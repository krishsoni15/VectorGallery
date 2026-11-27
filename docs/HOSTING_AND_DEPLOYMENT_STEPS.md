# VectorGallery — Hosting & Deployment Step-by-Step Guide

This guide walks through **exact, practical steps** to host VectorGallery online for real users—using either **Cloud Mode (Vercel + Supabase)**, **Self-Hosted Mode (VPS / Docker / Home Server with persistent local disk)**, and how to connect the **Android Companion App (.apk)** to your live server.

---

## Important Rule Before Choosing a Host

VectorGallery supports two storage/database modes automatically:

| Mode | Triggered When | Best Hosts | Why |
| :--- | :--- | :--- | :--- |
| **Cloud Mode** (`Supabase + pgvector`) | `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set (`STORAGE_DRIVER=supabase`) | **Vercel**, Netlify, Cloud Run, Fly.io | Stateless serverless hosts wipe local disks between deployments/restarts; Supabase persists DB, auth, and private files permanently. |
| **Local Mode** (`Local JSON + Local FS`) | Supabase keys are omitted (`STORAGE_DRIVER=local`) | **Ubuntu VPS (DigitalOcean / Hetzner / AWS EC2)**, Render/Railway **with a Persistent Volume**, Local LAN PC | Stores data in `data/*.json` and files in `public/uploads/`. Needs a real persistent filesystem (do **not** use Local Mode on Vercel). |

---

## Option A — Recommended Cloud Deployment (Vercel + Supabase Free Tier Friendly)

### Step 1: Set Up Supabase Project & Database
1. Go to [app.supabase.com](https://app.supabase.com/) and create a new project.
2. Open **SQL Editor** in the Supabase dashboard and run the migration files from `supabase/migrations/` in exact chronological order:
   1. `supabase/migrations/20230406025118_init.sql`
   2. `supabase/migrations/20260521092518_hybrid_search.sql`
   3. `supabase/migrations/20260521160800_ultra_upgrade.sql`
   4. `supabase/migrations/20260908_auth_and_keys.sql`
   5. `supabase/migrations/20261117_vectormind_v2_core.sql`
   6. `supabase/migrations/20261117_vectormind_v2_extensions.sql`
3. Open **Storage** in Supabase → Create a **Private** bucket named `documents` (keep **Public bucket = OFF** so files remain isolated per user via signed URLs and `/api/preview/[filename]`).
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Generate Security Secrets
Run locally to generate a 32-byte (64-hex-character) AES-256-GCM encryption key:
```bash
openssl rand -hex 32
```
Save this value for `CREDENTIAL_ENCRYPTION_KEY`. *(Never commit `.env.local` to GitHub.)*

### Step 3: Deploy Web & API to Vercel
1. Push your repository to GitHub (make sure `public/Generated Video November 27, 2026 - 2_43PM.mp4` is included if you deploy from Git, or host/replace the hero video asset).
2. In [vercel.com](https://vercel.com/), click **Add New → Project** and import your GitHub repo.
3. Under **Build & Development Settings**, keep defaults (`Next.js`, build command `npm run build`).
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
   - `STORAGE_DRIVER` = `supabase`
   - `SUPABASE_STORAGE_BUCKET` = `documents`
   - `CREDENTIAL_ENCRYPTION_KEY` = your 64-hex string from Step 2
   - *(Optional AI keys — app still works without them using local OCR & keyword recall)*:
     - `GEMINI_API_KEY` (for Vision OCR + Gemini chat + `embedding` vectors)
     - `GROQ_API_KEY` / `COHERE_API_KEY` / `OPENAI_API_KEY`
   - *(Optional Redis rate limiting)*: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
5. Click **Deploy**.
6. Verify your live site immediately:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
   Confirm `"database": { "configured": true }`, `"storage": { "driver": "supabase", "ready": true }`.

---

## Option B — Self-Hosted VPS / Ubuntu Server (Works with Local Mode or Cloud Mode)

Best if you want **100% zero external database dependency** on a VPS (e.g., \$5/month Ubuntu server with PM2 + Nginx SSL) or home network.

### Step 1: Server Prerequisites
Install **Node.js 22 LTS**, **npm**, **git**, **nginx**, and **pm2**:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2
```

### Step 2: Clone, Configure, Build & Run
```bash
git clone https://github.com/krishsoni15/VectorGallery.git
cd VectorGallery
npm ci

cp .env.example .env.local
nano .env.local
```
In `.env.local` for **Local Zero-Database Mode**, keep Supabase keys empty and set:
```env
STORAGE_DRIVER=local
CREDENTIAL_ENCRYPTION_KEY=<paste output of: openssl rand -hex 32>
# Optional AI keys (or add them per-user inside Web Settings -> AI Providers)
GEMINI_API_KEY=
GROQ_API_KEY=
```
Build and launch with PM2:
```bash
npm run build
pm2 start npm --name "vectorgallery-web" -- start
pm2 save
```
*(Optional background ingestion worker if using Supabase async queue:)*
```bash
pm2 start npm --name "vectorgallery-worker" -- run worker
```

### Step 3: Domain + HTTPS via Nginx & Certbot
Create `/etc/nginx/sites-available/vectorgallery`:
```nginx
server {
    server_name vault.yourdomain.com;
    client_max_body_size 55M; # matches 50 MB API upload limit + JSON overhead

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off; # important for SSE AI streaming (/api/v2/chat)
    }
}
```
Enable site & free Let's Encrypt SSL:
```bash
sudo ln -s /etc/nginx/sites-available/vectorgallery /etc/nginx/sites-enabled/
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d vault.yourdomain.com
```
> **Crucial Nginx detail:** Keep `client_max_body_size 55M` (otherwise Nginx rejects large uploads with `413` before Next.js sees them) and `proxy_buffering off` (so SSE AI chat tokens stream live word-by-word instead of waiting for stream end).

### Step 4: Backups (Local Mode Only)
Back up these two directories regularly:
- `data/` (`local_users.json`, `local_files.json`, `local_vectors.json`, `local_collections.json`, `local_conversations.json`, `local_search_history.json`, `local_devices.json`, `user_keys.json`)
- `public/uploads/` (raw user photos, PDFs, notes, and videos)

---

## Option C — Connect & Distribute the Android App (`.apk`)

The Flutter app (`mobile/`) defaults to `http://10.0.2.2:3000` (Android Emulator localhost). For a hosted website you have **two ways**:

### Fast Method (No Rebuild Needed)
1. Download and install `/vectorgallery.apk` from your site or `/install`.
2. Open the **Profile / Settings** tab in the Android app.
3. Update the **Server URL** field to `https://vault.yourdomain.com` (stored securely via `FlutterSecureStorage` under `vm_api_base_url` in `mobile/lib/core/network/api_client.dart`).

### Production Custom-Baked APK Method
1. Build a release APK pointing directly to your hosted URL:
   ```bash
   cd mobile
   flutter pub get
   flutter build apk --release --dart-define=VECTORGALLERY_API_URL=https://vault.yourdomain.com
   ```
2. Copy the APK into `public/` and compute its SHA-256:
   ```bash
   cp build/app/outputs/flutter-apk/app-release.apk ../public/vectorgallery.apk
   sha256sum ../public/vectorgallery.apk
   ```
3. Paste the new SHA-256 hash into `APK_EXPECTED_SHA256` inside `components/landing/tokens.ts` and rebuild/deploy the web app so `/install` displays the matching checksum.

---

## Post-Deploy Verification Checklist
1. `GET /api/health` returns `200 OK` and `storage.ready: true`.
2. `POST /api/auth/signup` + login works and isolates two test accounts cleanly.
3. `GET /api/preview/<file>` returns `401` when logged out and `200` when signed in as the file owner.
4. `GET /api/proxy?url=http://127.0.0.1:3000/` returns `403` (SSRF protection active).
5. Upload a text note or photo, search for a keyword inside it, and verify AI Assistant cites it cleanly.

