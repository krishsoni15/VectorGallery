import fs from 'fs'
import path from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getLocalFiles } from '@/lib/localMetadataStore'
import { getAdminSupabase, getServerUser, isServiceRoleConfigured } from '@/lib/supabase'

const SAFE_CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  txt: 'text/plain; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  json: 'application/json; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  // Serve potentially executable markup safely as inert text
  html: 'text/plain; charset=utf-8',
  htm: 'text/plain; charset=utf-8',
  svg: 'text/plain; charset=utf-8',
  xml: 'text/plain; charset=utf-8',
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', ['GET', 'HEAD'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const user = await getServerUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' })
  }

  const rawFilename = req.query.filename
  if (!rawFilename || typeof rawFilename !== 'string') {
    return res.status(400).json({ error: 'Missing filename' })
  }

  // Normalize strictly to a single basename to prevent directory traversal
  const safeName = path.basename(rawFilename).replace(/[\r\n"\\]/g, '')
  if (!safeName || safeName !== rawFilename || safeName === '.' || safeName === '..') {
    return res.status(400).json({ error: 'Invalid filename' })
  }

  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'private, max-age=300')

  const ext = safeName.toLowerCase().split('.').pop() || ''
  const resolvedType = SAFE_CONTENT_TYPES[ext] || 'application/octet-stream'

  // Local vault fallback when Supabase service role is not configured
  if (!isServiceRoleConfigured()) {
    const ownedFiles = getLocalFiles(user.id)
    const owned = ownedFiles.find(
      (f) =>
        !f.is_trashed &&
        (f.storage_key === safeName ||
          path.basename(f.storage_key || '') === safeName ||
          f.thumbnail_url === `/uploads/${user.id}/${safeName}`)
    )

    if (!owned) {
      return res.status(404).json({ error: 'File not found' })
    }

    const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads', user.id)
    const localPath = path.resolve(uploadsRoot, path.basename(owned.storage_key || safeName))
    if (!localPath.startsWith(uploadsRoot + path.sep) || !fs.existsSync(localPath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    const buffer = fs.readFileSync(localPath)
    res.setHeader('Content-Type', resolvedType)
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`)
    return res.status(200).send(buffer)
  }

  const supabase = getAdminSupabase()
  const { data: ownedRecord } = await supabase
    .from('files')
    .select('id, storage_key')
    .eq('user_id', user.id)
    .eq('storage_key', safeName)
    .eq('is_trashed', false)
    .maybeSingle()

  if (!ownedRecord) {
    return res.status(404).json({ error: 'File not found' })
  }

  const { data, error } = await supabase.storage.from('documents').download(safeName)
  if (error || !data) {
    return res.status(404).json({ error: 'File not found' })
  }

  const buffer = Buffer.from(await data.arrayBuffer())
  res.setHeader('Content-Type', resolvedType)
  res.setHeader('Content-Disposition', `inline; filename="${safeName}"`)
  return res.status(200).send(buffer)
}
