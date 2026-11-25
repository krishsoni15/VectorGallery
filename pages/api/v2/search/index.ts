import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, isServiceRoleConfigured } from '@/lib/supabase'
import { generateEmbedding, isProviderAvailable, EMBEDDING_PROVIDERS } from '@/lib/providers'
import { getLocalFiles } from '@/lib/localMetadataStore'
import { rankFilesByRelevance } from '@/lib/search/smartMatcher'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getServerUser(req)
    if (isServiceRoleConfigured() && !user) {
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

    const queryString = (q as string || '').trim()
    const cleanQuery = queryString.replace(/[,()]/g, ' ').trim()
    const pageSize = Math.min(parseInt(limit as string, 10) || 20, 50)

    if (!queryString || !cleanQuery) {
      return res.status(200).json({ results: [], query: '' })
    }

    if (!isServiceRoleConfigured()) {
      let localFiles = getLocalFiles().filter(f => !f.is_trashed)
      if (category && category !== 'all') {
        localFiles = localFiles.filter(f => f.category?.toLowerCase() === (category as string).toLowerCase())
      }
      const rankedMatches = rankFilesByRelevance(localFiles, queryString, pageSize)
      const results = rankedMatches.map(r => ({
        id: r.file.id,
        original_name: r.file.original_name,
        category: r.file.category,
        mime_type: r.file.mime_type,
        size_bytes: r.file.size_bytes,
        created_at: r.file.created_at,
        thumbnail_url: r.file.thumbnail_url,
        match_source: r.matchType,
        excerpt: r.snippet,
        score: Math.min(1.0, r.score / 100),
      }))
      return res.status(200).json({ results, query: queryString, total: results.length })
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

      // Match filename or extracted text (OCR / document text)
      fileQuery = fileQuery.or(
        `original_name.ilike.%${cleanQuery}%,extracted_text.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`
      ).limit(pageSize)

      const { data: matchedFiles } = await fileQuery

      for (const file of matchedFiles || []) {
        if (!seenFileIds.has(file.id)) {
          seenFileIds.add(file.id)

          // Find matching snippet
          let snippet = file.extracted_text ? file.extracted_text.slice(0, 180) : ''
          let matchType = 'filename'

          if (file.extracted_text && file.extracted_text.toLowerCase().includes(queryString.toLowerCase())) {
            const idx = file.extracted_text.toLowerCase().indexOf(queryString.toLowerCase())
            const start = Math.max(0, idx - 40)
            const end = Math.min(file.extracted_text.length, idx + queryString.length + 80)
            snippet = `...${file.extracted_text.slice(start, end)}...`
            matchType = file.category === 'screenshots' ? 'ocr_text' : 'document_text'
          }

          results.push({
            file_id: file.id,
            file_name: file.original_name,
            mime_type: file.mime_type,
            category: file.category,
            size_bytes: file.size_bytes,
            thumbnail_url: file.thumbnail_url,
            storage_key: file.storage_key,
            snippet: snippet || `Matched query "${queryString}"`,
            match_type: matchType,
            relevance_score: 0.92,
            why_matched: matchType === 'ocr_text' ? 'OCR text match in screenshot' : matchType === 'document_text' ? 'Content match in document' : 'Filename match',
            created_at: file.created_at,
          })
        }
      }
    } catch (e: any) {
      console.warn('[Search V2 API] Keyword query notice:', e.message)
    }

    // ─── 2. Optional Semantic / Vector Search if AI key configured ───
    const geminiConfig = EMBEDDING_PROVIDERS.gemini
    if (isProviderAvailable(geminiConfig.keyEnv) && results.length < pageSize) {
      try {
        const queryEmbedding = await generateEmbedding(queryString, 'gemini', 'query')
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
            const { data: pages } = await supabase.from('nods_page').select('id, path, meta').in('id', pageIds)
            const pageMap = new Map<number, any>()
            pages?.forEach((p: any) => pageMap.set(p.id, p))

            for (const hit of vectorHits) {
              const page = pageMap.get(hit.page_id)
              const fileName = page?.meta?.filename || page?.path || 'Document'
              const fileId = page?.meta?.fileId || `page_${hit.page_id}`

              if (!seenFileIds.has(fileId)) {
                seenFileIds.add(fileId)
                results.push({
                  file_id: fileId,
                  file_name: fileName,
                  mime_type: 'application/pdf',
                  category: 'documents',
                  size_bytes: page?.meta?.size || 0,
                  thumbnail_url: page?.meta?.storageUrl || null,
                  snippet: hit.content ? hit.content.slice(0, 180) : '',
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

