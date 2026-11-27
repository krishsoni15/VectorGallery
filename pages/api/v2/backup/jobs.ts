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
      if (req.method === 'GET') {
        return res.status(200).json({ jobs: [] })
      }
      return res.status(200).json({ success: true, job: req.body })
    }

    const supabase = getAdminSupabase()

    // ─── GET: List Backup Jobs ───
    if (req.method === 'GET') {
      const { device_id, status, limit = '50' } = req.query
      const pageSize = Math.min(parseInt(limit as string, 10) || 50, 100)

      let query = supabase
        .from('backup_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(pageSize)

      if (device_id && typeof device_id === 'string') {
        query = query.eq('device_id', device_id)
      }

      if (status && typeof status === 'string') {
        query = query.eq('status', status)
      }

      const { data, error } = await query
      if (error) {
        console.warn('[Backup Jobs API] Select notice:', error.message)
        return res.status(200).json({ jobs: [] })
      }

      return res.status(200).json({ jobs: data || [] })
    }

    // ─── POST: Create Backup Job ───
    if (req.method === 'POST') {
      const { device_id, local_path, sha256_hash, file_size } = req.body

      if (!local_path || !sha256_hash || file_size === undefined) {
        return res.status(400).json({ error: 'local_path, sha256_hash, and file_size are required' })
      }

      const { data, error } = await supabase
        .from('backup_jobs')
        .insert({
          user_id: userId,
          device_id: device_id || null,
          local_path,
          sha256_hash,
          file_size: Number(file_size),
          status: 'QUEUED',
          progress_percentage: 0,
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({ success: true, job: data })
    }

    // ─── PATCH: Update Job Progress or Status ───
    if (req.method === 'PATCH') {
      const { id, status, progress_percentage, error_message, file_id } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Job ID is required' })
      }

      const updates: any = {}
      if (status) updates.status = status
      if (progress_percentage !== undefined) updates.progress_percentage = Number(progress_percentage)
      if (error_message !== undefined) updates.error_message = error_message
      if (file_id) updates.file_id = file_id

      if (status === 'UPLOADING' && !updates.started_at) {
        updates.started_at = new Date().toISOString()
      } else if (status === 'COMPLETED') {
        updates.completed_at = new Date().toISOString()
        updates.progress_percentage = 100
      }

      const { data, error } = await supabase
        .from('backup_jobs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({ success: true, job: data })
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[Backup Jobs API] Error:', err)
    return res.status(500).json({ error: err.message || 'Backup jobs operation failed' })
  }
}

