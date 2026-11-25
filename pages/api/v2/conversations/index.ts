import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, isServiceRoleConfigured } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getServerUser(req)
    if (isServiceRoleConfigured() && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    if (!isServiceRoleConfigured()) {
      return res.status(200).json({ conversations: [] })
    }

    const supabase = getAdminSupabase()

    // ─── GET: List Conversations ───
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.warn('[Conversations API] Select notice:', error.message)
        return res.status(200).json({ conversations: [] })
      }

      return res.status(200).json({ conversations: data || [] })
    }

    // ─── POST: Create New Conversation ───
    if (req.method === 'POST') {
      const { title, provider } = req.body
      const convTitle = (title && typeof title === 'string' && title.trim().length > 0)
        ? title.trim()
        : 'New Memory Inquiry'

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: convTitle,
          provider: provider || 'gemini',
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({ success: true, conversation: data })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[Conversations API] Error:', err)
    return res.status(500).json({ error: err.message || 'Conversations operation failed' })
  }
}

