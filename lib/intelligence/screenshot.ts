/**
 * VectorGallery — Screenshot Intelligence Analyzer
 * Detects screenshots and extracts topics, source apps, and tags
 */

export interface ScreenshotAnalysis {
  isScreenshot: boolean
  confidence: number
  detectedApp?: string
  topics: string[]
  suggestedTags: string[]
}

const SCREENSHOT_FILENAME_PATTERNS = [
  /screenshot/i,
  /screen[_\s-]?shot/i,
  /screen[_\s-]?capture/i,
  /screely/i,
  /clean-shot/i,
  /captura/i,
  /^IMG_\d{8}_\d{6}\.(png|jpg)/, // Android screenshot naming convention
]

const APP_SIGNATURES: Record<string, RegExp[]> = {
  'AWS Console': [/aws\.amazon\.com/i, /ec2/i, /s3/i, /lambda/i, /cloudwatch/i, /aws pricing/i, /elastic compute/i],
  'VS Code': [/visual studio code/i, /vscode/i, /tsconfig/i, /package\.json/i, /terminal/i],
  'Terminal': [/bash/i, /zsh/i, /sudo/i, /git commit/i, /npm install/i, /docker/i, /curl/i],
  'GitHub': [/github\.com/i, /pull request/i, /repository/i, /commit/i, /issues/i],
  'Docker': [/docker/i, /docker-compose/i, /container/i, /kubernetes/i, /k8s/i],
  'React / Web': [/react/i, /next\.js/i, /tailwind/i, /component/i, /useState/i, /useEffect/i],
  'Billing & Invoices': [/invoice/i, /total amount/i, /subtotal/i, /billing/i, /payment/i, /receipt/i, /usd\s*\$?\d+/i, /price/i],
  'College / Academics': [/syllabus/i, /semester/i, /assignment/i, /lecture/i, /university/i, /college/i, /exam/i],
}

export function analyzeScreenshot(filename: string, extractedText: string, mimeType: string): ScreenshotAnalysis {
  let isScreenshot = false
  let confidence = 0.0

  // 1. Filename heuristic
  for (const pattern of SCREENSHOT_FILENAME_PATTERNS) {
    if (pattern.test(filename)) {
      isScreenshot = true
      confidence += 0.6
      break
    }
  }

  // 2. MIME type (Screenshots are overwhelmingly PNG)
  if (mimeType === 'image/png') {
    confidence += 0.2
  }

  // 3. Text content signatures (Screenshots contain dense text, URLs, error logs, or UI labels)
  const textLower = extractedText.toLowerCase()
  const detectedTopics: string[] = []
  let detectedApp: string | undefined

  for (const [app, patterns] of Object.entries(APP_SIGNATURES)) {
    for (const pat of patterns) {
      if (pat.test(textLower) || pat.test(filename)) {
        if (!detectedTopics.includes(app)) {
          detectedTopics.push(app)
        }
        if (!detectedApp && (app === 'AWS Console' || app === 'VS Code' || app === 'GitHub' || app === 'Terminal')) {
          detectedApp = app
        }
      }
    }
  }

  if (detectedTopics.length > 0) {
    confidence += 0.3
    if (confidence >= 0.5) isScreenshot = true
  }

  // 4. Generate relevant tags
  const tags = new Set<string>()
  if (isScreenshot) tags.add('screenshot')
  if (detectedApp) tags.add(detectedApp.toLowerCase().replace(/\s+/g, '-'))
  detectedTopics.forEach(t => tags.add(t.toLowerCase().replace(/[^a-z0-9]/g, '-')))

  // Add specific keywords found
  if (/pricing|cost|rate|quote|\$|eur|inr/i.test(textLower)) tags.add('pricing')
  if (/error|exception|failed|fatal|warning/i.test(textLower)) tags.add('error')
  if (/docker|container/i.test(textLower)) tags.add('docker')
  if (/react|frontend|javascript|typescript/i.test(textLower)) tags.add('frontend')

  return {
    isScreenshot,
    confidence: Math.min(1.0, confidence),
    detectedApp,
    topics: detectedTopics,
    suggestedTags: Array.from(tags),
  }
}

