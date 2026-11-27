// VECTORMIND — documents.ts
// Document Library API: GET (list by projectId) and DELETE (remove by id)
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '../../lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabaseAnonKey = (serviceKey && !serviceKey.includes('your_')) ? serviceKey : (anonKey || '')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getServerUser(req)
  if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required', step: 'auth' })
  }

  if (!isServiceRoleConfigured() || !supabaseUrl || !supabaseAnonKey) {
    return res.status(503).json({ error: 'Supabase not configured; use /api/v2/files', step: 'config' })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    if (req.method === 'GET') {
      const { projectId } = req.query

      const isValidUuid = (str?: string) => !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

      if (!projectId || typeof projectId !== 'string' || !isValidUuid(projectId)) {
        return res.status(200).json([])
      }

      let query = supabase
        .from('nods_page')
        .select('id, path, checksum, meta, project_id, user_id, nods_page_section(id)')
        .eq('project_id', projectId)
        .order('id', { ascending: false })

      if (user) {
        query = query.or(`user_id.eq.${user.id},user_id.is.null`)
      }

      const { data: pages, error } = await query
      if (error) throw error

      const formattedPages = (pages || []).map((page: any) => ({
        id: String(page.id),
        path: page.path,
        checksum: page.checksum,
        meta: page.meta,
        projectId: page.project_id,
        sectionCount: page.nods_page_section ? page.nods_page_section.length : 0,
      }))

      return res.status(200).json(formattedPages)
    }

    if (req.method === 'DELETE') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required', step: 'auth' })
      }
      const { id, filename, projectId } = req.query

      if (id && typeof id === 'string') {
        const ids = id.split(',')
        const { data: pages } = await supabase
          .from('nods_page')
          .select('id, meta')
          .in('id', ids)
          .eq('user_id', user.id)

        const ownedIds = (pages || []).map((p: any) => p.id)
        const storagePaths = (pages || [])
          .map((p: any) => p.meta?.storagePath)
          .filter(Boolean)

        if (storagePaths.length > 0) {
          await supabase.storage.from('documents').remove(storagePaths)
        }

        if (ownedIds.length > 0) {
          const { error } = await supabase
            .from('nods_page')
            .delete()
            .in('id', ownedIds)
            .eq('user_id', user.id)
          if (error) throw error
        }

        return res.status(200).json({ success: true, deleted: ownedIds.length })
      } else if (filename && projectId && typeof filename === 'string' && typeof projectId === 'string') {
        const { data: pages } = await supabase
          .from('nods_page')
          .select('id, meta')
          .eq('project_id', projectId)
          .eq('path', filename)
          .eq('user_id', user.id)

        const ids = (pages || []).map((p: any) => p.id)
        const storagePaths = (pages || [])
          .map((p: any) => p.meta?.storagePath)
          .filter(Boolean)

        if (storagePaths.length > 0) {
          await supabase.storage.from('documents').remove(storagePaths)
        }

        if (ids.length > 0) {
          const { error } = await supabase.from('nods_page').delete().in('id', ids).eq('user_id', user.id)
          if (error) throw error
        }

        return res.status(200).json({ success: true, deleted: ids.length })
      } else {
        return res.status(400).json({ error: 'Document ID or filename+projectId is required', step: 'validation' })
      }
    }

    res.setHeader('Allow', ['GET', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed`, step: 'validation' })
  } catch (err: any) {
    console.error('[VectorGallery] Documents API error:', err)
    return res.status(500).json({
      error: err.message || 'Failed to process request',
      step: 'database',
    })
  }
}
