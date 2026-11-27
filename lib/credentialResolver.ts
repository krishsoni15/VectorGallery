import fs from 'fs'
import path from 'path'
import { getAdminSupabase, isServiceRoleConfigured } from './supabase'
import { encrypt, decrypt } from './encryption'

export type AIProvider = 'gemini' | 'openai' | 'groq' | 'cohere'

export const ENV_KEY_MAP: Record<AIProvider, string> = {
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
  groq: 'GROQ_API_KEY',
  cohere: 'COHERE_API_KEY',
}

const LOCAL_KEYS_FILE = path.join(process.cwd(), 'data', 'user_keys.json')
const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000'

interface RawLocalKeyStore {
  byUser?: Record<string, Record<string, string>>
  [providerOrKey: string]: any
}

function readRawLocalKeyStore(): RawLocalKeyStore {
  try {
    if (fs.existsSync(LOCAL_KEYS_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_KEYS_FILE, 'utf-8')) || {}
    }
  } catch {}
  return {}
}

function writeRawLocalKeyStore(store: RawLocalKeyStore): void {
  const dir = path.dirname(LOCAL_KEYS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(LOCAL_KEYS_FILE, JSON.stringify(store, null, 2))
}

/**
 * Reads local encrypted provider keys.
 * When `userId` is omitted or guest, returns top-level sandbox keys; for registered users,
 * returns keys strictly isolated under `byUser[userId]`.
 */
export function getLocalKeys(userId?: string | null): Record<string, string> {
  const raw = readRawLocalKeyStore()
  if (userId && userId !== GUEST_USER_ID) {
    return raw.byUser?.[userId] || {}
  }
  const topLevel: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (k !== 'byUser' && typeof v === 'string') {
      topLevel[k] = v
    }
  }
  return topLevel
}

export function saveLocalKey(provider: string, rawKey: string, userId?: string | null): void {
  try {
    const store = readRawLocalKeyStore()
    const p = provider.toLowerCase()
    const encrypted = encrypt(rawKey)

    if (userId && userId !== GUEST_USER_ID) {
      if (!store.byUser) store.byUser = {}
      if (!store.byUser[userId]) store.byUser[userId] = {}
      store.byUser[userId][p] = encrypted
    } else {
      store[p] = encrypted
    }
    writeRawLocalKeyStore(store)
  } catch (e) {
    console.error('Failed to save local key:', e)
  }
}

export function deleteLocalKey(provider: string, userId?: string | null): void {
  try {
    const store = readRawLocalKeyStore()
    const p = provider.toLowerCase()

    if (userId && userId !== GUEST_USER_ID) {
      if (store.byUser?.[userId]) {
        delete store.byUser[userId][p]
      }
    } else {
      delete store[p]
    }
    writeRawLocalKeyStore(store)
  } catch (e) {
    console.error('Failed to delete local key:', e)
  }
}

export function purgeUserLocalKeys(userId: string): void {
  if (!userId || userId === GUEST_USER_ID) return
  try {
    const store = readRawLocalKeyStore()
    if (store.byUser && store.byUser[userId]) {
      delete store.byUser[userId]
      writeRawLocalKeyStore(store)
    }
  } catch (e) {
    console.error('Failed to purge user local keys:', e)
  }
}

interface ResolveCredentialOptions {
  userId?: string | null
  provider: AIProvider
}

/**
 * Resolves the API key for a provider.
 * Checks user's stored encrypted API key first, then falls back to server env vars.
 */
export async function getProviderCredential({
  userId,
  provider,
}: ResolveCredentialOptions): Promise<string | null> {
  const normalizedProvider = provider.toLowerCase() as AIProvider

  // 1. If Supabase is configured and userId exists, check database
  if (userId && isServiceRoleConfigured()) {
    try {
      const supabase = getAdminSupabase()
      const { data, error } = await supabase
        .from('user_provider_keys')
        .select('encrypted_api_key')
        .eq('user_id', userId)
        .eq('provider', normalizedProvider)
        .single()

      if (!error && data?.encrypted_api_key) {
        const decryptedKey = decrypt(data.encrypted_api_key)
        if (decryptedKey) {
          return decryptedKey
        }
      }
    } catch (err) {
      console.error(`Error fetching user API key for provider ${provider}:`, err)
    }
  }

  // 2. Check user-scoped (or sandbox) local encrypted file store
  const localKeys = getLocalKeys(userId)
  const encLocalKey = localKeys[normalizedProvider]
  if (encLocalKey) {
    try {
      const decrypted = decrypt(encLocalKey)
      if (decrypted) return decrypted
    } catch {
      console.warn(`[CredentialResolver] Notice: Local key for ${provider} could not be decrypted with current key`)
    }
  }

  // 3. Fallback to server environment variables
  const envVarName = ENV_KEY_MAP[normalizedProvider]
  if (envVarName && process.env[envVarName]) {
    return process.env[envVarName] || null
  }
  if (normalizedProvider === 'openai' && process.env.OPENAI_KEY) {
    return process.env.OPENAI_KEY
  }

  return null
}
