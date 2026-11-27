import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { signSupabaseFileUrls } from '@/lib/storage/supabaseStorage'
import { getLocalFiles } from '@/lib/localMetadataStore'
import { listLocalDevices } from '@/lib/localAppStore'
import { GUEST_USER_ID } from '@/lib/localAuthStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || GUEST_USER_ID

    const totalQuotaBytes = 15 * 1024 * 1024 * 1024

    if (!isServiceRoleConfigured()) {
      const localFiles = getLocalFiles(userId).filter((f) => !f.is_trashed)
      const devices = listLocalDevices(userId)

      let totalBytesUsed = 0
      let photosBytes = 0
      let videosBytes = 0
      let documentsBytes = 0
      let audioBytes = 0
      let screenshotsBytes = 0

      let photosCount = 0
      let videosCount = 0
      let documentsCount = 0
      let audioCount = 0
      let screenshotsCount = 0

      for (const f of localFiles) {
        const sz = Number(f.size_bytes || 0)
        totalBytesUsed += sz
        if (f.category === 'photos') { photosCount++; photosBytes += sz }
        else if (f.category === 'videos') { videosCount++; videosBytes += sz }
        else if (f.category === 'documents') { documentsCount++; documentsBytes += sz }
        else if (f.category === 'audio') { audioCount++; audioBytes += sz }
        else if (f.category === 'screenshots') { screenshotsCount++; screenshotsBytes += sz }
      }

      const percentUsed = Math.min(100, Number(((totalBytesUsed / totalQuotaBytes) * 100).toFixed(2)))
      const lastDeviceSync = devices[0]?.last_sync_at || null

      return res.status(200).json({
        storage: {
          total_bytes_used: totalBytesUsed,
          total_bytes_quota: totalQuotaBytes,
          formatted_used: formatBytes(totalBytesUsed),
          formatted_quota: formatBytes(totalQuotaBytes),
          percent_used: percentUsed,
          category_bytes: {
            photos: photosBytes,
            screenshots: screenshotsBytes,
            documents: documentsBytes,
            videos: videosBytes,
            audio: audioBytes,
          },
          formatted_category_bytes: {
            photos: formatBytes(photosBytes),
            screenshots: formatBytes(screenshotsBytes),
            documents: formatBytes(documentsBytes),
            videos: formatBytes(videosBytes),
            audio: formatBytes(audioBytes),
          },
        },
        counts: {
          total_files: localFiles.length,
          photos: photosCount,
          videos: videosCount,
          documents: documentsCount,
          audio: audioCount,
          screenshots: screenshotsCount,
        },
        backup_health: {
          connected_devices: devices.length > 0 ? devices.length : userId === GUEST_USER_ID ? 1 : 0,
          last_sync_at: lastDeviceSync || (localFiles.length > 0 ? localFiles[0].created_at : null),
          sync_status: devices.length > 0 || userId === GUEST_USER_ID ? 'ACTIVE' : 'IDLE',
        },
        recent_files: localFiles.slice(0, 10).map((f) => ({
          id: f.id,
          name: f.original_name,
          original_name: f.original_name,
          category: f.category,
          size: f.size_bytes,
          size_bytes: f.size_bytes,
          formatted_size: formatBytes(f.size_bytes),
          created_at: f.created_at,
          mime_type: f.mime_type,
          thumbnail_url: f.thumbnail_url,
          extracted_text: f.extracted_text,
          is_favorite: f.is_favorite,
          sha256_hash: f.sha256_hash,
        })),
      })
    }

    const supabase = getAdminSupabase()

    const { data: files } = await supabase
      .from('files')
      .select('id, original_name, category, size_bytes, created_at, mime_type, storage_key, thumbnail_url, extracted_text, is_favorite, sha256_hash')
      .eq('user_id', userId)
      .eq('is_trashed', false)
      .order('created_at', { ascending: false })

    let totalBytesUsed = 0
    let photosBytes = 0
    let videosBytes = 0
    let documentsBytes = 0
    let audioBytes = 0
    let screenshotsBytes = 0

    let photosCount = 0
    let videosCount = 0
    let documentsCount = 0
    let audioCount = 0
    let screenshotsCount = 0

    const fileList = files || []
    for (const f of fileList) {
      const sz = Number(f.size_bytes || 0)
      totalBytesUsed += sz
      if (f.category === 'photos') { photosCount++; photosBytes += sz }
      else if (f.category === 'videos') { videosCount++; videosBytes += sz }
      else if (f.category === 'documents') { documentsCount++; documentsBytes += sz }
      else if (f.category === 'audio') { audioCount++; audioBytes += sz }
      else if (f.category === 'screenshots') { screenshotsCount++; screenshotsBytes += sz }
    }

    const { data: devices } = await supabase
      .from('devices')
      .select('id, device_name, platform, last_sync_at, sync_status')
      .eq('user_id', userId)
      .order('last_sync_at', { ascending: false })

    const lastSyncAt = devices && devices.length > 0 ? devices[0].last_sync_at : null

    return res.status(200).json({
      storage: {
        total_bytes_used: totalBytesUsed,
        total_bytes_quota: totalQuotaBytes,
        formatted_used: formatBytes(totalBytesUsed),
        formatted_quota: formatBytes(totalQuotaBytes),
        percent_used: Number(((totalBytesUsed / totalQuotaBytes) * 100).toFixed(1)),
        category_bytes: {
          photos: photosBytes,
          screenshots: screenshotsBytes,
          documents: documentsBytes,
          videos: videosBytes,
          audio: audioBytes,
        },
        formatted_category_bytes: {
          photos: formatBytes(photosBytes),
          screenshots: formatBytes(screenshotsBytes),
          documents: formatBytes(documentsBytes),
          videos: formatBytes(videosBytes),
          audio: formatBytes(audioBytes),
        },
      },
      counts: {
        total_files: fileList.length,
        photos: photosCount,
        videos: videosCount,
        documents: documentsCount,
        audio: audioCount,
        screenshots: screenshotsCount,
      },
      backup_health: {
        connected_devices: (devices || []).length,
        last_sync_at: lastSyncAt,
        sync_status: devices && devices.length > 0 ? devices[0].sync_status : 'IDLE',
      },
      recent_files: await signSupabaseFileUrls(supabase, fileList.slice(0, 8)),
    })
  } catch (err: any) {
    console.error('[Dashboard Stats API] Error:', err)
    return res.status(500).json({ error: err.message || 'Stats fetch failed' })
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
