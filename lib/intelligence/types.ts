export type ProcessingStatus = 
  | 'PENDING'
  | 'VALIDATING'
  | 'EXTRACTING'
  | 'GENERATING_METADATA'
  | 'GENERATING_EMBEDDINGS'
  | 'INDEXING'
  | 'READY'
  | 'FAILED'

export type FileCategory = 
  | 'photos'
  | 'videos'
  | 'documents'
  | 'audio'
  | 'screenshots'
  | 'other'

export interface ExtractedMetadata {
  category: FileCategory
  isScreenshot: boolean
  screenshotTopics?: string[]
  detectedApp?: string
  pageCount?: number
  durationSeconds?: number
  sheetNames?: string[]
  dimensions?: { width: number; height: number }
  tags: string[]
  summary?: string
}

export interface ExtractionResult {
  rawText: string
  metadata: ExtractedMetadata
  chunks: Array<{
    content: string
    tokenCount: number
    pageNumber?: number
    heading?: string
  }>
}

