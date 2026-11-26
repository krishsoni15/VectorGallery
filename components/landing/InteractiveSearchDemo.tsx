import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  FileText,
  Image as ImageIcon,
  MessageSquare,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import {
  VG_COMPONENTS,
  VG_MOTION,
  VG_TYPOGRAPHY,
} from '@/components/landing/design-system'
import { MotionReveal } from '@/components/landing/motion'
import {
  CURATED_PHOTOS,
  DemoSearchResult,
  SYNTHETIC_DEMO_QUERIES,
  SYNTHETIC_SEARCH_CATALOG,
} from '@/components/landing/tokens'
import {
  BrowserFrame,
  Container,
  Section,
  SectionHeading,
} from '@/components/landing/ui'
import { cn } from '@/lib/utils'

type SearchMode = 'memory' | 'document' | 'ai'

interface ModeConfig {
  id: SearchMode
  label: string
  description: string
  placeholder: string
  prompts: string[]
  icon: typeof ImageIcon
}

const STOPWORDS = new Set([
  'find',
  'show',
  'from',
  'the',
  'with',
  'that',
  'this',
  'for',
  'and',
  'are',
  'was',
  'were',
  'what',
  'how',
  'can',
  'you',
  'your',
  'have',
  'about',
  'into',
  'all',
  'last',
  'more',
])

const MODE_CONFIGS: ModeConfig[] = [
  {
    id: 'memory',
    label: 'Memory search',
    description: 'Visual & EXIF recall across your camera roll',
    placeholder: 'Try: Find my photos from the mountains.',
    prompts: [
      SYNTHETIC_DEMO_QUERIES[0],
      'Calm lake sunrise canoe photo',
      'Misty forest valley morning',
    ],
    icon: ImageIcon,
  },
  {
    id: 'document',
    label: 'Document search',
    description: 'Dual OCR screenshots, PDFs, DOCX specs & receipts',
    placeholder: 'Try: Find the screenshot with AWS pricing.',
    prompts: [
      SYNTHETIC_DEMO_QUERIES[1],
      SYNTHETIC_DEMO_QUERIES[3],
      SYNTHETIC_DEMO_QUERIES[2],
      SYNTHETIC_DEMO_QUERIES[5],
    ],
    icon: FileText,
  },
  {
    id: 'ai',
    label: 'Ask AI',
    description: 'Grounded answers citing exact retrieved files',
    placeholder: 'Try: Summarize my Docker notes.',
    prompts: [
      SYNTHETIC_DEMO_QUERIES[4],
      'What did I spend on studio supplies in October?',
      'Which project milestones are listed in my spec?',
    ],
    icon: MessageSquare,
  },
]

const EXTRA_MEMORY_RECORDS: DemoSearchResult[] = [
  {
    id: 'demo-lake-sunrise',
    filename: 'Calm_Morning_Lake.webp',
    type: 'photo',
    categoryLabel: 'Photos · Alpine Lake',
    date: CURATED_PHOTOS[1]?.date ? `${CURATED_PHOTOS[1].date}, 2026` : 'Nov 19, 2026',
    size: '3.8 MB',
    thumb: '/landing/photos/lake-morning.webp',
    alt: 'Quiet canoe gliding across calm turquoise mountain lake at sunrise',
    highlight: 'Matched alpine lake sunrise reflection and calm canoe composition',
    excerpt: 'JPEG · 24 MP · Non-destructive Android Wi-Fi backup with SHA-256 verification.',
    citation: 'Calm_Morning_Lake.webp · EXIF & scene tags',
    tags: ['lake', 'mountain', 'mountains', 'sunrise', 'canoe', 'calm', 'water', 'morning', 'photo'],
  },
  {
    id: 'demo-valley-stream',
    filename: 'Valley_Mirror_Stream.webp',
    type: 'photo',
    categoryLabel: 'Photos · Mountain Valley',
    date: 'Oct 21, 2026',
    size: '4.6 MB',
    thumb: '/landing/photos/valley-reflection.webp',
    alt: 'Granite peaks reflected in crystal alpine stream bordered by pine trees',
    highlight: 'Matched granite mountain peaks, pine valley, and alpine stream reflection',
    excerpt: '50mm f/4.0 · Indexed cleanly in Personal Travel archive.',
    citation: 'Valley_Mirror_Stream.webp · Camera roll',
    tags: ['mountain', 'mountains', 'valley', 'stream', 'pine', 'peaks', 'reflection', 'travel'],
  },
  {
    id: 'demo-misty-pines',
    filename: 'Misty_Pine_Valley.webp',
    type: 'photo',
    categoryLabel: 'Photos · Forest Ridge',
    date: 'Nov 04, 2026',
    size: '3.4 MB',
    thumb: '/landing/photos/misty-pines.webp',
    alt: 'Evergreen conifer ridge partially veiled in soft morning forest mist',
    highlight: 'Matched misty evergreen ridge and early morning woodland light',
    excerpt: 'HEIC Synced · Stored with original metadata and zero duplicate copies.',
    citation: 'Misty_Pine_Valley.webp · Mobile Roll',
    tags: ['misty', 'forest', 'valley', 'pine', 'morning', 'mountain', 'evergreen'],
  },
]

interface GroundedAnswer {
  summary: string
  bullets: string[]
  citedIds: string[]
  providerNote: string
}

function buildGroundedAnswer(query: string, topResults: DemoSearchResult[]): GroundedAnswer | null {
  const clean = query.toLowerCase()
  if (clean.includes('docker') || clean.includes('container')) {
    return {
      summary:
        'Your Docker architecture notes specify a multi-stage Alpine container build paired with a pgvector-enabled PostgreSQL volume and a non-root ingestion worker.',
      bullets: [
        'Multi-stage Alpine image keeps web and worker containers lightweight.',
        'PostgreSQL healthcheck guards the pgvector embedding service before worker startup.',
        'Background ingestion processes OCR and chunk indexing asynchronously as a non-root user.',
      ],
      citedIds: ['demo-docker'],
      providerNote: 'Grounded in 1 markdown note · Zero unverified claims',
    }
  }

  if (clean.includes('spend') || clean.includes('receipt') || clean.includes('october')) {
    return {
      summary:
        'Based on your October expense PDF, your studio supplies purchase totaled $138.67 ($128.40 subtotal plus $10.27 tax).',
      bullets: [
        'Receipt #ST-8841 recorded on Oct 28, 2026.',
        'Subtotal: $128.40 · Tax: $10.27 · Total Paid: $138.67.',
      ],
      citedIds: ['demo-receipts'],
      providerNote: 'Grounded in 1 PDF receipt · Page 1 citation',
    }
  }

  if (clean.includes('milestone') || clean.includes('requirement') || clean.includes('spec')) {
    return {
      summary:
        'Your v2 project specification outlines three core delivery milestones: a 50 MB web upload limit, a persistent SQLite mobile backup queue, and strict multi-tenant RLS policies.',
      bullets: [
        'Web uploads capped at 50 MB per request with executable file filtering.',
        'Flutter mobile companion queues unique SHA-256 items in SQLite.',
        'Multi-user deployments isolate files and chunks via auth.uid() = user_id RLS.',
      ],
      citedIds: ['demo-requirements'],
      providerNote: 'Grounded in 1 DOCX specification · Paragraph 4 citation',
    }
  }

  if (topResults.length === 0) return null

  return {
    summary: `Found ${topResults.length} matching item${topResults.length === 1 ? '' : 's'} in the sample workspace. Top match: ${topResults[0].highlight}`,
    bullets: topResults.slice(0, 2).map((item) => `${item.filename}: ${item.excerpt}`),
    citedIds: topResults.slice(0, 2).map((item) => item.id),
    providerNote: 'Deterministic sample synthesis · Cites retrieved sources only',
  }
}

/**
 * Deterministic public 3-mode search experience using synthetic sample workspace records.
 * Never queries private user libraries or billed AI APIs.
 */
export function InteractiveSearchDemo() {
  const prefersReducedMotion = useReducedMotion()
  const [mode, setMode] = useState<SearchMode>('memory')
  const [query, setQuery] = useState(MODE_CONFIGS[0].prompts[0])
  const [typingTarget, setTypingTarget] = useState<string | null>(null)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [selectedFile, setSelectedFile] = useState<DemoSearchResult | null>(null)

  const activeMode = MODE_CONFIGS.find((m) => m.id === mode) || MODE_CONFIGS[0]

  const allCatalog = useMemo<DemoSearchResult[]>(() => {
    const existingIds = new Set(SYNTHETIC_SEARCH_CATALOG.map((item) => item.id))
    const extras = EXTRA_MEMORY_RECORDS.filter((item) => !existingIds.has(item.id))
    return [...SYNTHETIC_SEARCH_CATALOG, ...extras]
  }, [])

  const triggerPrompt = (prompt: string) => {
    if (prefersReducedMotion) {
      setTypingTarget(null)
      setQuery(prompt)
      return
    }
    setTypingTarget(prompt)
  }

  const handleModeSwitch = (nextMode: SearchMode) => {
    setMode(nextMode)
    const config = MODE_CONFIGS.find((m) => m.id === nextMode) || MODE_CONFIGS[0]
    triggerPrompt(config.prompts[0])
  }

  useEffect(() => {
    if (!typingTarget) return
    if (prefersReducedMotion) {
      setQuery(typingTarget)
      setTypingTarget(null)
      return
    }
    let idx = 0
    setQuery('')
    const timer = setInterval(() => {
      idx += 1
      setQuery(typingTarget.slice(0, idx))
      if (idx >= typingTarget.length) {
        clearInterval(timer)
        setTypingTarget(null)
      }
    }, 22)
    return () => clearInterval(timer)
  }, [typingTarget, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) {
      setCursorVisible(false)
      return
    }
    const blink = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 520)
    return () => clearInterval(blink)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (!selectedFile) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedFile(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedFile])

  const results = useMemo(() => {
    const pool = allCatalog.filter((item) => {
      if (mode === 'memory') return item.type === 'photo'
      if (mode === 'document') return item.type !== 'photo'
      return true
    })

    const clean = query.trim().toLowerCase()
    if (!clean) return pool.slice(0, 4)

    const tokens = clean
      .replace(/[?.!,]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t))

    if (tokens.length === 0) return pool.slice(0, 4)

    const scoreAgainst = (items: DemoSearchResult[]) =>
      items
        .map((item) => {
          const normalizedTags = item.tags.map((t) => t.toLowerCase())
          const body = `${item.filename} ${item.categoryLabel} ${item.highlight} ${item.excerpt}`.toLowerCase()
          let score = 0
          tokens.forEach((tok) => {
            if (normalizedTags.includes(tok)) {
              score += 5
            } else if (normalizedTags.some((tag) => tag.startsWith(tok) || tok.startsWith(tag))) {
              score += 3
            } else if (body.includes(tok)) {
              score += 1
            }
          })
          return { item, score }
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item)

    const modeMatches = scoreAgainst(pool)
    if (modeMatches.length > 0) return modeMatches.slice(0, 4)

    // If user typed a custom query belonging to another file type, fall back across the full catalog
    return scoreAgainst(allCatalog).slice(0, 4)
  }, [allCatalog, mode, query])

  const aiAnswer = useMemo(() => {
    if (mode !== 'ai') return null
    return buildGroundedAnswer(query, results)
  }, [mode, query, results])

  const resetDemo = () => {
    setTypingTarget(null)
    setQuery('')
  }

  return (
    <Section id="search-demo" surface="default" ariaLabel="Interactive search demonstration">
      <Container>
        <MotionReveal>
          <SectionHeading
            align="center"
            eyebrow="Interactive Sample Workspace"
            title={
              <>
                Remember the{' '}
                <em className={VG_TYPOGRAPHY.editorialWordClass}>moment</em>. Find
                the file.
              </>
            }
            subtitle="Ask across your archive in plain language — preview real visual recall, optical screenshot OCR, and cited document passages on deterministic sample data."
          />
        </MotionReveal>

        <MotionReveal delay={0.08} className="mt-10 max-w-[1120px] mx-auto">
          <BrowserFrame
            title="vectorgallery.local — Semantic & OCR Search"
            toolbarRight={
              <span className={VG_COMPONENTS.badges.sage}>
                Sample data only · Zero private access
              </span>
            }
          >
            <div className="p-5 sm:p-8 space-y-6">
              {/* 3-Mode Selector Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--vg-border)]">
                <div
                  role="tablist"
                  aria-label="Search demonstration modes"
                  className="inline-flex flex-wrap gap-2"
                >
                  {MODE_CONFIGS.map((item) => {
                    const Icon = item.icon
                    const active = item.id === mode
                    return (
                      <button
                        key={item.id}
                        role="tab"
                        aria-selected={active}
                        type="button"
                        onClick={() => handleModeSwitch(item.id)}
                        className={cn(
                          'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                          active ? VG_COMPONENTS.buttons.tabActive : VG_COMPONENTS.buttons.tabIdle
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-[12.5px] text-[var(--vg-ink-2)]">
                  {activeMode.description}
                </p>
              </div>

              {/* Search Input with Typing Cursor */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-[var(--vg-brand)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <label htmlFor="public-search-demo-input" className="sr-only">
                    Try a sample VectorGallery search query
                  </label>
                  <input
                    id="public-search-demo-input"
                    type="text"
                    value={typingTarget ? `${query}${cursorVisible ? '▍' : ''}` : query}
                    onChange={(e) => {
                      setTypingTarget(null)
                      setQuery(e.target.value.replace(/▍/g, ''))
                    }}
                    placeholder={activeMode.placeholder}
                    className={cn(VG_COMPONENTS.inputs.search, 'pr-36')}
                  />
                  <div className="hidden sm:flex items-center gap-1.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none px-2.5 py-1 rounded-lg bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[11px] font-mono text-[var(--vg-ink-2)]">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'inline-block w-1.5 h-3.5 rounded-[1px] bg-[var(--vg-brand)] transition-opacity duration-150',
                        cursorVisible || prefersReducedMotion ? 'opacity-100' : 'opacity-20'
                      )}
                    />
                    <span>{typingTarget ? 'Typing query' : `${results.length} matched`}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetDemo}
                  className={cn(VG_COMPONENTS.buttons.secondary, 'h-12 px-4 text-[13px] shrink-0')}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Mode-Specific Prompt Chips */}
              <div className="flex flex-wrap gap-2" role="group" aria-label="Sample search prompts">
                {activeMode.prompts.map((prompt) => {
                  const active = query === prompt && !typingTarget
                  return (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => triggerPrompt(prompt)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                        active ? VG_COMPONENTS.buttons.tabActive : VG_COMPONENTS.buttons.tabIdle
                      )}
                    >
                      {prompt}
                    </button>
                  )
                })}
              </div>

              {/* Grounded Ask AI Synthesis Card */}
              {mode === 'ai' && aiAnswer && (
                <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={VG_COMPONENTS.badges.mint}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      Grounded AI Summary
                    </span>
                    <span className="font-mono text-[11px] text-[var(--vg-ink-muted)]">
                      {aiAnswer.providerNote}
                    </span>
                  </div>
                  <p className="text-[14px] leading-relaxed font-medium text-[var(--vg-ink)]">
                    {aiAnswer.summary}
                  </p>
                  <ul className="space-y-1.5 text-[13px] text-[var(--vg-ink-2)]">
                    {aiAnswer.bullets.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--vg-brand)] mt-2 shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {aiAnswer.citedIds.map((id, idx) => {
                      const source = allCatalog.find((item) => item.id === id)
                      if (!source) return null
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedFile(source)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--vg-surface)] border border-[var(--vg-border)] hover:border-[var(--vg-brand)] text-[11.5px] font-mono text-[var(--vg-brand)] transition-colors"
                        >
                          <span>[{idx + 1}]</span>
                          <span className="truncate max-w-[240px]">{source.citation}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Matching Results */}
              {results.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl bg-[var(--vg-surface-2)] border border-dashed border-[var(--vg-border)] space-y-2">
                  <p className="text-[15px] font-semibold text-[var(--vg-ink)]">
                    No matching items in the sample library
                  </p>
                  <p className="text-[13px] text-[var(--vg-ink-2)] max-w-md mx-auto">
                    VectorGallery tells you clearly when content is missing rather than guessing. Try clicking one of the suggested prompts above.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {results.map((item) => (
                    <motion.button
                      layout={!prefersReducedMotion}
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedFile(item)}
                      className="text-left rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] hover:border-[var(--vg-brand)]/60 hover:bg-[var(--vg-surface)] p-4 flex gap-4 items-start transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
                    >
                      <img
                        src={item.thumb}
                        alt={item.alt}
                        decoding="async"
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[var(--vg-border)] group-hover:scale-[1.03] transition-transform"
                      />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono text-[var(--vg-brand)] truncate">
                            {item.categoryLabel}
                          </span>
                          <span className="text-[11px] font-mono text-[var(--vg-ink-muted)] shrink-0">
                            {item.size}
                          </span>
                        </div>
                        <h3 className="text-[14px] font-semibold text-[var(--vg-ink)] truncate">
                          {item.filename}
                        </h3>
                        <p className="text-[12px] text-[var(--vg-ink)] bg-[var(--vg-surface-soft)] px-2.5 py-1 rounded-lg line-clamp-2">
                          {item.highlight}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-[var(--vg-ink-muted)] pt-0.5">
                          <span className="truncate">{item.citation}</span>
                          <span className="font-medium text-[var(--vg-brand)] group-hover:underline shrink-0 ml-2">
                            Preview →
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </BrowserFrame>
        </MotionReveal>
      </Container>

      {/* Accessible File Preview Dialog */}
      <AnimatePresence>
        {selectedFile && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-preview-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080E0C]/70 backdrop-blur-sm"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: VG_MOTION.durations.micro, ease: VG_MOTION.ease }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedFile.type === 'photo' ? (
                    <ImageIcon className="w-4 h-4 text-[var(--vg-brand)] shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-[var(--vg-brand)] shrink-0" />
                  )}
                  <h3
                    id="demo-preview-title"
                    className="text-[16px] font-semibold text-[var(--vg-ink)] truncate"
                  >
                    {selectedFile.filename}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  aria-label="Close sample file preview"
                  className="w-8 h-8 rounded-full border border-[var(--vg-border)] flex items-center justify-center text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <img
                src={selectedFile.thumb}
                alt={selectedFile.alt}
                className="w-full h-56 rounded-2xl object-cover border border-[var(--vg-border)]"
              />

              <div className="space-y-2 text-[13px]">
                <p className="font-semibold text-[var(--vg-brand)]">
                  {selectedFile.citation}
                </p>
                <p className="text-[var(--vg-ink)] leading-relaxed">{selectedFile.highlight}</p>
                <p className="text-[var(--vg-ink-2)] leading-relaxed">{selectedFile.excerpt}</p>
              </div>

              <div className="pt-2 border-t border-[var(--vg-border)] flex items-center justify-between text-[12px] text-[var(--vg-ink-muted)]">
                <span>
                  Uploaded {selectedFile.date} · {selectedFile.size}
                </span>
                <span>Sample workspace item</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  )
}
