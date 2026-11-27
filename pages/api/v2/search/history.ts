import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import {
  clearLocalSearchHistory,
  listLocalSearchHistory,
  recordLocalSearchHistory,
} from '@/lib/localAppStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    if (!isServiceRoleConfigured()) {
      if (req.method === 'GET') {
        return res.status(200).json({ history: listLocalSearchHistory(userId) })
      }
      if (req.method === 'POST') {
        const { query, result_count = 0, filters = {} } = req.body || {}
        if (!query || typeof query !== 'string' || !query.trim()) {
          return res.status(400).json({ error: 'Search query is required' })
        }
        const history = recordLocalSearchHistory({
          userId,
          query,
          resultCount: result_count,
          filters,
        })
        return res.status(201).json({ success: true, history })
      }
      if (req.method === 'DELETE') {
        clearLocalSearchHistory(userId, req.query.id as string | undefined)
        return res.status(200).json({ success: true, cleared: true })
      }
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }

    const supabase = getAdminSupabase()

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('search_history')
        .select('id, query, result_count, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.warn('[Search History API] Select notice:', error.message)
        return res.status(200).json({ history: [] })
      }

      const seen = new Set<string>()
      const uniqueHistory = (data || []).filter((item: any) => {
        const q = item.query.trim().toLowerCase()
        if (seen.has(q)) return false
        seen.add(q)
        return true
      }).slice(0, 8)

      return res.status(200).json({ history: uniqueHistory })
    }

    if (req.method === 'POST') {
      const { query, result_count = 0, filters = {} } = req.body

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' })
      }

      const { data, error } = await supabase
        .from('search_history')
        .insert({
          user_id: userId,
          query: query.trim(),
          result_count,
          filters,
        })
        .select()
        .single()

      if (error) {
        console.warn('[Search History API] Insert notice:', error.message)
      }

      return res.status(201).json({ success: true, history: data })
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string

      let delQuery = supabase.from('search_history').delete().eq('user_id', userId)
      if (id) {
        delQuery = delQuery.eq('id', id)
      }

      const { error } = await delQuery
      if (error) throw error

      return res.status(200).json({ success: true, cleared: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[Search History API] Error:', err)
    return res.status(500).json({ error: err.message || 'Search history failed' })
  }
}
