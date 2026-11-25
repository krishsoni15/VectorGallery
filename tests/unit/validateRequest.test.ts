import { describe, it, expect } from 'vitest'
import {
  ChatRequestSchema,
  UploadRequestSchema,
  WorkspaceRequestSchema,
  withValidation,
} from '../../lib/validateRequest'
import { createMockReqRes } from '../helpers/mockNextApi'

describe('Request Schema Validation & Sanitization', () => {
  const validUuid = '11111111-1111-4111-8111-111111111111'

  it('strips script tags, HTML tags, and null bytes from chat queries', () => {
    const parsed = ChatRequestSchema.parse({
      query: '  <script>alert(1)</script><b>Docker</b>\0 compose notes  ',
      workspaceId: validUuid,
    })

    expect(parsed.query).toBe('Docker compose notes')
  })

  it('rejects chat payloads missing both workspaceId and projectId', () => {
    const result = ChatRequestSchema.safeParse({
      query: 'Find my tax receipts',
    })

    expect(result.success).toBe(false)
  })

  it('rejects disallowed executable extensions and oversized uploads', () => {
    const badExt = UploadRequestSchema.safeParse({
      filename: 'payload.exe',
      base64: Buffer.from('binary').toString('base64'),
      workspaceId: validUuid,
    })
    expect(badExt.success).toBe(false)

    // Base64 length representing > 50MB decoded buffer
    const oversizedBase64 = 'A'.repeat(70 * 1024 * 1024)
    const tooLarge = UploadRequestSchema.safeParse({
      filename: 'archive.pdf',
      base64: oversizedBase64,
      workspaceId: validUuid,
    })
    expect(tooLarge.success).toBe(false)
  })

  it('accepts strict workspace updates and rejects unknown fields', () => {
    const valid = WorkspaceRequestSchema.safeParse({
      id: validUuid,
      name: 'Personal Archive',
      chat_provider: 'gemini',
    })
    expect(valid.success).toBe(true)

    const unknownField = WorkspaceRequestSchema.safeParse({
      name: 'Vault',
      isAdmin: true,
    })
    expect(unknownField.success).toBe(false)
  })

  it('returns structured 400 validation errors via withValidation middleware', async () => {
    const handler = withValidation(WorkspaceRequestSchema, async (_req, res, data) => {
      return res.status(200).json({ ok: true, data })
    })

    const { req, res, getStatus, getData } = createMockReqRes({
      method: 'POST',
      body: { id: 'not-a-uuid' },
    })

    await handler(req, res)
    expect(getStatus()).toBe(400)
    expect(getData()?.error).toBe('Validation failed')
    expect(Array.isArray(getData()?.details)).toBe(true)
  })
})

