# VectorGallery — Production Deployment Architecture & Guide

VectorGallery is designed for deployment across modern cloud platforms (Vercel, Docker, Fly.io, Supabase Cloud).

---

## 1. Production Architecture Overview

```
[Flutter Mobile App] ───┐
                        ▼
                [HTTPS / Reverse Proxy]
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
[Next.js Web / API Server]       [Node.js Background Worker]
       │                                 │
       ├────────────────┬────────────────┤
       ▼                ▼                ▼
[Supabase PostgreSQL] [Supabase Storage] [AI Providers]
 (pgvector & RLS)      (Object Bucket)   (Gemini/Groq/Cohere)
```

---

## 2. Web & API Deployment (Vercel / Container)

### A. Vercel Deployment:
1. Connect your GitHub repository to Vercel.
2. In Project Settings $\to$ **Environment Variables**, configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STORAGE_DRIVER=supabase`
   - `CREDENTIAL_ENCRYPTION_KEY`
   - `GEMINI_API_KEY`
3. Deploy! Next.js will build and deploy edge API routes and static assets.

### B. Container Deployment (Docker):
Build and run the production container:
```bash
docker build -t vectorgallery:2.0 .
docker run -p 3000:3000 --env-file .env.production vectorgallery:2.0
```

---

## 3. Storage Hardening Checklist

1. **Bucket Privacy:** Ensure the target bucket (`documents`) is set to **Private** in Supabase Storage.
2. **Signed URLs:** All client downloads must use signed URLs generated via `storage.getSignedUrl(key, 3600)`. Never make files publicly accessible via unauthenticated URLs.
3. **MIME & Extension Whitelisting:** Enforce rejection of `.exe`, `.dll`, `.so`, `.sh`, `.bat`, and `.php` files (already implemented in `pages/api/v2/files/upload.ts`).
4. **File Size Bounds:** Maximum individual upload size is enforced at 50 MB per file.

---

## 4. Operational Monitoring & Health Checks

- The endpoint `GET /api/health` provides real-time service status, database connectivity, and driver status.
- Configure ping monitors (e.g., Datadog, UptimeRobot, BetterUptime) to check `https://your-domain.com/api/health` every 60 seconds.

