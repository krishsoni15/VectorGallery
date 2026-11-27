import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { createLocalCollection, listLocalCollections } from '@/lib/localAppStore'

const SMART_COLLECTIONS = [
  {
    id: 'smart-diwali',
    name: 'Diwali & New Year Wishes',
    description: 'Festive greeting cards, Nutan Varshabhinandan, diyas & celebratory blessings',
    type: 'diwali',
    is_smart: true,
    icon: 'folder-heart',
    filter_criteria: { tag: 'festive' },
  },
  {
    id: 'smart-screenshots',
    name: 'Recent Screenshots',
    description: 'Automatically cataloged screen captures, error logs, and receipts',
    type: 'screenshots',
    is_smart: true,
    icon: 'camera',
    filter_criteria: { category: 'screenshots' },
  },
  {
    id: 'smart-important',
    name: 'Important Documents',
    description: 'Starred contracts, IDs, college notes, and sensitive files',
    type: 'important',
    is_smart: true,
    icon: 'star',
    filter_criteria: { is_favorite: true },
  },
  {
    id: 'smart-bills',
    name: 'Bills & Invoices',
    description: 'Auto-detected payment receipts, invoices, and utility statements',
    type: 'bills',
    is_smart: true,
    icon: 'receipt',
    filter_criteria: { tag: 'pricing' },
  },
  {
    id: 'smart-large-files',
    name: 'Large Files (>20MB)',
    description: 'High-resolution videos, archives, and datasets',
    type: 'large_files',
    is_smart: true,
    icon: 'hard-drive',
    filter_criteria: { min_size_bytes: 20971520 },
  },
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    if (!isServiceRoleConfigured()) {
      if (req.method === 'GET') {
        const userCollections = listLocalCollections(userId)
        return res.status(200).json({
          collections: [...SMART_COLLECTIONS, ...userCollections],
        })
      }

      if (req.method === 'POST') {
        const { name, description, icon } = req.body || {}
        if (!name || typeof name !== 'string' || !name.trim()) {
          return res.status(400).json({ error: 'Collection name is required' })
        }
        const created = createLocalCollection({ userId, name, description, icon })
        return res.status(201).json({ success: true, collection: created })
      }

      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const supabase = getAdminSupabase()

    if (req.method === 'GET') {
      const { data: userCollections, error } = await supabase
        .from('collections')
        .select('*, collection_files(file_id)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('[Collections API] Select notice:', error.message)
        return res.status(200).json({ collections: SMART_COLLECTIONS })
      }

      const normalizedCustom = (userCollections || []).map((col: any) => ({
        ...col,
        file_ids: Array.isArray(col.collection_files)
          ? col.collection_files.map((cf: any) => cf.file_id)
          : [],
      }))

      return res.status(200).json({
        collections: [...SMART_COLLECTIONS, ...normalizedCustom],
      })
    }

    if (req.method === 'POST') {
      const { name, description, icon } = req.body || {}
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Collection name is required' })
      }

      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: userId,
          name: name.trim(),
          description: description || '',
          icon: icon || 'folder-heart',
          type: 'custom',
          is_smart: false,
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json({ success: true, collection: { ...data, file_ids: [] } })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    console.error('[Collections API] Error:', err)
    return res.status(500).json({ error: err.message || 'Collections operation failed' })
  }
}
