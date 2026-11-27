import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
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
import {
  VG_COMPONENTS,
  VG_LAYOUT,
  VG_MOTION,
} from '@/components/landing/design-system'
import { useClientReducedMotion } from '@/components/landing/motion/LivingMotionPrimitives'
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
  'have', 'about', 'into', 'all', 'did', 'my',
])

const MEMORY_CORPUS: MemoryRecord[] = [
  {
    id: 'harbor',
    filename: 'harbor_promenade_august.webp',
    kind: 'photo',
    categoryLabel: 'Summer Trip · Photos',
    date: 'Aug 18',
    thumb: '/landing/photos/aura-personal-travel.webp',
    alt: 'Traveler walking with an analog camera beside moored boats in a sunlit Mediterranean harbor',
    sceneSummary: 'Sunlit limestone promenade overlooking harbor boats with a film camera slung on the shoulder.',
    ocrExcerpt: 'Camera roll backup · Old Harbor Promenade · late afternoon coastal warmth.',
    aiAnswer: 'You photographed the stone harbor walk on August 18 with your 35mm film camera slung beside the moored boats.',
    citation: 'harbor_promenade_august.webp · Summer Album',
    tags: ['summer', 'trip', 'travel', 'harbor', 'camera', 'walk', 'boats', 'photos', 'coast'],
  },
  {
    id: 'boarding-pass',
    filename: 'coastal_line_seat_14a.jpg',
    kind: 'document',
    categoryLabel: 'OCR · Boarding Pass',
    date: 'Oct 24',
    thumb: '/landing/photos/aura-ticket-coastal.webp',
    alt: 'Crisp Coastal Line boarding pass for Seat 14A 08:40 from Marseille St Charles to Nice Ville',
    sceneSummary: 'Perforated paper rail stub photographed flat on dark slate under morning window shadow.',
    ocrExcerpt: 'COASTAL LINE · SEAT 14A · 08:40 · FROM: MARSEILLE ST CHARLES -> TO: NICE VILLE · TRN 045',
    aiAnswer: 'Your Coastal Line train stub is for Seat 14A departing at 08:40 on Train 045 from Marseille St Charles to Nice Ville.',
    citation: 'coastal_line_seat_14a.jpg · OCR Line 1-6',
    tags: ['coastal', 'line', 'seat', '14a', 'marseille', 'nice', 'train', 'boarding', 'pass', 'ticket', '08:40'],
  },
  {
    id: 'receipt',
    filename: 'studio_equip_receipt_10482.png',
    kind: 'document',
    categoryLabel: 'OCR · Expense Receipt',
    date: 'May 24',
    thumb: '/landing/photos/aura-receipt-studio.webp',
    alt: 'Studio Equip Co itemized receipt #10482 totaling $153.36 for acoustic headphones and desk lamp',
    sceneSummary: 'Cream printed expense receipt showing Acoustic Headphones ($89.00) and Desk Lamp ($45.00).',
    ocrExcerpt: 'STUDIO EQUIP. CO. · REC #10482 · ACOUSTIC HEADPHONES $89.00 · DESK LAMP $45.00 · TOTAL $153.36',
    aiAnswer: 'Studio Equip Co receipt #10482 totals $153.36 USD including 8% tax for Acoustic Headphones ($89) and a Desk Lamp ($45).',
    citation: 'studio_equip_receipt_10482.png · REC #10482',
    tags: ['studio', 'equip', 'receipt', 'headphones', 'lamp', '153.36', '10482', 'expense', 'tax', 'visa'],
  },
  {
    id: 'arch-notes',
    filename: 'architectural_spatial_flow.pdf',
    kind: 'document',
    categoryLabel: 'OCR · Handwritten Sketch',
    date: 'Nov 02',
    thumb: '/landing/photos/aura-arch-notes.webp',
    alt: 'Dot-grid notebook spread titled Architectural Study Spatial Flow with gallery cross-section',
    sceneSummary: 'Open dot-grid notebook with ink flowboxes (ENTRY -> GALLERY -> LIGHT WELL) and 1:1.618 plan grid.',
    ocrExcerpt: 'ARCHITECTURAL STUDY: SPATIAL FLOW · ENTRY -> GALLERY -> LIGHT WELL -> CIRCULATION · CROSS-SECTION',
    aiAnswer: 'Your November 2 architectural spread maps Entry -> Double-height Gallery -> Skylight Light Well -> Circulation on a 6m × 3.7m grid.',
    citation: 'architectural_spatial_flow.pdf · Spread 1',
    tags: ['architectural', 'spatial', 'flow', 'gallery', 'skylight', 'sketch', 'diagram', 'notebook', 'grid'],
  },
  {
    id: 'journal',
    filename: 'october_14_coffee_sketch.webp',
    kind: 'photo',
    categoryLabel: 'Notes · Handwritten',
    date: 'Oct 14',
    thumb: '/landing/photos/aura-journal-desk.webp',
    alt: 'Linen-bound notebook opened to October 14 with ink coffee cup sketch and fountain pen',
    sceneSummary: 'Fountain-pen journal spread dated October 14 alongside a botanical drawing and ceramic mug.',
    ocrExcerpt: 'OCTOBER 14 · Morning light, ceramic espresso sketch & studio notes.',
    aiAnswer: 'Your October 14 journal page contains morning ink notes and a hand-drawn coffee cup beside your brass nib pen.',
    citation: 'october_14_coffee_sketch.webp · Spread 14',
    tags: ['october', '14', 'coffee', 'sketch', 'handwritten', 'journal', 'fountain', 'pen'],
  },
  {
    id: 'kitchen',
    filename: 'sunday_kitchen_pears.webp',
    kind: 'photo',
    categoryLabel: 'Home · Family',
    date: 'Sep 08',
    thumb: '/landing/photos/aura-family-morning.webp',
    alt: 'Parent and child hands reaching into a ceramic bowl of fresh green pears in warm kitchen light',
    sceneSummary: 'Soft morning sunlight across a speckled bowl of crisp green pears on a timber table.',
    ocrExcerpt: 'Sunday Kitchen Roll · Morning light on oak table · Phone Auto-Backup.',
    aiAnswer: 'Captured on September 8 in morning kitchen light—hands gathering green pears into a stoneware bowl.',
    citation: 'sunday_kitchen_pears.webp · Family Roll',
    tags: ['kitchen', 'morning', 'pears', 'family', 'home', 'sunday', 'fruit', 'photos'],
  },
]

const SAMPLE_PROMPTS: Array<{ label: string; query: string; mode: SearchMode }> = [
  { label: 'Seat 14A Marseille pass', query: 'COASTAL LINE seat 14A Marseille', mode: 'document' },
  { label: 'Headphones receipt $153.36', query: 'Studio Equip headphones 153.36', mode: 'document' },
  { label: 'Summer harbor walk', query: 'Summer trip harbor camera', mode: 'photo' },
  { label: 'Ask: Gallery flow diagram', query: 'Architectural spatial flow gallery', mode: 'question' },
  { label: 'Sunday kitchen pears', query: 'Kitchen morning pears', mode: 'photo' },
]

export function InteractiveMemorySearch() {
  const reduced = useClientReducedMotion()
  const [query, setQuery] = useState('COASTAL LINE seat 14A Marseille')
  const [mode, setMode] = useState<SearchMode>('all')
  const [selectedId, setSelectedId] = useState<string>('boarding-pass')

  const matches = useMemo(() => {
    const tokens = query
      .toLowerCase()
      .split(/[\s.,/#!$?]+/)
      .filter((t) => t.length > 1 && !STOPWORDS.has(t))

    const pool = MEMORY_CORPUS.filter((m) => {
      if (mode === 'photo') return m.kind === 'photo'
      if (mode === 'document') return m.kind === 'document'
      return true
    })

    if (tokens.length === 0) return pool

    const scored = pool
      .map((item) => {
        const hay = `${item.filename} ${item.categoryLabel} ${item.sceneSummary} ${item.ocrExcerpt} ${item.tags.join(' ')}`.toLowerCase()
        let score = 0
        for (const tok of tokens) {
          if (item.tags.some((t) => t === tok)) score += 4
          else if (hay.includes(tok)) score += 2
        }
        return { item, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((e) => e.item)

    return scored.length > 0 ? scored : pool.slice(0, 3)
  }, [query, mode])

  const activeItem = matches.find((m) => m.id === selectedId) || matches[0] || MEMORY_CORPUS[0]

  const applySample = (sample: (typeof SAMPLE_PROMPTS)[number]) => {
    setQuery(sample.query)
    setMode(sample.mode)
    setSelectedId('')
  }

  return (
    <Section id="search" surface="default" ariaLabel="Interactive natural-language memory search">
      <Container wide>
        <div className="max-w-3xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-[#E7E9E5] dark:bg-[#202522] text-[#101211] dark:text-[#CFFF49] border border-[var(--vg-border)]">
              03 · Search &amp; Recall
            </span>
            <span className="text-[12.5px] text-[var(--vg-ink-2)]">
              Interactive sample library
            </span>
          </div>

          <h2
            className="font-display font-bold tracking-[-0.04em] leading-[1.03] text-[#101211] dark:text-[#F3F5F1]"
            style={{ fontSize: 'clamp(2rem, 4.4vw, 4rem)' }}
          >
            Find it by{' '}
            <span className="underline decoration-[#D4FF54] dark:decoration-[#CFFF49] decoration-4 underline-offset-4">
              remembering
            </span>{' '}
            it.
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] leading-[1.6] text-[var(--vg-ink-2)] max-w-2xl">
            Stop digging through nested folders. Search by a passing detail—a seat number on a boarding pass, an itemized headphone receipt, or afternoon harbor sunlight.
          </p>
        </div>

        {/* Sculpted Interactive Workbench Frame */}
        <MotionReveal className="rounded-3xl border border-[var(--vg-border-strong)] bg-[#FFFFFF] dark:bg-[#131715] shadow-[var(--vg-shadow-hero)] p-4 sm:p-6 lg:p-8">
          {/* Top Search Controls + Mode Pills */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3.5 pb-5 border-b border-[var(--vg-border)]">
            <div className="relative flex-1">
              <Search className="w-4.5 h-4.5 text-[#087F5B] dark:text-[#CFFF49] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search sample memories by phrase, receipt, or visual detail"
                placeholder="Type what you remember: Marseille seat 14A, $153.36 headphones, harbor boats..."
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

            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Search filter mode">
              {(
                [
                  { id: 'all', label: 'All', icon: Search },
                  { id: 'photo', label: 'Photos', icon: ImageIcon },
                  { id: 'document', label: 'Documents / OCR', icon: FileText },
                  { id: 'question', label: 'Ask AI', icon: MessageSquare },
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

          {/* Sample Prompt Suggestions */}
          <div className="flex flex-wrap items-center gap-2 py-4 border-b border-[var(--vg-border)]">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--vg-ink-2)] mr-1">
              Try:
            </span>
            {SAMPLE_PROMPTS.map((item) => {
              const isSelected = query === item.query
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => applySample(item)}
                  className={cn(
                    'px-3 py-1 rounded-full text-[12px] font-medium border transition-colors',
                    isSelected
                      ? 'bg-[#D4FF54] text-[#101211] border-[#101211]/15 font-semibold'
                      : 'bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[#101211] dark:hover:text-[#F3F5F1]'
                  )}
                >
                  {item.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => applySample(SAMPLE_PROMPTS[0])}
              className="ml-auto inline-flex items-center gap-1 text-[12px] text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 2-Column Interactive Results + Citation Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-start">
            {/* Left Matches List */}
            <div className="lg:col-span-5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--vg-ink-2)]">
                  Ranked Matches ({matches.length})
                </span>
                <span className="text-[11px] text-[var(--vg-ink-2)]">Offline + OCR ready</span>
              </div>

              {matches.map((item) => {
                const isSelected = activeItem.id === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-2xl border flex items-center gap-3.5 transition-all',
                      isSelected
                        ? 'bg-[#F2F3F0] dark:bg-[#202522] border-[#087F5B] dark:border-[#CFFF49] shadow-sm'
                        : 'bg-[var(--vg-surface)] border-[var(--vg-border)] hover:border-[var(--vg-border-strong)]'
                    )}
                  >
                    <div className="w-16 h-14 rounded-xl overflow-hidden bg-[var(--vg-surface-2)] shrink-0 border border-[var(--vg-border)]">
                      <img src={item.thumb} alt={item.alt} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[12px] font-semibold text-[#101211] dark:text-[#F3F5F1] truncate">
                          {item.filename}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--vg-ink-2)] shrink-0">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-[var(--vg-ink-2)] line-clamp-1 mt-0.5">
                        {item.sceneSummary}
                      </p>
                      <span className="inline-block mt-1 font-mono text-[10.5px] text-[#087F5B] dark:text-[#39D9A0]">
                        {item.categoryLabel}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right Inspected Capture + Grounded Citation / Ask AI Panel */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem.id + mode}
                  initial={reduced ? { opacity: 1 } : { opacity: 0.9, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 1 } : { opacity: 0.9, y: -4 }}
                  transition={{ duration: 0.22, ease: VG_MOTION.ease }}
                  className="rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[#F2F3F0] dark:bg-[#090B0A]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--vg-surface-2)]">
                    <img
                      src={activeItem.thumb}
                      alt={activeItem.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#090B0A]/85 via-[#090B0A]/40 to-transparent flex items-end justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#D4FF54] text-[#101211]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Exact Match</span>
                        </span>
                        <p className="font-mono text-[12.5px] text-[#F3F5F1] mt-1.5">
                          {activeItem.citation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-4">
                    {mode === 'question' ? (
                      <div className="rounded-xl p-4 bg-[#FFFFFF] dark:bg-[#131715] border border-[#087F5B]/30 dark:border-[#CFFF49]/35">
                        <div className="flex items-center gap-2 text-[11.5px] font-mono uppercase tracking-[0.08em] text-[#087F5B] dark:text-[#CFFF49] mb-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Grounded Assistant Citation</span>
                        </div>
                        <p className="text-[14.5px] leading-[1.6] text-[#101211] dark:text-[#F3F5F1] font-medium">
                          {activeItem.aiAnswer}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl p-4 bg-[#FFFFFF] dark:bg-[#131715] border border-[var(--vg-border)]">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--vg-ink-2)]">
                            Extracted OCR &amp; Scene Context
                          </span>
                          <span className="font-mono text-[11px] text-[#087F5B] dark:text-[#39D9A0]">
                            Indexed offline
                          </span>
                        </div>
                        <p className="font-mono text-[12.5px] leading-[1.55] text-[#101211] dark:text-[#F3F5F1]">
                          {activeItem.ocrExcerpt}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span className="text-[13px] text-[var(--vg-ink-2)]">
                        Works without external API keys. Optional Gemini / Groq keys add conversational answers.
                      </span>
                      <Link
                        href="/app"
                        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#101211] dark:text-[#CFFF49] hover:underline"
                      >
                        <span>Try in Web Vault</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </MotionReveal>
      </Container>
    </Section>
  )
}
