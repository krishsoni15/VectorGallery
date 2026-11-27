import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { getStorageDriver, SupabaseStorageDriver } from '@/lib/storage'

const FORBIDDEN_EXTENSIONS = new Set([
  '.exe', '.dll', '.so', '.sh', '.bat', '.cmd', '.ps1', '.vbs', '.com', '.msi', '.apk', '.bin', '.cgi', '.php', '.phtml', '.shtml',
])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    const { filename } = req.body || {}
    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Filename is required' })
    }

    const dotIdx = filename.lastIndexOf('.')
    const ext = dotIdx >= 0 ? filename.substring(dotIdx).toLowerCase() : ''
    if (ext && FORBIDDEN_EXTENSIONS.has(ext)) {
      return res.status(400).json({ error: `File type ${ext} is not allowed for security reasons` })
    }

    const storage = getStorageDriver()
    if (!(storage instanceof SupabaseStorageDriver)) {
      return res.status(200).json({
        directUpload: false,
      })
    }

    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storageKey = `${userId}/${Date.now()}_${sanitized}`
    const signed = await storage.createSignedUploadUrl(storageKey)

    return res.status(200).json({
      directUpload: true,
      storageKey: signed.path || storageKey,
      signedUrl: signed.signedUrl,
      token: signed.token,
    })
  } catch (err: any) {
    console.error('[Signed Upload API] Error:', err)
    return res.status(500).json({ error: err.message || 'Could not create signed upload URL' })
  }
}

