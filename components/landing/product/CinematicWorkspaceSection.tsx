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
import { VG_MOTION } from '@/components/landing/design-system'
import {
  SplitTextReveal,
  StudioGlareFrame,
} from '@/components/landing/motion/LivingMotionPrimitives'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { MotionReveal } from '@/components/landing/motion'
import { Container, Section } from '@/components/landing/ui'
import { cn } from '@/lib/utils'

type WorkspaceTab = 'library' | 'search' | 'assistant'

const LIBRARY_MEMORIES = [
  {
    src: '/landing/photos/aura-celebration-toast.webp',
    alt: 'Friends raising cut-crystal glasses above candlelit pistachio cake on golden-hour terrace',
    title: 'terrace_toast_sep19.webp',
    meta: 'Celebration · Sep 19',
  },
  {
    src: '/landing/photos/aura-evening-gathering.webp',
    alt: 'Candlelit courtyard dinner table beneath olive branches',
    title: 'olive_garden_dinner.webp',
    meta: 'Gatherings · Sep 24',
  },
  {
    src: '/landing/photos/aura-personal-travel.webp',
    alt: 'Traveler walking with an analog camera beside moored harbor boats',
    title: 'harbor_walk_august.webp',
    meta: 'Travel · Aug 18',
  },
  {
    src: '/landing/photos/aura-tech-screenshot.webp',
    alt: 'Workstation terminal showing TypeScript sync verification code and SHA-256 index check',
    title: 'sync_worker_verify.webp',
    meta: 'Work Capture · Nov 22',
  },
]

/**
 * Refined Workspace Showcase Frame:
 * Showcases Your Library, Intelligent Search, and Your AI Assistant inside a glass-beveled metallic viewport
 * using React Bits StudioGlareFrame with varied photography & realistic UI state transitions.
 */
export function CinematicWorkspaceSection() {
  const reduced = useReducedMotion()
  const [tab, setTab] = useState<WorkspaceTab>('library')

  return (
    <Section id="showcase" surface="secondary" ariaLabel="Workspace product showcase" className="py-20 sm:py-24">
      <Container wide className="scroll-mt-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8 sm:mb-10">
          <div className="max-w-3xl">
            <p className="text-[13px] font-medium text-[#087F5B] dark:text-[#46D6A4] mb-2.5">
              Web &amp; Desktop Workspace
            </p>

            <SplitTextReveal
              as="h2"
              text="Quiet software built around how memories return."
              className="font-display font-bold tracking-[-0.04em] leading-[1.04] text-[#101211] dark:text-[#F4F6F2]"
              style={{ fontSize: 'clamp(2.1rem, 4.1vw, 4.1rem)' }}
            />
          </div>

          <div
            role="tablist"
            aria-label="Workspace capability views"
            className="inline-flex p-1 rounded-full bg-[#FFFFFF] dark:bg-[#111416] border border-[var(--vg-border)] shadow-sm self-start lg:self-auto"
          >
            {(
              [
                { id: 'library', label: 'Library', icon: ImageIcon },
                { id: 'search', label: 'Search', icon: Search },
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
                    'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-[#101211] text-[#F4F6F2] dark:bg-[#CDFF45] dark:text-[#090B0D] shadow-sm font-semibold'
                      : 'text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sculpted Beveled Studio Hardware Presentation */}
        <MotionReveal>
          <StudioGlareFrame className="rounded-[2rem] border border-[var(--vg-border-strong)] bg-[#FFFFFF] dark:bg-[#111416] shadow-[var(--vg-shadow-hero)] ring-1 ring-inset ring-black/[0.03] dark:ring-white/[0.06]">
            {/* Minimal Workspace Window Bar */}
            <div className="px-5 sm:px-6 py-3.5 border-b border-[var(--vg-border)] bg-[#F4F5F2]/80 dark:bg-[#090B0D]/85 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#BCC5C8] dark:bg-white/25" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#BCC5C8] dark:bg-white/25" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#BCC5C8] dark:bg-white/25" />
                </div>
                <span className="text-[12.5px] font-medium text-[var(--vg-ink-2)]">
                  VectorGallery Vault —{' '}
                  {tab === 'library'
                    ? 'Timeline Library'
                    : tab === 'search'
                      ? 'Document & Receipt Recall'
                      : 'Grounded AI Assistant'}
                </span>
              </div>

              <Link
                href="/app"
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-[12.5px] font-semibold bg-[#CDFF45] text-[#101211] hover:bg-[#D8FF69] transition-colors shadow-sm"
              >
                <span>Open Web Vault</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px]">
              {/* Calm Read-Only Archive Index Sidebar (zero duplicate tab buttons) */}
              <aside className="hidden lg:flex lg:col-span-3 border-r border-[var(--vg-border)] p-5 bg-[#F4F5F2]/45 dark:bg-[#0C0F11] flex-col justify-between gap-4">
                <div className="space-y-4">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--vg-ink-2)]">
                    Personal Index
                  </p>
                  <div className="divide-y divide-[var(--vg-border)] border-y border-[var(--vg-border)] text-[12.5px]">
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 font-medium text-[#101211] dark:text-[#F4F6F2]">
                        <FolderHeart className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#46D6A4]" />
                        <span>All memories</span>
                      </span>
                      <span className="font-mono text-[11px] text-[var(--vg-ink-2)]">248</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[var(--vg-ink-2)]">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Photos &amp; travel</span>
                      </span>
                      <span className="font-mono text-[11px] text-[var(--vg-ink-2)]">184</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[var(--vg-ink-2)]">
                        <FileText className="w-3.5 h-3.5" />
                        <span>OCR documents</span>
                      </span>
                      <span className="font-mono text-[11px] text-[var(--vg-ink-2)]">64</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111416] border border-[var(--vg-border)] text-[12px] text-[var(--vg-ink-2)] leading-relaxed">
                  Originals stay untouched on storage you control—indexed with optical text recognition.
                </div>
              </aside>

              {/* Main Canvas */}
              <div className="lg:col-span-9 p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  {tab === 'library' && (
                    <motion.div
                      key="library"
                      initial={reduced ? { opacity: 1 } : { opacity: 0.88, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? { opacity: 1 } : { opacity: 0.88, y: -4 }}
                      transition={{ duration: 0.24, ease: VG_MOTION.ease }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                    >
                      {LIBRARY_MEMORIES.map((card) => (
                        <div
                          key={card.title}
                          className="group rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[#F4F5F2] dark:bg-[#090B0D] transition-all hover:border-[var(--vg-border-strong)]"
                        >
                          <div className="aspect-[2/1] w-full overflow-hidden">
                            <img
                              src={card.src}
                              alt={card.alt}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            />
                          </div>
                          <div className="px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#111416] flex items-center justify-between gap-2">
                            <span className="font-mono text-[11.5px] font-medium text-[#101211] dark:text-[#F4F6F2] truncate">
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
                      initial={reduced ? { opacity: 1 } : { opacity: 0.88, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? { opacity: 1 } : { opacity: 0.88, y: -4 }}
                      transition={{ duration: 0.24, ease: VG_MOTION.ease }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch"
                    >
                      <div className="rounded-2xl border border-[var(--vg-border)] overflow-hidden bg-[#F4F5F2] dark:bg-[#090B0D] flex flex-col">
                        <div className="aspect-[16/10] w-full overflow-hidden">
                          <img
                            src="/landing/photos/aura-university-letter.webp"
                            alt="Northridge University Registration Letter with submission deadline November 18"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 bg-[#FFFFFF] dark:bg-[#111416] flex-1">
                          <p className="font-mono text-[12px] font-semibold text-[#101211] dark:text-[#F4F6F2]">
                            northridge_registration_letter.pdf
                          </p>
                          <p className="mt-1.5 text-[12.5px] text-[var(--vg-ink-2)] leading-relaxed">
                            Indexed text: Certificate of Project Registration — Submission Window Deadline: November 18.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--vg-border)] overflow-hidden bg-[#F4F5F2] dark:bg-[#090B0D] flex flex-col">
                        <div className="aspect-[16/10] w-full overflow-hidden">
                          <img
                            src="/landing/photos/aura-receipt-studio.webp"
                            alt="Studio Equip Co receipt totaling $153.36 for acoustic headphones"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 bg-[#FFFFFF] dark:bg-[#111416] flex-1">
                          <p className="font-mono text-[12px] font-semibold text-[#101211] dark:text-[#F4F6F2]">
                            studio_equip_receipt_10482.png
                          </p>
                          <p className="mt-1.5 text-[12.5px] text-[var(--vg-ink-2)] leading-relaxed">
                            Indexed totals: Acoustic Headphones ($89.00), Desk Lamp ($45.00), Total USD $153.36.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === 'assistant' && (
                    <motion.div
                      key="assistant"
                      initial={reduced ? { opacity: 1 } : { opacity: 0.88, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? { opacity: 1 } : { opacity: 0.88, y: -4 }}
                      transition={{ duration: 0.24, ease: VG_MOTION.ease }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center"
                    >
                      <div className="md:col-span-6 space-y-3.5">
                        <div className="p-4 rounded-2xl bg-[#F4F5F2] dark:bg-[#191D20] border border-[var(--vg-border)]">
                          <p className="text-[11px] font-medium text-[var(--vg-ink-2)] mb-1">
                            Question
                          </p>
                          <p className="text-[14px] font-medium text-[#101211] dark:text-[#F4F6F2]">
                            &ldquo;What did my project deadline notes say for October?&rdquo;
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#090B0D] border border-[#087F5B]/40 dark:border-[#CDFF45]/45 space-y-1.5">
                          <p className="font-mono text-[11px] font-semibold text-[#087F5B] dark:text-[#CDFF45]">
                            Source · project_deadline_notes.webp
                          </p>
                          <p className="text-[13.5px] leading-[1.6] text-[#101211] dark:text-[#F4F6F2]">
                            Your handwritten grid note lists three dates: <strong>Final archive QA</strong> on Oct 18, <strong>Mobile backup test</strong> on Oct 21, and <strong>Public release tag</strong> on Oct 25.
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-6 rounded-2xl overflow-hidden border border-[var(--vg-border)] aspect-[16/10] shadow-sm">
                        <img
                          src="/landing/photos/aura-deadline-notes.webp"
                          alt="Handwritten project deadline notes listing October milestones on grid notebook"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </StudioGlareFrame>
        </MotionReveal>
      </Container>
    </Section>
  )
}
