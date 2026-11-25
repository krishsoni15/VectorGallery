import fs from 'fs'
import path from 'path'

export interface LocalFileRecord {
  id: string
  user_id: string
  folder_id: string | null
  original_name: string
  sanitized_name: string
  mime_type: string
  category: string
  size_bytes: number
  storage_key: string
  storage_provider: string
  sha256_hash: string
  thumbnail_url: string
  extracted_text: string
  processing_status: string
  indexing_status: string
  is_favorite: boolean
  is_trashed: boolean
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'local_files.json')

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2))
  }
}

export function getLocalFiles(): LocalFileRecord[] {
  ensureStorage()
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw) as LocalFileRecord[]
  } catch {
    return []
  }
}

export function saveLocalFile(record: LocalFileRecord): void {
  ensureStorage()
  const files = getLocalFiles()
  const existingIdx = files.findIndex(f => f.id === record.id || f.sha256_hash === record.sha256_hash)
  if (existingIdx >= 0) {
    files[existingIdx] = { ...files[existingIdx], ...record, updated_at: new Date().toISOString() }
  } else {
    files.unshift(record)
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(files, null, 2))
}

export function findLocalFileByHash(hash: string): LocalFileRecord | undefined {
  return getLocalFiles().find(f => f.sha256_hash === hash && !f.is_trashed)
}

export function findLocalFileById(id: string): LocalFileRecord | undefined {
  return getLocalFiles().find(f => f.id === id)
}

export function updateLocalFile(id: string, updates: Partial<LocalFileRecord>): LocalFileRecord | null {
  ensureStorage()
  const files = getLocalFiles()
  const idx = files.findIndex(f => f.id === id)
  if (idx === -1) return null
  files[idx] = { ...files[idx], ...updates, updated_at: new Date().toISOString() }
  fs.writeFileSync(DB_FILE, JSON.stringify(files, null, 2))
  return files[idx]
}

export function deleteLocalFile(id: string, permanent: boolean = false): boolean {
  ensureStorage()
  const files = getLocalFiles()
  if (permanent) {
    const filtered = files.filter(f => f.id !== id)
    fs.writeFileSync(DB_FILE, JSON.stringify(filtered, null, 2))
    return true
  } else {
    const idx = files.findIndex(f => f.id === id)
    if (idx === -1) return false
    files[idx].is_trashed = true
    files[idx].updated_at = new Date().toISOString()
    fs.writeFileSync(DB_FILE, JSON.stringify(files, null, 2))
    return true
  }
}

