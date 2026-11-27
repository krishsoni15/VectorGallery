import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { authenticateLocalUser } from '@/lib/localAuthStore'
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
    const { email, password } = req.body || {}
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''

    if (isServiceRoleConfigured()) {
      const anonClient = createClient(safeSupabaseUrl, safeSupabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data, error } = await anonClient.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error || !data?.session?.access_token || !data.user) {
        return res.status(401).json({ error: error?.message || 'Invalid email or password.' })
      }

      const token = data.session.access_token
      const refreshToken = data.session.refresh_token || ''
      const displayName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        cleanEmail.split('@')[0]

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
          refresh_token: refreshToken,
          user: compatUser,
        },
      })
    }

    if (process.env.VERCEL) {
      return res.status(503).json({
        error:
          'Cloud account storage is not configured on Vercel yet. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables (or continue in Local Sandbox).',
      })
    }

    const auth = authenticateLocalUser({ email: cleanEmail, password })
    if (!auth) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    res.setHeader(
      'Set-Cookie',
      `sb-access-token=${auth.token}; Path=/; Max-Age=604800; SameSite=Lax${secureFlag}`
    )

    const compatUser = {
      id: auth.user.id,
      email: auth.user.email,
      name: auth.user.name,
      created_at: auth.user.created_at,
      user_metadata: { full_name: auth.user.name },
      app_metadata: { provider: 'local' },
      aud: 'authenticated',
    }

    return res.status(200).json({
      success: true,
      sessionToken: auth.token,
      user: compatUser,
      session: {
        access_token: auth.token,
        user: compatUser,
      },
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Sign in failed' })
  }
}
