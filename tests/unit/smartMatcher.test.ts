import { describe, it, expect } from 'vitest'
import { parseQueryIntent, rankFilesByRelevance } from '../../lib/search/smartMatcher'

describe('Smart Intent Parser & Relevance Ranker', () => {
  const sampleVault = [
    {
      id: 'f-diwali',
      original_name: 'IMG-20261108-WA0005.jpg',
      category: 'photos',
      extracted_text: 'HAPPY DIWALI Wishing You Prosperity and Joy',
      is_trashed: false,
      created_at: '2026-11-17T12:00:00Z',
    },
    {
      id: 'f-newyear',
      original_name: 'IMG-20261110-WA0007.jpg',
      category: 'photos',
      extracted_text: 'Happy New Year નૂતનવર્ષાભિનંદન Nutan Varshabhinandan greeting card',
      is_trashed: false,
      created_at: '2026-11-18T12:00:00Z',
    },
    {
      id: 'f-aws',
      original_name: 'Screenshot_AWS_EC2.png',
      category: 'screenshots',
      extracted_text: 'AWS Management Console EC2 pricing m6i.large $0.096/hr',
      is_trashed: false,
      created_at: '2026-11-19T12:00:00Z',
    },
    {
      id: 'f-trashed',
      original_name: 'Old_AWS_Pricing.png',
      category: 'screenshots',
      extracted_text: 'AWS EC2 pricing',
      is_trashed: true,
      created_at: '2026-11-20T12:00:00Z',
    },
  ]

  it('extracts category intent and strips conversational stopwords', () => {
    const intent = parseQueryIntent('can you find me happy new year wish img to share')
    expect(intent.detectedCategory).toBe('photos')
    expect(intent.tokens).toEqual(['happy', 'new', 'year', 'wish'])
    expect(intent.isGenericCategoryQuery).toBe(false)
  })

  it('detects generic category-only queries across English and Gujarati', () => {
    const enIntent = parseQueryIntent('show my photos')
    expect(enIntent.detectedCategory).toBe('photos')
    expect(enIntent.isGenericCategoryQuery).toBe(true)

    const guIntent = parseQueryIntent('મારા ફોટો બતાવો')
    expect(guIntent.detectedCategory).toBe('photos')
  })

  it('ranks exact phrase and token matches above unrelated files while excluding trashed items', () => {
    const awsResults = rankFilesByRelevance(sampleVault, 'screenshot where I saved aws pricing')
    expect(awsResults.length).toBeGreaterThan(0)
    expect(awsResults[0].file.id).toBe('f-aws')
    expect(awsResults.some((r) => r.file.id === 'f-trashed')).toBe(false)

    const newYearResults = rankFilesByRelevance(sampleVault, 'નૂતનવર્ષાભિનંદન')
    expect(newYearResults[0].file.id).toBe('f-newyear')
  })
})

