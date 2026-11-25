import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, isServiceRoleConfigured } from '@/lib/supabase'
import { getLocalFiles } from '@/lib/localMetadataStore'

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
      const localFiles = getLocalFiles().filter(f => !f.is_trashed)
      if (collectionId === 'smart-diwali') {
        const matches = localFiles.filter(f =>
          /diwali|new year|varshabhinandan|greeting/i.test(f.original_name + ' ' + (f.extracted_text || ''))
        )
        return res.status(200).json({ files: matches })
      }
      if (collectionId === 'smart-screenshots') {
        return res.status(200).json({ files: localFiles.filter(f => f.category === 'screenshots') })
      }
      if (collectionId === 'smart-important') {
        return res.status(200).json({ files: localFiles.filter(f => f.is_favorite) })
      }
      if (collectionId === 'smart-bills') {
        return res.status(200).json({
          files: localFiles.filter(f => /receipt|bill|invoice|pricing|tax/i.test(f.original_name + ' ' + (f.extracted_text || '')))
        })
      }
      if (collectionId === 'smart-large-files') {
        return res.status(200).json({ files: localFiles.filter(f => f.size_bytes >= 20971520) })
      }
      return res.status(200).json({ files: localFiles })
    }

    const supabase = getAdminSupabase()

    // Verify collection belongs to user or is smart collection
    let collection: any = null
    const isSmartVirtual = collectionId.startsWith('smart-')

    if (!isSmartVirtual) {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .eq('user_id', userId)
        .maybeSingle()

      if (error || !data) {
        return res.status(404).json({ error: 'Collection not found' })
      }
      collection = data
    } else {
      collection = { id: collectionId, is_smart: true }
    }

    // ─── GET: List Files in Collection ───
    if (req.method === 'GET') {
      if (collection.is_smart) {
        // Smart Collection query evaluation
        let fileQuery = supabase
          .from('files')
          .select('*')
          .eq('user_id', userId)
          .eq('is_trashed', false)

        if (collectionId === 'smart-diwali') {
          fileQuery = fileQuery.or('original_name.ilike.%diwali%,original_name.ilike.%new%year%,extracted_text.ilike.%diwali%,extracted_text.ilike.%varshabhinandan%')
        } else if (collectionId === 'smart-screenshots') {
          fileQuery = fileQuery.eq('category', 'screenshots')
        } else if (collectionId === 'smart-important') {
          fileQuery = fileQuery.eq('is_favorite', true)
        } else if (collectionId === 'smart-large-files') {
          fileQuery = fileQuery.gte('size_bytes', 20971520) // > 20 MB
        } else if (collectionId === 'smart-bills') {
          fileQuery = fileQuery.or('original_name.ilike.%receipt%,original_name.ilike.%bill%,original_name.ilike.%invoice%,extracted_text.ilike.%pricing%')
        }

        const { data: smartFiles, error } = await fileQuery.order('created_at', { ascending: false })
        if (error) throw error
        return res.status(200).json({ files: smartFiles || [] })
      }

      // Custom Collection: Join collection_files with files
      const { data: relations, error: relErr } = await supabase
        .from('collection_files')
        .select('file_id')
        .eq('collection_id', collectionId)

      if (relErr) throw relErr

      const fileIds = (relations || []).map((r: any) => r.file_id)
      if (fileIds.length === 0) {
        return res.status(200).json({ files: [] })
      }

      const { data: customFiles, error: filesErr } = await supabase
        .from('files')
        .select('*')
        .in('id', fileIds)
        .eq('user_id', userId)
        .eq('is_trashed', false)
        .order('created_at', { ascending: false })

      if (filesErr) throw filesErr
      return res.status(200).json({ files: customFiles || [] })
    }

    // ─── POST: Add File(s) to Collection ───
    if (req.method === 'POST') {
      const { file_ids, file_id } = req.body
      const targetIds = Array.isArray(file_ids) ? file_ids : file_id ? [file_id] : []

      if (targetIds.length === 0) {
        return res.status(400).json({ error: 'file_id or file_ids is required' })
      }

      const rows = targetIds.map((fId: string) => ({
        collection_id: collectionId,
        file_id: fId,
      }))

      const { error: insertErr } = await supabase
        .from('collection_files')
        .upsert(rows, { onConflict: 'collection_id,file_id' })

      if (insertErr) throw insertErr

      return res.status(200).json({ success: true, added_count: targetIds.length })
    }

    // ─── DELETE: Remove File from Collection ───
    if (req.method === 'DELETE') {
      const fileId = (req.query.file_id as string) || req.body?.file_id

      if (!fileId) {
        return res.status(400).json({ error: 'file_id is required' })
      }

      const { error: delErr } = await supabase
        .from('collection_files')
        .delete()
        .eq('collection_id', collectionId)
        .eq('file_id', fileId)

      if (delErr) throw delErr

      return res.status(200).json({ success: true, removed: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[Collection Files API] Error:', err)
    return res.status(500).json({ error: err.message || 'Collection files operation failed' })
  }
}

