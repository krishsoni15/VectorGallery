import { describe, it, expect, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import uploadHandler from '../../pages/api/v2/files/upload'
import restoreHandler from '../../pages/api/v2/files/restore'
import searchHandler from '../../pages/api/v2/search/index'
import chatHandler from '../../pages/api/v2/chat/index'
import healthHandler from '../../pages/api/health'
import { deleteLocalFile } from '../../lib/localMetadataStore'
import { createMockReqRes } from '../helpers/mockNextApi'

describe('API Security, Upload Guardrails & Offline Grounding', () => {
  const createdFileIds: string[] = []
  const createdUploadPaths: string[] = []

  afterAll(() => {
    for (const id of createdFileIds) {
      deleteLocalFile(id, true)
    }
    for (const relKey of createdUploadPaths) {
      try {
        const fullPath = path.join(process.cwd(), 'public', 'uploads', relKey)
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
      } catch {}
    }
  })

  it('rejects disallowed executable uploads with 400 Bad Request', async () => {
    const { req, res, getStatus, getData } = createMockReqRes({
      method: 'POST',
      body: {
        filename: 'malware_script.sh',
        base64: Buffer.from('rm -rf /').toString('base64'),
        mimeType: 'application/x-sh',
      },
    })

    await uploadHandler(req, res)
    expect(getStatus()).toBe(400)
    expect(getData()?.error).toContain('not allowed for security reasons')
  })

  it('ingests a valid document upload, extracts text, and computes SHA-256', async () => {
    const docText = 'Official Admission Notice: MS Computer Science Fall 2026.'
    const { req, res, getStatus, getData } = createMockReqRes({
      method: 'POST',
      body: {
        filename: 'vitest_admission_notice.txt',
        base64: Buffer.from(docText).toString('base64'),
        mimeType: 'text/plain',
      },
    })

    await uploadHandler(req, res)
    expect(getStatus()).toBe(200)
    const file = getData()?.file
    expect(getData()?.success).toBe(true)
    expect(file?.filename).toBe('vitest_admission_notice.txt')
    expect(file?.category).toBe('documents')
    expect(file?.sha256).toHaveLength(64)

    if (file?.fileId) createdFileIds.push(file.fileId)
    if (file?.storageUrl?.startsWith('/uploads/')) {
      createdUploadPaths.push(file.storageUrl.replace('/uploads/', ''))
    }
  })

  it('deduplicates identical binary payloads via SHA-256 hash', async () => {
    const payload = Buffer.from(`Deduplication probe ${Date.now()}`).toString('base64')

    const first = createMockReqRes({
      method: 'POST',
      body: { filename: 'vitest_receipt_1.txt', base64: payload, mimeType: 'text/plain' },
    })
    await uploadHandler(first.req, first.res)
    expect(first.getStatus()).toBe(200)
    const firstFile = first.getData()?.file
    if (firstFile?.fileId) createdFileIds.push(firstFile.fileId)
    if (firstFile?.storageUrl?.startsWith('/uploads/')) {
      createdUploadPaths.push(firstFile.storageUrl.replace('/uploads/', ''))
    }

    const second = createMockReqRes({
      method: 'POST',
      body: { filename: 'vitest_receipt_copy.txt', base64: payload, mimeType: 'text/plain' },
    })
    await uploadHandler(second.req, second.res)
    expect(second.getStatus()).toBe(200)
    expect(second.getData()?.success).toBe(true)
    expect(second.getData()?.file?.isDuplicate).toBe(true)
    expect(second.getData()?.file?.fileId).toBe(firstFile?.fileId)
  })

  it('handles special punctuation in search queries safely', async () => {
    const { req, res, getStatus, getData } = createMockReqRes({
      method: 'GET',
      query: { q: 'AWS EC2, pricing (m6i.large)' },
    })

    await searchHandler(req, res)
    expect(getStatus()).toBe(200)
    expect(getData()?.query).toBe('AWS EC2, pricing (m6i.large)')
  })

  it('validates restore endpoint requires a non-empty file_ids array', async () => {
    const { req, res, getStatus, getData } = createMockReqRes({
      method: 'POST',
      body: { file_ids: [] },
    })

    await restoreHandler(req, res)
    expect(getStatus()).toBe(400)
    expect(getData()?.error).toContain('file_ids array is required')
  })

  it('streams SSE chat responses in offline fallback mode when AI keys are absent', async () => {
    const { req, res, getHeaders, getWrittenChunks, isEnded } = createMockReqRes({
      method: 'POST',
      body: { query: 'What was I researching about Docker?' },
    })

    await chatHandler(req, res)
    expect(getHeaders()['Content-Type']).toBe('text/event-stream')
    expect(isEnded()).toBe(true)

    const output = getWrittenChunks().join('')
    expect(output).toContain('data:')
    expect(output).toContain('"type":"done"')
  })

  it('exposes storage readiness on /api/health', async () => {
    const { req, res, getStatus, getData } = createMockReqRes({ method: 'GET' })
    await healthHandler(req, res)

    expect(getStatus()).toBe(200)
    expect(getData()?.status).toBe('ok')
    expect(getData()?.storage?.ready).toBe(true)
  })
})
