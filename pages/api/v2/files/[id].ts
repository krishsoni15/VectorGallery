import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { getStorageDriver } from '@/lib/storage'
import { findLocalFileById, updateLocalFile, deleteLocalFile } from '@/lib/localMetadataStore'
import { removeLocalVectorChunks } from '@/lib/localVectorStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fileId = req.query.id as string

  if (!fileId) {
    return res.status(400).json({ error: 'File ID is required' })
  }

  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    if (!isServiceRoleConfigured()) {
      const storage = getStorageDriver()
      const localFile = findLocalFileById(fileId, userId)
      if (!localFile) {
        return res.status(404).json({ error: 'File not found or access denied' })
      }
      if (req.method === 'GET') {
        const downloadUrl = storage.getPublicUrl(localFile.storage_key)
        return res.status(200).json({
          file: {
            ...localFile,
            download_url: downloadUrl,
          },
        })
      }
      if (req.method === 'PATCH') {
        const { original_name, folder_id, is_favorite, is_trashed } = req.body || {}
        const updates: any = {}
        if (typeof original_name === 'string' && original_name.trim().length > 0) {
          updates.original_name = original_name.trim()
          updates.sanitized_name = original_name.trim().replace(/[^a-zA-Z0-9.-]/g, '_')
        }
        if (folder_id !== undefined) updates.folder_id = folder_id || null
        if (typeof is_favorite === 'boolean') updates.is_favorite = is_favorite
        if (typeof is_trashed === 'boolean') updates.is_trashed = is_trashed
        const updated = updateLocalFile(fileId, updates, userId)
        return res.status(200).json({ success: true, file: updated })
      }
      if (req.method === 'DELETE') {
        const permanent = req.query.permanent === 'true'
        if (permanent) {
          await storage.delete(localFile.storage_key)
          removeLocalVectorChunks([fileId], userId)
        }
        deleteLocalFile(fileId, permanent, userId)
        return res.status(200).json({ success: true, deleted: fileId, permanent })
      }
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const supabase = getAdminSupabase()
    const storage = getStorageDriver()

    // 1. Verify file exists and belongs to the authenticated user
    const { data: file, error: fetchErr } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchErr || !file) {
      return res.status(404).json({ error: 'File not found or access denied' })
    }

    // ─── GET: Retrieve file metadata & signed URL ───
    if (req.method === 'GET') {
      const signedUrl = await storage.getSignedUrl(file.storage_key, 3600)
      return res.status(200).json({
        file: {
          ...file,
          download_url: signedUrl,
        },
      })
    }

    // ─── PATCH: Rename, Move, Favorite, Restore ───
    if (req.method === 'PATCH') {
      const { original_name, folder_id, is_favorite, is_trashed } = req.body
      const updates: any = { updated_at: new Date().toISOString() }

      if (typeof original_name === 'string' && original_name.trim().length > 0) {
        updates.original_name = original_name.trim()
        updates.sanitized_name = original_name.trim().replace(/[^a-zA-Z0-9.-]/g, '_')
      }

      if (folder_id !== undefined) {
        updates.folder_id = folder_id || null
      }

      if (typeof is_favorite === 'boolean') {
        updates.is_favorite = is_favorite
      }

      if (typeof is_trashed === 'boolean') {
        updates.is_trashed = is_trashed
        updates.trashed_at = is_trashed ? new Date().toISOString() : null
      }

      const { data: updated, error: updateErr } = await supabase
        .from('files')
        .update(updates)
        .eq('id', fileId)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateErr) throw updateErr

      return res.status(200).json({ success: true, file: updated })
    }

    // ─── DELETE: Soft delete (Trash) or Permanent Purge ───
    if (req.method === 'DELETE') {
      const permanent = req.query.permanent === 'true'

      if (permanent) {
        // 1. Remove from binary storage
        await storage.delete(file.storage_key)

        // 2. Delete database record (cascades chunks)
        const { error: delErr } = await supabase
          .from('files')
          .delete()
          .eq('id', fileId)
          .eq('user_id', userId)

        if (delErr) throw delErr

        return res.status(200).json({ success: true, permanent: true })
      } else {
        // Soft delete: Move to Trash
        const { data: trashed, error: trashErr } = await supabase
          .from('files')
          .update({
            is_trashed: true,
            trashed_at: new Date().toISOString(),
          })
          .eq('id', fileId)
          .eq('user_id', userId)
          .select()
          .single()

        if (trashErr) throw trashErr

        return res.status(200).json({ success: true, trashed: true, file: trashed })
      }
    }

    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[File ID API] Error:', err)
    return res.status(500).json({ error: err.message || 'Operation failed' })
  }
}

