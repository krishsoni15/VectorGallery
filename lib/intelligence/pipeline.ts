/**
 * VectorGallery — File Ingestion & Intelligence Pipeline
 * Coordinates: Validation → Deduplication → Storage → Parsing → Embedding → Indexing
 */

import crypto from 'crypto'
import { getAdminSupabase, isServiceRoleConfigured } from '../supabase'
import { getStorageDriver } from '../storage'
import { parseDocument } from './documentParser'
import { generateEmbeddingsBatch, isProviderAvailable, EMBEDDING_PROVIDERS, type EmbeddingProviderId } from '../providers'
import { getProviderCredential } from '../credentialResolver'
import { ProcessingStatus } from './types'
import { saveLocalFile, findLocalFileByHash, updateLocalFile } from '../localMetadataStore'
import { upsertLocalVectorChunks } from '../localVectorStore'

export interface ProcessFileInput {
  filename: string
  buffer?: Buffer
  storageKey?: string
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
  const { filename, mimeType, userId, folderId, embeddingProvider = 'gemini' } = input
  const supabase = getAdminSupabase()
  const storage = getStorageDriver()
  const resolvedProvider = (process.env.STORAGE_DRIVER || process.env.STORAGE_PROVIDER || (isServiceRoleConfigured() ? 'supabase' : 'local')).toLowerCase() === 'local'
    ? 'local'
    : 'supabase'

  let buffer: Buffer
  const preUploadedKey = input.storageKey
  if (input.buffer) {
    buffer = input.buffer
  } else if (preUploadedKey) {
    buffer = await storage.download(preUploadedKey)
  } else {
    throw new Error('File payload or storageKey is required')
  }

  // 1. Validation & SHA-256 Computation
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
  const sizeBytes = buffer.length

  // 2. Duplicate Detection scoped strictly per userId
  if (isServiceRoleConfigured()) {
    const { data: existing, error: dupErr } = await supabase
      .from('files')
      .select('id, original_name, category, size_bytes, processing_status, sha256_hash, thumbnail_url, storage_key')
      .eq('user_id', userId)
      .eq('sha256_hash', sha256)
      .eq('is_trashed', false)
      .maybeSingle()

    if (dupErr) {
      if (preUploadedKey) {
        await storage.delete(preUploadedKey).catch(() => {})
      }
      if (dupErr.code === 'PGRST205' || dupErr.code === '42501') {
        throw new Error(
          'Database schema or table permissions are not initialized in Supabase. Run the latest supabase/SETUP_ALL_IN_ONE.sql in your Supabase SQL Editor.'
        )
      }
      throw new Error(`Database error while checking files: ${dupErr.message}`)
    }

    if (existing) {
      if (preUploadedKey && preUploadedKey !== existing.storage_key) {
        await storage.delete(preUploadedKey).catch(() => {})
      }
      const signedExistingUrl =
        resolvedProvider === 'supabase' && existing.storage_key
          ? await storage.getSignedUrl(existing.storage_key, 3600).catch(() => existing.thumbnail_url || '')
          : existing.thumbnail_url || storage.getPublicUrl(existing.storage_key)
      return {
        fileId: existing.id,
        isDuplicate: true,
        filename: existing.original_name,
        category: existing.category,
        sizeBytes: existing.size_bytes,
        status: 'READY',
        sha256,
        storageUrl: signedExistingUrl,
        chunksIndexed: 0,
      }
    }
  } else {
    const existing = findLocalFileByHash(sha256, userId)
    if (existing) {
      if (preUploadedKey && preUploadedKey !== existing.storage_key) {
        await storage.delete(preUploadedKey).catch(() => {})
      }
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

  // 3. Storage Upload (or bind pre-uploaded direct storage key)
  let uploadResult: { path: string; key: string; url: string; sizeBytes: number }
  if (preUploadedKey) {
    const url =
      resolvedProvider === 'supabase'
        ? await storage.getSignedUrl(preUploadedKey, 3600)
        : storage.getPublicUrl(preUploadedKey)
    uploadResult = { path: preUploadedKey, key: preUploadedKey, url, sizeBytes }
  } else {
    const storageKey = `${userId}/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    uploadResult = await storage.upload(storageKey, buffer, {
      contentType: mimeType,
      upsert: true,
    })
  }

  // Resolve user's OCR & embedding credentials
  const userGeminiKey = await getProviderCredential({ userId, provider: 'gemini' })
  const userEmbedKey = await getProviderCredential({ userId, provider: embeddingProvider })

  // 4. Extraction & Parsing
  const parsed = await parseDocument(filename, buffer, mimeType, {
    geminiApiKey: userGeminiKey,
  })
  const category = parsed.metadata.category

  // 5. Database Record Creation
  let fileId = crypto.randomUUID()
  if (isServiceRoleConfigured()) {
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
        storage_provider: resolvedProvider,
        sha256_hash: sha256,
        thumbnail_url: uploadResult.url,
        extracted_text: parsed.rawText.slice(0, 10000),
        processing_status: 'EXTRACTING',
        indexing_status: 'PENDING',
        metadata: parsed.metadata,
      })
      .select()
      .single()

    if (insertError) {
      await storage.delete(uploadResult.key).catch(() => {})
      if (insertError.code === 'PGRST205' || insertError.code === '42501') {
        throw new Error(
          'Database schema or table permissions are not initialized in Supabase. Run the latest supabase/SETUP_ALL_IN_ONE.sql in your Supabase SQL Editor.'
        )
      }
      throw new Error(`Database record creation failed: ${insertError.message}`)
    }

    if (fileRow) {
      fileId = fileRow.id
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
      extracted_text: parsed.rawText.slice(0, 20000),
      processing_status: 'READY',
      indexing_status: 'PENDING',
      is_favorite: false,
      is_trashed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: parsed.metadata,
    })
  }

  // 6. Vector Embeddings & Chunk Indexing (Cloud & Local)
  let chunksIndexed = 0
  const chunksToEmbed = parsed.chunks.filter((c) => c.content.trim().length > 0)

  if (chunksToEmbed.length > 0) {
    const config = EMBEDDING_PROVIDERS[embeddingProvider]
    const hasKey = Boolean(userEmbedKey) || (config && isProviderAvailable(config.keyEnv))
    let embeddings: number[][] | null = null

    if (hasKey) {
      try {
        const texts = chunksToEmbed.map((c) => c.content)
        embeddings = await generateEmbeddingsBatch(
          texts,
          embeddingProvider,
          'document',
          0,
          userEmbedKey
        )
      } catch (embErr: any) {
        console.warn('[Pipeline] Embedding generation skipped/failed (continuing with lexical chunks):', embErr.message)
      }
    }

    if (isServiceRoleConfigured() && embeddings) {
      try {
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
            embedding: embeddings![i],
            token_count: chunk.tokenCount,
            heading_context: chunk.heading,
            page_number: chunk.pageNumber,
            chunk_level: 1,
          }))

          await supabase.from('nods_page_section').insert(sections)
          chunksIndexed = sections.length
        }
      } catch (dbErr: any) {
        console.warn('[Pipeline] Supabase chunk indexing failed:', dbErr.message)
      }
    } else if (!isServiceRoleConfigured()) {
      chunksIndexed = upsertLocalVectorChunks({
        userId,
        fileId,
        filename,
        category,
        chunks: chunksToEmbed.map((chunk, i) => ({
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          heading: chunk.heading,
          pageNumber: chunk.pageNumber,
          embedding: embeddings?.[i],
        })),
      })
      updateLocalFile(
        fileId,
        {
          indexing_status: embeddings ? 'INDEXED' : 'COMPLETED',
        },
        userId
      )
    }
  } else if (!isServiceRoleConfigured()) {
    updateLocalFile(fileId, { indexing_status: 'COMPLETED' }, userId)
  }

  // 7. Update status to READY & auto-tag in Supabase mode
  if (isServiceRoleConfigured()) {
    try {
      await supabase
        .from('files')
        .update({
          processing_status: 'READY',
          indexing_status: chunksIndexed > 0 ? 'INDEXED' : 'SKIPPED',
        })
        .eq('id', fileId)

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
