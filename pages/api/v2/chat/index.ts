import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminSupabase, getServerUser, isServiceRoleConfigured } from '@/lib/supabase'
import { streamChatResponse, isProviderAvailable, CHAT_PROVIDERS, type ChatProviderId } from '@/lib/providers'
import { getProviderCredential } from '@/lib/credentialResolver'
import { getLocalFiles } from '@/lib/localMetadataStore'
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
    if (isServiceRoleConfigured() && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' })
    }
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    const { query, prompt, chatHistory, selectedFileIds, provider = 'gemini', conversationId } = req.body
    const userQuery = (query || prompt || '').trim()

    if (!userQuery) {
      return res.status(400).json({ error: 'Query is required' })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')

    // Persist user message if conversationId provided and DB is configured
    if (conversationId && isServiceRoleConfigured()) {
      try {
        const supabase = getAdminSupabase()
        await supabase.from('conversation_messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: userQuery,
        })
      } catch (saveErr) {
        console.warn('[Chat V2 API] Failed to persist user message:', saveErr)
      }
    }

    // 1. Retrieve user files matching query for grounding
    let contextDocs: Array<{
      file_id: string
      file_name: string
      snippet: string
      page?: number
      category?: string
      thumbnail_url?: string
    }> = []

    if (isServiceRoleConfigured()) {
      try {
        const supabase = getAdminSupabase()
        let fileQuery = supabase
          .from('files')
          .select('id, original_name, extracted_text')
          .eq('user_id', userId)
          .eq('is_trashed', false)
          .limit(8)

        if (selectedFileIds && Array.isArray(selectedFileIds) && selectedFileIds.length > 0) {
          fileQuery = fileQuery.in('id', selectedFileIds)
        }

        const { data: matchedFiles } = await fileQuery

        if (matchedFiles && matchedFiles.length > 0) {
          contextDocs = matchedFiles
            .filter((f: any) => f.extracted_text && f.extracted_text.trim().length > 0)
            .map((f: any) => ({
              file_id: f.id,
              file_name: f.original_name,
              snippet: f.extracted_text.slice(0, 1500),
              page: 1,
            }))
        }
      } catch (dbErr: any) {
        console.warn('[Chat V2 API] Context retrieval notice:', dbErr.message)
      }
    } else {
      const localFiles = getLocalFiles().filter(f => !f.is_trashed)
      const rankedMatches = rankFilesByRelevance(localFiles, userQuery, 8)
      contextDocs = rankedMatches.map(r => ({
        file_id: r.file.id,
        file_name: r.file.original_name,
        category: r.file.category,
        thumbnail_url: r.file.thumbnail_url,
        snippet: (r.file.extracted_text || r.file.metadata?.summary || r.file.original_name).slice(0, 1500),
        page: 1,
      }))
    }

    // 2. Build Grounded Citations & System Prompt
    const citations = contextDocs.map((doc, idx) => ({
      id: idx + 1,
      file_id: doc.file_id,
      file_name: doc.file_name,
      page: doc.page || 1,
      excerpt: doc.snippet.slice(0, 300),
      category: doc.category,
      thumbnail_url: doc.thumbnail_url,
    }))

    const contextBlock = contextDocs.length > 0
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

    // 3. Select and resolve chat provider
    const clientApiKey = (req.body.apiKey as string)?.trim() || (req.headers['x-api-key'] as string)?.trim() || null
    let activeChatProvider: ChatProviderId = (provider as ChatProviderId) || 'gemini'

    if (clientApiKey) {
      if (clientApiKey.startsWith('gsk_')) {
        activeChatProvider = 'groq'
      } else if (clientApiKey.startsWith('AIzaSy') || clientApiKey.startsWith('AQ.')) {
        activeChatProvider = 'gemini'
      } else if (clientApiKey.startsWith('sk-')) {
        activeChatProvider = 'openai'
      }
    } else {
      if (!isProviderAvailable(CHAT_PROVIDERS[activeChatProvider].keyEnv)) {
        const fallback = (['groq', 'gemini', 'cohere', 'openai'] as ChatProviderId[]).find(p =>
          isProviderAvailable(CHAT_PROVIDERS[p].keyEnv)
        )
        if (fallback) {
          activeChatProvider = fallback
        }
      }
    }

    const personalKey = await getProviderCredential({ userId, provider: activeChatProvider })
    const effectiveKey = clientApiKey || personalKey

    // Check if any AI key is configured
    const isAnyKeyConfigured = effectiveKey || isProviderAvailable(CHAT_PROVIDERS[activeChatProvider].keyEnv)

    let fullResponse = ''

    if (!isAnyKeyConfigured) {
      // Offline fallback: Answer using local search summaries without external AI
      if (contextDocs.length > 0) {
        fullResponse = `Here ${contextDocs.length === 1 ? 'is the file' : 'are the files'} matching "${userQuery}":\n\n` +
          contextDocs.map(d => {
            const isMedia = d.category === 'photos' || d.category === 'screenshots' || d.file_name.endsWith('.jpg') || d.file_name.endsWith('.png')
            const imgPreview = isMedia && d.thumbnail_url ? `\n![${d.file_name}](${d.thumbnail_url})\n` : ''
            return `### 📄 **${d.file_name}**\n${imgPreview}**Excerpt:** ${d.snippet.slice(0, 280)}...`
          }).join('\n\n') +
          `\n\n*(Note: Running in offline grounded mode. Enter your Gemini API key in Settings or add GEMINI_API_KEY to your environment to get conversational generative AI answers.)*`
      } else {
        fullResponse = `No documents matching "${userQuery}" were found in your library.\n\n*(Tip: Upload documents or photos first, or search for keywords like "new year", "diwali", "menu", "admission", or "blood donation".)*`
      }

      sendEvent({ type: 'token', content: fullResponse })
      if (contextDocs.length > 0) {
        sendEvent({ type: 'citations', citations })
      }
      sendEvent({ type: 'done' })

      // Persist assistant response & citations if conversationId
      if (conversationId && isServiceRoleConfigured()) {
        try {
          const supabase = getAdminSupabase()
          const { data: msgRow } = await supabase.from('conversation_messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: fullResponse,
            confidence_level: contextDocs.length > 0 ? 'HIGH' : 'LOW',
          }).select('id').single()

          if (msgRow && citations.length > 0) {
            await supabase.from('citations').insert(
              citations.map(c => ({
                message_id: msgRow.id,
                file_id: c.file_id,
                file_name: c.file_name,
                page_number: c.page || 1,
                excerpt: c.excerpt,
              }))
            )
          }
          await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)
        } catch (e) {
          console.warn('[Chat API] Persist notice:', e)
        }
      }

      return res.end()
    }

    // 4. Stream Response via Provider
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

    // 5. Intelligent citation filtering:
    // Only cite files that were explicitly referenced in the response or are top-matching (max 3)
    const mentionedCitations = citations.filter(c => {
      const base = c.file_name.toLowerCase()
      const noExt = base.replace(/\.[^.]+$/, '')
      return (
        fullResponse.toLowerCase().includes(base) ||
        fullResponse.toLowerCase().includes(noExt) ||
        fullResponse.includes(`Source ${c.id}`)
      )
    })
    const finalCitations = mentionedCitations.length > 0 ? mentionedCitations : citations.slice(0, 3)

    // Emit citations at the end
    sendEvent({ type: 'citations', citations: finalCitations })
    sendEvent({ type: 'confidence', level: finalCitations.length > 0 ? 'HIGH' : 'LOW' })
    sendEvent({ type: 'done' })

    // Persist assistant response & citations to conversation
    if (conversationId && isServiceRoleConfigured()) {
      try {
        const supabase = getAdminSupabase()
        const { data: msgRow } = await supabase.from('conversation_messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: fullResponse,
          confidence_level: finalCitations.length > 0 ? 'HIGH' : 'LOW',
        }).select('id').single()

        if (msgRow && finalCitations.length > 0) {
          await supabase.from('citations').insert(
            finalCitations.map(c => ({
              message_id: msgRow.id,
              file_id: c.file_id,
              file_name: c.file_name,
              page_number: c.page || 1,
              excerpt: c.excerpt,
            }))
          )
        }
        await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)
      } catch (e) {
        console.warn('[Chat API] Persist notice:', e)
      }
    }

    return res.end()
  } catch (err: any) {
    console.error('[Chat V2 API] Error:', err)
    sendEvent({ type: 'error', error: err.message || 'Assistant response failed' })
    return res.end()
  }
}

