import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import {
  isServiceRoleConfigured,
  safeSupabaseAnonKey,
  safeSupabaseUrl,
} from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { refreshToken } = req.body || {}
    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({ error: 'refreshToken is required' })
    }

    if (!isServiceRoleConfigured()) {
      return res.status(400).json({ error: 'Refresh tokens are only used in Cloud Supabase mode' })
    }

    const anonClient = createClient(safeSupabaseUrl, safeSupabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error } = await anonClient.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data?.session?.access_token || !data.user) {
      return res.status(401).json({ error: error?.message || 'Session refresh failed. Please sign in again.' })
    }

    const token = data.session.access_token
    const nextRefresh = data.session.refresh_token || refreshToken
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    const displayName =
      data.user.user_metadata?.full_name ||
      data.user.user_metadata?.name ||
      data.user.email?.split('@')[0] ||
      'User'

    res.setHeader(
      'Set-Cookie',
      `sb-access-token=${token}; Path=/; Max-Age=604800; SameSite=Lax${secureFlag}`
    )

    const compatUser = {
      ...data.user,
      name: displayName,
    }

    return res.status(200).json({
      success: true,
      sessionToken: token,
      user: compatUser,
      session: {
        access_token: token,
        refresh_token: nextRefresh,
        user: compatUser,
      },
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Session refresh failed' })
  }
}

