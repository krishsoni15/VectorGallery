import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, isServiceRoleConfigured } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getServerUser(req)
    if (isServiceRoleConfigured() && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    if (!isServiceRoleConfigured()) {
      // Local development mock
      if (req.method === 'GET') {
        return res.status(200).json({
          profile: {
            id: userId,
            full_name: 'Krish Soni',
            email: 'krish@vectorgallery.app',
            storage_quota_bytes: 16106127360,
            backup_settings: {
              auto_backup: true,
              wifi_only: true,
              categories: ['photos', 'documents', 'screenshots'],
            },
            theme: 'dark',
          },
        })
      }
      if (req.method === 'PUT') {
        return res.status(200).json({ success: true, profile: req.body })
      }
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const supabase = getAdminSupabase()

    // ─── GET: Fetch User Profile & Settings ───
    if (req.method === 'GET') {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      return res.status(200).json({
        profile: {
          id: userId,
          full_name: profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          storage_quota_bytes: profile?.storage_quota_bytes || 16106127360,
          backup_settings: profile?.backup_settings || {
            auto_backup: true,
            wifi_only: true,
            categories: ['photos', 'documents', 'screenshots'],
          },
          theme: profile?.theme || 'dark',
          created_at: profile?.created_at || user?.created_at,
        },
      })
    }

    // ─── PUT: Update Profile or Settings ───
    if (req.method === 'PUT') {
      const { full_name, backup_settings, theme } = req.body
      const updates: any = { updated_at: new Date().toISOString() }

      if (typeof full_name === 'string') updates.full_name = full_name.trim()
      if (backup_settings && typeof backup_settings === 'object') updates.backup_settings = backup_settings
      if (typeof theme === 'string') updates.theme = theme

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: userId,
            ...updates,
          },
          { onConflict: 'id' }
        )
        .select()
        .single()

      if (error) {
        console.warn('[Profile API] Upsert notice:', error.message)
      }

      // Also update Supabase auth metadata if full_name changed
      if (full_name && typeof full_name === 'string') {
        try {
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { full_name: full_name.trim() },
          })
        } catch {}
      }

      return res.status(200).json({
        success: true,
        profile: data || { id: userId, ...updates },
      })
    }

    res.setHeader('Allow', ['GET', 'PUT'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[Profile API] Error:', err)
    return res.status(500).json({ error: err.message || 'Profile operation failed' })
  }
}

