import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { registerLocalUser } from '@/lib/localAuthStore'
import {
  getAdminSupabase,
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
    const { email, password, name } = req.body || {}

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = (typeof name === 'string' && name.trim()) || cleanEmail.split('@')[0]
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''

    if (isServiceRoleConfigured()) {
      const adminSupabase = getAdminSupabase()
      const { data: created, error: createErr } = await adminSupabase.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: cleanName },
      })

      if (createErr || !created?.user) {
        const msg = (createErr?.message || '').toLowerCase()
        if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
          return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' })
        }
        return res.status(400).json({ error: createErr?.message || 'Unable to create account.' })
      }

      // Initialize profile row cleanly
      await adminSupabase
        .from('user_profiles')
        .upsert(
          {
            id: created.user.id,
            full_name: cleanName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .then(() => {}, () => {})

      const anonClient = createClient(safeSupabaseUrl, safeSupabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      const token = signInData?.session?.access_token || ''
      const refreshToken = signInData?.session?.refresh_token || ''
      if (signInErr || !token) {
        return res.status(500).json({ error: signInErr?.message || 'Account created, please sign in.' })
      }

      res.setHeader(
        'Set-Cookie',
        `sb-access-token=${token}; Path=/; Max-Age=604800; SameSite=Lax${secureFlag}`
      )

      const compatUser = {
        ...created.user,
        name: cleanName,
      }

      return res.status(201).json({
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

    const { user, token } = registerLocalUser({ email: cleanEmail, password, name: cleanName })

    res.setHeader(
      'Set-Cookie',
      `sb-access-token=${token}; Path=/; Max-Age=604800; SameSite=Lax${secureFlag}`
    )

    const compatUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      user_metadata: { full_name: user.name },
      app_metadata: { provider: 'local' },
      aud: 'authenticated',
    }

    return res.status(201).json({
      success: true,
      sessionToken: token,
      user: compatUser,
      session: {
        access_token: token,
        user: compatUser,
      },
    })
  } catch (err: any) {
    const status = err?.status || 500
    return res.status(status).json({ error: err.message || 'Sign up failed' })
  }
}
