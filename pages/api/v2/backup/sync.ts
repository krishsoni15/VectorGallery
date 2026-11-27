import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { getLocalFiles } from '@/lib/localMetadataStore'

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

    const { device_id, candidates } = req.body

    if (!Array.isArray(candidates)) {
      return res.status(400).json({ error: 'candidates must be an array of files with sha256_hash' })
    }

    if (!isServiceRoleConfigured()) {
      const existingSet = new Set(
        getLocalFiles(userId)
          .filter((f) => !f.is_trashed)
          .map((f) => f.sha256_hash)
      )
      const existingHashes = candidates
        .map((c: any) => c.sha256_hash)
        .filter((h: any) => h && existingSet.has(h))
      const requiredUploads = candidates
        .filter((c: any) => !existingSet.has(c.sha256_hash))
        .map((c: any) => ({
          sha256_hash: c.sha256_hash,
          local_path: c.local_path,
          upload_url: '/api/v2/files/upload',
        }))

      return res.status(200).json({
        success: true,
        existing_hashes: existingHashes,
        required_uploads: requiredUploads,
        skipped_count: existingHashes.length,
        pending_count: requiredUploads.length,
      })
    }

    const supabase = getAdminSupabase()
    const hashes = candidates.map((c: any) => c.sha256_hash).filter(Boolean)

    let existingHashes: string[] = []
    if (hashes.length > 0) {
      const { data: matchedFiles } = await supabase
        .from('files')
        .select('sha256_hash')
        .eq('user_id', userId)
        .eq('is_trashed', false)
        .in('sha256_hash', hashes)

      existingHashes = (matchedFiles || []).map((f: any) => f.sha256_hash)
    }

    const existingSet = new Set(existingHashes)
    const requiredUploads = candidates
      .filter((c: any) => !existingSet.has(c.sha256_hash))
      .map((c: any) => ({
        sha256_hash: c.sha256_hash,
        local_path: c.local_path,
        upload_url: '/api/v2/files/upload',
      }))

    // Update device sync timestamp
    if (device_id) {
      await supabase
        .from('devices')
        .update({
          last_sync_at: new Date().toISOString(),
          sync_status: 'IDLE',
        })
        .eq('id', device_id)
        .eq('user_id', userId)
    }

    return res.status(200).json({
      success: true,
      existing_hashes: existingHashes,
      required_uploads: requiredUploads,
      skipped_count: existingHashes.length,
      pending_count: requiredUploads.length,
    })
  } catch (err: any) {
    console.error('[Backup Sync API] Error:', err)
    return res.status(500).json({ error: err.message || 'Sync failed' })
  }
}

