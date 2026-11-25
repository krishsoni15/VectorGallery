import { describe, it, expect, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { LocalStorageDriver } from '../../lib/storage/localStorage'

describe('Storage Abstraction Driver (Local Filesystem)', () => {
  const testDir = path.join(process.cwd(), 'tests', 'fixtures', 'uploads')
  const driver = new LocalStorageDriver(testDir)

  afterAll(() => {
    try {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true })
      }
    } catch {}
  })

  it('uploads buffer to storage and returns valid path and url', async () => {
    const data = Buffer.from('VectorGallery Test Document Content')
    const key = 'test_user/test_file.txt'

    const result = await driver.upload(key, data, { contentType: 'text/plain' })
    expect(result.key).toBe(key)
    expect(result.sizeBytes).toBe(data.length)
    expect(result.url).toBe(`/uploads/${key}`)

    const exists = await driver.exists(key)
    expect(exists).toBe(true)
  })

  it('downloads previously uploaded content identically', async () => {
    const originalText = 'Identical binary verification string 12345!@#'
    const key = 'test_user/binary_check.bin'

    await driver.upload(key, Buffer.from(originalText))
    const downloaded = await driver.download(key)

    expect(downloaded.toString('utf-8')).toBe(originalText)
  })

  it('deletes stored object successfully', async () => {
    const key = 'test_user/to_delete.txt'
    await driver.upload(key, Buffer.from('Delete me'))

    expect(await driver.exists(key)).toBe(true)
    const deleted = await driver.delete(key)
    expect(deleted).toBe(true)
    expect(await driver.exists(key)).toBe(false)
  })
})

