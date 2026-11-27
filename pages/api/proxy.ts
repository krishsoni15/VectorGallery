import type { NextApiRequest, NextApiResponse } from 'next'
import dns from 'dns/promises'
import net from 'net'
import { getServerUser } from '@/lib/supabase'

const MAX_PROXY_BYTES = 5 * 1024 * 1024 // 5 MB safety cap
const ALLOWED_PROXY_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
])

function isBlockedIp(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/^::ffff:/, '')
  if (normalized === '::1' || normalized === '0.0.0.0') return true
  const ipType = net.isIP(normalized)
  if (ipType === 4) {
    const parts = normalized.split('.').map(Number)
    if (parts[0] === 127 || parts[0] === 10 || parts[0] === 0) return true
    if (parts[0] === 169 && parts[1] === 254) return true
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
    if (parts[0] === 192 && parts[1] === 168) return true
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true // CGNAT
  }
  if (ipType === 6) {
    if (
      normalized.startsWith('fe80:') ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd')
    ) {
      return true
    }
  }
  return false
}

function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  if (
    lower === 'localhost' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower === '0.0.0.0' ||
    lower === '::1'
  ) {
    return true
  }
  if (net.isIP(lower)) return isBlockedIp(lower)
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

  if (isBlockedHostname(parsed.hostname)) {
    return res.status(403).send('Private or local targets are forbidden')
  }

  // Prevent DNS-rebinding / local hostname aliasing bypasses
  try {
    const resolved = await dns.lookup(parsed.hostname, { all: true })
    if (!resolved.length || resolved.some((entry) => isBlockedIp(entry.address))) {
      return res.status(403).send('Resolved target address is forbidden')
    }
  } catch {
    return res.status(400).send('Unable to resolve target host')
  }

  try {
    const response = await fetch(parsed.toString(), {
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
    })

    if (response.status >= 300 && response.status < 400) {
      return res.status(403).send('Redirects are disabled on proxy endpoint')
    }

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch from remote source')
    }

    const rawContentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    const safeContentType = ALLOWED_PROXY_TYPES.has(rawContentType) ? rawContentType : 'application/octet-stream'
    const declaredLen = Number(response.headers.get('content-length') || 0)
    if (Number.isFinite(declaredLen) && declaredLen > MAX_PROXY_BYTES) {
      return res.status(413).send('Remote payload exceeds 5 MB proxy limit')
    }

    const arrayBuffer = await response.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_PROXY_BYTES) {
      return res.status(413).send('Remote payload exceeds 5 MB proxy limit')
    }

    res.setHeader('Content-Type', safeContentType)
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'private, max-age=300')

    return res.status(200).send(Buffer.from(arrayBuffer))
  } catch (error) {
    console.error('[Proxy] Fetch error:', error)
    return res.status(502).send('Upstream fetch failed')
  }
}
