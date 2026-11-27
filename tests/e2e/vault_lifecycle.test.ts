import { describe, it, expect, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { processFile } from '../../lib/intelligence/pipeline'
import { analyzeScreenshot } from '../../lib/intelligence/screenshot'
import { parseDocument } from '../../lib/intelligence/documentParser'
import { LocalStorageDriver } from '../../lib/storage/localStorage'
import { saveLocalFile, updateLocalFile, deleteLocalFile, findLocalFileById } from '../../lib/localMetadataStore'
import { removeLocalVectorChunks } from '../../lib/localVectorStore'
import { rankFilesByRelevance } from '../../lib/search/smartMatcher'

describe('Vault Lifecycle — Ingestion, Indexing, Retrieval & Trash Restoration', () => {
  const fixtureRoot = path.join(process.cwd(), 'tests', 'fixtures', 'e2e_uploads')
  const testStorage = new LocalStorageDriver(fixtureRoot)
  const tempFileIds: string[] = []
  const tempUploadKeys: string[] = []

  afterAll(() => {
    if (tempFileIds.length > 0) {
      removeLocalVectorChunks(tempFileIds)
    }
    for (const id of tempFileIds) {
      deleteLocalFile(id, true)
    }
    for (const key of tempUploadKeys) {
      try {
        const full = path.join(process.cwd(), 'public', 'uploads', key)
        if (fs.existsSync(full)) fs.unlinkSync(full)
      } catch {}
    }
    try {
      const userUploadDir = path.join(process.cwd(), 'public', 'uploads', 'vitest-e2e-user')
      if (fs.existsSync(userUploadDir)) fs.rmSync(userUploadDir, { recursive: true, force: true })
      if (fs.existsSync(fixtureRoot)) {
        fs.rmSync(fixtureRoot, { recursive: true, force: true })
      }
    } catch {}
  })

  it('parses uploaded document text into chunks and retrieves matching snippets', async () => {
    const content = 'College Admission Letter 2026. Congratulations! You have been accepted to MS Computer Science.'
    const buffer = Buffer.from(content)

    const parsed = await parseDocument('college_admission_2026.txt', buffer, 'text/plain')
    expect(parsed.rawText).toContain('accepted to MS Computer Science')
    expect(parsed.chunks.length).toBeGreaterThan(0)

    const processed = await processFile({
      filename: 'college_admission_2026.txt',
      buffer,
      mimeType: 'text/plain',
      userId: 'vitest-e2e-user',
    })
    if (processed.fileId) tempFileIds.push(processed.fileId)
    if (processed.storageUrl?.startsWith('/uploads/')) {
      tempUploadKeys.push(processed.storageUrl.replace('/uploads/', ''))
    }
    expect(processed.category).toBe('documents')
    expect(processed.status).toBe('READY')
  })

  it('classifies AWS pricing screenshots and surfaces them via relevance ranking', () => {
    const ocrText = 'AWS Management Console - EC2 Pricing\nm6i.large: $0.096 per hour\nt3.medium: $0.0416 per hour'
    const analysis = analyzeScreenshot('Screenshot_AWS_EC2_Pricing.png', ocrText, 'image/png')

    expect(analysis.isScreenshot).toBe(true)
    expect(analysis.topics).toContain('AWS Console')
    expect(analysis.suggestedTags).toContain('pricing')

    const matches = rankFilesByRelevance(
      [
        {
          id: 'ss-aws',
          original_name: 'Screenshot_AWS_EC2_Pricing.png',
          category: 'screenshots',
          extracted_text: ocrText,
          is_trashed: false,
        },
      ],
      'Find screenshot with AWS EC2 pricing'
    )
    expect(matches).toHaveLength(1)
    expect(matches[0].file.id).toBe('ss-aws')
  })

  it('persists, downloads, soft-deletes, and restores vault records cleanly', async () => {
    const fileBytes = Buffer.from('Quarterly infrastructure roadmap — encrypted local backup.')
    const stored = await testStorage.upload('vitest_user/roadmap.txt', fileBytes)
    const downloaded = await testStorage.download(stored.key)
    expect(downloaded.toString('utf-8')).toBe(fileBytes.toString('utf-8'))

    const recordId = `vitest-e2e-${Date.now()}`
    tempFileIds.push(recordId)
    saveLocalFile({
      id: recordId,
      user_id: 'vitest-e2e-user',
      folder_id: null,
      original_name: 'roadmap.txt',
      sanitized_name: 'roadmap.txt',
      mime_type: 'text/plain',
      category: 'documents',
      size_bytes: fileBytes.length,
      storage_key: stored.key,
      storage_provider: 'local',
      sha256_hash: 'e'.repeat(64),
      thumbnail_url: '',
      extracted_text: fileBytes.toString('utf-8'),
      processing_status: 'READY',
      indexing_status: 'COMPLETED',
      is_favorite: false,
      is_trashed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Soft-delete -> Trash -> Restore
    deleteLocalFile(recordId, false)
    expect(findLocalFileById(recordId)?.is_trashed).toBe(true)

    updateLocalFile(recordId, { is_trashed: false })
    const restored = findLocalFileById(recordId)
    expect(restored?.is_trashed).toBe(false)
    expect(restored?.original_name).toBe('roadmap.txt')
  })
})

