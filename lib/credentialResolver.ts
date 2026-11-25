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

export function getLocalKeys(): Record<string, string> {
  try {
    if (fs.existsSync(LOCAL_KEYS_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_KEYS_FILE, 'utf-8'))
    }
  } catch {}
  return {}
}

export function saveLocalKey(provider: string, rawKey: string): void {
  try {
    const dir = path.dirname(LOCAL_KEYS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const keys = getLocalKeys()
    const p = provider.toLowerCase()
    keys[p] = encrypt(rawKey)
    fs.writeFileSync(LOCAL_KEYS_FILE, JSON.stringify(keys, null, 2))
    
    // Also inject into process.env for the running session
    const envVar = ENV_KEY_MAP[p as AIProvider]
    if (envVar) {
      process.env[envVar] = rawKey
    }
  } catch (e) {
    console.error('Failed to save local key:', e)
  }
}

export function deleteLocalKey(provider: string): void {
  try {
    const keys = getLocalKeys()
    const p = provider.toLowerCase()
    delete keys[p]
    fs.writeFileSync(LOCAL_KEYS_FILE, JSON.stringify(keys, null, 2))

    const envVar = ENV_KEY_MAP[p as AIProvider]
    if (envVar) {
      delete process.env[envVar]
    }
  } catch (e) {
    console.error('Failed to delete local key:', e)
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

  // 2. Check local encrypted file store (for local dev mode)
  const localKeys = getLocalKeys()
  const encLocalKey = localKeys[normalizedProvider]
  if (encLocalKey) {
    try {
      const decrypted = decrypt(encLocalKey)
      if (decrypted) return decrypted
    } catch (e) {
      console.warn(`[CredentialResolver] Notice: Local key for ${provider} could not be decrypted with current key`)
    }
  }

  // 3. Fallback to server environment variables
  const envVarName = ENV_KEY_MAP[normalizedProvider]
  if (envVarName && process.env[envVarName]) {
    return process.env[envVarName] || null
  }

  return null
}
