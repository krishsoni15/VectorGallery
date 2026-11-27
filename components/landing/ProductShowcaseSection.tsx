import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  FolderHeart,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Search,
} from 'lucide-react'
import {
  VG_COMPONENTS,
  VG_MOTION,
  VG_TYPOGRAPHY,
} from '@/components/landing/design-system'
import { MotionReveal } from '@/components/landing/motion'
import { Container, Section } from '@/components/landing/ui'
import { cn } from '@/lib/utils'

type WorkspaceState = 'library' | 'search' | 'assistant'

const WORKSPACE_STATES: Array<{
  id: WorkspaceState
  label: string
  subtitle: string
  icon: typeof ImageIcon
}> = [
  {
    id: 'library',
    label: 'Library',
    subtitle: 'Photos, notes, and saved pages arranged calmly together',
    icon: ImageIcon,
  },
  {
    id: 'search',
    label: 'Search',
    subtitle: 'Instant recall across scenes, scanned bills, and personal notes',
    icon: Search,
  },
  {
    id: 'assistant',
    label: 'Assistant',
    subtitle: 'Grounded answers pointing back to the exact memories you kept',
    icon: MessageSquare,
  },
]

const LIBRARY_GALLERY = [
  {
    src: '/landing/photos/aura-sunlit-interior.webp',
    alt: 'Sunlit architectural living room with framed prints and pale green ceramic vase on a stone shelf',
    title: 'Stone_Bench_Prints.webp',
    caption: 'Home & Light · Oct 19',
    featured: true,
    fav: true,
  },
  {
    src: '/landing/photos/aura-evening-gathering.webp',
    alt: 'Friends gathered around a candlelit stone table under olive trees at dusk',
    title: 'Olive_Garden_Dinner.webp',
    caption: 'Gatherings · Sep 24',
    featured: false,
    fav: true,
  },
  {
    src: '/landing/photos/aura-personal-travel.webp',
    alt: 'Traveler walking with an analog camera beside boats in a sunlit Mediterranean harbor',
    title: 'Harbor_Walk_Camera.webp',
    caption: 'Summer Coast · Aug 18',
    featured: false,
    fav: false,
  },
  {
    src: '/landing/photos/aura-coastal-path.webp',
    alt: 'Grassy footpath winding along chalk cliffs above pale turquoise sea',
    title: 'Chalk_Cliff_Path.webp',
    caption: 'Summer Coast · Aug 15',
    featured: false,
    fav: false,
  },
]

/**
 * Chapter 03 — Full-Width Studio Product Showcase (Project Aura).
 * 3 focused workspace states: Library, Search, Assistant.
 */
export function ProductShowcaseSection() {
  const prefersReducedMotion = useReducedMotion()
  const [activeState, setActiveState] = useState<WorkspaceState>('library')
  const [selectedLibraryIndex, setSelectedLibraryIndex] = useState(0)

  const currentState =
    WORKSPACE_STATES.find((state) => state.id === activeState) || WORKSPACE_STATES[0]

  return (
    <Section id="showcase" surface="secondary" ariaLabel="Product workspace showcase">
      <Container wide>
        {/* Centered Wide Grotesk Heading (Zero serif italics) */}
        <MotionReveal className="max-w-[920px] mx-auto text-center space-y-5">
          <h2
            className="font-display font-bold text-[var(--vg-ink)]"
            style={{
              fontSize: VG_TYPOGRAPHY.scale.h2.fontSize,
              lineHeight: VG_TYPOGRAPHY.scale.h2.lineHeight,
              letterSpacing: VG_TYPOGRAPHY.scale.h2.letterSpacing,
              textWrap: 'balance',
            }}
          >
            Your life isn&apos;t made of folders. Neither should your cloud be.
          </h2>
          <p
            className="text-[var(--vg-ink-2)] max-w-2xl mx-auto"
            style={{
              fontSize: VG_TYPOGRAPHY.scale.lead.fontSize,
              lineHeight: VG_TYPOGRAPHY.scale.lead.lineHeight,
            }}
          >
            Photographs, paperwork, screenshots, and personal notes come together effortlessly in one quiet place built for how memory actually works.
          </p>
        </MotionReveal>

        {/* Full-Width Architectural Workspace Frame (~90% desktop canvas) */}
        <MotionReveal delay={0.08} className="mt-12 max-w-[1340px] mx-auto">
          <div className="rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-hero)] overflow-hidden">
            {/* Minimal Studio Browser Chrome + 3-State Switcher */}
            <div className="px-4 sm:px-7 py-4 border-b border-[var(--vg-border)] bg-[var(--vg-surface-2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CBD2C7] dark:bg-[#2E3530]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CBD2C7] dark:bg-[#2E3530]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CBD2C7] dark:bg-[#2E3530]" />
                </div>
                <span className="text-[13px] font-medium text-[var(--vg-ink-2)]">
                  VectorGallery Workspace
                </span>
              </div>

              <div
                role="tablist"
                aria-label="Workspace product views"
                className="inline-flex flex-wrap items-center gap-1.5"
              >
                {WORKSPACE_STATES.map((state) => {
                  const Icon = state.icon
                  const active = state.id === activeState
                  return (
                    <button
                      key={state.id}
                      role="tab"
                      aria-selected={active}
                      type="button"
                      onClick={() => setActiveState(state.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                        active ? VG_COMPONENTS.buttons.tabActive : VG_COMPONENTS.buttons.tabIdle
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{state.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Workspace Interior */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
              {/* Quiet Left Navigation Rail */}
              <aside
                aria-label="Workspace collections"
                className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[var(--vg-border)] bg-[#F0F1EC]/75 dark:bg-[#171A18]/80 p-5 sm:p-6 flex flex-col justify-between gap-6"
              >
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[12px] font-medium text-[var(--vg-ink-muted)]">
                      Personal Vault
                    </p>
                    <p className="font-display text-[17px] font-semibold text-[var(--vg-ink)]">
                      {currentState.label}
                    </p>
                  </div>

                  <nav className="grid grid-cols-3 lg:grid-cols-1 gap-1.5" aria-label="Workspace sections">
                    {WORKSPACE_STATES.map((state) => {
                      const Icon = state.icon
                      const active = state.id === activeState
                      return (
                        <button
                          key={state.id}
                          type="button"
                          onClick={() => setActiveState(state.id)}
                          className={cn(
                            'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] text-left transition-colors',
                            active
                              ? 'bg-[var(--vg-surface)] text-[var(--vg-brand)] font-semibold border border-[var(--vg-border)] shadow-sm'
                              : 'text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[#FFFFFF]/60 dark:hover:bg-[#252A26]/60'
                          )}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{state.label}</span>
                        </button>
                      )
                    })}
                  </nav>

                  <div className="hidden lg:block pt-4 border-t border-[var(--vg-border)] space-y-2">
                    <p className="text-[12px] font-medium text-[var(--vg-ink-muted)]">
                      Collections
                    </p>
                    {[
                      { name: 'Summer Coast', count: '42' },
                      { name: 'Home & Light', count: '18' },
                      { name: 'Receipts & Notes', count: '29' },
                    ].map((col) => (
                      <div
                        key={col.name}
                        className="flex items-center justify-between py-1.5 text-[13px] text-[var(--vg-ink-2)]"
                      >
                        <span className="inline-flex items-center gap-2 truncate">
                          <FolderHeart className="w-3.5 h-3.5 text-[var(--vg-brand)] shrink-0" />
                          <span className="truncate">{col.name}</span>
                        </span>
                        <span className="font-mono text-[11px] text-[var(--vg-ink-muted)]">
                          {col.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden lg:block rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-4 space-y-1.5">
                  <p className="text-[12.5px] font-semibold text-[var(--vg-ink)]">
                    Private by default
                  </p>
                  <p className="text-[12px] leading-relaxed text-[var(--vg-ink-2)]">
                    Your originals stay untouched, ready to browse or download anytime.
                  </p>
                </div>
              </aside>

              {/* Dynamic Right Stage */}
              <div className="lg:col-span-9 p-5 sm:p-8 bg-[var(--vg-surface)] flex flex-col justify-between gap-6">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--vg-border)]">
                  <p className="text-[14px] font-medium text-[var(--vg-ink)]">
                    {currentState.subtitle}
                  </p>
                  <span className="text-[12px] text-[var(--vg-ink-muted)]">
                    Sample workspace preview
                  </span>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeState}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.3,
                      ease: VG_MOTION.ease,
                    }}
                    className="flex-1"
                  >
                    {/* STATE 1: LIBRARY */}
                    {activeState === 'library' && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
                        {/* Featured Editorial Hero Tile */}
                        <div className="md:col-span-7 relative rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface-2)] min-h-[280px] md:min-h-[380px]">
                          <img
                            src={LIBRARY_GALLERY[selectedLibraryIndex].src}
                            alt={LIBRARY_GALLERY[selectedLibraryIndex].alt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0C]/80 via-[#0B0D0C]/15 to-transparent" />
                          <div className="vg-photo-caption absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-[12px] opacity-85">
                                {LIBRARY_GALLERY[selectedLibraryIndex].caption}
                              </p>
                              <p className="font-display text-[17px] font-semibold truncate">
                                {LIBRARY_GALLERY[selectedLibraryIndex].title}
                              </p>
                            </div>
                            {LIBRARY_GALLERY[selectedLibraryIndex].fav && (
                              <span
                                aria-label="Favorite photo"
                                className="w-8 h-8 rounded-full bg-[#0B0D0C]/65 text-[#58D6A8] flex items-center justify-center shrink-0 border border-white/15"
                              >
                                <Heart className="w-4 h-4 fill-current" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Curated Strip */}
                        <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-3">
                          {LIBRARY_GALLERY.map((photo, index) => {
                            const selected = index === selectedLibraryIndex
                            return (
                              <button
                                key={photo.title}
                                type="button"
                                onClick={() => setSelectedLibraryIndex(index)}
                                className={cn(
                                  'flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all',
                                  selected
                                    ? 'bg-[var(--vg-surface-2)] border-[var(--vg-brand)] shadow-sm'
                                    : 'bg-[var(--vg-surface)] border-[var(--vg-border)] hover:border-[var(--vg-border-strong)] hover:bg-[#F0F1EC]/60 dark:hover:bg-[#171A18]/80'
                                )}
                              >
                                <img
                                  src={photo.src}
                                  alt={photo.alt}
                                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[var(--vg-border)]"
                                />
                                <div className="min-w-0 space-y-0.5">
                                  <p className="text-[13px] font-semibold text-[var(--vg-ink)] truncate">
                                    {photo.title}
                                  </p>
                                  <p className="text-[11.5px] text-[var(--vg-ink-2)] truncate">
                                    {photo.caption}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* STATE 2: SEARCH */}
                    {activeState === 'search' && (
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)]">
                          <Search className="w-4 h-4 text-[var(--vg-brand)] shrink-0" />
                          <span className="text-[15px] font-medium text-[var(--vg-ink)]">
                            evening dinner under olive trees or sunlit living room prints
                          </span>
                          <span className="ml-auto text-[12px] font-medium text-[var(--vg-brand)]">
                            3 matched
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] overflow-hidden">
                            <div className="aspect-[16/10] overflow-hidden">
                              <img
                                src="/landing/photos/aura-evening-gathering.webp"
                                alt="Candlelit evening dinner under olive trees"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 space-y-1.5">
                              <div className="flex items-center justify-between text-[11.5px]">
                                <span className="font-medium text-[var(--vg-brand)]">
                                  Scene & Memory Match
                                </span>
                                <span className="text-[var(--vg-ink-muted)]">Sep 24</span>
                              </div>
                              <p className="text-[14px] font-semibold text-[var(--vg-ink)]">
                                Olive_Garden_Dinner.webp
                              </p>
                              <p className="text-[12.5px] text-[var(--vg-ink-2)]">
                                Candlelight, long linen table, olive branches, and outdoor string lights.
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] overflow-hidden">
                            <div className="aspect-[16/10] overflow-hidden">
                              <img
                                src="/landing/photos/aura-sunlit-interior.webp"
                                alt="Sunlit architectural interior with framed prints on a stone bench"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 space-y-1.5">
                              <div className="flex items-center justify-between text-[11.5px]">
                                <span className="font-medium text-[var(--vg-brand)]">
                                  Scene & Interior Match
                                </span>
                                <span className="text-[var(--vg-ink-muted)]">Oct 19</span>
                              </div>
                              <p className="text-[14px] font-semibold text-[var(--vg-ink)]">
                                Stone_Bench_Prints.webp
                              </p>
                              <p className="text-[12.5px] text-[var(--vg-ink-2)]">
                                Framed abstract drawings beside celadon vase on rough-cut limestone ledge.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[var(--vg-brand)] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-semibold text-[var(--vg-ink)] truncate">
                                October_Menu_and_Guest_List.pdf
                              </p>
                              <p className="text-[12px] text-[var(--vg-ink-2)] truncate">
                                Matched page snippet: “Olive grove courtyard table for twelve — figs, sourdough & candles”
                              </p>
                            </div>
                          </div>
                          <span className="text-[12px] font-medium text-[var(--vg-brand)] shrink-0">
                            Page 1
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STATE 3: ASSISTANT */}
                    {activeState === 'assistant' && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                        <div className="md:col-span-7 flex flex-col justify-between gap-4">
                          <div className="space-y-4">
                            <div className="flex justify-end">
                              <div className="max-w-md rounded-2xl rounded-br-sm bg-[var(--vg-surface-2)] border border-[var(--vg-border)] px-4 py-3 text-[13.5px] text-[var(--vg-ink)]">
                                Gather the coastal path photos from our trip and show the dinner we had that week.
                              </div>
                            </div>

                            <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-5 space-y-3">
                              <p className="text-[14px] leading-relaxed text-[var(--vg-ink)]">
                                From your late-summer archive, your coastal cliff walk and harbor stroll were captured three days apart, followed by the candlelit courtyard dinner under the olive trees.
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[12px] font-mono text-[var(--vg-brand)]">
                                  [1] Chalk_Cliff_Path.webp
                                  <ArrowUpRight className="w-3 h-3" />
                                </span>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[12px] font-mono text-[var(--vg-brand)]">
                                  [2] Olive_Garden_Dinner.webp
                                  <ArrowUpRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] px-4 py-3 flex items-center justify-between text-[12.5px] text-[var(--vg-ink-2)]">
                            <span>Every answer points directly back to files you own.</span>
                            <BookOpen className="w-4 h-4 text-[var(--vg-brand)] shrink-0" />
                          </div>
                        </div>

                        {/* Cited Visual Panel */}
                        <div className="md:col-span-5 space-y-3">
                          <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-3 space-y-2.5">
                            <div className="aspect-[16/10] rounded-xl overflow-hidden">
                              <img
                                src="/landing/photos/aura-coastal-path.webp"
                                alt="Grassy coastal path along white cliffs above calm sea"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex items-center justify-between text-[12px] px-1">
                              <span className="font-semibold text-[var(--vg-ink)]">
                                [1] Chalk_Cliff_Path.webp
                              </span>
                              <span className="text-[var(--vg-ink-muted)]">Aug 15</span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-3 flex items-center gap-3">
                            <img
                              src="/landing/photos/aura-personal-travel.webp"
                              alt="Harbor walk with film camera"
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[var(--vg-border)]"
                            />
                            <div className="min-w-0">
                              <p className="text-[12px] font-medium text-[var(--vg-brand)]">
                                Related · Same Trip
                              </p>
                              <p className="text-[13px] font-semibold text-[var(--vg-ink)] truncate">
                                Harbor_Walk_Camera.webp
                              </p>
                              <p className="text-[11.5px] text-[var(--vg-ink-2)]">
                                Sunlit harbor · Aug 18
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </MotionReveal>
      </Container>
    </Section>
  )
}
