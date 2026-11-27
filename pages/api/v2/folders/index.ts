import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    if (!isServiceRoleConfigured()) {
      return res.status(200).json({ folders: [] })
    }

    const supabase = getAdminSupabase()

    // ─── GET: List folders ───
    if (req.method === 'GET') {
      const { parent_id } = req.query
      let query = supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (parent_id) {
        query = parent_id === 'root' ? query.is('parent_id', null) : query.eq('parent_id', parent_id)
      }

      const { data, error } = await query
      if (error) {
        console.warn('[Folders API] Select notice:', error.message)
        return res.status(200).json({ folders: [] })
      }

      return res.status(200).json({ folders: data || [] })
    }

    // ─── POST: Create folder ───
    if (req.method === 'POST') {
      const { name, parent_id, color, icon } = req.body
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Folder name is required' })
      }

      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: userId,
          name: name.trim(),
          parent_id: parent_id || null,
          color: color || '#1D9E75',
          icon: icon || 'folder',
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json({ success: true, folder: data })
    }

    // ─── PUT: Rename or update folder ───
    if (req.method === 'PUT') {
      const { id, name, color, icon, is_favorite } = req.body
      if (!id) return res.status(400).json({ error: 'Folder ID is required' })

      const updates: any = { updated_at: new Date().toISOString() }
      if (name) updates.name = name.trim()
      if (color) updates.color = color
      if (icon) updates.icon = icon
      if (typeof is_favorite === 'boolean') updates.is_favorite = is_favorite

      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return res.status(200).json({ success: true, folder: data })
    }

    // ─── DELETE: Remove folder ───
    if (req.method === 'DELETE') {
      const id = req.query.id as string || req.body?.id
      if (!id) return res.status(400).json({ error: 'Folder ID is required' })

      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
      return res.status(200).json({ success: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[Folders API] Error:', err)
    return res.status(500).json({ error: err.message || 'Folder operation failed' })
  }
}

