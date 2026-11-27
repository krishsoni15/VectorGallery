import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { signSupabaseFileUrls } from '@/lib/storage/supabaseStorage'
import { findLocalFileById, getLocalFiles } from '@/lib/localMetadataStore'
import {
  addFilesToLocalCollection,
  findLocalCollection,
  removeFileFromLocalCollection,
} from '@/lib/localAppStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const collectionId = req.query.id as string
  if (!collectionId) {
    return res.status(400).json({ error: 'Collection ID is required' })
  }

  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'
    const isSmartVirtual = collectionId.startsWith('smart-')

    if (!isServiceRoleConfigured()) {
      const userFiles = getLocalFiles(userId).filter((f) => !f.is_trashed)

      if (req.method === 'GET') {
        if (collectionId === 'smart-diwali') {
          const matches = userFiles.filter((f) =>
            /diwali|new year|varshabhinandan|greeting|festive|wishes|nutan/i.test(
              f.original_name + ' ' + (f.extracted_text || '')
            )
          )
          return res.status(200).json({ files: matches })
        }
        if (collectionId === 'smart-screenshots') {
          return res.status(200).json({ files: userFiles.filter((f) => f.category === 'screenshots') })
        }
        if (collectionId === 'smart-important') {
          return res.status(200).json({ files: userFiles.filter((f) => f.is_favorite) })
        }
        if (collectionId === 'smart-bills') {
          return res.status(200).json({
            files: userFiles.filter((f) =>
              /receipt|bill|invoice|pricing|tax|payment|gst/i.test(
                f.original_name + ' ' + (f.extracted_text || '')
              )
            ),
          })
        }
        if (collectionId === 'smart-large-files') {
          return res.status(200).json({ files: userFiles.filter((f) => f.size_bytes >= 20971520) })
        }

        const customCol = findLocalCollection(collectionId, userId)
        if (!customCol) {
          return res.status(404).json({ error: 'Collection not found' })
        }
        const memberSet = new Set(customCol.file_ids || [])
        return res.status(200).json({
          files: userFiles.filter((f) => memberSet.has(f.id)),
        })
      }

      if (isSmartVirtual) {
        return res.status(400).json({ error: 'Smart collections are automatically curated' })
      }

      if (req.method === 'POST') {
        const { file_ids, file_id } = req.body || {}
        const targetIds: string[] = Array.isArray(file_ids) ? file_ids : file_id ? [file_id] : []
        const ownedIds = targetIds.filter((fid) => Boolean(findLocalFileById(fid, userId)))
        if (ownedIds.length === 0) {
          return res.status(400).json({ error: 'Valid user-owned file_id or file_ids is required' })
        }
        const updated = addFilesToLocalCollection(collectionId, userId, ownedIds)
        if (!updated) {
          return res.status(404).json({ error: 'Collection not found' })
        }
        return res.status(200).json({ success: true, collection: updated, added_count: ownedIds.length })
      }

      if (req.method === 'DELETE') {
        const fileId = (req.query.file_id as string) || req.body?.file_id
        if (!fileId) return res.status(400).json({ error: 'file_id is required' })
        const removed = removeFileFromLocalCollection(collectionId, userId, fileId)
        if (!removed) return res.status(404).json({ error: 'Collection not found' })
        return res.status(200).json({ success: true, removed: true })
      }

      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }

    const supabase = getAdminSupabase()

    let collection: any = null
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

    if (req.method === 'GET') {
      if (collection.is_smart) {
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
          fileQuery = fileQuery.gte('size_bytes', 20971520)
        } else if (collectionId === 'smart-bills') {
          fileQuery = fileQuery.or('original_name.ilike.%receipt%,original_name.ilike.%bill%,original_name.ilike.%invoice%,extracted_text.ilike.%pricing%')
        }

        const { data: smartFiles, error } = await fileQuery.order('created_at', { ascending: false })
        if (error) throw error
        return res.status(200).json({ files: await signSupabaseFileUrls(supabase, smartFiles || []) })
      }

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
      return res.status(200).json({ files: await signSupabaseFileUrls(supabase, customFiles || []) })
    }

    if (isSmartVirtual) {
      return res.status(400).json({ error: 'Smart collections are automatically curated' })
    }

    if (req.method === 'POST') {
      const { file_ids, file_id } = req.body
      const targetIds = Array.isArray(file_ids) ? file_ids : file_id ? [file_id] : []

      if (targetIds.length === 0) {
        return res.status(400).json({ error: 'file_id or file_ids is required' })
      }

      // Enforce ownership of added files
      const { data: ownedRows } = await supabase
        .from('files')
        .select('id')
        .eq('user_id', userId)
        .in('id', targetIds)

      const ownedIds = (ownedRows || []).map((f: any) => f.id)
      if (ownedIds.length === 0) {
        return res.status(404).json({ error: 'No matching owned files found' })
      }

      const rows = ownedIds.map((fId: string) => ({
        collection_id: collectionId,
        file_id: fId,
      }))

      const { error: insertErr } = await supabase
        .from('collection_files')
        .upsert(rows, { onConflict: 'collection_id,file_id' })

      if (insertErr) throw insertErr

      return res.status(200).json({ success: true, added_count: ownedIds.length })
    }

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
