import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerUser, getAdminSupabase, isServiceRoleConfigured } from '@/lib/supabase'
import { encrypt, decrypt } from '@/lib/encryption'
import { AIProvider, getLocalKeys, saveLocalKey, deleteLocalKey, ENV_KEY_MAP } from '@/lib/credentialResolver'

const VALID_PROVIDERS: AIProvider[] = ['gemini', 'openai', 'groq', 'cohere']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getServerUser(req)
  if (isServiceRoleConfigured() && !user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // 1. GET: Fetch list of personal configured keys metadata
  if (req.method === 'GET') {
    if (!isServiceRoleConfigured()) {
      const localKeys = getLocalKeys()
      const list = Object.entries(localKeys).map(([provider, encKey]) => {
        const raw = decrypt(encKey) || ''
        const key_last4 = raw.length >= 4 ? raw.slice(-4) : '****'
        return {
          provider,
          key_last4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })

      // Also check env vars
      for (const p of VALID_PROVIDERS) {
        if (!list.find(item => item.provider === p) && process.env[ENV_KEY_MAP[p]]) {
          const raw = process.env[ENV_KEY_MAP[p]]!
          list.push({
            provider: p,
            key_last4: raw.slice(-4),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      }

      return res.status(200).json({ keys: list })
    }

    try {
      const supabase = getAdminSupabase()
      const { data, error } = await supabase
        .from('user_provider_keys')
        .select('provider, key_last4, created_at, updated_at')
        .eq('user_id', user!.id)

      if (error) {
        throw error
      }

      return res.status(200).json({ keys: data || [] })
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch provider keys' })
    }
  }

  // 2. POST: Save or update personal API key
  if (req.method === 'POST') {
    try {
      const { provider, apiKey } = req.body

      if (!provider || !VALID_PROVIDERS.includes(provider as AIProvider)) {
        return res.status(400).json({ error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}` })
      }

      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        return res.status(400).json({ error: 'API key string is required' })
      }

      const trimmedKey = apiKey.trim()
      const key_last4 = trimmedKey.length >= 4 ? trimmedKey.slice(-4) : trimmedKey

      if (!isServiceRoleConfigured()) {
        saveLocalKey(provider, trimmedKey)
        return res.status(200).json({
          success: true,
          message: `${provider.toUpperCase()} API key saved securely.`,
          key: { provider, key_last4 },
        })
      }

      const encrypted_api_key = encrypt(trimmedKey)
      const supabase = getAdminSupabase()
      const { data, error } = await supabase
        .from('user_provider_keys')
        .upsert(
          {
            user_id: user!.id,
            provider: provider.toLowerCase(),
            encrypted_api_key,
            key_last4,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,provider' }
        )
        .select('provider, key_last4, updated_at')
        .single()

      if (error) {
        throw error
      }

      return res.status(200).json({
        success: true,
        message: `${provider.toUpperCase()} API key saved securely.`,
        key: data,
      })
    } catch (err: any) {
      console.error('Error saving provider key:', err)
      return res.status(500).json({ error: err.message || 'Failed to save provider key' })
    }
  }

  // 3. DELETE: Remove personal API key
  if (req.method === 'DELETE') {
    try {
      const { provider } = req.body || req.query

      if (!provider || !VALID_PROVIDERS.includes(provider as AIProvider)) {
        return res.status(400).json({ error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}` })
      }

      if (!isServiceRoleConfigured()) {
        deleteLocalKey(provider)
        return res.status(200).json({ success: true, message: `${provider} key deleted.` })
      }

      const supabase = getAdminSupabase()
      const { error } = await supabase
        .from('user_provider_keys')
        .delete()
        .eq('user_id', user!.id)
        .eq('provider', (provider as string).toLowerCase())

      if (error) {
        throw error
      }

      return res.status(200).json({ success: true, message: `${provider} key deleted.` })
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete provider key' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
