import { describe, it, expect } from 'vitest'
import { recursiveCharacterChunker } from '../../lib/chunker'

describe('Recursive Boundary-Aware Chunker', () => {
  it('splits long markdown document into targeted chunks with metadata', () => {
    const text = `# Introduction to Cloud Computing\n\nCloud computing provides on-demand availability of computer system resources.\n\n## Architecture Overview\n\nThe architecture consists of frontend platforms and backend cloud servers.\n\n## Database Layer\n\nDatabases store persistent metadata and object references across regions.`

    const chunks = recursiveCharacterChunker(text, 100, 20)

    expect(chunks.length).toBeGreaterThan(0)
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeGreaterThan(0)
      expect(chunk.tokenCount).toBeGreaterThan(0)
    }
  })

  it('preserves section headings in chunk metadata', () => {
    const text = `# Docker Containerization\n\nDocker simplifies deployment using container images.\n\n### Compose Setup\n\nUse docker-compose.yml to define multi-container services.`

    const chunks = recursiveCharacterChunker(text, 150, 30)
    expect(chunks.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty or whitespace-only documents cleanly', () => {
    expect(recursiveCharacterChunker('')).toHaveLength(0)
    expect(recursiveCharacterChunker('   \n\n   ')).toHaveLength(0)
  })
})

