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
      return res.status(200).json({ devices: [] })
    }

    const supabase = getAdminSupabase()

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', userId)
        .order('last_sync_at', { ascending: false })

      if (error) {
        console.warn('[Devices API] Select notice:', error.message)
        return res.status(200).json({ devices: [] })
      }

      return res.status(200).json({ devices: data || [] })
    }

    if (req.method === 'POST') {
      const { device_name, platform, device_identifier, app_version, settings } = req.body

      if (!device_name || !platform || !device_identifier) {
        return res.status(400).json({ error: 'device_name, platform, and device_identifier are required' })
      }

      const { data, error } = await supabase
        .from('devices')
        .upsert(
          {
            user_id: userId,
            device_name,
            platform,
            device_identifier,
            app_version: app_version || '2.0.0',
            last_sync_at: new Date().toISOString(),
            sync_status: 'IDLE',
            settings: settings || { wifi_only: true, auto_backup: true, categories: ['photos', 'documents', 'screenshots'] },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,device_identifier' }
        )
        .select()
        .single()

      if (error) throw error
      return res.status(200).json({ success: true, device: data })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    console.error('[Devices API] Error:', err)
    return res.status(500).json({ error: err.message || 'Device operation failed' })
  }
}

