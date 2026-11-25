# VectorGallery — API Design & Contract Specification

## 1. Architecture Overview

VectorGallery provides a clean, unified REST and SSE (Server-Sent Events) API. The exact same API endpoints power both the **Next.js Web Application** and the **Flutter Mobile Application**.

### Standards:
- **Authentication:** All requests must include a valid Supabase JWT Bearer token: `Authorization: Bearer <jwt>`.
- **Response Format:** JSON (`application/json`) with standard envelope:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```
- **Streaming Responses:** Server-Sent Events (`text/event-stream` or `application/x-ndjson`).
- **Pagination:** Cursor-based pagination (`limit`, `cursor`, `has_more`).

---

## 2. Authentication & Authorization

All endpoints extract and verify the user server-side via Supabase Auth:
```ts
const { data: { user }, error } = await supabase.auth.getUser(token)
```
Requests lacking valid authentication receive `HTTP 401 Unauthorized`. Client-supplied user ID headers (`x-user-email`) are never trusted for authorization.

---

## 3. Core API Endpoints

### 3.1 File Management (`/api/v2/files`)

#### `GET /api/v2/files`
List files with filtering, sorting, and cursor pagination.
- **Query Parameters:**
  - `category` (optional): `'photos' | 'videos' | 'documents' | 'audio' | 'screenshots' | 'all'`
  - `folder_id` (optional): UUID of folder or `'root'`
  - `is_favorite` (optional): boolean
  - `is_trashed` (optional): boolean (default `false`)
  - `search` (optional): text search term
  - `limit` (optional): default 50, max 200
  - `cursor` (optional): ISO timestamp or ID cursor
- **Response:**
  ```json
  {
    "files": [
      {
        "id": "c1f7b028-...",
        "original_name": "aws-ec2-pricing.png",
        "mime_type": "image/png",
        "category": "screenshots",
        "size_bytes": 482910,
        "sha256_hash": "e3b0c44...",
        "thumbnail_url": "/api/v2/files/c1f7b028-.../thumbnail",
        "processing_status": "READY",
        "indexing_status": "INDEXED",
        "is_favorite": true,
        "is_trashed": false,
        "created_at": "2026-11-17T10:00:00Z"
      }
    ],
    "next_cursor": "2026-11-16T18:22:10Z",
    "has_more": true
  }
  ```

#### `POST /api/v2/files/upload`
Upload a new file with deduplication check.
- **Request Body:** `multipart/form-data` or JSON with base64 payload.
  - `file`: binary file
  - `folder_id` (optional): target folder UUID
  - `sha256_hash` (optional): client-computed hash for immediate deduplication check
- **Behavior:**
  1. Computes SHA-256 hash.
  2. Queries existing active file by hash and `user_id`.
  3. If duplicate exists, returns existing file record with `duplicate: true` (no re-upload).
  4. Stores file via Storage Adapter (Supabase Storage / R2 / Local).
  5. Queues background extraction job (`PENDING` → `EXTRACTING` → `INDEXING`).

#### `PATCH /api/v2/files/[id]`
Update file metadata (rename, move to folder, favorite, restore).
- **Body:** `{ "original_name": "new_name.pdf", "folder_id": "...", "is_favorite": true }`

#### `DELETE /api/v2/files/[id]`
Soft-delete (move to trash) or permanently delete.
- **Query:** `?permanent=true` for purge from storage and database. Default moves to trash (`is_trashed = true, trashed_at = now()`).

#### `POST /api/v2/files/restore`
Restore one or multiple files from Trash.
- **Body:** `{ "file_ids": ["uuid1", "uuid2"] }`

---

### 3.2 Mobile Backup Synchronization (`/api/v2/backup`)

#### `POST /api/v2/backup/sync`
Coordinates incremental mobile sync.
- **Request:**
  ```json
  {
    "device_id": "device-uuid",
    "candidates": [
      {
        "local_path": "/storage/emulated/0/DCIM/Camera/IMG_20261117.jpg",
        "sha256_hash": "a1b2c3d4...",
        "file_size": 2048590,
        "modified_at": "2026-11-17T08:30:00Z"
      }
    ]
  }
  ```
- **Response:**
  Returns which files are already backed up vs. which files must be uploaded:
  ```json
  {
    "existing_hashes": ["a1b2c3d4..."],
    "required_uploads": [
      {
        "sha256_hash": "f9e8d7c6...",
        "upload_url": "/api/v2/files/upload"
      }
    ]
  }
  ```

---

### 3.3 Hybrid AI Search (`/api/v2/search`)

Unified retrieval across file names, full-text document content, OCR image text, and pgvector embeddings.
- **Query Parameters:**
  - `q`: search query string
  - `type`: `'hybrid' | 'semantic' | 'keyword'` (default `'hybrid'`)
  - `category`: optional filter
  - `from_date` / `to_date`: date filters
  - `limit`: default 20
- **Response:**
  ```json
  {
    "results": [
      {
        "file_id": "uuid",
        "file_name": "aws-ec2-pricing.png",
        "category": "screenshots",
        "snippet": "...m6i.large $0.096 per Hour on-demand pricing...",
        "match_type": "ocr_text",
        "relevance_score": 0.89,
        "created_at": "2026-11-10T12:00:00Z"
      }
    ]
  }
  ```

---

### 3.4 AI Assistant Streaming Chat (`/api/v2/chat`)

Interactive chat grounded in personal documents with real source citations.
- **Protocol:** Server-Sent Events (`text/event-stream`).
- **Events Emitted:**
  - `data: {"type": "token", "content": "Based on "}`
  - `data: {"type": "citation", "citation": {"file_id": "...", "file_name": "aws.png", "page": 1, "excerpt": "..."}}`
  - `data: {"type": "confidence", "level": "HIGH", "grounding_score": 94}`
  - `data: {"type": "done"}`

---

### 3.5 Storage & Dashboard Metrics (`/api/v2/dashboard/stats`)

Calculates actual persisted storage statistics per user.
- **Response:**
  ```json
  {
    "storage": {
      "total_bytes_used": 1420584910,
      "total_bytes_quota": 16106127360,
      "formatted_used": "1.32 GB",
      "formatted_quota": "15.00 GB",
      "percent_used": 8.8
    },
    "counts": {
      "total_files": 314,
      "photos": 182,
      "videos": 12,
      "documents": 65,
      "audio": 8,
      "screenshots": 47
    },
    "backup_health": {
      "connected_devices": 2,
      "last_sync_at": "2026-11-17T09:15:00Z",
      "pending_uploads": 0,
      "failed_uploads": 0,
      "status": "HEALTHY"
    },
    "recent_files": [ ... ],
    "recent_searches": [ ... ]
  }
  ```

---

### 3.6 Backward-Compatible Legacy Endpoints

The existing endpoints are maintained and routed through the new architecture:
- `/api/upload` — Maps to ingestion pipeline.
- `/api/chat` — Preserves existing chat parameters while supporting the new schema.
- `/api/documents` — Preserves document listing and deletion.
- `/api/workspaces` — Preserves workspace CRUD with authenticated user ownership.
- `/api/vector-search` — Preserves vector similarity search.

