import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, hasExplicitCredential, isServiceRoleConfigured } from '@/lib/supabase'
import {
  CHAT_PROVIDERS,
  EMBEDDING_PROVIDERS,
  generateEmbedding,
  isProviderAvailable,
  streamChatResponse,
  type ChatProviderId,
} from '@/lib/providers'
import { getProviderCredential } from '@/lib/credentialResolver'
import { calculateGroundingScore } from '@/lib/groundingScore'
import { getLocalFiles } from '@/lib/localMetadataStore'
import { appendLocalConversationMessage, getLocalConversation } from '@/lib/localAppStore'
import { hasUserVectorEmbeddings, hybridSearchLocalChunks } from '@/lib/localVectorStore'
import { rankFilesByRelevance } from '@/lib/search/smartMatcher'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sendEvent = (data: any) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`)
      if (typeof (res as any).flush === 'function') {
        (res as any).flush()
      }
    } catch {}
  }

  try {
    const user = await getServerUser(req)
    if ((isServiceRoleConfigured() || hasExplicitCredential(req)) && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    const { query, prompt, chatHistory, selectedFileIds, provider = 'gemini', conversationId } = req.body || {}
    const userQuery = ((query || prompt || '') as string).trim()

    if (!userQuery) {
      return res.status(400).json({ error: 'Query is required' })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')

    // Persist incoming user message scoped to user
    if (conversationId) {
      if (isServiceRoleConfigured()) {
        try {
          const supabase = getAdminSupabase()
          const { data: ownConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', conversationId)
            .eq('user_id', userId)
            .maybeSingle()

          if (ownConv) {
            await supabase.from('conversation_messages').insert({
              conversation_id: conversationId,
              role: 'user',
              content: userQuery,
            })
          }
        } catch (saveErr) {
          console.warn('[Chat V2 API] Failed to persist user message:', saveErr)
        }
      } else if (getLocalConversation(conversationId, userId)) {
        appendLocalConversationMessage(conversationId, userId, {
          role: 'user',
          content: userQuery,
        })
      }
    }

    // 1. Retrieve user-scoped files & hybrid chunks for grounded RAG context
    let contextDocs: Array<{
      file_id: string
      file_name: string
      snippet: string
      page?: number
      category?: string
      thumbnail_url?: string
      score?: number
    }> = []

    const selectedIdsFilter: string[] | undefined =
      Array.isArray(selectedFileIds) && selectedFileIds.length > 0
        ? selectedFileIds.map(String)
        : undefined

    if (isServiceRoleConfigured()) {
      try {
        const supabase = getAdminSupabase()
        let fileQuery = supabase
          .from('files')
          .select('id, original_name, extracted_text, category, thumbnail_url, metadata, created_at, is_trashed')
          .eq('user_id', userId)
          .eq('is_trashed', false)
          .order('created_at', { ascending: false })
          .limit(selectedIdsFilter ? 20 : 80)

        if (selectedIdsFilter) {
          fileQuery = fileQuery.in('id', selectedIdsFilter)
        }

        const { data: userFiles } = await fileQuery
        const candidates = userFiles || []

        // Combine Supabase hybrid_search vector chunks + relevant user files
        const embedKey = await getProviderCredential({ userId, provider: 'gemini' })
        if (embedKey || isProviderAvailable(EMBEDDING_PROVIDERS.gemini.keyEnv)) {
          try {
            const qEmb = await generateEmbedding(userQuery, 'gemini', 'query', 0, embedKey)
            const { data: vectorHits } = await supabase.rpc('hybrid_search', {
              query_embedding: qEmb,
              query_text: userQuery,
              p_project_id: '00000000-0000-0000-0000-000000000001',
              match_count: 10,
              similarity_threshold: 0.25,
            })

            if (vectorHits && vectorHits.length > 0) {
              const pageIds = Array.from(new Set(vectorHits.map((h: any) => h.page_id)))
              const { data: ownPages } = await supabase
                .from('nods_page')
                .select('id, path, meta')
                .in('id', pageIds)
                .eq('user_id', userId)

              const pageMap = new Map((ownPages || []).map((p: any) => [p.id, p]))
              for (const hit of vectorHits) {
                const p: any = pageMap.get(hit.page_id)
                if (!p) continue
                const fId = String(p.meta?.fileId || `page_${p.id}`)
                if (selectedIdsFilter && !selectedIdsFilter.includes(fId)) continue
                const fileMeta = candidates.find((c: any) => c.id === fId)
                contextDocs.push({
                  file_id: fId,
                  file_name: p.meta?.filename || p.path || 'Document',
                  category: fileMeta?.category,
                  thumbnail_url: fileMeta?.thumbnail_url || p.meta?.storageUrl,
                  snippet: (hit.content || '').slice(0, 2000),
                  page: hit.page_number || 1,
                  score: hit.similarity || 0.7,
                })
              }
            }
          } catch {}
        }

        if (selectedIdsFilter) {
          for (const f of candidates) {
            if (f.extracted_text?.trim() && !contextDocs.some((d) => d.file_id === f.id)) {
              contextDocs.push({
                file_id: f.id,
                file_name: f.original_name,
                category: f.category,
                thumbnail_url: f.thumbnail_url,
                snippet: f.extracted_text.slice(0, 4500),
                page: 1,
                score: 0.9,
              })
            }
          }
        } else if (contextDocs.length === 0 && candidates.length > 0) {
          const ranked = rankFilesByRelevance(candidates, userQuery, 8)
          const picks = ranked.length > 0 ? ranked.map((r) => r.file) : candidates.slice(0, 6)
          contextDocs = picks
            .filter((f: any) => f.extracted_text?.trim().length > 0)
            .map((f: any) => ({
              file_id: f.id,
              file_name: f.original_name,
              category: f.category,
              thumbnail_url: f.thumbnail_url,
              snippet: f.extracted_text.slice(0, 2200),
              page: 1,
              score: 0.75,
            }))
        }
      } catch (dbErr: any) {
        console.warn('[Chat V2 API] Context retrieval notice:', dbErr.message)
      }
    } else {
      let localFiles = getLocalFiles(userId).filter((f) => !f.is_trashed)
      if (selectedIdsFilter) {
        const selectedSet = new Set(selectedIdsFilter)
        localFiles = localFiles.filter((f) => selectedSet.has(f.id))
      }

      const fileById = new Map(localFiles.map((f) => [f.id, f]))
      const activeFileIds = new Set(localFiles.map((f) => f.id))

      // If specific file(s) are focused or a summary/overview of library is requested, surface full text slices cleanly
      if (selectedIdsFilter && localFiles.length > 0) {
        contextDocs = localFiles.map((f) => ({
          file_id: f.id,
          file_name: f.original_name,
          category: f.category,
          thumbnail_url: f.thumbnail_url,
          snippet: (f.extracted_text || f.metadata?.summary || f.original_name).slice(0, 4500),
          page: 1,
          score: 0.95,
        }))
      } else if (localFiles.length > 0) {
        // Run Hybrid Chunk RAG (vector cosine + lexical smartMatcher)
        let queryEmbedding: number[] | null = null
        if (hasUserVectorEmbeddings(userId, activeFileIds)) {
          const embedKey = await getProviderCredential({ userId, provider: 'gemini' })
          if (embedKey) {
            try {
              queryEmbedding = await generateEmbedding(userQuery, 'gemini', 'query', 0, embedKey)
            } catch {
              queryEmbedding = null
            }
          }
        }

        const chunkHits = hybridSearchLocalChunks({
          userId,
          activeFileIds,
          query: userQuery,
          queryEmbedding,
          selectedFileIds: selectedIdsFilter,
          limit: 10,
        })

        for (const hit of chunkHits) {
          const f = fileById.get(hit.chunk.file_id)
          if (!f) continue
          contextDocs.push({
            file_id: f.id,
            file_name: f.original_name,
            category: f.category,
            thumbnail_url: f.thumbnail_url,
            snippet: hit.chunk.content.slice(0, 2000),
            page: hit.chunk.page_number || 1,
            score: hit.fusedScore,
          })
        }

        // Supplement with file-level smartMatcher matches when chunk store is empty or query is broad
        const rankedMatches = rankFilesByRelevance(localFiles, userQuery, 8)
        for (const r of rankedMatches) {
          if (!contextDocs.some((d) => d.file_id === r.file.id)) {
            contextDocs.push({
              file_id: r.file.id,
              file_name: r.file.original_name,
              category: r.file.category,
              thumbnail_url: r.file.thumbnail_url,
              snippet: (r.file.extracted_text || r.file.metadata?.summary || r.file.original_name).slice(0, 2200),
              page: 1,
              score: Math.min(0.95, r.score / 120),
            })
          }
        }
      }
    }

    // 2. Group citations cleanly by unique file while passing all chunks as grounded context
    const uniqueCitationsMap = new Map<string, any>()
    contextDocs.forEach((doc) => {
      if (!uniqueCitationsMap.has(doc.file_id)) {
        uniqueCitationsMap.set(doc.file_id, {
          id: uniqueCitationsMap.size + 1,
          file_id: doc.file_id,
          file_name: doc.file_name,
          page: doc.page || 1,
          excerpt: doc.snippet.slice(0, 300),
          category: doc.category,
          thumbnail_url: doc.thumbnail_url,
        })
      }
    })
    const citations = Array.from(uniqueCitationsMap.values())

    const contextBlock =
      contextDocs.length > 0
        ? contextDocs.map((d, i) => `[Source ${i + 1}: ${d.file_name}]\n${d.snippet}`).join('\n\n')
        : 'No personal files found matching this query in the user workspace.'

    const systemPrompt = `You are VectorGallery, an intelligent personal AI digital memory assistant.
You help the user understand, search, retrieve, and summarize their personal documents, screenshots, and files.

CRITICAL GROUNDING RULES:
1. Always base personal information answers ONLY on the CONTEXT provided below.
2. If the answer cannot be found in the user's files, clearly say: "I couldn't find information about that in your stored files."
3. Never pretend a file exists if it is not in the context.
4. When referencing information from a file, cite the file name clearly.
5. Provide clean, concise markdown formatting.

CONTEXT:
${contextBlock}`

    // 3. Select and resolve chat provider using user's encrypted keys first, then server env
    const clientApiKey =
      (req.body.apiKey as string)?.trim() ||
      (req.headers['x-api-key'] as string)?.trim() ||
      null
    let activeChatProvider: ChatProviderId = (provider as ChatProviderId) || 'gemini'
    let effectiveKey: string | null = clientApiKey

    if (clientApiKey) {
      if (clientApiKey.startsWith('gsk_')) activeChatProvider = 'groq'
      else if (clientApiKey.startsWith('AIzaSy') || clientApiKey.startsWith('AQ.')) activeChatProvider = 'gemini'
      else if (clientApiKey.startsWith('sk-')) activeChatProvider = 'openai'
    } else {
      const candidateOrder: ChatProviderId[] = Array.from(
        new Set<ChatProviderId>([activeChatProvider, 'groq', 'gemini', 'cohere', 'openai'])
      )
      for (const cand of candidateOrder) {
        const resolved = await getProviderCredential({ userId, provider: cand })
        if (resolved) {
          activeChatProvider = cand
          effectiveKey = resolved
          break
        }
      }
    }

    const isAnyKeyConfigured = Boolean(
      effectiveKey || isProviderAvailable(CHAT_PROVIDERS[activeChatProvider].keyEnv)
    )

    let fullResponse = ''

    if (!isAnyKeyConfigured) {
      if (citations.length > 0) {
        fullResponse =
          `Here ${citations.length === 1 ? 'is the file' : 'are the files'} matching "${userQuery}":\n\n` +
          citations
            .map((c) => {
              const isMedia =
                c.category === 'photos' ||
                c.category === 'screenshots' ||
                /\.(jpe?g|png|webp|gif)$/i.test(c.file_name)
              const imgPreview = isMedia && c.thumbnail_url ? `\n![${c.file_name}](${c.thumbnail_url})\n` : ''
              return `### ${c.file_name}\n${imgPreview}**Excerpt:** ${c.excerpt}...`
            })
            .join('\n\n') +
          `\n\n*(Running in offline grounded mode. Configure a Gemini or Groq API key in Settings to enable generative conversational answers.)*`
      } else {
        fullResponse = `No documents matching "${userQuery}" were found in your library.\n\n*(Tip: Upload documents, receipts, notes, or photos first, then ask questions about their contents.)*`
      }

      const offlineConfidence: 'HIGH' | 'MEDIUM' | 'LOW' = citations.length > 0 ? 'HIGH' : 'LOW'
      sendEvent({ type: 'token', content: fullResponse })
      if (citations.length > 0) {
        sendEvent({ type: 'citations', citations })
      }
      sendEvent({ type: 'confidence', level: offlineConfidence })
      sendEvent({ type: 'done' })

      await persistAssistantMessage(conversationId, userId, fullResponse, citations, offlineConfidence)
      return res.end()
    }

    // 4. Stream response via selected LLM provider
    await streamChatResponse(
      systemPrompt,
      userQuery,
      chatHistory || [],
      activeChatProvider,
      (token) => {
        fullResponse += token
        sendEvent({ type: 'token', content: token })
      },
      effectiveKey
    )

    // 5. Intelligent citation & grounding computation
    const mentionedCitations = citations.filter((c) => {
      const base = c.file_name.toLowerCase()
      const noExt = base.replace(/\.[^.]+$/, '')
      return (
        fullResponse.toLowerCase().includes(base) ||
        fullResponse.toLowerCase().includes(noExt) ||
        fullResponse.includes(`Source ${c.id}`)
      )
    })
    const finalCitations = mentionedCitations.length > 0 ? mentionedCitations : citations.slice(0, 3)

    const grounding = await calculateGroundingScore(
      fullResponse,
      contextDocs.map((d) => ({ content: d.snippet }))
    )
    const confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' =
      finalCitations.length === 0
        ? 'LOW'
        : grounding.level === 'high'
          ? 'HIGH'
          : grounding.level === 'medium'
            ? 'MEDIUM'
            : 'HIGH'

    sendEvent({ type: 'citations', citations: finalCitations })
    sendEvent({ type: 'confidence', level: confidenceLevel })
    sendEvent({ type: 'done' })

    await persistAssistantMessage(conversationId, userId, fullResponse, finalCitations, confidenceLevel)
    return res.end()
  } catch (err: any) {
    console.error('[Chat V2 API] Error:', err)
    sendEvent({ type: 'error', error: err.message || 'Assistant response failed' })
    return res.end()
  }
}

async function persistAssistantMessage(
  conversationId: string | undefined,
  userId: string,
  content: string,
  citations: any[],
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW'
) {
  if (!conversationId) return

  if (isServiceRoleConfigured()) {
    try {
      const supabase = getAdminSupabase()
      const { data: ownConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .maybeSingle()

      if (!ownConv) return

      const { data: msgRow } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content,
          confidence_level: confidenceLevel,
        })
        .select('id')
        .single()

      if (msgRow && citations.length > 0) {
        await supabase.from('citations').insert(
          citations.map((c) => ({
            message_id: msgRow.id,
            file_id: c.file_id,
            file_name: c.file_name,
            page_number: c.page || 1,
            excerpt: c.excerpt,
          }))
        )
      }
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .eq('user_id', userId)
    } catch (e) {
      console.warn('[Chat API] Persist notice:', e)
    }
    return
  }

  appendLocalConversationMessage(conversationId, userId, {
    role: 'assistant',
    content,
    citations,
    confidence_level: confidenceLevel,
  })
}
