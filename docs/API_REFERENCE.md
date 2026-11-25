# VectorGallery — API Reference & Inventory

All endpoints under `pages/api/v2/` use JSON request and response payloads unless otherwise specified (e.g., SSE streaming for AI chat).

---

## 1. System Health
### `GET /api/health`
- **Auth:** Public
- **Response:**
  ```json
  {
    "status": "ok",
    "version": "2.0.0",
    "timestamp": "2026-11-17T10:30:00.000Z",
    "uptimeSeconds": 120,
    "database": { "configured": true, "clientConfigured": true },
    "storage": { "driver": "local", "ready": true },
    "aiProviders": { "gemini": true, "groq": false, "cohere": false, "openai": false }
  }
  ```

---

## 2. Authentication & User Profile
### `GET /api/v2/auth/profile`
- **Auth:** Required (`Bearer <token>` or `sb-access-token` cookie)
- **Response:**
  ```json
  {
    "profile": {
      "id": "uuid",
      "full_name": "Krish Soni",
      "email": "krish@vectorgallery.app",
      "storage_quota_bytes": 16106127360,
      "backup_settings": {
        "auto_backup": true,
        "wifi_only": true,
        "categories": ["photos", "documents", "screenshots"]
      },
      "theme": "dark"
    }
  }
  ```

### `PUT /api/v2/auth/profile`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "full_name": "Krish Soni",
    "backup_settings": { "auto_backup": true, "wifi_only": true, "categories": ["photos"] },
    "theme": "dark"
  }
  ```

### `GET /api/auth/provider-keys`
- **Auth:** Required
- **Response:** List of configured AI keys with `key_last4` (encrypted keys are never returned).

### `POST /api/auth/provider-keys`
- **Auth:** Required
- **Request Body:** `{ "provider": "gemini", "apiKey": "AIzaSy..." }`

---

## 3. Files Management
### `GET /api/v2/files`
- **Auth:** Required
- **Query Parameters:**
  - `category`: `photos` | `videos` | `documents` | `audio` | `screenshots` | `all`
  - `folder_id`: Folder UUID or `root`
  - `is_favorite`: `true` | `false`
  - `is_trashed`: `true` | `false`
  - `search`: Keyword string
  - `limit`: Default 50 (max 100)
  - `cursor`: Pagination timestamp

### `POST /api/v2/files/upload`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "filename": "admission_letter.pdf",
    "base64": "<base64_encoded_payload>",
    "mimeType": "application/pdf",
    "folderId": "optional-uuid"
  }
  ```
- **Response:** `{ "success": true, "file": { "fileId": "uuid", "isDuplicate": false, ... } }`

### `GET /api/v2/files/[id]`
- **Auth:** Required
- **Response:** Returns file metadata and freshly generated 1-hour signed download URL.

### `PATCH /api/v2/files/[id]`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "original_name": "Renamed_File.pdf",
    "folder_id": "new-folder-uuid",
    "is_favorite": true,
    "is_trashed": false
  }
  ```

### `DELETE /api/v2/files/[id]`
- **Auth:** Required
- **Query Parameters:** `permanent=true` for purge from disk/cloud storage; default is soft delete to Trash.

### `POST /api/v2/files/restore`
- **Auth:** Required
- **Request Body:** `{ "file_ids": ["uuid-1", "uuid-2"] }`

### `POST /api/v2/files/bulk`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "action": "trash" | "restore" | "favorite" | "unfavorite" | "delete" | "move",
    "file_ids": ["uuid-1", "uuid-2"],
    "folder_id": "optional-target-folder-uuid"
  }
  ```

### `POST /api/v2/files/[id]/copy`
- **Auth:** Required
- **Response:** Clones metadata and reuses deduplicated storage reference.

---

## 4. Folders
### `GET /api/v2/folders`
- **Query Parameters:** `parent_id` (UUID or `root`)
### `POST /api/v2/folders`
- **Request Body:** `{ "name": "Work", "parent_id": null, "color": "#1D9E75", "icon": "folder" }`
### `PUT /api/v2/folders`
- **Request Body:** `{ "id": "uuid", "name": "Work 2026", "is_favorite": true }`
### `DELETE /api/v2/folders`
- **Query Parameters:** `id=uuid`

---

## 5. Collections
### `GET /api/v2/collections`
- Lists smart collections (Screenshots, Important, Bills, Large Files) and custom user albums.
### `POST /api/v2/collections`
- **Request Body:** `{ "name": "Tax Receipts", "description": "2026 Tax Return", "type": "custom" }`
### `GET /api/v2/collections/[id]/files`
- Lists files inside the collection.
### `POST /api/v2/collections/[id]/files`
- **Request Body:** `{ "file_ids": ["uuid-1", "uuid-2"] }`
### `DELETE /api/v2/collections/[id]/files`
- **Request Body:** `{ "file_id": "uuid" }`

---

## 6. AI Search & Conversations
### `GET /api/v2/search`
- **Query Parameters:**
  - `q`: Search query string
  - `category`: Optional category filter
  - `from_date`, `to_date`: Optional ISO date bounds
  - `limit`: Default 20 (max 50)
- **Response:** List of matching items with `snippet`, `match_type` (`ocr_text`, `document_text`, `filename`, `semantic_vector`), and `relevance_score`.

### `GET /api/v2/search/history` & `POST /api/v2/search/history`
- Manages user's recent search queries.

### `GET /api/v2/conversations` & `POST /api/v2/conversations`
- Lists and creates persistent chat inquiries.

### `GET /api/v2/conversations/[id]` & `DELETE /api/v2/conversations/[id]`
- Retrieves message thread and source citations; deletes conversation.

### `POST /api/v2/chat`
- **Protocol:** Server-Sent Events (`text/event-stream`)
- **Request Body:**
  ```json
  {
    "query": "What was I researching about Docker?",
    "conversationId": "optional-uuid",
    "provider": "gemini"
  }
  ```
- **Stream Events:**
  - `data: {"type": "token", "content": "..."}`
  - `data: {"type": "citations", "citations": [{"file_id": "...", "file_name": "...", "excerpt": "..."}]}`
  - `data: {"type": "done"}`

---

## 7. Devices & Mobile Backup
### `GET /api/v2/devices` & `POST /api/v2/devices`
- Registers or lists connected mobile and desktop devices.
### `DELETE /api/v2/devices/[id]`
- Revokes device connection.
### `POST /api/v2/backup/sync`
- Receives candidate SHA-256 hashes from mobile app and returns `required_uploads` (omitting already synced files).
### `GET /api/v2/backup/jobs` & `POST /api/v2/backup/jobs` & `PATCH /api/v2/backup/jobs`
- Tracks upload queue progress, backoff retry states, and failures.

