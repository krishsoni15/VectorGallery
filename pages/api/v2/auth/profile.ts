import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import {
  getAdminSupabase,
  getServerUser,
  hasExplicitCredential,
  isServiceRoleConfigured,
} from '@/lib/supabase'
import {
  GUEST_USER_ID,
  deleteLocalUserAccount,
  getGuestProfile,
  getLocalUserById,
  updateLocalUserProfile,
} from '@/lib/localAuthStore'
import { purgeUserLocalFiles } from '@/lib/localMetadataStore'
import { purgeUserVectorChunks } from '@/lib/localVectorStore'
import { purgeUserAppData } from '@/lib/localAppStore'
import { purgeUserLocalKeys } from '@/lib/credentialResolver'
import { getStorageDriver } from '@/lib/storage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || GUEST_USER_ID

    if (!isServiceRoleConfigured()) {
      if (req.method === 'GET') {
        if (!user) {
          return res.status(200).json({ profile: getGuestProfile() })
        }
        const record = getLocalUserById(user.id)
        return res.status(200).json({
          profile: record
            ? {
                id: record.id,
                full_name: record.name,
                email: record.email,
                storage_quota_bytes: record.storage_quota_bytes,
                backup_settings: record.backup_settings,
                theme: record.theme,
                created_at: record.created_at,
                is_guest: false,
              }
            : getGuestProfile(),
        })
      }

      if (req.method === 'PUT') {
        const { full_name, backup_settings, theme } = req.body || {}
        const result = updateLocalUserProfile(userId, { full_name, backup_settings, theme })
        if (!result) {
          return res.status(404).json({ error: 'User profile not found' })
        }
        if (result.refreshedToken) {
          res.setHeader(
            'Set-Cookie',
            `sb-access-token=${result.refreshedToken}; Path=/; Max-Age=604800; SameSite=Lax`
          )
        }
        return res.status(200).json({ success: true, profile: result.profile })
      }

      if (req.method === 'DELETE') {
        if (!user) {
          return res.status(401).json({ error: 'Sign in with an account before deleting profile data' })
        }
        const removedFiles = purgeUserLocalFiles(user.id)
        const storage = getStorageDriver()
        const keys = removedFiles.map((f) => f.storage_key).filter(Boolean)
        if (keys.length > 0) {
          await storage.delete(keys).catch(() => {})
        }
        // Remove empty per-user local upload directory cleanly
        const safeUserId = path.basename(user.id)
        if (safeUserId && safeUserId === user.id) {
          const userUploadDir = path.join(process.cwd(), 'public', 'uploads', safeUserId)
          try {
            if (fs.existsSync(userUploadDir) && fs.readdirSync(userUploadDir).length === 0) {
              fs.rmdirSync(userUploadDir)
            }
          } catch {}
        }
        purgeUserVectorChunks(user.id)
        purgeUserAppData(user.id)
        purgeUserLocalKeys(user.id)
        deleteLocalUserAccount(user.id)
        res.setHeader('Set-Cookie', 'sb-access-token=; Path=/; Max-Age=0; SameSite=Lax')
        return res.status(200).json({ success: true, purged: true })
      }

      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const supabase = getAdminSupabase()

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
          is_guest: false,
        },
      })
    }

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

    if (req.method === 'DELETE') {
      const { data: userFiles } = await supabase
        .from('files')
        .select('storage_key')
        .eq('user_id', userId)
      const storage = getStorageDriver()
      const keys = (userFiles || []).map((f: any) => f.storage_key).filter(Boolean)
      if (keys.length > 0) await storage.delete(keys).catch(() => {})
      await supabase.from('files').delete().eq('user_id', userId)
      await supabase.auth.admin.deleteUser(userId)
      res.setHeader('Set-Cookie', 'sb-access-token=; Path=/; Max-Age=0; SameSite=Lax')
      return res.status(200).json({ success: true, purged: true })
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err: any) {
    console.error('[Profile API] Error:', err)
    return res.status(500).json({ error: err.message || 'Profile operation failed' })
  }
}
