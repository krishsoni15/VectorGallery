import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import { generateEmbedding, isProviderAvailable, EMBEDDING_PROVIDERS } from '@/lib/providers'
import { getProviderCredential } from '@/lib/credentialResolver'
import { getLocalFiles } from '@/lib/localMetadataStore'
import { hasUserVectorEmbeddings, hybridSearchLocalChunks } from '@/lib/localVectorStore'
import { rankFilesByRelevance } from '@/lib/search/smartMatcher'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    const {
      q,
      category,
      from_date,
      to_date,
      limit = '20',
    } = req.query

    const queryString = ((q as string) || '').trim()
    const cleanQuery = queryString.replace(/[,()]/g, ' ').trim()
    const pageSize = Math.min(parseInt(limit as string, 10) || 20, 50)

    if (!queryString || !cleanQuery) {
      return res.status(200).json({ results: [], query: '', count: 0 })
    }

    if (!isServiceRoleConfigured()) {
      let localFiles = getLocalFiles(userId).filter((f) => !f.is_trashed)

      if (category && category !== 'all') {
        const targetCat = (category as string).toLowerCase()
        localFiles = localFiles.filter((f) => {
          const fc = (f.category || '').toLowerCase()
          return targetCat === 'photos' ? fc === 'photos' || fc === 'screenshots' : fc === targetCat
        })
      }

      if (from_date && typeof from_date === 'string') {
        const fromTs = new Date(from_date).getTime()
        if (!Number.isNaN(fromTs)) {
          localFiles = localFiles.filter((f) => new Date(f.created_at).getTime() >= fromTs)
        }
      }

      if (to_date && typeof to_date === 'string') {
        const toTs = new Date(to_date).getTime()
        if (!Number.isNaN(toTs)) {
          localFiles = localFiles.filter((f) => new Date(f.created_at).getTime() <= toTs)
        }
      }

      if (localFiles.length === 0) {
        return res.status(200).json({ results: [], query: queryString, count: 0, total: 0 })
      }

      const fileById = new Map(localFiles.map((f) => [f.id, f]))
      const activeFileIds = new Set(localFiles.map((f) => f.id))

      // Only invoke query embedding API when user actually has stored vector chunks
      let queryEmbedding: number[] | null = null
      if (hasUserVectorEmbeddings(userId, activeFileIds)) {
        const embedKey = await getProviderCredential({ userId, provider: 'gemini' })
        if (embedKey) {
          try {
            queryEmbedding = await generateEmbedding(queryString, 'gemini', 'query', 0, embedKey)
          } catch {
            queryEmbedding = null
          }
        }
      }

      const chunkHits = hybridSearchLocalChunks({
        userId,
        activeFileIds,
        query: queryString,
        queryEmbedding,
        category: typeof category === 'string' ? category : undefined,
        limit: pageSize * 2,
      })

      const fileMatches = rankFilesByRelevance(localFiles, queryString, pageSize)

      // Fuse chunk-level hybrid hits + file-level lexical/intent hits by file_id
      const combined = new Map<string, any>()

      for (const hit of chunkHits) {
        const file = fileById.get(hit.chunk.file_id)
        if (!file) continue
        const existing = combined.get(file.id)
        const whyMatched =
          hit.matchType === 'semantic_vector'
            ? 'Semantic vector match'
            : hit.matchType === 'ocr_text'
              ? 'OCR text match'
              : `Matched in ${hit.chunk.heading || 'document'}`

        if (!existing || hit.fusedScore > existing.relevance_score) {
          combined.set(file.id, {
            file_id: file.id,
            id: file.id,
            file_name: file.original_name,
            original_name: file.original_name,
            mime_type: file.mime_type,
            category: file.category,
            size_bytes: file.size_bytes,
            thumbnail_url: file.thumbnail_url,
            storage_key: file.storage_key,
            snippet: hit.chunk.content.slice(0, 260),
            excerpt: hit.chunk.content.slice(0, 260),
            match_type: hit.matchType,
            match_source: hit.matchType,
            relevance_score: Number(hit.fusedScore.toFixed(2)),
            score: Number(hit.fusedScore.toFixed(2)),
            why_matched: whyMatched,
            created_at: file.created_at,
          })
        }
      }

      for (const r of fileMatches) {
        const normScore = Math.min(0.99, Math.max(0.35, r.score / 120))
        const existing = combined.get(r.file.id)
        const whyMatched =
          r.matchType === 'EXACT_PHRASE'
            ? 'Exact phrase match'
            : r.matchType === 'CATEGORY_RECENCY'
              ? 'Category & visual match'
              : r.file.category === 'screenshots'
                ? 'OCR & metadata match'
                : 'Filename & keyword match'

        if (!existing) {
          combined.set(r.file.id, {
            file_id: r.file.id,
            id: r.file.id,
            file_name: r.file.original_name,
            original_name: r.file.original_name,
            mime_type: r.file.mime_type,
            category: r.file.category,
            size_bytes: r.file.size_bytes,
            thumbnail_url: r.file.thumbnail_url,
            storage_key: r.file.storage_key,
            snippet: r.snippet || r.file.original_name,
            excerpt: r.snippet || r.file.original_name,
            match_type: r.matchType,
            match_source: r.matchType,
            relevance_score: Number(normScore.toFixed(2)),
            score: Number(normScore.toFixed(2)),
            why_matched: whyMatched,
            created_at: r.file.created_at,
          })
        } else if (r.matchType === 'EXACT_PHRASE') {
          existing.relevance_score = Number(Math.max(existing.relevance_score, normScore).toFixed(2))
          existing.score = existing.relevance_score
        }
      }

      const finalResults = Array.from(combined.values())
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, pageSize)

      return res.status(200).json({
        results: finalResults,
        query: queryString,
        count: finalResults.length,
        total: finalResults.length,
      })
    }

    const supabase = getAdminSupabase()
    const results: any[] = []
    const seenFileIds = new Set<string>()

    // ─── 1. Keyword & Full-Text Search across `files` ───
    try {
      let fileQuery = supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .eq('is_trashed', false)

      if (category && category !== 'all') {
        fileQuery = fileQuery.eq('category', category)
      }

      if (from_date && typeof from_date === 'string') {
        fileQuery = fileQuery.gte('created_at', from_date)
      }

      if (to_date && typeof to_date === 'string') {
        fileQuery = fileQuery.lte('created_at', to_date)
      }

      fileQuery = fileQuery
        .or(`original_name.ilike.%${cleanQuery}%,extracted_text.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`)
        .limit(pageSize)

      const { data: matchedFiles } = await fileQuery

      for (const file of matchedFiles || []) {
        if (!seenFileIds.has(file.id)) {
          seenFileIds.add(file.id)

          let snippet = file.extracted_text ? file.extracted_text.slice(0, 200) : ''
          let matchType = 'filename'

          if (file.extracted_text && file.extracted_text.toLowerCase().includes(queryString.toLowerCase())) {
            const idx = file.extracted_text.toLowerCase().indexOf(queryString.toLowerCase())
            const start = Math.max(0, idx - 40)
            const end = Math.min(file.extracted_text.length, idx + queryString.length + 120)
            snippet = `...${file.extracted_text.slice(start, end)}...`
            matchType = file.category === 'screenshots' ? 'ocr_text' : 'document_text'
          }

          results.push({
            file_id: file.id,
            id: file.id,
            file_name: file.original_name,
            original_name: file.original_name,
            mime_type: file.mime_type,
            category: file.category,
            size_bytes: file.size_bytes,
            thumbnail_url: file.thumbnail_url,
            storage_key: file.storage_key,
            snippet: snippet || `Matched query "${queryString}"`,
            excerpt: snippet || `Matched query "${queryString}"`,
            match_type: matchType,
            relevance_score: 0.92,
            why_matched:
              matchType === 'ocr_text'
                ? 'OCR text match in screenshot'
                : matchType === 'document_text'
                  ? 'Content match in document'
                  : 'Filename match',
            created_at: file.created_at,
          })
        }
      }
    } catch (e: any) {
      console.warn('[Search V2 API] Keyword query notice:', e.message)
    }

    // ─── 2. Optional Semantic / Vector Search scoped to user's pages ───
    const embedKey = await getProviderCredential({ userId, provider: 'gemini' })
    if ((embedKey || isProviderAvailable(EMBEDDING_PROVIDERS.gemini.keyEnv)) && results.length < pageSize) {
      try {
        const queryEmbedding = await generateEmbedding(queryString, 'gemini', 'query', 0, embedKey)
        if (queryEmbedding && queryEmbedding.length > 0) {
          const { data: vectorHits } = await supabase.rpc('hybrid_search', {
            query_embedding: queryEmbedding,
            query_text: queryString,
            p_project_id: '00000000-0000-0000-0000-000000000001',
            match_count: 10,
            similarity_threshold: 0.25,
          })

          if (vectorHits && vectorHits.length > 0) {
            const pageIds = Array.from(new Set(vectorHits.map((h: any) => h.page_id)))
            const { data: pages } = await supabase
              .from('nods_page')
              .select('id, path, meta, user_id')
              .in('id', pageIds)
              .eq('user_id', userId)

            const pageMap = new Map<number, any>()
            pages?.forEach((p: any) => pageMap.set(p.id, p))

            for (const hit of vectorHits) {
              const page = pageMap.get(hit.page_id)
              if (!page) continue
              const fileName = page?.meta?.filename || page?.path || 'Document'
              const fileId = page?.meta?.fileId || `page_${hit.page_id}`

              if (!seenFileIds.has(fileId)) {
                seenFileIds.add(fileId)
                results.push({
                  file_id: fileId,
                  id: fileId,
                  file_name: fileName,
                  original_name: fileName,
                  mime_type: 'application/pdf',
                  category: 'documents',
                  size_bytes: page?.meta?.size || 0,
                  thumbnail_url: page?.meta?.storageUrl || null,
                  snippet: hit.content ? hit.content.slice(0, 220) : '',
                  excerpt: hit.content ? hit.content.slice(0, 220) : '',
                  match_type: 'semantic_vector',
                  relevance_score: Number((hit.similarity || 0.75).toFixed(2)),
                  why_matched: 'Semantic vector similarity',
                  created_at: new Date().toISOString(),
                })
              }
            }
          }
        }
      } catch (vectorErr: any) {
        console.warn('[Search V2 API] Semantic vector search skipped:', vectorErr.message)
      }
    }

    return res.status(200).json({
      query: queryString,
      count: results.length,
      results: results.slice(0, pageSize),
    })
  } catch (err: any) {
    console.error('[Search V2 API] Error:', err)
    return res.status(500).json({ error: err.message || 'Search failed' })
  }
}
