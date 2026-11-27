import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { updateLocalFile } from '@/lib/localMetadataStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    const { file_ids } = req.body

    if (!Array.isArray(file_ids) || file_ids.length === 0) {
      return res.status(400).json({ error: 'file_ids array is required' })
    }

    if (!isServiceRoleConfigured()) {
      let restored = 0
      for (const id of file_ids) {
        if (updateLocalFile(id, { is_trashed: false }, userId)) {
          restored++
        }
      }
      return res.status(200).json({ success: true, restored_count: restored })
    }

    const supabase = getAdminSupabase()

    const { data, error } = await supabase
      .from('files')
      .update({
        is_trashed: false,
        trashed_at: null,
        updated_at: new Date().toISOString(),
      })
      .in('id', file_ids)
      .eq('user_id', userId)
      .select('id')

    if (error) throw error

    return res.status(200).json({
      success: true,
      restored_count: (data || []).length,
    })
  } catch (err: any) {
    console.error('[Restore API] Error:', err)
    return res.status(500).json({ error: err.message || 'Restore failed' })
  }
}

