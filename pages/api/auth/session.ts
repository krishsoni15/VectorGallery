import type { NextApiRequest, NextApiResponse } from 'next'
import { extractAuthToken, getServerUser } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await getServerUser(req)
  const token = extractAuthToken(req)

  if (!user) {
    return res.status(200).json({ user: null, session: null })
  }

  return res.status(200).json({
    user,
    session: {
      access_token: token || '',
      user,
    },
  })
}

