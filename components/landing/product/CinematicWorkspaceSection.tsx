import React, { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  FileText,
  FolderHeart,
  Image as ImageIcon,
  MessageSquare,
  Search,
} from 'lucide-react'
import { VG_LAYOUT, VG_MOTION } from '@/components/landing/design-system'
import { useClientReducedMotion } from '@/components/landing/motion/LivingMotionPrimitives'
import { MotionReveal } from '@/components/landing/motion'
import { Container, Section } from '@/components/landing/ui'
import { cn } from '@/lib/utils'

type WorkspaceTab = 'library' | 'search' | 'assistant'

const LIBRARY_CARDS = [
  {
    src: '/landing/photos/aura-sunlit-interior.webp',
    alt: 'Sunlit architectural living room with framed prints and pale green ceramic vase',
    title: 'stone_bench_prints.webp',
    meta: 'Home Archive · Oct 19',
  },
  {
    src: '/landing/photos/aura-evening-gathering.webp',
    alt: 'Friends gathered around a candlelit stone table beneath olive trees',
    title: 'olive_garden_dinner.webp',
    meta: 'Gatherings · Sep 24',
  },
  {
    src: '/landing/photos/aura-personal-travel.webp',
    alt: 'Traveler walking with an analog camera beside moored harbor boats',
    title: 'harbor_walk_camera.webp',
    meta: 'Summer Coast · Aug 18',
  },
  {
    src: '/landing/photos/aura-coastal-path.webp',
    alt: 'Sandy coastal path above chalk cliffs and calm sea water',
    title: 'chalk_cliff_path.webp',
    meta: 'Summer Coast · Aug 15',
  },
]

/**
 * Chapter 04 — Panoramic Minimalist Workspace Showcase.
 * Presents the real VectorGallery web experience cleanly with Library Timeline,
 * OCR Document Recall, and Grounded Citation Assistant views.
 */
export function CinematicWorkspaceSection() {
  const reduced = useClientReducedMotion()
  const [tab, setTab] = useState<WorkspaceTab>('library')

  return (
    <Section id="showcase" surface="secondary" ariaLabel="Cinematic workspace showcase">
      <Container wide>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#131715] text-[#101211] dark:text-[#CFFF49] border border-[var(--vg-border)]">
                04 · Web Workspace
              </span>
              <span className="text-[12.5px] text-[var(--vg-ink-2)]">Desktop &amp; Web Vault</span>
            </div>

            <h2
              className="font-display font-bold tracking-[-0.04em] leading-[1.03] text-[#101211] dark:text-[#F3F5F1]"
              style={{ fontSize: 'clamp(2.15rem, 4.4vw, 4.5rem)' }}
            >
              Calm software built for years of keeping.
            </h2>
          </div>

          {/* 3 Clean View Tabs */}
          <div
            role="tablist"
            aria-label="Workspace product views"
            className="inline-flex p-1.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[var(--vg-border)] shadow-sm self-start lg:self-auto"
          >
            {(
              [
                { id: 'library', label: 'Library', icon: ImageIcon },
                { id: 'search', label: 'OCR Docs', icon: FileText },
                { id: 'assistant', label: 'Assistant', icon: MessageSquare },
              ] as const
            ).map((item) => {
              const Icon = item.icon
              const active = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-all',
                    active
                      ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CFFF49] dark:text-[#090B0A] shadow-sm font-semibold'
                      : 'text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F3F5F1]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Architectural Workspace Stage */}
        <MotionReveal className="rounded-[2rem] border border-[var(--vg-border-strong)] bg-[#FFFFFF] dark:bg-[#131715] shadow-[var(--vg-shadow-hero)] overflow-hidden">
          {/* Clean Studio Chrome Header */}
          <div className="px-5 sm:px-7 py-4 border-b border-[var(--vg-border)] bg-[#F2F3F0]/75 dark:bg-[#090B0A]/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D1D5D2] dark:bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#D1D5D2] dark:bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#D1D5D2] dark:bg-white/20" />
              </div>
              <span className="font-mono text-[12px] text-[var(--vg-ink-2)]">
                VectorGallery · Workspace View
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11.5px] font-mono bg-[#FFFFFF] dark:bg-[#202522] border border-[var(--vg-border)] text-[var(--vg-ink-2)]">
                <Search className="w-3 h-3 text-[#087F5B] dark:text-[#CFFF49]" />
                <span>Cmd+K instant vault search</span>
              </span>
              <Link
                href="/app"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[#D4FF54] text-[#101211] hover:bg-[#C8F73E] transition-colors"
              >
                <span>Launch App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive Workspace Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[430px]">
            {/* Left Minimal Navigation Rail */}
            <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[var(--vg-border)] p-5 bg-[#F2F3F0]/45 dark:bg-[#0D100F] flex flex-row lg:flex-col justify-between gap-4">
              <div className="flex flex-row lg:flex-col gap-1.5 flex-wrap">
                <div className="px-3 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#202522] border border-[var(--vg-border)] flex items-center gap-2 text-[13px] font-semibold text-[#101211] dark:text-[#F3F5F1]">
                  <FolderHeart className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49]" />
                  <span>All Memories</span>
                </div>
                <div className="px-3 py-2 rounded-xl text-[13px] text-[var(--vg-ink-2)] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Camera Roll</span>
                </div>
                <div className="px-3 py-2 rounded-xl text-[13px] text-[var(--vg-ink-2)] flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Receipts &amp; Passes</span>
                </div>
                <div className="px-3 py-2 rounded-xl text-[13px] text-[var(--vg-ink-2)] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Ask Vault</span>
                </div>
              </div>

              <div className="hidden lg:block p-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#131715] border border-[var(--vg-border)] text-[12px] text-[var(--vg-ink-2)] leading-relaxed">
                Files stay stored in original quality—ready in local folders or private buckets without re-encoding.
              </div>
            </aside>

            {/* Main Studio Content Canvas */}
            <div className="lg:col-span-9 p-5 sm:p-7">
              <AnimatePresence mode="wait">
                {tab === 'library' && (
                  <motion.div
                    key="library"
                    initial={reduced ? { opacity: 1 } : { opacity: 0.9, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 1 } : { opacity: 0.9, y: -4 }}
                    transition={{ duration: 0.22, ease: VG_MOTION.ease }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {LIBRARY_CARDS.map((card, i) => (
                      <div
                        key={card.title}
                        className={cn(
                          'group rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[#F2F3F0] dark:bg-[#090B0A]',
                          i === 0 ? 'sm:row-span-1' : ''
                        )}
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden">
                          <img
                            src={card.src}
                            alt={card.alt}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                        </div>
                        <div className="px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#131715] flex items-center justify-between gap-2">
                          <span className="font-mono text-[11.5px] font-medium text-[#101211] dark:text-[#F3F5F1] truncate">
                            {card.title}
                          </span>
                          <span className="text-[11px] text-[var(--vg-ink-2)] shrink-0">
                            {card.meta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {tab === 'search' && (
                  <motion.div
                    key="search"
                    initial={reduced ? { opacity: 1 } : { opacity: 0.9, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 1 } : { opacity: 0.9, y: -4 }}
                    transition={{ duration: 0.22, ease: VG_MOTION.ease }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch"
                  >
                    <div className="rounded-2xl border border-[var(--vg-border)] overflow-hidden bg-[#F2F3F0] dark:bg-[#090B0A] flex flex-col">
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src="/landing/photos/aura-ticket-coastal.webp"
                          alt="Coastal Line boarding pass for Seat 14A Marseille to Nice"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 bg-[#FFFFFF] dark:bg-[#131715] flex-1">
                        <p className="font-mono text-[12px] font-semibold text-[#101211] dark:text-[#F3F5F1]">
                          coastal_line_seat_14a.jpg
                        </p>
                        <p className="mt-1.5 text-[12.5px] text-[var(--vg-ink-2)] leading-relaxed">
                          Extracted text: Seat 14A · 08:40 · TRN 045 · Marseille St Charles -&gt; Nice Ville.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--vg-border)] overflow-hidden bg-[#F2F3F0] dark:bg-[#090B0A] flex flex-col">
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src="/landing/photos/aura-receipt-studio.webp"
                          alt="Studio Equip Co itemized receipt showing headphones and lamp"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 bg-[#FFFFFF] dark:bg-[#131715] flex-1">
                        <p className="font-mono text-[12px] font-semibold text-[#101211] dark:text-[#F3F5F1]">
                          studio_equip_receipt_10482.png
                        </p>
                        <p className="mt-1.5 text-[12.5px] text-[var(--vg-ink-2)] leading-relaxed">
                          Extracted items: Acoustic Headphones $89.00, Desk Lamp $45.00 · Total USD $153.36.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {tab === 'assistant' && (
                  <motion.div
                    key="assistant"
                    initial={reduced ? { opacity: 1 } : { opacity: 0.9, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 1 } : { opacity: 0.9, y: -4 }}
                    transition={{ duration: 0.22, ease: VG_MOTION.ease }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center"
                  >
                    <div className="md:col-span-6 space-y-4">
                      <div className="p-4 rounded-2xl bg-[#F2F3F0] dark:bg-[#202522] border border-[var(--vg-border)]">
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--vg-ink-2)] mb-1">
                          Prompt
                        </p>
                        <p className="text-[14.5px] font-medium text-[#101211] dark:text-[#F3F5F1]">
                          &ldquo;Summarize my architectural spatial flow sketch and room sequence.&rdquo;
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#090B0A] border border-[#087F5B]/40 dark:border-[#CFFF49]/45">
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#087F5B] dark:text-[#CFFF49] mb-1.5">
                          Grounded Response · architectural_spatial_flow.pdf
                        </p>
                        <p className="text-[14px] leading-[1.6] text-[#101211] dark:text-[#F3F5F1]">
                          Your sketch outlines a four-stage progression: <strong>Entry</strong> (natural light orientation) -&gt; <strong>Gallery</strong> (double-height ceiling) -&gt; <strong>Light Well</strong> (skylights above void) -&gt; <strong>Circulation</strong>, laid across a 6m × 3.7m proportion grid.
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-6 rounded-2xl overflow-hidden border border-[var(--vg-border)]">
                      <img
                        src="/landing/photos/aura-arch-notes.webp"
                        alt="Open dot-grid architectural notebook spread with spatial flow sketch"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </MotionReveal>
      </Container>
    </Section>
  )
}

