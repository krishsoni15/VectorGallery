import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { withRateLimit } from '../../lib/rateLimiter'
import { createMockReqRes } from '../helpers/mockNextApi'

describe('API Rate Limiter Middleware', () => {
  const prevRedisUrl = process.env.UPSTASH_REDIS_REST_URL

  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL
  })

  afterEach(() => {
    if (prevRedisUrl !== undefined) {
      process.env.UPSTASH_REDIS_REST_URL = prevRedisUrl
    }
  })

  it('fails open with accurate rate-limit headers when Redis is not configured', async () => {
    let innerCalled = false
    const wrapped = withRateLimit('chat', async (_req, res) => {
      innerCalled = true
      res.status(200).json({ ok: true })
    })

    const { req, res, getStatus, getHeaders } = createMockReqRes({
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.42, 10.0.0.1' },
    })

    await wrapped(req, res)
    expect(innerCalled).toBe(true)
    expect(getStatus()).toBe(200)
    expect(getHeaders()['X-RateLimit-Limit']).toBe('30')
    expect(getHeaders()['X-RateLimit-Remaining']).toBe('30')
  })

  it('applies tier-specific quota limits for upload and workspace routes', async () => {
    const uploadWrapped = withRateLimit('upload', async (_req, res) => {
      res.status(200).json({ ok: true })
    })
    const uploadHarness = createMockReqRes({ method: 'POST', body: { workspaceId: 'ws-1' } })
    await uploadWrapped(uploadHarness.req, uploadHarness.res)
    expect(uploadHarness.getHeaders()['X-RateLimit-Limit']).toBe('100')

    const wsWrapped = withRateLimit('workspaces', async (_req, res) => {
      res.status(200).json({ ok: true })
    })
    const wsHarness = createMockReqRes({ method: 'GET' })
    await wsWrapped(wsHarness.req, wsHarness.res)
    expect(wsHarness.getHeaders()['X-RateLimit-Limit']).toBe('60')
  })
})

