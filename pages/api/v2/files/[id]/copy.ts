import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { findLocalFileById, saveLocalFile } from '@/lib/localMetadataStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
      const original = findLocalFileById(fileId, userId)
      if (!original) {
        return res.status(404).json({ error: 'Source file not found or access denied' })
      }
      const ext = original.original_name.includes('.')
        ? original.original_name.substring(original.original_name.lastIndexOf('.'))
        : ''
      const base = original.original_name.includes('.')
        ? original.original_name.substring(0, original.original_name.lastIndexOf('.'))
        : original.original_name
      const copyName = `${base} (Copy)${ext}`
      const now = new Date().toISOString()
      const copyRecord = {
        ...original,
        id: crypto.randomUUID(),
        original_name: copyName,
        sanitized_name: copyName.replace(/[^a-zA-Z0-9.-]/g, '_'),
        is_favorite: false,
        is_trashed: false,
        created_at: now,
        updated_at: now,
      }
      saveLocalFile(copyRecord)
      return res.status(201).json({ success: true, file: copyRecord })
    }

    const supabase = getAdminSupabase()

    // 1. Fetch original file
    const { data: original, error: fetchErr } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchErr || !original) {
      return res.status(404).json({ error: 'Source file not found or access denied' })
    }

    // 2. Clone file entry with new name and ID
    const newId = crypto.randomUUID()
    const ext = original.original_name.includes('.')
      ? original.original_name.substring(original.original_name.lastIndexOf('.'))
      : ''
    const base = original.original_name.includes('.')
      ? original.original_name.substring(0, original.original_name.lastIndexOf('.'))
      : original.original_name
    const copyName = `${base} (Copy)${ext}`

    const { data: copyFile, error: insertErr } = await supabase
      .from('files')
      .insert({
        id: newId,
        user_id: userId,
        folder_id: original.folder_id,
        original_name: copyName,
        sanitized_name: copyName.replace(/[^a-zA-Z0-9.-]/g, '_'),
        mime_type: original.mime_type,
        category: original.category,
        size_bytes: original.size_bytes,
        storage_key: original.storage_key, // Reuses binary storage reference (deduplicated)
        storage_provider: original.storage_provider,
        sha256_hash: original.sha256_hash,
        thumbnail_url: original.thumbnail_url,
        extracted_text: original.extracted_text,
        processing_status: original.processing_status,
        indexing_status: original.indexing_status,
        metadata: original.metadata,
        is_favorite: false,
        is_trashed: false,
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    return res.status(201).json({
      success: true,
      file: copyFile,
    })
  } catch (err: any) {
    console.error('[Copy File API] Error:', err)
    return res.status(500).json({ error: err.message || 'Failed to copy file' })
  }
}

