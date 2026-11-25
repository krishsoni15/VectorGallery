/**
 * VectorGallery — Multi-Format Document Intelligence Parser
 * Extracts structured text and metadata from PDF, DOCX, CSV, TXT, MD, JSON
 */

import { recursiveCharacterChunker } from '../chunker'
import { ExtractedMetadata, ExtractionResult, FileCategory } from './types'
import { extractTextFromImage } from './ocr'
import { analyzeScreenshot } from './screenshot'

export async function parseDocument(
  filename: string,
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  let rawText = ''
  let category: FileCategory = 'other'
  let pageCount: number | undefined
  let sheetNames: string[] | undefined
  const tags: string[] = []

  // 1. Determine category
  const imageExts = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.heic']
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
  const audioExts = ['.mp3', '.wav', '.m4a', '.flac', '.ogg']
  const docExts = ['.pdf', '.docx', '.doc', '.txt', '.md', '.markdown', '.json', '.csv', '.xlsx', '.xls']

  if (imageExts.includes(ext) || mimeType.startsWith('image/')) {
    category = 'photos'
  } else if (videoExts.includes(ext) || mimeType.startsWith('video/')) {
    category = 'videos'
  } else if (audioExts.includes(ext) || mimeType.startsWith('audio/')) {
    category = 'audio'
  } else if (docExts.includes(ext)) {
    category = 'documents'
  }

  // 2. Extract content by type
  if (category === 'photos') {
    rawText = await extractTextFromImage(buffer, mimeType || 'image/png')
    const screenshot = analyzeScreenshot(filename, rawText, mimeType)
    if (screenshot.isScreenshot) {
      category = 'screenshots'
      tags.push(...screenshot.suggestedTags)
    }
  } else if (ext === '.pdf') {
    try {
      const { extractText, getDocumentProxy } = await import('unpdf')
      const pdf = await getDocumentProxy(new Uint8Array(buffer))
      pageCount = pdf.numPages
      const { text } = await extractText(pdf, { mergePages: true })
      rawText = text
    } catch (e: any) {
      console.warn('[Parser] unpdf extraction fallback:', e.message)
      rawText = buffer.toString('utf-8')
    }
  } else if (ext === '.csv' || ext === '.tsv') {
    const csvContent = buffer.toString('utf-8')
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0)
    sheetNames = ['Sheet1']
    if (lines.length > 0) {
      const headers = lines[0]
      rawText = `### Spreadsheet: ${filename}\nColumns: ${headers}\n\nRows:\n` + lines.slice(1, 200).join('\n')
      tags.push('spreadsheet', 'csv')
    }
  } else if (ext === '.docx') {
    // DOCX XML parser
    try {
      const content = buffer.toString('binary')
      const tMatches = content.match(/<w:t[^>]*>(.*?)<\/w:t>/g)
      if (tMatches && tMatches.length > 0) {
        rawText = tMatches.map(m => m.replace(/<w:t[^>]*>|<\/w:t>/g, '')).join(' ')
      } else {
        rawText = buffer.toString('utf-8')
      }
    } catch {
      rawText = buffer.toString('utf-8')
    }
  } else if (ext === '.json') {
    try {
      const parsed = JSON.parse(buffer.toString('utf-8'))
      rawText = JSON.stringify(parsed, null, 2)
      tags.push('json', 'data')
    } catch {
      rawText = buffer.toString('utf-8')
    }
  } else if (category === 'videos' || category === 'audio') {
    // Media metadata summary
    rawText = `[Media File: ${filename} | Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB | MIME: ${mimeType}]`
    tags.push(category)
  } else {
    rawText = buffer.toString('utf-8')
  }

  // 3. Clean and sanitize
  const cleanText = rawText
    .replace(/\u0000/g, '')
    .replace(/\x00/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // 4. Chunk text for vector embeddings and search snippets
  const chunkerResults = cleanText ? recursiveCharacterChunker(cleanText, 400, 80) : []
  const chunks = chunkerResults.map((c, i) => ({
    content: c.content,
    tokenCount: c.tokenCount,
    heading: c.metadata.heading || `Section ${i + 1}`,
    pageNumber: c.metadata.pageNum || 1,
  }))

  const metadata: ExtractedMetadata = {
    category,
    isScreenshot: category === 'screenshots',
    pageCount,
    sheetNames,
    tags: Array.from(new Set(tags)),
    summary: cleanText.slice(0, 200),
  }

  return {
    rawText: cleanText,
    metadata,
    chunks,
  }
}

