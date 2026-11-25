/**
 * VectorGallery — File Ingestion & Intelligence Pipeline
 * Coordinates: Validation → Deduplication → Storage → Parsing → Embedding → Indexing
 */

import crypto from 'crypto'
import { getAdminSupabase, isServiceRoleConfigured } from '../supabase'
import { getStorageDriver } from '../storage'
import { parseDocument } from './documentParser'
import { generateEmbeddingsBatch, isProviderAvailable, EMBEDDING_PROVIDERS, type EmbeddingProviderId } from '../providers'
import { ProcessingStatus } from './types'
import { saveLocalFile, findLocalFileByHash } from '../localMetadataStore'

export interface ProcessFileInput {
  filename: string
  buffer: Buffer
  mimeType: string
  userId: string
  folderId?: string | null
  embeddingProvider?: EmbeddingProviderId
}

export interface ProcessFileResult {
  fileId: string
  isDuplicate: boolean
  filename: string
  category: string
  sizeBytes: number
  status: ProcessingStatus
  sha256: string
  storageUrl: string
  chunksIndexed: number
}

export async function processFile(input: ProcessFileInput): Promise<ProcessFileResult> {
  const { filename, buffer, mimeType, userId, folderId, embeddingProvider = 'gemini' } = input
  const supabase = getAdminSupabase()
  const storage = getStorageDriver()

  // 1. Validation & SHA-256 Computation
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
  const sizeBytes = buffer.length

  // 2. Duplicate Detection
  // Check if identical file already exists for this user
  if (isServiceRoleConfigured()) {
    try {
      const { data: existing } = await supabase
        .from('files')
        .select('id, original_name, category, size_bytes, processing_status, sha256_hash')
        .eq('user_id', userId)
        .eq('sha256_hash', sha256)
        .eq('is_trashed', false)
        .maybeSingle()

      if (existing) {
        const publicUrl = storage.getPublicUrl(`${userId}/${sha256}_${filename}`)
        return {
          fileId: existing.id,
          isDuplicate: true,
          filename: existing.original_name,
          category: existing.category,
          sizeBytes: existing.size_bytes,
          status: 'READY',
          sha256,
          storageUrl: publicUrl,
          chunksIndexed: 0,
        }
      }
    } catch (e) {
      console.warn('[Pipeline] Duplicate check notice:', e)
    }
  } else {
    const existing = findLocalFileByHash(sha256)
    if (existing) {
      return {
        fileId: existing.id,
        isDuplicate: true,
        filename: existing.original_name,
        category: existing.category,
        sizeBytes: existing.size_bytes,
        status: 'READY',
        sha256,
        storageUrl: existing.thumbnail_url,
        chunksIndexed: 0,
      }
    }
  }

  // 3. Storage Upload
  const storageKey = `${userId}/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const uploadResult = await storage.upload(storageKey, buffer, {
    contentType: mimeType,
    upsert: true,
  })

  // 4. Extraction & Parsing
  const parsed = await parseDocument(filename, buffer, mimeType)
  const category = parsed.metadata.category

  // 5. Database Record Creation
  let fileId = crypto.randomUUID()
  if (isServiceRoleConfigured()) {
    try {
      const { data: fileRow, error: insertError } = await supabase
        .from('files')
        .insert({
          id: fileId,
          user_id: userId,
          folder_id: folderId || null,
          original_name: filename,
          sanitized_name: filename.replace(/[^a-zA-Z0-9.-]/g, '_'),
          mime_type: mimeType,
          category,
          size_bytes: sizeBytes,
          storage_key: uploadResult.key,
          storage_provider: process.env.STORAGE_PROVIDER || 'local',
          sha256_hash: sha256,
          thumbnail_url: uploadResult.url,
          extracted_text: parsed.rawText.slice(0, 10000), // First 10k chars for fast FTS
          processing_status: 'EXTRACTING',
          indexing_status: 'PENDING',
          metadata: parsed.metadata,
        })
        .select()
        .single()

      if (!insertError && fileRow) {
        fileId = fileRow.id
      }
    } catch (e) {
      console.warn('[Pipeline] File row insert notice:', e)
    }
  } else {
    saveLocalFile({
      id: fileId,
      user_id: userId,
      folder_id: folderId || null,
      original_name: filename,
      sanitized_name: filename.replace(/[^a-zA-Z0-9.-]/g, '_'),
      mime_type: mimeType,
      category,
      size_bytes: sizeBytes,
      storage_key: uploadResult.key,
      storage_provider: 'local',
      sha256_hash: sha256,
      thumbnail_url: uploadResult.url,
      extracted_text: parsed.rawText.slice(0, 10000),
      processing_status: 'READY',
      indexing_status: 'COMPLETED',
      is_favorite: false,
      is_trashed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: parsed.metadata,
    })
  }

  // 6. Vector Embeddings (if chunks exist and provider key is available)
  let chunksIndexed = 0
  const chunksToEmbed = parsed.chunks.filter(c => c.content.trim().length > 0)

  if (chunksToEmbed.length > 0) {
    const config = EMBEDDING_PROVIDERS[embeddingProvider]
    const hasKey = config && isProviderAvailable(config.keyEnv)

    if (hasKey) {
      try {
        const texts = chunksToEmbed.map(c => c.content)
        const embeddings = await generateEmbeddingsBatch(texts, embeddingProvider, 'document')

        if (isServiceRoleConfigured()) {
          // Backward-compatible entry in nods_page and nods_page_section
          const { data: page } = await supabase
            .from('nods_page')
            .insert({
              project_id: '00000000-0000-0000-0000-000000000001',
              user_id: userId,
              path: filename,
              checksum: sha256,
              meta: { filename, size: sizeBytes, storageUrl: uploadResult.url, fileId },
              type: category,
            })
            .select()
            .single()

          if (page) {
            const sections = chunksToEmbed.map((chunk, i) => ({
              page_id: page.id,
              content: chunk.content,
              embedding: embeddings[i],
              token_count: chunk.tokenCount,
              heading_context: chunk.heading,
              page_number: chunk.pageNumber,
              chunk_level: 1,
            }))

            await supabase.from('nods_page_section').insert(sections)
            chunksIndexed = sections.length
          }
        }
      } catch (embErr: any) {
        console.warn('[Pipeline] Embedding generation skipped/failed (falling back to keyword search):', embErr.message)
      }
    }
  }

  // 7. Update status to READY & increment storage stats
  if (isServiceRoleConfigured()) {
    try {
      await supabase
        .from('files')
        .update({
          processing_status: 'READY',
          indexing_status: chunksIndexed > 0 ? 'INDEXED' : 'SKIPPED',
        })
        .eq('id', fileId)

      // Auto-tag file
      if (parsed.metadata.tags.length > 0) {
        for (const tag of parsed.metadata.tags) {
          const { data: tagRow } = await supabase
            .from('tags')
            .upsert({ user_id: userId, name: tag, source: 'ai' }, { onConflict: 'user_id,name' })
            .select()
            .single()

          if (tagRow) {
            await supabase.from('file_tags').upsert({ file_id: fileId, tag_id: tagRow.id })
          }
        }
      }
    } catch (e) {
      console.warn('[Pipeline] Status update notice:', e)
    }
  }

  return {
    fileId,
    isDuplicate: false,
    filename,
    category,
    sizeBytes,
    status: 'READY',
    sha256,
    storageUrl: uploadResult.url,
    chunksIndexed,
  }
}

