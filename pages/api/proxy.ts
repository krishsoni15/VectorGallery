import type { NextApiRequest, NextApiResponse } from 'next'
import net from 'net'
import { getServerUser } from '@/lib/supabase'

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  if (lower === 'localhost' || lower.endsWith('.local') || lower === '0.0.0.0' || lower === '::1') {
    return true
  }
  const ipType = net.isIP(lower)
  if (ipType === 4) {
    const parts = lower.split('.').map(Number)
    if (parts[0] === 127 || parts[0] === 10 || parts[0] === 0) return true
    if (parts[0] === 169 && parts[1] === 254) return true
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
    if (parts[0] === 192 && parts[1] === 168) return true
  }
  if (ipType === 6 && (lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd'))) {
    return true
  }
  return false
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getServerUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' })
  }

  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing URL parameter')
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return res.status(400).send('Invalid URL')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.status(400).send('Unsupported protocol')
  }

  if (isBlockedHost(parsed.hostname)) {
    return res.status(403).send('Private or local targets are forbidden')
  }

  try {
    const response = await fetch(parsed.toString())
    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch from remote source')
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Cache-Control', 'public, max-age=3600')

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return res.status(200).send(buffer)
  } catch (error) {
    console.error('[Proxy] Fetch error:', error)
    return res.status(500).send('Internal Server Error')
  }
}
