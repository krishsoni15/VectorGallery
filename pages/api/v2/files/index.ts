import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, isServiceRoleConfigured } from '@/lib/supabase'
import { getLocalFiles } from '@/lib/localMetadataStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getServerUser(req)
    if (isServiceRoleConfigured() && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    const {
      category,
      folder_id,
      is_favorite,
      is_trashed,
      search,
      limit = '50',
      cursor,
    } = req.query

    const pageSize = Math.min(parseInt(limit as string, 10) || 50, 100)

    if (!isServiceRoleConfigured()) {
      let localFiles = getLocalFiles().filter(f => f.user_id === userId || userId === '00000000-0000-0000-0000-000000000000')
      if (is_trashed === 'true') {
        localFiles = localFiles.filter(f => f.is_trashed)
      } else {
        localFiles = localFiles.filter(f => !f.is_trashed)
      }
      if (category && category !== 'all') {
        localFiles = localFiles.filter(f => f.category?.toLowerCase() === (category as string).toLowerCase())
      }
      if (is_favorite === 'true') {
        localFiles = localFiles.filter(f => f.is_favorite)
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase()
        localFiles = localFiles.filter(f => f.original_name.toLowerCase().includes(q) || f.extracted_text?.toLowerCase().includes(q))
      }
      return res.status(200).json({
        files: localFiles.slice(0, pageSize),
        next_cursor: null,
        has_more: false,
        total: localFiles.length,
      })
    }

    const supabase = getAdminSupabase()
    let query = supabase
      .from('files')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Trashed filter
    if (is_trashed === 'true') {
      query = query.eq('is_trashed', true)
    } else {
      query = query.eq('is_trashed', false)
    }

    // Category filter
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Folder filter
    if (folder_id && folder_id !== 'all') {
      if (folder_id === 'root') {
        query = query.is('folder_id', null)
      } else {
        query = query.eq('folder_id', folder_id)
      }
    }

    // Favorite filter
    if (is_favorite === 'true') {
      query = query.eq('is_favorite', true)
    }

    // Keyword search filter
    if (search && typeof search === 'string' && search.trim().length > 0) {
      query = query.ilike('original_name', `%${search.trim()}%`)
    }

    // Ordering and Pagination
    query = query.order('created_at', { ascending: false }).limit(pageSize + 1)

    if (cursor && typeof cursor === 'string') {
      query = query.lt('created_at', cursor)
    }

    const { data: rows, count, error } = await query

    if (error) {
      // If table doesn't exist yet, return empty list gracefully
      console.warn('[Files API] DB select notice:', error.message)
      return res.status(200).json({ files: [], next_cursor: null, has_more: false, total: 0 })
    }

    const hasMore = (rows || []).length > pageSize
    const files = hasMore ? rows.slice(0, pageSize) : (rows || [])
    const nextCursor = hasMore && files.length > 0 ? files[files.length - 1].created_at : null

    return res.status(200).json({
      files,
      next_cursor: nextCursor,
      has_more: hasMore,
      total: count || files.length,
    })
  } catch (err: any) {
    console.error('[Files API] Error:', err)
    return res.status(500).json({ error: err.message || 'Failed to list files' })
  }
}

