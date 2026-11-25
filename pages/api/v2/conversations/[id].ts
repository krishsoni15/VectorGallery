import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, isServiceRoleConfigured } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const conversationId = req.query.id as string
  if (!conversationId) {
    return res.status(400).json({ error: 'Conversation ID is required' })
  }

  try {
    const user = await getServerUser(req)
    if (isServiceRoleConfigured() && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    if (!isServiceRoleConfigured()) {
      return res.status(200).json({
        conversation: { id: conversationId, title: 'Memory Conversation' },
        messages: [],
      })
    }

    const supabase = getAdminSupabase()

    // Verify conversation ownership
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle()

    if (convErr || !conv) {
      return res.status(404).json({ error: 'Conversation not found or access denied' })
    }

    // ─── GET: Fetch Messages & Citations ───
    if (req.method === 'GET') {
      const { data: messages, error: msgErr } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgErr) throw msgErr

      const messageIds = (messages || []).map((m: any) => m.id)
      let citationsMap: Record<string, any[]> = {}

      if (messageIds.length > 0) {
        const { data: citations } = await supabase
          .from('citations')
          .select('*')
          .in('message_id', messageIds)

        citations?.forEach((cite: any) => {
          if (!citationsMap[cite.message_id]) citationsMap[cite.message_id] = []
          citationsMap[cite.message_id].push(cite)
        })
      }

      const enrichedMessages = (messages || []).map((m: any) => ({
        ...m,
        citations: citationsMap[m.id] || [],
      }))

      return res.status(200).json({
        conversation: conv,
        messages: enrichedMessages,
      })
    }

    // ─── PATCH: Rename Conversation ───
    if (req.method === 'PATCH') {
      const { title } = req.body
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required' })
      }

      const { data: updated, error: updateErr } = await supabase
        .from('conversations')
        .update({
          title: title.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateErr) throw updateErr

      return res.status(200).json({ success: true, conversation: updated })
    }

    // ─── DELETE: Remove Conversation ───
    if (req.method === 'DELETE') {
      const { error: delErr } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', userId)

      if (delErr) throw delErr

      return res.status(200).json({ success: true, deleted: true })
    }

    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[Conversation Detail API] Error:', err)
    return res.status(500).json({ error: err.message || 'Conversation operation failed' })
  }
}

