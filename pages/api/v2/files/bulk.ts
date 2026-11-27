import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { getStorageDriver } from '@/lib/storage'
import { updateLocalFile, deleteLocalFile, findLocalFileById } from '@/lib/localMetadataStore'
import { removeLocalVectorChunks } from '@/lib/localVectorStore'

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

    const { action, file_ids, folder_id } = req.body

    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'action is required (trash, restore, favorite, unfavorite, delete, move)' })
    }

    if (!Array.isArray(file_ids) || file_ids.length === 0) {
      return res.status(400).json({ error: 'file_ids array must contain at least one ID' })
    }

    if (!isServiceRoleConfigured()) {
      const storage = getStorageDriver()
      let affected = 0
      const purgedIds: string[] = []
      for (const id of file_ids) {
        if (action === 'trash') {
          if (updateLocalFile(id, { is_trashed: true }, userId)) affected++
        } else if (action === 'restore') {
          if (updateLocalFile(id, { is_trashed: false }, userId)) affected++
        } else if (action === 'favorite') {
          if (updateLocalFile(id, { is_favorite: true }, userId)) affected++
        } else if (action === 'unfavorite') {
          if (updateLocalFile(id, { is_favorite: false }, userId)) affected++
        } else if (action === 'move') {
          if (updateLocalFile(id, { folder_id: folder_id || null }, userId)) affected++
        } else if (action === 'delete') {
          const target = findLocalFileById(id, userId)
          if (target) {
            await storage.delete(target.storage_key).catch(() => {})
            if (deleteLocalFile(id, true, userId)) {
              purgedIds.push(id)
              affected++
            }
          }
        }
      }
      if (purgedIds.length > 0) {
        removeLocalVectorChunks(purgedIds, userId)
      }
      return res.status(200).json({
        success: true,
        action,
        affected_count: affected,
      })
    }

    const supabase = getAdminSupabase()
    const storage = getStorageDriver()

    switch (action) {
      case 'trash': {
        const { data, error } = await supabase
          .from('files')
          .update({
            is_trashed: true,
            trashed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .in('id', file_ids)
          .eq('user_id', userId)
          .select('id')

        if (error) throw error
        return res.status(200).json({ success: true, action: 'trash', affected_count: data?.length || 0 })
      }

      case 'restore': {
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
        return res.status(200).json({ success: true, action: 'restore', affected_count: data?.length || 0 })
      }

      case 'favorite': {
        const { data, error } = await supabase
          .from('files')
          .update({
            is_favorite: true,
            updated_at: new Date().toISOString(),
          })
          .in('id', file_ids)
          .eq('user_id', userId)
          .select('id')

        if (error) throw error
        return res.status(200).json({ success: true, action: 'favorite', affected_count: data?.length || 0 })
      }

      case 'unfavorite': {
        const { data, error } = await supabase
          .from('files')
          .update({
            is_favorite: false,
            updated_at: new Date().toISOString(),
          })
          .in('id', file_ids)
          .eq('user_id', userId)
          .select('id')

        if (error) throw error
        return res.status(200).json({ success: true, action: 'unfavorite', affected_count: data?.length || 0 })
      }

      case 'move': {
        const targetFolder = folder_id === 'root' || !folder_id ? null : folder_id
        const { data, error } = await supabase
          .from('files')
          .update({
            folder_id: targetFolder,
            updated_at: new Date().toISOString(),
          })
          .in('id', file_ids)
          .eq('user_id', userId)
          .select('id')

        if (error) throw error
        return res.status(200).json({ success: true, action: 'move', affected_count: data?.length || 0 })
      }

      case 'delete': {
        // 1. Fetch file storage keys for safe physical deletion
        const { data: filesToDelete, error: fetchErr } = await supabase
          .from('files')
          .select('id, storage_key')
          .in('id', file_ids)
          .eq('user_id', userId)

        if (fetchErr) throw fetchErr

        if (filesToDelete && filesToDelete.length > 0) {
          const keys = filesToDelete.map((f: any) => f.storage_key).filter(Boolean)
          await storage.delete(keys)

          const ids = filesToDelete.map((f: any) => f.id)
          const { error: delErr } = await supabase
            .from('files')
            .delete()
            .in('id', ids)
            .eq('user_id', userId)

          if (delErr) throw delErr
          return res.status(200).json({ success: true, action: 'delete', affected_count: ids.length })
        }

        return res.status(200).json({ success: true, action: 'delete', affected_count: 0 })
      }

      default:
        return res.status(400).json({ error: `Unsupported bulk action: ${action}` })
    }
  } catch (err: any) {
    console.error('[Bulk Files API] Error:', err)
    return res.status(500).json({ error: err.message || 'Bulk operation failed' })
  }
}

