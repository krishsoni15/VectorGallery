import { describe, it, expect } from 'vitest'
import { analyzeScreenshot } from '../../lib/intelligence/screenshot'

describe('Screenshot Intelligence Analyzer', () => {
  it('detects screenshot filename patterns accurately', () => {
    const analysis = analyzeScreenshot('Screenshot_20261117_120400.png', 'Amazon Web Services EC2 Pricing $0.096/hr', 'image/png')
    expect(analysis.isScreenshot).toBe(true)
    expect(analysis.confidence).toBeGreaterThanOrEqual(0.6)
    expect(analysis.topics).toContain('AWS Console')
    expect(analysis.suggestedTags).toContain('screenshot')
    expect(analysis.suggestedTags).toContain('pricing')
  })

  it('identifies source application from text contents', () => {
    const text = 'root@ubuntu:~$ docker-compose up -d\nStarting containers...'
    const analysis = analyzeScreenshot('clean_capture.png', text, 'image/png')

    expect(analysis.isScreenshot).toBe(true)
    expect(analysis.topics).toContain('Docker')
    expect(analysis.suggestedTags).toContain('docker')
  })

  it('distinguishes regular photos from screenshots', () => {
    const analysis = analyzeScreenshot('family_vacation.jpg', 'Camera photo taken outdoors with sunset', 'image/jpeg')
    expect(analysis.isScreenshot).toBe(false)
  })
})

