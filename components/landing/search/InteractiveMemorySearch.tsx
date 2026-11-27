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
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'

type SearchMode = 'all' | 'photo' | 'document'

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

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

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
  { label: 'Train ticket', query: 'Find my train ticket to Nice.', mode: 'all' },
  { label: 'September dinner', query: 'Find our dinner photos from September.', mode: 'photo' },
  { label: 'Headphones receipt', query: 'Show the receipt for my headphones.', mode: 'document' },
  { label: 'Deadline notes', query: 'What did my project notes say about the deadline?', mode: 'document' },
]

function HighlightedText({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length) return <>{text}</>
  const escaped = tokens.map(escapeRegex)
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
  const { user } = useAuth()
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
        const hay = `${item.filename} ${item.categoryLabel} ${item.sceneSummary} ${item.ocrExcerpt} ${item.tags.join(' ')}`
        let score = 0
        for (const tok of cleanTokens) {
          const wordMatch = new RegExp(`\\b${escapeRegex(tok)}\\b`, 'i')
          if (item.tags.some((t) => t === tok)) score += 5
          else if (wordMatch.test(hay)) score += 2
        }
        return { item, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((e) => e.item)

    return { tokens: cleanTokens, matches: scored }
  }, [query, mode])

  const activeItem = matches.find((m) => m.id === selectedId) || matches[0] || null
  const isModified = query !== SAMPLE_PROMPTS[0].query || mode !== 'all'

  const applySample = (sample: (typeof SAMPLE_PROMPTS)[number]) => {
    setQuery(sample.query)
    setMode(sample.mode)
    setSelectedId('')
  }

  return (
    <Section id="search" surface="default" ariaLabel="Interactive natural-language memory search" className="py-20 sm:py-24">
      <Container wide className="scroll-mt-24">
        <div className="max-w-3xl mb-8 sm:mb-10">
          <p className="text-[13px] font-medium text-[#087F5B] dark:text-[#46D6A4] mb-2.5">
            Interactive Sample Demonstration
          </p>

          <SplitTextReveal
            as="h2"
            text="Don't search harder. Remember naturally."
            className="font-display font-bold tracking-[-0.04em] leading-[1.04] text-[#101211] dark:text-[#F4F6F2]"
            style={{ fontSize: 'clamp(2.1rem, 4.1vw, 4.1rem)' }}
          />
          <p className="mt-3 text-[15.5px] sm:text-[16.5px] leading-[1.58] text-[var(--vg-ink-2)] max-w-2xl">
            Ask for a ticket destination, a September dinner table, a studio receipt, or handwritten deadline notes—VectorGallery surfaces exact files with cited detail.
          </p>
        </div>

        {/* Minimalist Unified Search Workbench */}
        <MotionReveal className="rounded-[2rem] border border-[var(--vg-border-strong)] bg-[#FFFFFF]/95 dark:bg-[#111416]/95 backdrop-blur-xl shadow-[var(--vg-shadow-hero)] p-4 sm:p-6">
          {/* Single Clean Query Bar + Compact 3-Way Scope Switch */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 pb-3.5 border-b border-[var(--vg-border)]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#087F5B] dark:text-[#CDFF45] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search sample archive by phrase, receipt, or detail"
                placeholder="Ask naturally: train ticket to Nice, headphones receipt, deadline notes..."
                className={cn(VG_COMPONENTS.inputs.search, 'h-11 pr-9 text-[14.5px]')}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[var(--vg-surface-2)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div
              className="inline-flex items-center p-1 rounded-full bg-[var(--vg-surface-2)] border border-[var(--vg-border)] self-start lg:self-auto"
              role="group"
              aria-label="Filter results by category"
            >
              {(
                [
                  { id: 'all', label: 'All', icon: Search },
                  { id: 'photo', label: 'Photos', icon: ImageIcon },
                  { id: 'document', label: 'Docs', icon: FileText },
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
                      'inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-colors',
                      active
                        ? 'bg-[#FFFFFF] dark:bg-[#191D20] text-[#101211] dark:text-[#CDFF45] shadow-sm font-semibold'
                        : 'text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quiet Inline Prompt Suggestions (no button stack wall) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 border-b border-[var(--vg-border)] text-[12.5px]">
            <span className="text-[var(--vg-ink-2)]">Try:</span>
            {SAMPLE_PROMPTS.map((item) => {
              const isSelected = query === item.query
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => applySample(item)}
                  className={cn(
                    'py-0.5 transition-colors border-b',
                    isSelected
                      ? 'text-[#101211] dark:text-[#CDFF45] font-semibold border-[#087F5B] dark:border-[#CDFF45]'
                      : 'text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F4F6F2] border-transparent'
                  )}
                >
                  {item.label}
                </button>
              )
            })}
            {isModified && (
              <button
                type="button"
                onClick={() => applySample(SAMPLE_PROMPTS[0])}
                className="ml-auto inline-flex items-center gap-1 text-[12px] text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Results Area OR Clean Empty State */}
          {matches.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3.5">
              <div className="w-11 h-11 mx-auto rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] flex items-center justify-center text-[var(--vg-ink-2)]">
                <Search className="w-4 h-4" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <p className="font-display text-base font-bold text-[#101211] dark:text-[#F4F6F2]">
                  No matches for &ldquo;{query}&rdquo; in this sample set
                </p>
                <p className="text-[13px] text-[var(--vg-ink-2)] leading-relaxed">
                  Try one of the sample phrases above or search your full archive in the Web Vault.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => applySample(SAMPLE_PROMPTS[0])}
                  className={VG_COMPONENTS.buttons.secondarySm}
                >
                  Restore sample
                </button>
                <Link href={user ? '/app' : '/signup'} className={VG_COMPONENTS.buttons.primarySm}>
                  {user ? 'Open Web Vault' : 'Get started'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-5 items-start">
              {/* Left Quiet Result List + Obsidian Extracted Signal Matrix */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1 text-[11.5px] text-[var(--vg-ink-2)]">
                  <span>
                    {matches.length} matching {matches.length === 1 ? 'memory' : 'memories'}
                  </span>
                  <span className="font-mono">Local OCR + Semantic</span>
                </div>

                <LayoutGroup>
                  {matches.map((item) => {
                    const isSelected = activeItem?.id === item.id
                    return (
                      <motion.button
                        key={item.id}
                        layout={!reduced}
                        transition={{ duration: 0.26, ease: VG_MOTION.ease }}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          'w-full text-left p-2.5 rounded-2xl border flex items-center gap-3 transition-colors',
                          isSelected
                            ? 'bg-[#101211] dark:bg-[#191D20] border-[#101211] dark:border-[#CDFF45] text-[#F4F6F2] shadow-md'
                            : 'bg-[var(--vg-surface)] border-[var(--vg-border)] hover:border-[var(--vg-border-strong)]'
                        )}
                      >
                        <div className="w-14 h-12 rounded-xl overflow-hidden bg-[var(--vg-surface-2)] shrink-0 border border-white/10">
                          <img src={item.thumb} alt={item.alt} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                'font-mono text-[11.5px] font-semibold truncate',
                                isSelected ? 'text-[#F4F6F2]' : 'text-[#101211] dark:text-[#F4F6F2]'
                              )}
                            >
                              {item.filename}
                            </span>
                            <span
                              className={cn(
                                'text-[11px] font-mono shrink-0',
                                isSelected ? 'text-[#CDFF45]' : 'text-[var(--vg-ink-2)]'
                              )}
                            >
                              {item.date}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'text-[12px] line-clamp-1 mt-0.5',
                              isSelected ? 'text-[#B8C5CC]' : 'text-[var(--vg-ink-2)]'
                            )}
                          >
                            <HighlightedText text={item.sceneSummary} tokens={tokens} />
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </LayoutGroup>

                {/* Signal Telemetry Card filling left-column balance whenever 1-3 items match */}
                {activeItem && (
                  <div className="mt-1 rounded-2xl bg-[#0D1013] dark:bg-[#161B20] border border-[#101211]/15 dark:border-white/[0.10] p-4 text-[#F4F6F2] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#CDFF45]">
                        Extracted Signal
                      </span>
                      <span className="text-[11px] font-medium text-[#A4AEA9]">
                        {activeItem.categoryLabel}
                      </span>
                    </div>
                    <p className="font-mono text-[11.5px] leading-relaxed text-[#E3E8EA]">
                      <HighlightedText text={activeItem.ocrExcerpt} tokens={tokens} />
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeItem.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[10.5px] font-mono bg-white/[0.08] text-[#B8C5CC] border border-white/[0.08]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Uncropped Gallery Frame + Grounded Recall Pane */}
              {activeItem && (
                <div className="lg:col-span-7">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeItem.id + mode}
                      initial={reduced ? { opacity: 1 } : { opacity: 0.88, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduced ? { opacity: 1 } : { opacity: 0.88, scale: 0.99 }}
                      transition={{ duration: 0.22, ease: VG_MOTION.ease }}
                      className="rounded-2xl overflow-hidden border border-[var(--vg-border-strong)] bg-[#0B0E11] shadow-[var(--vg-shadow-card)]"
                    >
                      {/* Clean Header Strip above image so artifact text/edges are never overlaid */}
                      <div className="px-4 py-2.5 border-b border-white/[0.10] bg-[#111519] flex items-center justify-between gap-3">
                        <span className="font-mono text-[11.5px] text-[#E3E8EA] truncate">
                          {activeItem.citation}
                        </span>
                        <span className="vg-cta-lime inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#CDFF45] text-[#101211] shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Matched</span>
                        </span>
                      </div>

                      {/* Full Uncropped Museum Mat Frame */}
                      <div className="relative h-[230px] sm:h-[265px] xl:h-[290px] w-full bg-[#090B0D] p-3 sm:p-4 flex items-center justify-center">
                        <img
                          src={activeItem.thumb}
                          alt={activeItem.alt}
                          className="max-h-full max-w-full w-auto h-full object-contain rounded-lg shadow-[0_18px_42px_-12px_rgba(0,0,0,0.75)] transition-transform duration-500 hover:scale-[1.015]"
                        />
                      </div>

                      <div className="p-4 sm:p-5 bg-[#FFFFFF] dark:bg-[#111416] border-t border-[var(--vg-border)] space-y-3">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#087F5B] dark:text-[#CDFF45]">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Grounded answer</span>
                          </div>
                          <p className="text-[14.5px] sm:text-[15px] leading-[1.55] text-[#101211] dark:text-[#F4F6F2] font-medium">
                            <HighlightedText text={activeItem.aiAnswer} tokens={tokens} />
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-[var(--vg-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <span className="font-mono text-[11px] text-[var(--vg-ink-2)] truncate">
                            Verified source · {activeItem.categoryLabel} · {activeItem.date}
                          </span>
                          <Link
                            href={user ? '/app' : '/signup'}
                            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#087F5B] dark:text-[#CDFF45] hover:underline shrink-0"
                          >
                            <span>{user ? 'Try in Web Vault' : 'Get started'}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
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
