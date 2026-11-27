import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerUser, getAdminSupabase, isServiceRoleConfigured } from '@/lib/supabase'
import { getLocalKeys, ENV_KEY_MAP, type AIProvider } from '@/lib/credentialResolver'
import { decrypt } from '@/lib/encryption'

const PROVIDERS_LIST: AIProvider[] = ['gemini', 'openai', 'groq', 'cohere']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getServerUser(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const providerStatus: Record<
      string,
      { configured: boolean; key_last4: string | null; source: 'personal' | 'env' | 'none' }
    > = {}

    if (!isServiceRoleConfigured()) {
      const personalKeys = getLocalKeys(user.id)

      PROVIDERS_LIST.forEach((provider) => {
        const enc = personalKeys[provider]
        if (enc) {
          let last4: string | null = '****'
          try {
            const raw = decrypt(enc)
            if (raw) last4 = raw.length >= 4 ? raw.slice(-4) : raw
          } catch {}
          providerStatus[provider] = {
            configured: true,
            key_last4: last4,
            source: 'personal',
          }
        } else if (process.env[ENV_KEY_MAP[provider]]) {
          providerStatus[provider] = {
            configured: true,
            key_last4: null,
            source: 'env',
          }
        } else {
          providerStatus[provider] = {
            configured: false,
            key_last4: null,
            source: 'none',
          }
        }
      })

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || '',
          createdAt: user.created_at,
        },
        providerKeys: providerStatus,
      })
    }

    const supabase = getAdminSupabase()

    const { data: userKeys, error } = await supabase
      .from('user_provider_keys')
      .select('provider, key_last4, updated_at')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching user keys:', error)
    }

    PROVIDERS_LIST.forEach((provider) => {
      const userKey = userKeys?.find((k: any) => k.provider === provider)
      const envKeyName = ENV_KEY_MAP[provider]
      const hasEnvKey = Boolean(process.env[envKeyName])

      if (userKey) {
        providerStatus[provider] = {
          configured: true,
          key_last4: userKey.key_last4 || null,
          source: 'personal',
        }
      } else if (hasEnvKey) {
        providerStatus[provider] = {
          configured: true,
          key_last4: null,
          source: 'env',
        }
      } else {
        providerStatus[provider] = {
          configured: false,
          key_last4: null,
          source: 'none',
        }
      }
    })

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || '',
        createdAt: user.created_at,
      },
      providerKeys: providerStatus,
    })
  } catch (err: any) {
    console.error('Error in /api/auth/user:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
