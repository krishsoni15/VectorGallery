/**
 * VectorGallery — Smart Intent & Semantic Matcher
 * Parses natural language queries, extracts search tokens, detects target categories,
 * removes conversational stopwords, and ranks library files by relevance.
 */

export interface ScoredFileMatch {
  file: any
  score: number
  matchedTokens: string[]
  matchType: 'EXACT_PHRASE' | 'TOKEN_MATCH' | 'CATEGORY_RECENCY'
  snippet: string
}

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'yours',
  'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their',
  'so', 'ya', 'yeah', 'yup', 'nah', 'ok', 'okay', 'also', 'too', 'very',
  'just', 'now', 'then', 'than', 'that', 'this', 'these', 'those',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  'need', 'ned', 'want', 'share', 'sahe', 'send', 'give',
  'find', 'fin', 'search', 'get', 'look', 'looking', 'show', 'tell', 'ask',
  'bro', 'please', 'pls', 'the', 'a', 'an', 'for', 'of', 'in', 'on', 'at',
  'to', 'from', 'with', 'about', 'some', 'any', 'all', 'here', 'there',
  'what', 'which', 'who', 'how', 'when', 'why', 'hey', 'hi', 'hello',
  'friend', 'frind', 'friends', 'family', 'someone', 'one', 'two', 'three',
  // Multilingual conversational helpers (Gujarati / Hindi)
  'શોધો', 'વાળા', 'માટે', 'ની', 'ના', 'નો', 'ને', 'કરો', 'આપો', 'બતાવો', 'છે', 'મને', 'ખોળો', 'ઢૂંઢો', 'ખોજો', 'દેખો'
])

const CATEGORY_MAP: Record<string, string[]> = {
  photos: ['img', 'imgs', 'image', 'images', 'photo', 'photos', 'pic', 'pics', 'picture', 'pictures', 'wallpaper', 'ફોટો', 'ફોટા', 'તસવીર', 'ઇમેજ', 'फोटो'],
  screenshots: ['screenshot', 'screenshots', 'ss', 'screen', 'capture', 'સ્ક્રીનશોટ'],
  documents: ['doc', 'docs', 'document', 'documents', 'pdf', 'pdfs', 'text', 'txt', 'note', 'notes', 'file', 'files', 'paper', 'letter', 'certificate', 'receipt', 'bill', 'statement', 'contract', 'દસ્તાવેજ', 'કાગળ', 'પત્ર', 'દસ્તાવેજો'],
  videos: ['video', 'videos', 'vid', 'vids', 'clip', 'clips', 'movie', 'recording', 'વિડિઓ', 'વિડિયો'],
}

export function parseQueryIntent(rawQuery: string): {
  tokens: string[]
  detectedCategory: string | null
  cleanPhrase: string
  isGenericCategoryQuery: boolean
} {
  const normalized = rawQuery.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, ' ')
  const rawWords = normalized.split(/\s+/).filter(w => w.length > 0)

  let detectedCategory: string | null = null

  // Check for category intent words
  for (const word of rawWords) {
    for (const [cat, synonyms] of Object.entries(CATEGORY_MAP)) {
      if (synonyms.includes(word)) {
        detectedCategory = cat
        break
      }
    }
    if (detectedCategory) break
  }

  // Filter out stopwords and category trigger words
  const categoryWords = new Set(Object.values(CATEGORY_MAP).flat())
  const meaningfulTokens = rawWords.filter(w => !STOP_WORDS.has(w) && !categoryWords.has(w))

  const cleanPhrase = meaningfulTokens.join(' ')
  const isGenericCategoryQuery = meaningfulTokens.length === 0 && detectedCategory !== null

  return {
    tokens: meaningfulTokens,
    detectedCategory,
    cleanPhrase,
    isGenericCategoryQuery,
  }
}

export function rankFilesByRelevance(files: any[], rawQuery: string, limit: number = 8): ScoredFileMatch[] {
  const { tokens, detectedCategory, cleanPhrase, isGenericCategoryQuery } = parseQueryIntent(rawQuery)

  const scored: ScoredFileMatch[] = []

  for (const file of files) {
    if (file.is_trashed) continue

    const name = (file.original_name || '').toLowerCase()
    const text = (file.extracted_text || '').toLowerCase()
    const summary = (file.metadata?.summary || '').toLowerCase()
    const category = (file.category || '').toLowerCase()

    const fullContent = `${name} ${text} ${summary}`
    const docWords = new Set(fullContent.split(/[^\p{L}\p{M}\p{N}]+/gu).filter(w => w.length > 0))

    let score = 0
    const matchedTokens: string[] = []
    let matchType: ScoredFileMatch['matchType'] = 'TOKEN_MATCH'

    // 1. Exact full phrase match
    if (cleanPhrase && cleanPhrase.length >= 3 && fullContent.includes(cleanPhrase)) {
      score += 120
      matchType = 'EXACT_PHRASE'
    }

    // 2. Sub-phrase bigram matching (e.g. "happy new year" -> "new year")
    if (tokens.length >= 2) {
      for (let i = 0; i < tokens.length - 1; i++) {
        const bigram = `${tokens[i]} ${tokens[i + 1]}`
        if (fullContent.includes(bigram)) {
          score += 60
        }
      }
    }

    // 3. Word token matching (isolated words or stem prefix)
    if (tokens.length > 0) {
      for (const token of tokens) {
        let tokenMatched = false
        if (name.includes(token)) {
          score += 40
          tokenMatched = true
        } else if (docWords.has(token) || (token.length >= 4 && Array.from(docWords).some(w => w.startsWith(token)))) {
          score += 25
          tokenMatched = true
        }

        if (tokenMatched) {
          matchedTokens.push(token)
        }
      }

      // Bonus if all tokens match
      if (matchedTokens.length === tokens.length && tokens.length > 1) {
        score += 35
      }
    }

    // 4. Category alignment boost ONLY if file actually matched tokens or exact phrase
    if (detectedCategory) {
      if (category === detectedCategory || (detectedCategory === 'photos' && category === 'screenshots')) {
        const minTokensNeeded = Math.min(2, Math.max(1, Math.ceil(tokens.length * 0.4)))
        if (matchedTokens.length >= minTokensNeeded || matchType === 'EXACT_PHRASE') {
          score += 25
        }
      }
    }

    // 5. Generic category queries (e.g. "show my photos" or "find images")
    if (isGenericCategoryQuery) {
      if (category === detectedCategory || (detectedCategory === 'photos' && category === 'screenshots')) {
        score = 50
        matchType = 'CATEGORY_RECENCY'
      }
    }

    // Only include if there is a meaningful score
    if (score > 15) {
      let snippet = file.extracted_text || file.metadata?.summary || file.original_name || ''
      if (matchedTokens.length > 0) {
        // Find excerpt around matched token
        const firstToken = matchedTokens[0]
        const idx = text.indexOf(firstToken)
        if (idx !== -1) {
          const start = Math.max(0, idx - 40)
          const end = Math.min(text.length, idx + 160)
          snippet = text.slice(start, end).replace(/\n+/g, ' ').trim()
        }
      }

      scored.push({
        file,
        score,
        matchedTokens,
        matchType,
        snippet: snippet.slice(0, 300),
      })
    }
  }

  // Sort descending by score, then by recency
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.file.created_at).getTime() - new Date(a.file.created_at).getTime()
  })

  // Dynamic relative threshold filtering: eliminate low-scoring false positives
  if (tokens.length > 0 && scored.length > 0) {
    const topScore = scored[0].score
    const relativeCutoff = Math.max(30, topScore * 0.50)
    const highConfidenceMatches = scored.filter(s => s.score >= relativeCutoff)
    if (highConfidenceMatches.length > 0) {
      return highConfidenceMatches.slice(0, limit)
    }
  }

  return scored.slice(0, limit)
}

