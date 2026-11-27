import type { NextApiRequest, NextApiResponse } from 'next'
import { registerLocalUser } from '@/lib/localAuthStore'

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

    const { user, token } = registerLocalUser({ email, password, name })

    res.setHeader(
      'Set-Cookie',
      `sb-access-token=${token}; Path=/; Max-Age=604800; SameSite=Lax`
    )

    const compatUser = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      user_metadata: { full_name: user.name },
      app_metadata: { provider: 'local' },
      aud: 'authenticated',
    }

    return res.status(201).json({
      success: true,
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

