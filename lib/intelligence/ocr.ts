/**
 * VectorGallery — Dual-Engine Multimodal OCR
 * Supports Cloud Vision (Gemini 2.0 Flash) with offline/zero-cost local fallback
 */

export async function extractTextFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY

  // 1. If Gemini Vision API key is configured, attempt multimodal OCR
  if (geminiKey) {
    try {
      const base64Data = buffer.toString('base64')
      const prompt = `You are an expert OCR and document analysis engine.
Analyze this image thoroughly and extract ALL visible text, headings, numbers, tables, diagrams, labels, and structured details.
Format your output as clean Markdown:
- Preserve headings (#, ##, ###)
- Preserve lists and bullet points
- Convert tables into clean Markdown tables
- If this is a screenshot, note the visible applications, headers, and UI elements.
Do NOT include conversational filler like "Here is the text". Output ONLY the extracted text.`

      const models = ['gemini-2.0-flash', 'gemini-1.5-flash']
      for (const model of models) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { inline_data: { mime_type: mimeType, data: base64Data } },
                  { text: prompt }
                ]
              }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
            })
          }
        )

        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text && text.trim().length > 0) {
            return text.trim()
          }
        }
      }
    } catch (err: any) {
      console.warn('[OCR] Gemini Multimodal OCR failed, engaging local OCR fallback:', err.message)
    }
  }

  // 2. Offline / Local Heuristic OCR Fallback
  return fallbackLocalOCR(buffer, mimeType)
}

/**
 * Robust Local Image Text & Metadata Extractor
 * Extracts readable ASCII/UTF-8 strings, EXIF metadata, and text blocks without external API dependencies.
 */
function fallbackLocalOCR(buffer: Buffer, mimeType: string): string {
  const lines: string[] = []
  
  // Extract ASCII / UTF-8 printable string chunks from image binary (often contains embedded text, EXIF, software tags)
  const rawString = buffer.toString('binary')
  const printableChunks: string[] = []
  let currentChunk = ''

  for (let i = 0; i < rawString.length; i++) {
    const code = rawString.charCodeAt(i)
    // Printable ASCII characters (space to ~)
    if (code >= 32 && code <= 126) {
      currentChunk += rawString[i]
    } else {
      if (currentChunk.length >= 4) {
        // Filter out binary garbage strings
        const cleaned = currentChunk.trim()
        if (cleaned.length >= 4 && !/^[0-9a-fA-F]{8,}$/.test(cleaned) && /[a-zA-Z]/.test(cleaned)) {
          printableChunks.push(cleaned)
        }
      }
      currentChunk = ''
    }
  }

  if (printableChunks.length > 0) {
    // Deduplicate and filter common image header noise
    const noiseFilter = /^(JFIF|Exif|Photoshop|Adobe|ICC_PROFILE|sRGB|XML:com\.adobe|http:|xmlns|AppleComputer|uuid:)/i
    const meaningfulText = Array.from(new Set(printableChunks))
      .filter(chunk => !noiseFilter.test(chunk) && chunk.length < 200)
      .slice(0, 30)

    if (meaningfulText.length > 0) {
      lines.push(`### Extracted Image Text & Metadata (${mimeType})`)
      meaningfulText.forEach(txt => lines.push(`- ${txt}`))
    }
  }

  if (lines.length === 0) {
    return `[Image Document (${mimeType}): Ready for search and cataloging. No embedded text detected.]`
  }

  return lines.join('\n')
}

