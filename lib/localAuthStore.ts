import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export interface BackupSettings {
  auto_backup: boolean
  wifi_only: boolean
  categories: string[]
}

export interface LocalUserRecord {
  id: string
  email: string
  name: string
  passwordHash: string
  salt: string
  storage_quota_bytes: number
  backup_settings: BackupSettings
  theme: 'light' | 'dark'
  created_at: string
  updated_at: string
}

export type PublicLocalUser = Omit<LocalUserRecord, 'passwordHash' | 'salt'>

interface LocalUsersStoreData {
  users: LocalUserRecord[]
  guestProfile: {
    backup_settings: BackupSettings
    theme: 'light' | 'dark'
    updated_at: string
  }
}

export const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000'
const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'local_users.json')
const TOKEN_PREFIX = 'vg_local_'
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  auto_backup: true,
  wifi_only: true,
  categories: ['photos', 'documents', 'screenshots'],
}

function getSigningSecret(): Buffer {
  const secret =
    process.env.CREDENTIAL_ENCRYPTION_KEY &&
    process.env.CREDENTIAL_ENCRYPTION_KEY !== 'your_credential_encryption_key'
      ? process.env.CREDENTIAL_ENCRYPTION_KEY
      : process.env.SUPABASE_SERVICE_ROLE_KEY &&
          process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key'
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : 'vectorgallery-local-session-secret-v2'
  return crypto.createHash('sha256').update(`session:${secret}`).digest()
}

function readStore(): LocalUsersStoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(USERS_FILE)) {
    const initial: LocalUsersStoreData = {
      users: [],
      guestProfile: {
        backup_settings: { ...DEFAULT_BACKUP_SETTINGS },
        theme: 'dark',
        updated_at: new Date().toISOString(),
      },
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(initial, null, 2))
    return initial
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
    return {
      users: Array.isArray(parsed?.users) ? parsed.users : [],
      guestProfile: parsed?.guestProfile || {
        backup_settings: { ...DEFAULT_BACKUP_SETTINGS },
        theme: 'dark',
        updated_at: new Date().toISOString(),
      },
    }
  } catch {
    return {
      users: [],
      guestProfile: {
        backup_settings: { ...DEFAULT_BACKUP_SETTINGS },
        theme: 'dark',
        updated_at: new Date().toISOString(),
      },
    }
  }
}

function writeStore(data: LocalUsersStoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2))
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashPassword(password, salt), 'hex')
  const stored = Buffer.from(storedHash, 'hex')
  if (candidate.length !== stored.length) return false
  return crypto.timingSafeEqual(candidate, stored)
}

export function sanitizePublicUser(record: LocalUserRecord): PublicLocalUser {
  const { passwordHash: _p, salt: _s, ...rest } = record
  return rest
}

/** Issues an HMAC-SHA256 signed stateless session token for local mode. */
export function issueLocalSessionToken(user: Pick<LocalUserRecord, 'id' | 'email' | 'name'>): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Date.now(),
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString('base64url')

  const sig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('base64url')
  return `${TOKEN_PREFIX}${payload}.${sig}`
}

export function isLocalTokenFormat(token?: string | null): boolean {
  return Boolean(token && token.startsWith(TOKEN_PREFIX))
}

/** Verifies an HMAC-SHA256 local session token and confirms the user exists on disk. */
export function verifyLocalSessionToken(token?: string | null): PublicLocalUser | null {
  if (!token || !token.startsWith(TOKEN_PREFIX)) return null

  const raw = token.slice(TOKEN_PREFIX.length)
  const dotIdx = raw.indexOf('.')
  if (dotIdx <= 0) return null

  const payload = raw.slice(0, dotIdx)
  const sig = raw.slice(dotIdx + 1)
  if (!payload || !sig) return null

  const expectedSig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expectedSig)
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!decoded?.sub || !decoded?.exp || Date.now() > Number(decoded.exp)) {
      return null
    }
    const store = readStore()
    const user = store.users.find((u) => u.id === decoded.sub)
    return user ? sanitizePublicUser(user) : null
  } catch {
    return null
  }
}

export function registerLocalUser(input: {
  email: string
  password: string
  name?: string
}): { user: PublicLocalUser; token: string } {
  const email = input.email.trim().toLowerCase()
  const name = (input.name || '').trim() || email.split('@')[0]
  const store = readStore()

  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    const err: any = new Error('An account with this email already exists.')
    err.status = 409
    throw err
  }

  const now = new Date().toISOString()
  const salt = crypto.randomBytes(16).toString('hex')
  const record: LocalUserRecord = {
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash: hashPassword(input.password, salt),
    salt,
    storage_quota_bytes: 16106127360,
    backup_settings: { ...DEFAULT_BACKUP_SETTINGS },
    theme: 'dark',
    created_at: now,
    updated_at: now,
  }

  store.users.push(record)
  writeStore(store)

  return {
    user: sanitizePublicUser(record),
    token: issueLocalSessionToken(record),
  }
}

export function authenticateLocalUser(input: {
  email: string
  password: string
}): { user: PublicLocalUser; token: string } | null {
  const email = input.email.trim().toLowerCase()
  const store = readStore()
  const found = store.users.find((u) => u.email.toLowerCase() === email)
  if (!found) return null
  if (!verifyPassword(input.password, found.salt, found.passwordHash)) {
    return null
  }
  return {
    user: sanitizePublicUser(found),
    token: issueLocalSessionToken(found),
  }
}

export function getLocalUserById(userId: string): PublicLocalUser | null {
  if (!userId || userId === GUEST_USER_ID) return null
  const store = readStore()
  const found = store.users.find((u) => u.id === userId)
  return found ? sanitizePublicUser(found) : null
}

export function getGuestProfile() {
  const store = readStore()
  return {
    id: GUEST_USER_ID,
    full_name: 'Personal Vault (Sandbox)',
    email: 'sandbox@vectorgallery.local',
    storage_quota_bytes: 16106127360,
    backup_settings: store.guestProfile.backup_settings || { ...DEFAULT_BACKUP_SETTINGS },
    theme: store.guestProfile.theme || 'dark',
    is_guest: true,
  }
}

export function updateLocalUserProfile(
  userId: string,
  updates: {
    full_name?: string
    backup_settings?: BackupSettings
    theme?: 'light' | 'dark'
  }
) {
  const store = readStore()
  const now = new Date().toISOString()

  if (!userId || userId === GUEST_USER_ID) {
    if (updates.backup_settings && typeof updates.backup_settings === 'object') {
      store.guestProfile.backup_settings = updates.backup_settings
    }
    if (updates.theme === 'light' || updates.theme === 'dark') {
      store.guestProfile.theme = updates.theme
    }
    store.guestProfile.updated_at = now
    writeStore(store)
    return {
      profile: getGuestProfile(),
      refreshedToken: null as string | null,
    }
  }

  const idx = store.users.findIndex((u) => u.id === userId)
  if (idx === -1) return null

  const existing = store.users[idx]
  if (typeof updates.full_name === 'string' && updates.full_name.trim()) {
    existing.name = updates.full_name.trim()
  }
  if (updates.backup_settings && typeof updates.backup_settings === 'object') {
    existing.backup_settings = updates.backup_settings
  }
  if (updates.theme === 'light' || updates.theme === 'dark') {
    existing.theme = updates.theme
  }
  existing.updated_at = now
  store.users[idx] = existing
  writeStore(store)

  return {
    profile: {
      id: existing.id,
      full_name: existing.name,
      email: existing.email,
      storage_quota_bytes: existing.storage_quota_bytes,
      backup_settings: existing.backup_settings,
      theme: existing.theme,
      created_at: existing.created_at,
      is_guest: false,
    },
    refreshedToken: issueLocalSessionToken(existing),
  }
}

export function deleteLocalUserAccount(userId: string): boolean {
  if (!userId || userId === GUEST_USER_ID) return false
  const store = readStore()
  const before = store.users.length
  store.users = store.users.filter((u) => u.id !== userId)
  if (store.users.length === before) return false
  writeStore(store)
  return true
}

