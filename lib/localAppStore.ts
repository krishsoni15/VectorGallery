import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const COLLECTIONS_FILE = path.join(DATA_DIR, 'local_collections.json')
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'local_conversations.json')
const SEARCH_HISTORY_FILE = path.join(DATA_DIR, 'local_search_history.json')
const DEVICES_FILE = path.join(DATA_DIR, 'local_devices.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readJson<T>(filePath: string, fallback: T): T {
  ensureDir()
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2))
    return fallback
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(filePath: string, value: T): void {
  ensureDir()
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2))
}

// ─── Collections Store ──────────────────────────────────────────────────────────

export interface LocalCollectionRecord {
  id: string
  user_id: string
  name: string
  description: string
  icon: string
  type: 'custom'
  is_smart: false
  file_ids: string[]
  created_at: string
  updated_at: string
}

export function listLocalCollections(userId: string): LocalCollectionRecord[] {
  const all = readJson<LocalCollectionRecord[]>(COLLECTIONS_FILE, [])
  return all.filter((c) => c.user_id === userId)
}

export function findLocalCollection(collectionId: string, userId: string): LocalCollectionRecord | null {
  return listLocalCollections(userId).find((c) => c.id === collectionId) || null
}

export function createLocalCollection(input: {
  userId: string
  name: string
  description?: string
  icon?: string
}): LocalCollectionRecord {
  const all = readJson<LocalCollectionRecord[]>(COLLECTIONS_FILE, [])
  const now = new Date().toISOString()
  const record: LocalCollectionRecord = {
    id: crypto.randomUUID(),
    user_id: input.userId,
    name: input.name.trim(),
    description: (input.description || '').trim(),
    icon: input.icon || 'folder-heart',
    type: 'custom',
    is_smart: false,
    file_ids: [],
    created_at: now,
    updated_at: now,
  }
  all.unshift(record)
  writeJson(COLLECTIONS_FILE, all)
  return record
}

export function updateLocalCollection(
  collectionId: string,
  userId: string,
  updates: Partial<Pick<LocalCollectionRecord, 'name' | 'description' | 'icon'>>
): LocalCollectionRecord | null {
  const all = readJson<LocalCollectionRecord[]>(COLLECTIONS_FILE, [])
  const idx = all.findIndex((c) => c.id === collectionId && c.user_id === userId)
  if (idx === -1) return null
  all[idx] = {
    ...all[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  }
  writeJson(COLLECTIONS_FILE, all)
  return all[idx]
}

export function deleteLocalCollection(collectionId: string, userId: string): boolean {
  const all = readJson<LocalCollectionRecord[]>(COLLECTIONS_FILE, [])
  const next = all.filter((c) => !(c.id === collectionId && c.user_id === userId))
  if (next.length === all.length) return false
  writeJson(COLLECTIONS_FILE, next)
  return true
}

export function addFilesToLocalCollection(collectionId: string, userId: string, fileIds: string[]): LocalCollectionRecord | null {
  const all = readJson<LocalCollectionRecord[]>(COLLECTIONS_FILE, [])
  const idx = all.findIndex((c) => c.id === collectionId && c.user_id === userId)
  if (idx === -1) return null
  const merged = Array.from(new Set([...(all[idx].file_ids || []), ...fileIds]))
  all[idx] = { ...all[idx], file_ids: merged, updated_at: new Date().toISOString() }
  writeJson(COLLECTIONS_FILE, all)
  return all[idx]
}

export function removeFileFromLocalCollection(collectionId: string, userId: string, fileId: string): boolean {
  const all = readJson<LocalCollectionRecord[]>(COLLECTIONS_FILE, [])
  const idx = all.findIndex((c) => c.id === collectionId && c.user_id === userId)
  if (idx === -1) return false
  all[idx] = {
    ...all[idx],
    file_ids: (all[idx].file_ids || []).filter((id) => id !== fileId),
    updated_at: new Date().toISOString(),
  }
  writeJson(COLLECTIONS_FILE, all)
  return true
}

// ─── Conversations & Messages Store ─────────────────────────────────────────────

export interface LocalCitationRecord {
  id: number
  file_id: string
  file_name: string
  page?: number
  excerpt: string
  category?: string
  thumbnail_url?: string
}

export interface LocalMessageRecord {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  citations?: LocalCitationRecord[]
  confidence_level?: 'HIGH' | 'MEDIUM' | 'LOW'
  created_at: string
}

export interface LocalConversationRecord {
  id: string
  user_id: string
  title: string
  provider: string
  created_at: string
  updated_at: string
  messages: LocalMessageRecord[]
}

export function listLocalConversations(userId: string) {
  const all = readJson<LocalConversationRecord[]>(CONVERSATIONS_FILE, [])
  return all
    .filter((c) => c.user_id === userId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map(({ messages: _m, ...summary }) => summary)
}

export function getLocalConversation(conversationId: string, userId: string): LocalConversationRecord | null {
  const all = readJson<LocalConversationRecord[]>(CONVERSATIONS_FILE, [])
  return all.find((c) => c.id === conversationId && c.user_id === userId) || null
}

export function createLocalConversation(userId: string, title: string, provider = 'gemini') {
  const all = readJson<LocalConversationRecord[]>(CONVERSATIONS_FILE, [])
  const now = new Date().toISOString()
  const record: LocalConversationRecord = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: title.trim() || 'New Memory Inquiry',
    provider,
    created_at: now,
    updated_at: now,
    messages: [],
  }
  all.unshift(record)
  writeJson(CONVERSATIONS_FILE, all)
  const { messages: _m, ...summary } = record
  return summary
}

export function appendLocalConversationMessage(
  conversationId: string,
  userId: string,
  message: Omit<LocalMessageRecord, 'id' | 'conversation_id' | 'created_at'>
): LocalMessageRecord | null {
  const all = readJson<LocalConversationRecord[]>(CONVERSATIONS_FILE, [])
  const idx = all.findIndex((c) => c.id === conversationId && c.user_id === userId)
  if (idx === -1) return null

  const now = new Date().toISOString()
  const entry: LocalMessageRecord = {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    created_at: now,
    ...message,
  }
  all[idx].messages.push(entry)
  all[idx].updated_at = now
  writeJson(CONVERSATIONS_FILE, all)
  return entry
}

export function renameLocalConversation(conversationId: string, userId: string, title: string) {
  const all = readJson<LocalConversationRecord[]>(CONVERSATIONS_FILE, [])
  const idx = all.findIndex((c) => c.id === collectionIdOrConv(conversationId) && c.user_id === userId)
  if (idx === -1) return null
  all[idx].title = title.trim()
  all[idx].updated_at = new Date().toISOString()
  writeJson(CONVERSATIONS_FILE, all)
  const { messages: _m, ...summary } = all[idx]
  return summary
}

function collectionIdOrConv(id: string) {
  return id
}

export function deleteLocalConversation(conversationId: string, userId: string): boolean {
  const all = readJson<LocalConversationRecord[]>(CONVERSATIONS_FILE, [])
  const next = all.filter((c) => !(c.id === conversationId && c.user_id === userId))
  if (next.length === all.length) return false
  writeJson(CONVERSATIONS_FILE, next)
  return true
}

// ─── Search History Store ───────────────────────────────────────────────────────

export interface LocalSearchHistoryEntry {
  id: string
  user_id: string
  query: string
  result_count: number
  filters: Record<string, any>
  created_at: string
}

export function listLocalSearchHistory(userId: string): LocalSearchHistoryEntry[] {
  const all = readJson<LocalSearchHistoryEntry[]>(SEARCH_HISTORY_FILE, [])
  const userEntries = all
    .filter((h) => h.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const seen = new Set<string>()
  return userEntries
    .filter((item) => {
      const k = item.query.trim().toLowerCase()
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, 8)
}

export function recordLocalSearchHistory(input: {
  userId: string
  query: string
  resultCount?: number
  filters?: Record<string, any>
}): LocalSearchHistoryEntry {
  const all = readJson<LocalSearchHistoryEntry[]>(SEARCH_HISTORY_FILE, [])
  const entry: LocalSearchHistoryEntry = {
    id: crypto.randomUUID(),
    user_id: input.userId,
    query: input.query.trim(),
    result_count: input.resultCount ?? 0,
    filters: input.filters || {},
    created_at: new Date().toISOString(),
  }
  all.unshift(entry)
  writeJson(SEARCH_HISTORY_FILE, all.slice(0, 500))
  return entry
}

export function clearLocalSearchHistory(userId: string, id?: string): void {
  const all = readJson<LocalSearchHistoryEntry[]>(SEARCH_HISTORY_FILE, [])
  const next = id
    ? all.filter((h) => !(h.user_id === userId && h.id === id))
    : all.filter((h) => h.user_id !== userId)
  writeJson(SEARCH_HISTORY_FILE, next)
}

// ─── Devices & Purge Helpers ────────────────────────────────────────────────────

export interface LocalDeviceRecord {
  id: string
  user_id: string
  device_name: string
  platform: string
  device_identifier: string
  app_version: string
  last_sync_at: string
  sync_status: string
  settings: Record<string, any>
  updated_at: string
}

export function listLocalDevices(userId: string): LocalDeviceRecord[] {
  const all = readJson<LocalDeviceRecord[]>(DEVICES_FILE, [])
  return all.filter((d) => d.user_id === userId)
}

export function upsertLocalDevice(input: {
  userId: string
  device_name: string
  platform: string
  device_identifier: string
  app_version?: string
  settings?: Record<string, any>
}): LocalDeviceRecord {
  const all = readJson<LocalDeviceRecord[]>(DEVICES_FILE, [])
  const now = new Date().toISOString()
  const idx = all.findIndex(
    (d) => d.user_id === input.userId && d.device_identifier === input.device_identifier
  )
  const record: LocalDeviceRecord = {
    id: idx >= 0 ? all[idx].id : crypto.randomUUID(),
    user_id: input.userId,
    device_name: input.device_name,
    platform: input.platform,
    device_identifier: input.device_identifier,
    app_version: input.app_version || '2.0.0',
    last_sync_at: now,
    sync_status: 'IDLE',
    settings: input.settings || {
      wifi_only: true,
      auto_backup: true,
      categories: ['photos', 'documents', 'screenshots'],
    },
    updated_at: now,
  }
  if (idx >= 0) all[idx] = record
  else all.unshift(record)
  writeJson(DEVICES_FILE, all)
  return record
}

export function deleteLocalDevice(deviceId: string, userId: string): boolean {
  const all = readJson<LocalDeviceRecord[]>(DEVICES_FILE, [])
  const next = all.filter((d) => !(d.id === deviceId && d.user_id === userId))
  if (next.length === all.length) return false
  writeJson(DEVICES_FILE, next)
  return true
}

export function purgeUserAppData(userId: string): void {
  const cols = readJson<LocalCollectionRecord[]>(COLLECTIONS_FILE, [])
  writeJson(COLLECTIONS_FILE, cols.filter((c) => c.user_id !== userId))

  const convs = readJson<LocalConversationRecord[]>(CONVERSATIONS_FILE, [])
  writeJson(CONVERSATIONS_FILE, convs.filter((c) => c.user_id !== userId))

  const hist = readJson<LocalSearchHistoryEntry[]>(SEARCH_HISTORY_FILE, [])
  writeJson(SEARCH_HISTORY_FILE, hist.filter((h) => h.user_id !== userId))

  const devs = readJson<LocalDeviceRecord[]>(DEVICES_FILE, [])
  writeJson(DEVICES_FILE, devs.filter((d) => d.user_id !== userId))
}

