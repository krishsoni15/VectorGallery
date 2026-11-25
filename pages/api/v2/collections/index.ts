import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, isServiceRoleConfigured } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getServerUser(req)
    if (isServiceRoleConfigured() && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    const smartCollections = [
      {
        id: 'smart-diwali',
        name: 'Diwali & New Year Wishes',
        description: 'Festive greeting cards, Nutan Varshabhinandan, diyas & celebratory blessings',
        type: 'diwali',
        is_smart: true,
        icon: 'folder-heart',
        cover_image: '/uploads/00000000-0000-0000-0000-000000000000/1794916947502_IMG-20261108-WA0005.jpg',
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

    if (!isServiceRoleConfigured()) {
      return res.status(200).json({ collections: smartCollections })
    }

    const supabase = getAdminSupabase()

    if (req.method === 'GET') {
      const { data: userCollections, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('[Collections API] Select notice:', error.message)
        return res.status(200).json({ collections: smartCollections })
      }

      return res.status(200).json({
        collections: [...smartCollections, ...(userCollections || [])],
      })
    }

    if (req.method === 'POST') {
      const { name, description, icon } = req.body
      if (!name) return res.status(400).json({ error: 'Collection name is required' })

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
      return res.status(201).json({ success: true, collection: data })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    console.error('[Collections API] Error:', err)
    return res.status(500).json({ error: err.message || 'Collections operation failed' })
  }
}

