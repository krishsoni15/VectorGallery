import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, isServiceRoleConfigured } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const collectionId = req.query.id as string
  if (!collectionId) {
    return res.status(400).json({ error: 'Collection ID is required' })
  }

  try {
    const user = await getServerUser(req)
    if (isServiceRoleConfigured() && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    if (!isServiceRoleConfigured()) {
      return res.status(200).json({
        success: true,
        collection: { id: collectionId, name: 'Collection', type: 'custom' },
      })
    }

    const supabase = getAdminSupabase()

    // ─── GET: Fetch Single Collection ───
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .eq('user_id', userId)
        .maybeSingle()

      if (error || !data) {
        return res.status(404).json({ error: 'Collection not found' })
      }

      return res.status(200).json({ collection: data })
    }

    // ─── PUT / PATCH: Update Collection ───
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { name, description, icon, cover_image_url, filter_criteria } = req.body
      const updates: any = { updated_at: new Date().toISOString() }

      if (name && typeof name === 'string') updates.name = name.trim()
      if (description !== undefined) updates.description = description
      if (icon !== undefined) updates.icon = icon
      if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url
      if (filter_criteria !== undefined) updates.filter_criteria = filter_criteria

      const { data, error } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', collectionId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({ success: true, collection: data })
    }

    // ─── DELETE: Remove Collection ───
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', userId)

      if (error) throw error

      return res.status(200).json({ success: true, deleted: true })
    }

    res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[Collection API] Error:', err)
    return res.status(500).json({ error: err.message || 'Collection operation failed' })
  }
}

