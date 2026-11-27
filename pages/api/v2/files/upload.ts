import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { processFile } from '@/lib/intelligence/pipeline'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

const FORBIDDEN_EXTENSIONS = new Set([
  '.exe', '.dll', '.so', '.sh', '.bat', '.cmd', '.ps1', '.vbs', '.com', '.msi', '.apk', '.bin', '.cgi', '.php', '.phtml', '.shtml'
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

    const { filename, base64, mimeType, folderId, embeddingProvider } = req.body

    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Filename is required' })
    }

    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
    if (FORBIDDEN_EXTENSIONS.has(ext)) {
      return res.status(400).json({ error: `File type ${ext} is not allowed for security reasons` })
    }

    if (!base64 || typeof base64 !== 'string') {
      return res.status(400).json({ error: 'Base64 file data is required' })
    }

    let buffer: Buffer
    try {
      buffer = Buffer.from(base64, 'base64')
    } catch (e: any) {
      return res.status(400).json({ error: `Invalid base64 payload: ${e.message}` })
    }

    if (buffer.length > 50 * 1024 * 1024) {
      return res.status(413).json({ error: 'File size exceeds maximum 50MB limit' })
    }

    const detectedMime = mimeType || detectMime(filename)

    const result = await processFile({
      filename,
      buffer,
      mimeType: detectedMime,
      userId,
      folderId: folderId || null,
      embeddingProvider: embeddingProvider || 'gemini',
    })

    return res.status(200).json({
      success: true,
      file: result,
    })
  } catch (err: any) {
    console.error('[Upload V2 API] Error:', err)
    return res.status(500).json({ error: err.message || 'File processing failed' })
  }
}

function detectMime(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
  }
  return map[ext] || 'application/octet-stream'
}

