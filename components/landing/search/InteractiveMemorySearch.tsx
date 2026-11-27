import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { VG_COMPONENTS, VG_MOTION } from '@/components/landing/design-system'
import { SplitTextReveal } from '@/components/landing/motion/LivingMotionPrimitives'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { MotionReveal } from '@/components/landing/motion'
import { Container, Section } from '@/components/landing/ui'
import { cn } from '@/lib/utils'

type SearchMode = 'all' | 'photo' | 'document' | 'question'

interface MemoryRecord {
  id: string
  filename: string
  kind: 'photo' | 'document'
  categoryLabel: string
  date: string
  thumb: string
  alt: string
  sceneSummary: string
  ocrExcerpt: string
  aiAnswer: string
  citation: string
  tags: string[]
}

const STOPWORDS = new Set([
  'find', 'show', 'from', 'the', 'with', 'that', 'this', 'for', 'and', 'are',
  'was', 'were', 'what', 'where', 'which', 'how', 'can', 'you', 'your', 'our',
  'have', 'about', 'into', 'all', 'did', 'my', 'say', 'photos', 'to', 'in',
  'on', 'at', 'of', 'by', 'is', 'it', 'or', 'be',
])

const MEMORY_CORPUS: MemoryRecord[] = [
  {
    id: 'boarding-pass',
    filename: 'coastal_line_seat_14a.jpg',
    kind: 'document',
    categoryLabel: 'Boarding Pass',
    date: 'Oct 24',
    thumb: '/landing/photos/aura-ticket-coastal.webp',
    alt: 'Coastal Line train boarding pass for Seat 14A departing Marseille St Charles to Nice Ville',
    sceneSummary: 'Perforated paper train ticket stub photographed on dark slate.',
    ocrExcerpt: 'COASTAL LINE · SEAT 14A · 08:40 · FROM: MARSEILLE ST CHARLES -> TO: NICE VILLE · TRN 045',
    aiAnswer: 'Your Coastal Line train ticket to Nice is Seat 14A departing at 08:40 from Marseille St Charles on Train 045.',
    citation: 'coastal_line_seat_14a.jpg · OCR Line 1-6',
    tags: ['train', 'ticket', 'nice', 'marseille', 'coastal', 'line', 'seat', '14a', 'pass', '08:40'],
  },
  {
    id: 'dinner-september',
    filename: 'olive_garden_dinner_sep24.webp',
    kind: 'photo',
    categoryLabel: 'September Gathering',
    date: 'Sep 24',
    thumb: '/landing/photos/aura-evening-gathering.webp',
    alt: 'Friends gathered around a candlelit stone courtyard table beneath olive trees in September',
    sceneSummary: 'Candlelit courtyard dinner table beneath olive trees with friends.',
    ocrExcerpt: 'September Courtyard Dinner · Olive garden table, shared supper & beeswax candles.',
    aiAnswer: 'Found two September evening dinner memories: Olive Courtyard Supper (Sep 24) and the terrace celebration toast (Sep 19).',
    citation: 'olive_garden_dinner_sep24.webp · Gatherings',
    tags: ['dinner', 'september', 'supper', 'friends', 'courtyard', 'olive', 'evening', 'table', 'candles'],
  },
  {
    id: 'celebration-toast',
    filename: 'terrace_celebration_sep19.webp',
    kind: 'photo',
    categoryLabel: 'Celebration Album',
    date: 'Sep 19',
    thumb: '/landing/photos/aura-celebration-toast.webp',
    alt: 'Friends raising cut-crystal glasses in a warm golden-hour dinner toast above celebration cake',
    sceneSummary: 'Golden-hour terrace dinner toast with crystal coupes and pistachio cake.',
    ocrExcerpt: 'September Terrace Celebration · Golden hour toast & lit cake candles.',
    aiAnswer: 'Captured on September 19 at dusk — friends raising glasses together around the terrace table.',
    citation: 'terrace_celebration_sep19.webp · Celebrations',
    tags: ['dinner', 'september', 'celebration', 'toast', 'cake', 'terrace', 'friends'],
  },
  {
    id: 'receipt',
    filename: 'studio_equip_receipt_10482.png',
    kind: 'document',
    categoryLabel: 'Expense Receipt',
    date: 'May 24',
    thumb: '/landing/photos/aura-receipt-studio.webp',
    alt: 'Studio Equip Co receipt #10482 totaling $153.36 for Acoustic Headphones and Desk Lamp',
    sceneSummary: 'Printed Studio Equip Co receipt #10482 showing Acoustic Headphones ($89.00).',
    ocrExcerpt: 'STUDIO EQUIP. CO. · REC #10482 · ACOUSTIC HEADPHONES $89.00 · DESK LAMP $45.00 · TOTAL $153.36',
    aiAnswer: 'Studio Equip Co receipt #10482 shows Acoustic Headphones ($89.00) and a Desk Lamp ($45.00), totaling $153.36 USD with tax.',
    citation: 'studio_equip_receipt_10482.png · REC #10482',
    tags: ['receipt', 'headphones', 'acoustic', 'studio', 'equip', '153.36', '89.00', '10482', 'lamp'],
  },
  {
    id: 'deadlines',
    filename: 'project_deadline_notes.webp',
    kind: 'document',
    categoryLabel: 'Project Notes',
    date: 'Oct 18',
    thumb: '/landing/photos/aura-deadline-notes.webp',
    alt: 'Handwritten project deadline notes on grid paper reading Final archive QA Oct 18 and Public release tag Oct 25',
    sceneSummary: 'Grid notebook spread listing Final archive QA (Oct 18) and Release tag (Oct 25).',
    ocrExcerpt: 'PROJECT DEADLINE NOTES · Final archive QA: Oct 18 · Mobile backup test: Oct 21 · Public release tag: Oct 25',
    aiAnswer: 'Your handwritten project notes set three deadlines: Final archive QA on Oct 18, Mobile backup test on Oct 21, and Public release tag on Oct 25.',
    citation: 'project_deadline_notes.webp · Notebook Spread',
    tags: ['project', 'notes', 'deadline', 'deadlines', 'oct', '18', '21', '25', 'release', 'qa', 'backup'],
  },
  {
    id: 'university',
    filename: 'northridge_registration_letter.pdf',
    kind: 'document',
    categoryLabel: 'University Record',
    date: 'Nov 18',
    thumb: '/landing/photos/aura-university-letter.webp',
    alt: 'Northridge University Autumn Certificate of Project Registration showing November 18 deadline',
    sceneSummary: 'Northridge University project registration letter specifying the Nov 18 submission deadline.',
    ocrExcerpt: 'NORTHRIDGE UNIVERSITY · Coastal Archive Research · Submission Window Deadline: November 18',
    aiAnswer: 'Your Northridge University registration confirms Coastal Archive Mapping & Spatial Data Analysis must be finalized before November 18.',
    citation: 'northridge_registration_letter.pdf · Academic Registry',
    tags: ['university', 'northridge', 'project', 'deadline', 'registration', 'submission', 'november', '18', 'letter'],
  },
]

const SAMPLE_PROMPTS: Array<{ label: string; query: string; mode: SearchMode }> = [
  { label: 'Train ticket to Nice', query: 'Find my train ticket to Nice.', mode: 'document' },
  { label: 'Dinner photos in September', query: 'Find our dinner photos from September.', mode: 'photo' },
  { label: 'Headphones receipt', query: 'Show the receipt for my headphones.', mode: 'document' },
  { label: 'Project deadline notes', query: 'What did my project notes say about the deadline?', mode: 'question' },
]

function HighlightedText({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length) return <>{text}</>
  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = `\\b(${escaped.join('|')})\\b`
  const splitRegex = new RegExp(pattern, 'gi')
  const matchRegex = new RegExp(`^${pattern}$`, 'i')
  const parts = text.split(splitRegex)
  return (
    <>
      {parts.map((part, idx) =>
        matchRegex.test(part) ? (
          <mark
            key={idx}
            className="px-1 py-0.5 rounded bg-[#CDFF45]/75 dark:bg-[#CDFF45]/25 text-[#101211] dark:text-[#CDFF45] font-semibold"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={idx}>{part}</React.Fragment>
        )
      )}
    </>
  )
}

export function InteractiveMemorySearch() {
  const reduced = useReducedMotion()
  const [query, setQuery] = useState('Find my train ticket to Nice.')
  const [mode, setMode] = useState<SearchMode>('all')
  const [selectedId, setSelectedId] = useState<string>('boarding-pass')

  const { tokens, matches } = useMemo(() => {
    const cleanTokens = query
      .toLowerCase()
      .split(/[\s.,/#!$?]+/)
      .filter((t) => t.length > 1 && !STOPWORDS.has(t))

    const pool = MEMORY_CORPUS.filter((m) => {
      if (mode === 'photo') return m.kind === 'photo'
      if (mode === 'document') return m.kind === 'document'
      return true
    })

    if (cleanTokens.length === 0) {
      return { tokens: [], matches: pool }
    }

    const scored = pool
      .map((item) => {
        const hay = `${item.filename} ${item.categoryLabel} ${item.sceneSummary} ${item.ocrExcerpt} ${item.tags.join(' ')}`.toLowerCase()
        let score = 0
        for (const tok of cleanTokens) {
          if (item.tags.some((t) => t === tok)) score += 5
          else if (hay.includes(tok)) score += 2
        }
        return { item, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((e) => e.item)

    return { tokens: cleanTokens, matches: scored }
  }, [query, mode])

  const activeItem = matches.find((m) => m.id === selectedId) || matches[0] || null

  const applySample = (sample: (typeof SAMPLE_PROMPTS)[number]) => {
    setQuery(sample.query)
    setMode(sample.mode)
    setSelectedId('')
  }

  return (
    <Section id="search" surface="default" ariaLabel="Interactive natural-language memory search">
      <Container wide className="scroll-mt-24">
        <div className="max-w-4xl mb-10 sm:mb-12">
          <p className="text-[13px] font-medium text-[#087F5B] dark:text-[#46D6A4] mb-3">
            Interactive Sample Demonstration
          </p>

          <SplitTextReveal
            as="h2"
            text="Don't search harder. Remember naturally."
            className="font-display font-bold tracking-[-0.04em] leading-[1.03] text-[#101211] dark:text-[#F4F6F2]"
            style={{ fontSize: 'clamp(2.2rem, 4.4vw, 4.65rem)' }}
          />
          <p className="mt-4 text-[16px] sm:text-[17.5px] leading-[1.6] text-[var(--vg-ink-2)] max-w-2xl">
            Ask for a destination on a ticket stub, a September dinner table, an equipment receipt, or handwritten deadline notes—VectorGallery surfaces exact files and cites where the detail lives.
          </p>
        </div>

        {/* Focused Studio Spatial Search Workbench */}
        <MotionReveal className="rounded-[2rem] border border-[var(--vg-border-strong)] bg-[#FFFFFF]/90 dark:bg-[#111416]/90 backdrop-blur-xl shadow-[var(--vg-shadow-hero)] p-4 sm:p-6 lg:p-8">
          {/* Natural-Language Search Input + Mode Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3.5 pb-5 border-b border-[var(--vg-border)]">
            <div className="relative flex-1">
              <Search className="w-4.5 h-4.5 text-[#087F5B] dark:text-[#CDFF45] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search sample archive by phrase, receipt, or detail"
                placeholder="Ask naturally: train ticket to Nice, headphones receipt, deadline notes..."
                className={VG_COMPONENTS.inputs.search}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[var(--vg-surface-2)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter results by category">
              {(
                [
                  { id: 'all', label: 'Everything', icon: Search },
                  { id: 'photo', label: 'Photos', icon: ImageIcon },
                  { id: 'document', label: 'Documents', icon: FileText },
                  { id: 'question', label: 'AI Answers', icon: MessageSquare },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon
                const active = mode === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMode(tab.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-[13px] font-medium border transition-all',
                      active ? VG_COMPONENTS.buttons.tabActive : VG_COMPONENTS.buttons.tabIdle
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Example Query Prompts + Reset */}
          <div className="flex flex-wrap items-center gap-2 py-4 border-b border-[var(--vg-border)]">
            <span className="text-[12px] font-medium text-[var(--vg-ink-2)] mr-1">Try asking:</span>
            {SAMPLE_PROMPTS.map((item) => {
              const isSelected = query === item.query
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => applySample(item)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors',
                    isSelected
                      ? 'bg-[#CDFF45] text-[#101211] border-[#101211]/15 font-semibold'
                      : 'bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                  )}
                >
                  {item.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => applySample(SAMPLE_PROMPTS[0])}
              className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset demo</span>
            </button>
          </div>

          {/* Results Area OR Genuine Empty / Unsupported Query Guidance */}
          {matches.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] flex items-center justify-center text-[var(--vg-ink-2)]">
                <Search className="w-5 h-5" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <p className="font-display text-lg font-bold text-[#101211] dark:text-[#F4F6F2]">
                  No matches for &ldquo;{query}&rdquo; in this sample set
                </p>
                <p className="text-[13.5px] text-[var(--vg-ink-2)] leading-relaxed">
                  This deterministic public demo indexes six personal sample artifacts. Try one of the prompts above or explore your full library inside the Web Vault.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => applySample(SAMPLE_PROMPTS[0])}
                  className={VG_COMPONENTS.buttons.secondarySm}
                >
                  Restore sample query
                </button>
                <Link href="/app" className={VG_COMPONENTS.buttons.primarySm}>
                  Open Web Vault
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-start">
              {/* Left Shared-Element Animated Result List */}
              <div className="lg:col-span-5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1 mb-1 text-[12px] text-[var(--vg-ink-2)]">
                  <span className="font-medium">
                    {matches.length} matching {matches.length === 1 ? 'memory' : 'memories'}
                  </span>
                  <span>Deterministic sample preview</span>
                </div>

                <LayoutGroup>
                  {matches.map((item) => {
                    const isSelected = activeItem?.id === item.id
                    return (
                      <motion.button
                        key={item.id}
                        layout={!reduced}
                        transition={{ duration: 0.28, ease: VG_MOTION.ease }}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          'w-full text-left p-3 rounded-2xl border flex items-center gap-3.5 transition-colors',
                          isSelected
                            ? 'bg-[#F4F5F2] dark:bg-[#191D20] border-[#087F5B] dark:border-[#CDFF45] shadow-sm'
                            : 'bg-[var(--vg-surface)] border-[var(--vg-border)] hover:border-[var(--vg-border-strong)]'
                        )}
                      >
                        <div className="w-16 h-14 rounded-xl overflow-hidden bg-[var(--vg-surface-2)] shrink-0 border border-[var(--vg-border)]">
                          <img src={item.thumb} alt={item.alt} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[12px] font-semibold text-[#101211] dark:text-[#F4F6F2] truncate">
                              {item.filename}
                            </span>
                            <span className="text-[11px] font-mono text-[var(--vg-ink-2)] shrink-0">
                              {item.date}
                            </span>
                          </div>
                          <p className="text-[12.5px] text-[var(--vg-ink-2)] line-clamp-1 mt-0.5">
                            <HighlightedText text={item.sceneSummary} tokens={tokens} />
                          </p>
                          <span className="inline-block mt-1 text-[11px] font-medium text-[#087F5B] dark:text-[#46D6A4]">
                            {item.categoryLabel}
                          </span>
                        </div>
                      </motion.button>
                    )
                  })}
                </LayoutGroup>
              </div>

              {/* Right Enlarging Memory Preview + Highlighted Citation */}
              {activeItem && (
                <div className="lg:col-span-7">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeItem.id + mode}
                      initial={reduced ? { opacity: 1 } : { opacity: 0.88, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduced ? { opacity: 1 } : { opacity: 0.88, scale: 0.985 }}
                      transition={{ duration: 0.24, ease: VG_MOTION.ease }}
                      className="rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[#F4F5F2] dark:bg-[#090B0D]"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--vg-surface-2)]">
                        <img
                          src={activeItem.thumb}
                          alt={activeItem.alt}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#090B0D]/88 via-[#090B0D]/42 to-transparent flex items-end justify-between gap-3">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#CDFF45] text-[#101211]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Matched Detail</span>
                            </span>
                            <p className="font-mono text-[12px] text-[#F4F6F2] mt-1.5">
                              {activeItem.citation}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 space-y-4">
                        <div className="rounded-xl p-4 bg-[#FFFFFF] dark:bg-[#111416] border border-[#087F5B]/30 dark:border-[#CDFF45]/35 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#087F5B] dark:text-[#CDFF45]">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Grounded Recall Answer</span>
                            </span>
                            <span className="text-[11px] text-[var(--vg-ink-2)]">Cited source</span>
                          </div>
                          <p className="text-[14.5px] leading-[1.6] text-[#101211] dark:text-[#F4F6F2] font-medium">
                            <HighlightedText text={activeItem.aiAnswer} tokens={tokens} />
                          </p>
                        </div>

                        <div className="rounded-xl p-3.5 bg-[#FFFFFF]/70 dark:bg-[#111416]/70 border border-[var(--vg-border)]">
                          <p className="text-[11.5px] font-medium text-[var(--vg-ink-2)] mb-1">
                            Extracted Text &amp; Context
                          </p>
                          <p className="font-mono text-[12px] leading-[1.55] text-[#101211] dark:text-[#F4F6F2]">
                            <HighlightedText text={activeItem.ocrExcerpt} tokens={tokens} />
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <span className="text-[12.5px] text-[var(--vg-ink-2)]">
                            Sample preview dataset. Real vault runs locally without external API keys.
                          </span>
                          <Link
                            href="/app"
                            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#087F5B] dark:text-[#CDFF45] hover:underline"
                          >
                            <span>Try in Web Vault</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </MotionReveal>
      </Container>
    </Section>
  )
}
