import { describe, it, expect } from 'vitest'
import { parseDocument } from '../../lib/intelligence/documentParser'

describe('Multi-Format Document Parser', () => {
  it('parses CSV spreadsheet documents into structured searchable rows', async () => {
    const csvData = 'Item,Quantity,Unit Price,Total\nWidget A,10,$5.00,$50.00\nWidget B,4,$12.50,$50.00'
    const buffer = Buffer.from(csvData)

    const result = await parseDocument('inventory.csv', buffer, 'text/csv')

    expect(result.metadata.category).toBe('documents')
    expect(result.rawText).toContain('Item,Quantity,Unit Price,Total')
    expect(result.rawText).toContain('Widget A')
    expect(result.chunks.length).toBeGreaterThan(0)
  })

  it('parses JSON data documents with clean formatting', async () => {
    const jsonData = JSON.stringify({ project: 'VectorGallery', version: '2.0', features: ['AI Cloud', 'Mobile Backup'] })
    const buffer = Buffer.from(jsonData)

    const result = await parseDocument('config.json', buffer, 'application/json')

    expect(result.metadata.category).toBe('documents')
    expect(result.rawText).toContain('"project": "VectorGallery"')
  })

  it('categorizes media files without crashing', async () => {
    const dummyBuffer = Buffer.from('FAKE-MP3-HEADER-DATA')
    const result = await parseDocument('podcast.mp3', dummyBuffer, 'audio/mpeg')

    expect(result.metadata.category).toBe('audio')
    expect(result.rawText).toContain('Media File: podcast.mp3')
  })
})

