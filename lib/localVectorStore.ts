import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { parseQueryIntent } from './search/smartMatcher'

export interface LocalVectorChunk {
  id: string
  file_id: string
  user_id: string
  filename: string
  category: string
  heading: string
  page_number: number
  content: string
  token_count: number
  embedding?: number[]
  created_at: string
}

export interface HybridChunkHit {
  chunk: LocalVectorChunk
  vectorScore: number
  lexicalScore: number
  fusedScore: number
  matchType: 'semantic_vector' | 'document_text' | 'ocr_text'
}

const DATA_DIR = path.join(process.cwd(), 'data')
const VECTORS_FILE = path.join(DATA_DIR, 'local_vectors.json')

function readVectors(): LocalVectorChunk[] {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(VECTORS_FILE)) {
    fs.writeFileSync(VECTORS_FILE, JSON.stringify([], null, 2))
    return []
  }
  try {
    return JSON.parse(fs.readFileSync(VECTORS_FILE, 'utf-8')) as LocalVectorChunk[]
  } catch {
    return []
  }
}

function writeVectors(chunks: LocalVectorChunk[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(VECTORS_FILE, JSON.stringify(chunks, null, 2))
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom > 0 ? dot / denom : 0
}

export function upsertLocalVectorChunks(input: {
  userId: string
  fileId: string
  filename: string
  category: string
  chunks: Array<{
    content: string
    tokenCount: number
    heading?: string
    pageNumber?: number
    embedding?: number[]
  }>
}): number {
  const existing = readVectors().filter((c) => c.file_id !== input.fileId)
  const now = new Date().toISOString()

  const records: LocalVectorChunk[] = input.chunks
    .filter((c) => c.content && c.content.trim().length > 0)
    .map((c, idx) => ({
      id: crypto.randomUUID(),
      file_id: input.fileId,
      user_id: input.userId,
      filename: input.filename,
      category: input.category,
      heading: c.heading || `Section ${idx + 1}`,
      page_number: c.pageNumber || 1,
      content: c.content,
      token_count: c.tokenCount || Math.ceil(c.content.length / 4),
      embedding: c.embedding,
      created_at: now,
    }))

  writeVectors([...records, ...existing])
  return records.length
}

export function removeLocalVectorChunks(fileIds: string[], userId?: string): void {
  const idSet = new Set(fileIds)
  const remaining = readVectors().filter((c) => {
    if (!idSet.has(c.file_id)) return true
    if (userId && c.user_id !== userId) return true
    return false
  })
  writeVectors(remaining)
}

export function purgeUserVectorChunks(userId: string): void {
  const remaining = readVectors().filter((c) => c.user_id !== userId)
  writeVectors(remaining)
}

export function hasUserVectorEmbeddings(userId: string, activeFileIds?: Set<string>): boolean {
  return readVectors().some(
    (c) =>
      c.user_id === userId &&
      (!activeFileIds || activeFileIds.has(c.file_id)) &&
      Array.isArray(c.embedding) &&
      c.embedding.length > 0
  )
}

/**
 * Computes hybrid chunk ranking combining dense cosine similarity + lexical token alignment
 * with Reciprocal Rank Fusion (RRF) and MMR-style per-file diversity.
 */
export function hybridSearchLocalChunks(params: {
  userId: string
  activeFileIds: Set<string>
  query: string
  queryEmbedding?: number[] | null
  selectedFileIds?: string[]
  category?: string
  limit?: number
}): HybridChunkHit[] {
  const limit = params.limit ?? 12
  const selectedSet =
    params.selectedFileIds && params.selectedFileIds.length > 0
      ? new Set(params.selectedFileIds)
      : null

  const candidates = readVectors().filter((chunk) => {
    if (chunk.user_id !== params.userId) return false
    if (!params.activeFileIds.has(chunk.file_id)) return false
    if (selectedSet && !selectedSet.has(chunk.file_id)) return false
    if (params.category && params.category !== 'all' && chunk.category !== params.category) {
      return false
    }
    return true
  })

  if (candidates.length === 0) return []

  const { tokens, cleanPhrase } = parseQueryIntent(params.query)
  const queryEmb = params.queryEmbedding

  const vectorScored = candidates.map((chunk) => {
    const vec =
      queryEmb && chunk.embedding && chunk.embedding.length === queryEmb.length
        ? Math.max(0, cosineSimilarity(queryEmb, chunk.embedding))
        : 0

    const lower = `${chunk.filename} ${chunk.heading} ${chunk.content}`.toLowerCase()
    const words = new Set(lower.split(/[^\p{L}\p{M}\p{N}]+/gu).filter(Boolean))

    let lex = 0
    if (cleanPhrase && cleanPhrase.length >= 3 && lower.includes(cleanPhrase)) {
      lex += 0.65
    }
    if (tokens.length > 0) {
      let matched = 0
      for (const tok of tokens) {
        if (
          words.has(tok) ||
          (tok.length >= 4 && Array.from(words).some((w) => w.startsWith(tok)))
        ) {
          matched++
        }
      }
      lex += (matched / tokens.length) * 0.55
    }

    return {
      chunk,
      vectorScore: vec,
      lexicalScore: Math.min(1, lex),
    }
  })

  // Vector rank & lexical rank for Reciprocal Rank Fusion
  const byVec = [...vectorScored]
    .filter((x) => x.vectorScore >= 0.28)
    .sort((a, b) => b.vectorScore - a.vectorScore)
  const byLex = [...vectorScored]
    .filter((x) => x.lexicalScore > 0.12)
    .sort((a, b) => b.lexicalScore - a.lexicalScore)

  const rankMap = new Map<string, { item: typeof vectorScored[number]; rrf: number }>()
  const k = 60

  byVec.forEach((entry, rank) => {
    const prev = rankMap.get(entry.chunk.id) || { item: entry, rrf: 0 }
    prev.rrf += 1.2 / (k + rank + 1)
    rankMap.set(entry.chunk.id, prev)
  })

  byLex.forEach((entry, rank) => {
    const prev = rankMap.get(entry.chunk.id) || { item: entry, rrf: 0 }
    prev.rrf += 1.0 / (k + rank + 1)
    rankMap.set(entry.chunk.id, prev)
  })

  const ranked = Array.from(rankMap.values()).sort((a, b) => {
    if (b.rrf !== a.rrf) return b.rrf - a.rrf
    return b.item.vectorScore + b.item.lexicalScore - (a.item.vectorScore + a.item.lexicalScore)
  })

  // MMR-style diversity: limit chunks from a single file unless fewer files matched
  const perFileCount = new Map<string, number>()
  const selected: HybridChunkHit[] = []

  for (const { item, rrf } of ranked) {
    const current = perFileCount.get(item.chunk.file_id) || 0
    if (current >= 3) continue
    perFileCount.set(item.chunk.file_id, current + 1)

    const matchType: HybridChunkHit['matchType'] =
      item.vectorScore >= 0.35 && item.vectorScore >= item.lexicalScore
        ? 'semantic_vector'
        : item.chunk.category === 'screenshots'
          ? 'ocr_text'
          : 'document_text'

    selected.push({
      chunk: item.chunk,
      vectorScore: item.vectorScore,
      lexicalScore: item.lexicalScore,
      fusedScore: Math.min(0.99, Math.max(item.vectorScore, item.lexicalScore, rrf * 22)),
      matchType,
    })

    if (selected.length >= limit) break
  }

  return selected
}
