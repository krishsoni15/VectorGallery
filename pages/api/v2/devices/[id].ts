import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { deleteLocalDevice } from '@/lib/localAppStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const deviceId = req.query.id as string
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID is required' })
  }

  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    if (!isServiceRoleConfigured()) {
      if (req.method === 'DELETE') {
        const revoked = deleteLocalDevice(deviceId, userId)
        if (!revoked) return res.status(404).json({ error: 'Device not found' })
        return res.status(200).json({ success: true, revoked: true })
      }
      res.setHeader('Allow', ['DELETE'])
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }

    const supabase = getAdminSupabase()

    // ─── DELETE: Revoke Connected Device ───
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', userId)

      if (error) throw error

      return res.status(200).json({ success: true, revoked: true })
    }

    res.setHeader('Allow', ['DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[Device Revocation API] Error:', err)
    return res.status(500).json({ error: err.message || 'Device operation failed' })
  }
}

