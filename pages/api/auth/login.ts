import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateLocalUser } from '@/lib/localAuthStore'

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

    const auth = authenticateLocalUser({ email, password })
    if (!auth) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    res.setHeader(
      'Set-Cookie',
      `sb-access-token=${auth.token}; Path=/; Max-Age=604800; SameSite=Lax`
    )

    const compatUser = {
      id: auth.user.id,
      email: auth.user.email,
      created_at: auth.user.created_at,
      user_metadata: { full_name: auth.user.name },
      app_metadata: { provider: 'local' },
      aud: 'authenticated',
    }

    return res.status(200).json({
      success: true,
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

