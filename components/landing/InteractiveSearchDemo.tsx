import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowUpRight,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import {
  VG_COMPONENTS,
  VG_LAYOUT,
  VG_MOTION,
  VG_TYPOGRAPHY,
} from '@/components/landing/design-system'
import { MotionReveal } from '@/components/landing/motion'
import { Container, Section } from '@/components/landing/ui'
import { cn } from '@/lib/utils'

type SearchMode = 'photo' | 'document' | 'question'

interface AuraMemoryItem {
  id: string
  filename: string
  kind: 'photo' | 'document'
  categoryLabel: string
  date: string
  thumb: string
  alt: string
  sceneSummary: string
  documentExcerpt: string
  citation: string
  tags: string[]
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
  'where',
  'which',
  'how',
  'can',
  'you',
  'your',
  'our',
  'have',
  'about',
  'into',
  'all',
  'did',
  'notes',
  'photos',
  'photo',
])

const AURA_MEMORIES: AuraMemoryItem[] = [
  {
    id: 'aura-travel',
    filename: 'Harbor_Walk_Camera.webp',
    kind: 'photo',
    categoryLabel: 'Summer Trip · Coast',
    date: 'Aug 18',
    thumb: '/landing/photos/aura-personal-travel.webp',
    alt: 'Traveler with a woven tote and film camera walking along a sunlit stone harbor balustrade overlooking fishing boats',
    sceneSummary:
      'Sunlit stone promenade beside calm harbor boats with a woven market bag and analog camera slung over linen.',
    documentExcerpt:
      'EXIF location note: Old Harbor Promenade · late afternoon warm light, 35mm.',
    citation: 'Harbor_Walk_Camera.webp · Summer Album',
    tags: ['summer', 'trip', 'travel', 'harbor', 'coast', 'coastal', 'camera', 'walk', 'boats', 'seaside'],
  },
  {
    id: 'aura-train',
    filename: 'Coastal_Train_Ticket.webp',
    kind: 'photo',
    categoryLabel: 'Summer Trip · Transit',
    date: 'Aug 16',
    thumb: '/landing/photos/aura-train-journey.webp',
    alt: 'Passenger hand resting on a leather notebook beside a pale green paper train ticket overlooking the Mediterranean coast',
    sceneSummary:
      'Window seat along the coastal rail line with a leather travel journal and pale green fare stub on the sill.',
    documentExcerpt:
      'Ticket stub #408-B · Coastal Express morning departure, Seat 14A, hand-annotated in margin.',
    citation: 'Coastal_Train_Ticket.webp · Travel Stub',
    tags: ['summer', 'trip', 'train', 'ticket', 'stub', 'coast', 'coastal', 'journey', 'leather', 'notebook'],
  },
  {
    id: 'aura-journal',
    filename: 'October_14_Journal.webp',
    kind: 'document',
    categoryLabel: 'Handwritten Page · Ink',
    date: 'Oct 14',
    thumb: '/landing/photos/aura-journal-desk.webp',
    alt: 'Open fountain-pen journal dated October 14 with an ink sketch of a coffee cup and botanical leaves beside a speckled ceramic mug',
    sceneSummary:
      'Open cloth-bound notebook bathed in morning window light beside a fountain pen and speckled espresso cup.',
    documentExcerpt:
      '“October 14 — Quiet morning by the front window. Sketched the espresso cup and eucalyptus stems before walking down to the square.”',
    citation: 'October_14_Journal.webp · Handwritten Entry',
    tags: ['october', '14', 'handwritten', 'coffee', 'espresso', 'sketch', 'journal', 'ink', 'cup', 'page'],
  },
  {
    id: 'aura-morning',
    filename: 'Morning_Kitchen_Pears.webp',
    kind: 'photo',
    categoryLabel: 'Home · Everyday',
    date: 'Sep 29',
    thumb: '/landing/photos/aura-family-morning.webp',
    alt: 'Two pairs of hands arranging fresh green pears and sage leaves in a speckled ceramic bowl on a warm wooden kitchen table',
    sceneSummary:
      'Late-morning kitchen counter with fresh orchard pears, garden sage, linen towel, and stoneware mug.',
    documentExcerpt:
      'Shared household album · Captured in natural doorway light without flash.',
    citation: 'Morning_Kitchen_Pears.webp · Home Album',
    tags: ['morning', 'kitchen', 'pears', 'family', 'home', 'bowl', 'sage', 'table'],
  },
  {
    id: 'aura-study',
    filename: 'Garden_Window_Desk.webp',
    kind: 'document',
    categoryLabel: 'Study Notes · Workspace',
    date: 'Oct 06',
    thumb: '/landing/photos/aura-study-table.webp',
    alt: 'Timber study desk beside a casement garden window with a brass lamp, stacked books, laptop, and handwritten sticky notes',
    sceneSummary:
      'Quiet wooden desk lit by a warm brass lamp beside garden greenery, cloth books, and desk reminders.',
    documentExcerpt:
      'Extracted desk notes: “1. Call architect Tuesday · 2. Archive summer film rolls · 3. Order archival linen boxes.”',
    citation: 'Garden_Window_Desk.webp · Desk Notes',
    tags: ['desk', 'study', 'window', 'garden', 'books', 'sticky', 'notes', 'lamp', 'architect'],
  },
  {
    id: 'aura-camera',
    filename: 'Rangefinder_Contact_Sheet.webp',
    kind: 'document',
    categoryLabel: 'Archive · Film Log',
    date: 'Sep 11',
    thumb: '/landing/photos/aura-heirloom-object.webp',
    alt: 'Silver rangefinder film camera with 50mm lens resting beside black-and-white coastal contact print strips and a brass loupe',
    sceneSummary:
      'Silver 35mm rangefinder camera beside black-and-white contact strips and a folding brass inspection loupe.',
    documentExcerpt:
      'Engraved body & lens log: 50mm f/2 Summicron · Contact strip #12 frames 4–9 marked for silver print.',
    citation: 'Rangefinder_Contact_Sheet.webp · Film Archive',
    tags: ['film', 'camera', 'contact', 'sheet', 'rangefinder', 'loupe', '50mm', 'print', 'archive'],
  },
]

interface ModeConfig {
  id: SearchMode
  label: string
  prompts: string[]
  icon: typeof ImageIcon
}

const MODE_CONFIGS: ModeConfig[] = [
  {
    id: 'photo',
    label: 'Find a photo',
    prompts: [
      'Find the photos from our summer trip',
      'Morning pears on the wooden kitchen table',
      'Coastal train window seat',
    ],
    icon: ImageIcon,
  },
  {
    id: 'document',
    label: 'Find a document',
    prompts: [
      'Handwritten coffee sketch from October 14',
      'Desk notes beside the garden window',
      'Coastal train ticket stub',
    ],
    icon: FileText,
  },
  {
    id: 'question',
    label: 'Ask a question',
    prompts: [
      'What lens is logged with my contact sheet?',
      'Where did I sketch the coffee cup in October?',
      'Which photos are from our summer trip?',
    ],
    icon: MessageSquare,
  },
]

interface AnswerSynthesis {
  answer: string
  sourceId: string
}

function synthesizeAnswer(query: string, topMatch: AuraMemoryItem | null): AnswerSynthesis | null {
  const clean = query.toLowerCase()
  if (clean.includes('lens') || clean.includes('contact') || clean.includes('camera')) {
    return {
      answer:
        'Your film archive log pairs a silver 35mm rangefinder with a 50mm f/2 lens, with frames 4–9 on contact strip #12 marked for printing.',
      sourceId: 'aura-camera',
    }
  }
  if (clean.includes('sketch') || clean.includes('coffee') || clean.includes('october')) {
    return {
      answer:
        'In your October 14 journal entry, you sketched an espresso cup and eucalyptus stems by the front window before walking down to the square.',
      sourceId: 'aura-journal',
    }
  }
  if (clean.includes('summer') || clean.includes('trip') || clean.includes('coast')) {
    return {
      answer:
        'Two summer trip memories matched: your afternoon walk along the sunlit stone harbor and the coastal rail journey with your green fare stub.',
      sourceId: 'aura-travel',
    }
  }
  if (!topMatch) return null
  return {
    answer: `${topMatch.sceneSummary} ${topMatch.documentExcerpt}`,
    sourceId: topMatch.id,
  }
}

/**
 * Chapter 02 — Interactive Sample Search Demo (Project Aura).
 * Uses deterministic matching across 6 bespoke editorial memories with spring choreography.
 */
export function InteractiveSearchDemo() {
  const prefersReducedMotion = useReducedMotion()
  const [mode, setMode] = useState<SearchMode>('photo')
  const [query, setQuery] = useState(MODE_CONFIGS[0].prompts[0])
  const [typingTarget, setTypingTarget] = useState<string | null>(null)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [inspectedId, setInspectedId] = useState<string | null>(null)

  const activeMode = MODE_CONFIGS.find((m) => m.id === mode) || MODE_CONFIGS[0]

  const triggerPrompt = (prompt: string) => {
    setInspectedId(null)
    if (prefersReducedMotion) {
      setTypingTarget(null)
      setQuery(prompt)
      return
    }
    setTypingTarget(prompt)
  }

  const handleModeChange = (next: SearchMode) => {
    setMode(next)
    const cfg = MODE_CONFIGS.find((m) => m.id === next) || MODE_CONFIGS[0]
    triggerPrompt(cfg.prompts[0])
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
    }, 20)
    return () => clearInterval(timer)
  }, [typingTarget, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) {
      setCursorVisible(false)
      return
    }
    const blink = setInterval(() => setCursorVisible((v) => !v), 530)
    return () => clearInterval(blink)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (!inspectedId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inspectedId])

  const matchedSet = useMemo(() => {
    const clean = query.trim().toLowerCase()
    if (!clean) {
      return new Set(AURA_MEMORIES.map((item) => item.id))
    }

    const tokens = clean
      .replace(/[?.!,]/g, '')
      .split(/\s+/)
      .filter((t) => t.length >= 2 && !STOPWORDS.has(t))

    if (tokens.length === 0) {
      return new Set(AURA_MEMORIES.map((item) => item.id))
    }

    const scored = AURA_MEMORIES.map((item) => {
      const tags = item.tags.map((t) => t.toLowerCase())
      const text = `${item.filename} ${item.categoryLabel} ${item.sceneSummary} ${item.documentExcerpt}`.toLowerCase()
      let score = 0
      tokens.forEach((tok) => {
        if (tags.includes(tok)) score += 5
        else if (tags.some((tag) => tag.startsWith(tok) || tok.startsWith(tag))) score += 3
        else if (text.includes(tok)) score += 1
      })
      if (mode === 'photo' && item.kind === 'photo' && score > 0) score += 1
      if (mode === 'document' && item.kind === 'document' && score > 0) score += 1
      return { id: item.id, score }
    })
      .filter((entry) => entry.score >= 3 || (tokens.length === 1 && entry.score > 0))
      .sort((a, b) => b.score - a.score)

    return new Set(scored.map((s) => s.id))
  }, [mode, query])

  const orderedMemories = useMemo(() => {
    const clean = query.trim()
    if (!clean) return AURA_MEMORIES
    return [...AURA_MEMORIES].sort((a, b) => {
      const aHit = matchedSet.has(a.id) ? 1 : 0
      const bHit = matchedSet.has(b.id) ? 1 : 0
      return bHit - aHit
    })
  }, [matchedSet, query])

  const topMatchedItem = useMemo(
    () => orderedMemories.find((m) => matchedSet.has(m.id)) || null,
    [matchedSet, orderedMemories]
  )

  const questionAnswer = useMemo(() => {
    if (mode !== 'question' || !query.trim()) return null
    return synthesizeAnswer(query, topMatchedItem)
  }, [mode, query, topMatchedItem])

  const inspectedItem = useMemo(
    () => AURA_MEMORIES.find((item) => item.id === inspectedId) || null,
    [inspectedId]
  )

  const hasActiveQuery = query.trim().length > 0
  const matchedCount = hasActiveQuery ? matchedSet.size : AURA_MEMORIES.length

  return (
    <Section
      id="search-demo"
      surface="default"
      ariaLabel="Interactive search demonstration"
      className="py-16 sm:py-20 lg:py-24 border-t border-[var(--vg-border)]"
    >
      <Container>
        {/* Centered Editorial Grotesk Heading (Zero serif italics) */}
        <MotionReveal className="max-w-[820px] mx-auto text-center space-y-4">
          <p className="text-[13px] font-medium text-[var(--vg-ink-2)]">
            Interactive sample demo · Sample files only
          </p>
          <h2
            className="font-display font-bold text-[var(--vg-ink)]"
            style={{
              fontSize: VG_TYPOGRAPHY.scale.h2.fontSize,
              lineHeight: VG_TYPOGRAPHY.scale.h2.lineHeight,
              letterSpacing: VG_TYPOGRAPHY.scale.h2.letterSpacing,
              textWrap: 'balance',
            }}
          >
            Remember a little. Find a lot.
          </h2>
          <p
            className="text-[var(--vg-ink-2)] max-w-2xl mx-auto"
            style={{
              fontSize: VG_TYPOGRAPHY.scale.lead.fontSize,
              lineHeight: VG_TYPOGRAPHY.scale.lead.lineHeight,
            }}
          >
            Search in everyday words across moments you photographed, pages you scanned, or details tucked inside a note.
          </p>
        </MotionReveal>

        {/* Studio Inquiry Stage */}
        <MotionReveal delay={0.08} className="mt-9 max-w-[1160px] mx-auto space-y-5">
          <div className={cn(VG_COMPONENTS.cards.surface, 'p-4 sm:p-6 space-y-5')}>
            {/* Mode Switcher + Clear Label */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div
                role="tablist"
                aria-label="Search inquiry mode"
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
                      onClick={() => handleModeChange(item.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                        active ? VG_COMPONENTS.buttons.tabActive : VG_COMPONENTS.buttons.tabIdle
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>

              <span className="text-[12.5px] font-medium text-[var(--vg-ink-2)]">
                {matchedCount} of {AURA_MEMORIES.length} sample memories matched
              </span>
            </div>

            {/* Prominent Search Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-[var(--vg-brand)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <label htmlFor="public-search-demo-input" className="sr-only">
                  Try searching sample VectorGallery memories
                </label>
                <input
                  id="public-search-demo-input"
                  type="text"
                  value={typingTarget ? `${query}${cursorVisible ? '▍' : ''}` : query}
                  onChange={(e) => {
                    setTypingTarget(null)
                    setQuery(e.target.value.replace(/▍/g, ''))
                  }}
                  placeholder="Find the photos from our summer trip"
                  className={cn(VG_COMPONENTS.inputs.search, 'pr-28')}
                />
                <div className="hidden sm:flex items-center gap-1.5 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[11.5px] text-[var(--vg-ink-muted)]">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'inline-block w-1.5 h-3.5 rounded-[1px] bg-[var(--vg-brand)] transition-opacity',
                      cursorVisible || prefersReducedMotion ? 'opacity-100' : 'opacity-20'
                    )}
                  />
                  <span>{typingTarget ? 'Searching…' : 'Live demo'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTypingTarget(null)
                  setQuery('')
                  setInspectedId(null)
                }}
                className={cn(VG_COMPONENTS.buttons.secondary, 'h-12 px-5 text-[13px] shrink-0')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show all</span>
              </button>
            </div>

            {/* Clickable Sample Queries */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Sample search prompts">
              {activeMode.prompts.map((prompt) => {
                const active = query === prompt && !typingTarget
                return (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => triggerPrompt(prompt)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                      active ? VG_COMPONENTS.buttons.tabActive : VG_COMPONENTS.buttons.tabIdle
                    )}
                  >
                    {prompt}
                  </button>
                )
              })}
            </div>

            {/* Grounded Answer Bar (Ask a question mode) */}
            {mode === 'question' && questionAnswer && (
              <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[14.5px] leading-relaxed text-[var(--vg-ink)]">
                  {questionAnswer.answer}
                </p>
                {(() => {
                  const source = AURA_MEMORIES.find((m) => m.id === questionAnswer.sourceId)
                  if (!source) return null
                  return (
                    <button
                      type="button"
                      onClick={() => setInspectedId(source.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--vg-surface)] border border-[var(--vg-border)] hover:border-[var(--vg-brand)] text-[12px] font-mono text-[var(--vg-brand)] shrink-0 transition-colors"
                    >
                      <span>[1] {source.filename}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )
                })()}
              </div>
            )}

            {/* Empty Match Reassurance */}
            {hasActiveQuery && matchedSet.size === 0 && (
              <div className="rounded-2xl border border-dashed border-[var(--vg-border-strong)] bg-[var(--vg-surface-2)] p-6 text-center space-y-1.5">
                <p className="text-[15px] font-semibold text-[var(--vg-ink)]">
                  Nothing in the 6 sample files matched that phrase.
                </p>
                <p className="text-[13.5px] text-[var(--vg-ink-2)]">
                  VectorGallery stays honest when a memory is missing instead of guessing. Try a sample prompt above or click Show all.
                </p>
              </div>
            )}

            {/* Spatial Gallery of 6 Memories — Matched spring forward, unrelated gently recede */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {orderedMemories.map((item) => {
                const isMatched = !hasActiveQuery || matchedSet.has(item.id)
                return (
                  <motion.button
                    key={item.id}
                    layout={!prefersReducedMotion}
                    layoutId={prefersReducedMotion ? undefined : `memory-card-${item.id}`}
                    type="button"
                    onClick={() => setInspectedId(item.id)}
                    animate={
                      prefersReducedMotion
                        ? { opacity: isMatched ? 1 : 0.48 }
                        : {
                            opacity: isMatched ? 1 : 0.48,
                            scale: isMatched ? 1 : 0.96,
                          }
                    }
                    transition={VG_MOTION.springSnappy}
                    className={cn(
                      'group text-left rounded-2xl border p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                      isMatched
                        ? 'bg-[var(--vg-surface)] border-[var(--vg-border)] hover:border-[var(--vg-brand)] hover:-translate-y-0.5 shadow-[var(--vg-shadow-card)] hover:shadow-[var(--vg-shadow-hero)]'
                        : 'bg-[var(--vg-surface-2)] border-[var(--vg-border)]'
                    )}
                  >
                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[var(--vg-surface-2)] mb-2.5 relative">
                      <img
                        src={item.thumb}
                        alt={item.alt}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      {hasActiveQuery && isMatched && (
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#087F5B] text-[#FFFFFF] dark:bg-[#58D6A8] dark:text-[#071912]">
                          Match
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 px-1">
                      <div className="flex items-center justify-between gap-2 text-[11.5px]">
                        <span className="font-medium text-[var(--vg-brand)] truncate">
                          {item.categoryLabel}
                        </span>
                        <span className="text-[var(--vg-ink-muted)] shrink-0">{item.date}</span>
                      </div>

                      <h3 className="text-[14px] font-semibold text-[var(--vg-ink)] truncate">
                        {item.filename}
                      </h3>

                      <p className="text-[12.5px] leading-relaxed text-[var(--vg-ink-2)] line-clamp-2">
                        {mode === 'document' ? item.documentExcerpt : item.sceneSummary}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </MotionReveal>
      </Container>

      {/* Smooth Shared-Transition File Inspection Panel */}
      <AnimatePresence>
        {inspectedItem && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="aura-memory-inspect-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D0C]/70 backdrop-blur-sm"
            onClick={() => setInspectedId(null)}
          >
            <motion.div
              layoutId={prefersReducedMotion ? undefined : `memory-card-${inspectedItem.id}`}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.9, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              transition={VG_MOTION.springSnappy}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-full max-w-xl rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-[var(--vg-brand)]">
                    {inspectedItem.categoryLabel} · {inspectedItem.date}
                  </p>
                  <h3
                    id="aura-memory-inspect-title"
                    className="font-display text-[18px] font-bold text-[var(--vg-ink)] truncate"
                  >
                    {inspectedItem.filename}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedId(null)}
                  aria-label="Close memory inspection panel"
                  className="w-9 h-9 rounded-full border border-[var(--vg-border)] flex items-center justify-center text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface-2)]">
                <img
                  src={inspectedItem.thumb}
                  alt={inspectedItem.alt}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] p-4 space-y-2">
                <p className="text-[13.5px] leading-relaxed text-[var(--vg-ink)]">
                  {inspectedItem.sceneSummary}
                </p>
                <p className="text-[13px] leading-relaxed text-[var(--vg-ink-2)] border-t border-[var(--vg-border)] pt-2">
                  {inspectedItem.documentExcerpt}
                </p>
              </div>

              <div className="flex items-center justify-between text-[12px] text-[var(--vg-ink-muted)]">
                <span className="font-mono truncate">{inspectedItem.citation}</span>
                <span className="shrink-0 ml-2">Sample workspace item</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  )
}
