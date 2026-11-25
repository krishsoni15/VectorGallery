/**
 * VectorGallery — Asynchronous Intelligence & Ingestion Worker
 * Processes queued files, document parsing, OCR, and embeddings outside serverless limits.
 */

import { getAdminSupabase, isServiceRoleConfigured } from '../lib/supabase'
import { getStorageDriver } from '../lib/storage'
import { parseDocument } from '../lib/intelligence/documentParser'
import { generateEmbeddingsBatch, isProviderAvailable, EMBEDDING_PROVIDERS } from '../lib/providers'

let isRunning = true

export async function processPendingFiles(): Promise<number> {
  if (!isServiceRoleConfigured()) {
    return 0
  }

  const supabase = getAdminSupabase()
  const storage = getStorageDriver()

  // 1. Fetch pending or validating files
  const { data: pendingFiles, error } = await supabase
    .from('files')
    .select('*')
    .in('processing_status', ['PENDING', 'VALIDATING'])
    .order('created_at', { ascending: true })
    .limit(5)

  if (error || !pendingFiles || pendingFiles.length === 0) {
    return 0
  }

  console.log(`[Worker] Found ${pendingFiles.length} file(s) awaiting processing`)

  for (const file of pendingFiles) {
    try {
      // Mark as EXTRACTING
      await supabase
        .from('files')
        .update({ processing_status: 'EXTRACTING', updated_at: new Date().toISOString() })
        .eq('id', file.id)

      // Download binary from storage
      const buffer = await storage.download(file.storage_key)

      // Extract document text / OCR
      const parsed = await parseDocument(file.original_name, buffer, file.mime_type)

      // Update extracted text and metadata
      await supabase
        .from('files')
        .update({
          extracted_text: parsed.rawText,
          category: parsed.metadata.category || file.category,
          processing_status: 'GENERATING_METADATA',
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id)

      // Optional Embeddings if provider key is configured
      let indexingStatus = 'SKIPPED'
      const geminiConfig = EMBEDDING_PROVIDERS.gemini
      if (isProviderAvailable(geminiConfig.keyEnv) && parsed.chunks.length > 0) {
        try {
          await supabase
            .from('files')
            .update({ processing_status: 'GENERATING_EMBEDDINGS' })
            .eq('id', file.id)

          const chunkTexts = parsed.chunks.map(c => c.content)
          const embeddings = await generateEmbeddingsBatch(chunkTexts, 'gemini', 'document')
          if (embeddings && embeddings.length > 0) {
            indexingStatus = 'INDEXED'
          }
        } catch (embedErr) {
          console.warn(`[Worker] Embeddings skipped for ${file.original_name}:`, embedErr)
        }
      }

      // Mark file READY
      await supabase
        .from('files')
        .update({
          processing_status: 'READY',
          indexing_status: indexingStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id)

      console.log(`[Worker] Successfully processed file: ${file.original_name} (${file.id})`)
    } catch (err: any) {
      console.error(`[Worker] Failed processing ${file.original_name}:`, err.message)
      await supabase
        .from('files')
        .update({
          processing_status: 'FAILED',
          processing_error: err.message || 'Worker extraction failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id)
    }
  }

  return pendingFiles.length
}

export async function startWorker() {
  console.log('====================================================')
  console.log('VectorGallery Background Processing Worker Started')
  console.log(`Database connected: ${isServiceRoleConfigured()}`)
  console.log('====================================================')

  const loop = async () => {
    if (!isRunning) return
    try {
      await processPendingFiles()
    } catch (err) {
      console.error('[Worker] Loop error:', err)
    }
    if (isRunning) {
      setTimeout(loop, 5000)
    }
  }

  loop()
}

// Handle termination signals
process.on('SIGINT', () => {
  console.log('\n[Worker] Stopping gracefully on SIGINT...')
  isRunning = false
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n[Worker] Stopping gracefully on SIGTERM...')
  isRunning = false
  process.exit(0)
})

// Auto-start if invoked directly
if (require.main === module) {
  startWorker()
}
