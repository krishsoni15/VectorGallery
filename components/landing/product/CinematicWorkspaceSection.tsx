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
    <Section id="showcase" surface="secondary" ariaLabel="Workspace product showcase">
      <Container wide className="scroll-mt-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-3xl">
            <p className="text-[13px] font-medium text-[#087F5B] dark:text-[#46D6A4] mb-3">
              Web &amp; Desktop Workspace
            </p>

            <SplitTextReveal
              as="h2"
              text="Quiet software built around how memories return."
              className="font-display font-bold tracking-[-0.04em] leading-[1.03] text-[#101211] dark:text-[#F4F6F2]"
              style={{ fontSize: 'clamp(2.2rem, 4.4vw, 4.5rem)' }}
            />
          </div>

          <div
            role="tablist"
            aria-label="Workspace capability views"
            className="inline-flex p-1.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111416] border border-[var(--vg-border)] shadow-sm self-start lg:self-auto"
          >
            {(
              [
                { id: 'library', label: 'Your library', icon: ImageIcon },
                { id: 'search', label: 'Intelligent search', icon: Search },
                { id: 'assistant', label: 'Your AI assistant', icon: MessageSquare },
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
          <StudioGlareFrame className="rounded-[2.2rem] border border-[var(--vg-border-strong)] bg-[#FFFFFF] dark:bg-[#111416] shadow-[var(--vg-shadow-hero)] ring-1 ring-inset ring-black/[0.03] dark:ring-white/[0.06]">
            {/* Workspace Window Bar */}
            <div className="px-5 sm:px-7 py-4 border-b border-[var(--vg-border)] bg-[#F4F5F2]/80 dark:bg-[#090B0D]/85 flex flex-wrap items-center justify-between gap-4">
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

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] bg-[#FFFFFF] dark:bg-[#191D20] border border-[var(--vg-border)] text-[var(--vg-ink-2)]">
                  <Search className="w-3 h-3 text-[#087F5B] dark:text-[#CDFF45]" />
                  <span>Cmd+K quick find</span>
                </span>
                <Link
                  href="/app"
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-[12.5px] font-semibold bg-[#CDFF45] text-[#101211] hover:bg-[#D8FF69] transition-colors shadow-sm"
                >
                  <span>Open Web Vault</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
              {/* Workspace Rail */}
              <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[var(--vg-border)] p-5 bg-[#F4F5F2]/45 dark:bg-[#0C0F11] flex flex-row lg:flex-col justify-between gap-4">
                <div className="flex flex-row lg:flex-col gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTab('library')}
                    className={cn(
                      'px-3.5 py-2 rounded-xl flex items-center gap-2.5 text-[13px] font-medium transition-colors text-left',
                      tab === 'library'
                        ? 'bg-[#FFFFFF] dark:bg-[#191D20] border border-[var(--vg-border)] text-[#101211] dark:text-[#F4F6F2] font-semibold shadow-sm'
                        : 'text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                    )}
                  >
                    <FolderHeart className="w-4 h-4 text-[#087F5B] dark:text-[#CDFF45]" />
                    <span>Your library</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('search')}
                    className={cn(
                      'px-3.5 py-2 rounded-xl flex items-center gap-2.5 text-[13px] font-medium transition-colors text-left',
                      tab === 'search'
                        ? 'bg-[#FFFFFF] dark:bg-[#191D20] border border-[var(--vg-border)] text-[#101211] dark:text-[#F4F6F2] font-semibold shadow-sm'
                        : 'text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                    )}
                  >
                    <FileText className="w-4 h-4 text-[#087F5B] dark:text-[#CDFF45]" />
                    <span>Intelligent search</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('assistant')}
                    className={cn(
                      'px-3.5 py-2 rounded-xl flex items-center gap-2.5 text-[13px] font-medium transition-colors text-left',
                      tab === 'assistant'
                        ? 'bg-[#FFFFFF] dark:bg-[#191D20] border border-[var(--vg-border)] text-[#101211] dark:text-[#F4F6F2] font-semibold shadow-sm'
                        : 'text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                    )}
                  >
                    <MessageSquare className="w-4 h-4 text-[#087F5B] dark:text-[#CDFF45]" />
                    <span>Your AI assistant</span>
                  </button>
                </div>

                <div className="hidden lg:block p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#111416] border border-[var(--vg-border)] text-[12.5px] text-[var(--vg-ink-2)] leading-relaxed">
                  Original files live safely on storage you choose—indexed with optical text recognition without altering your uploads.
                </div>
              </aside>

              {/* Main Canvas */}
              <div className="lg:col-span-9 p-5 sm:p-7">
                <AnimatePresence mode="wait">
                  {tab === 'library' && (
                    <motion.div
                      key="library"
                      initial={reduced ? { opacity: 1 } : { opacity: 0.88, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? { opacity: 1 } : { opacity: 0.88, y: -4 }}
                      transition={{ duration: 0.24, ease: VG_MOTION.ease }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {LIBRARY_MEMORIES.map((card) => (
                        <div
                          key={card.title}
                          className="group rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[#F4F5F2] dark:bg-[#090B0D] transition-all hover:border-[var(--vg-border-strong)]"
                        >
                          <div className="aspect-[16/10] w-full overflow-hidden">
                            <img
                              src={card.src}
                              alt={card.alt}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            />
                          </div>
                          <div className="px-4 py-3 bg-[#FFFFFF] dark:bg-[#111416] flex items-center justify-between gap-2">
                            <span className="font-mono text-[11.5px] font-medium text-[#101211] dark:text-[#F4F6F2] truncate">
                              {card.title}
                            </span>
                            <span className="text-[11.5px] text-[var(--vg-ink-2)] shrink-0">
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
                      className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch"
                    >
                      <div className="rounded-2xl border border-[var(--vg-border)] overflow-hidden bg-[#F4F5F2] dark:bg-[#090B0D] flex flex-col">
                        <div className="aspect-[4/3] w-full overflow-hidden">
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
                          <p className="mt-1.5 text-[13px] text-[var(--vg-ink-2)] leading-relaxed">
                            Indexed text: Certificate of Project Registration — Submission Window Deadline: November 18.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--vg-border)] overflow-hidden bg-[#F4F5F2] dark:bg-[#090B0D] flex flex-col">
                        <div className="aspect-[4/3] w-full overflow-hidden">
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
                          <p className="mt-1.5 text-[13px] text-[var(--vg-ink-2)] leading-relaxed">
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
                      <div className="md:col-span-6 space-y-4">
                        <div className="p-4 rounded-2xl bg-[#F4F5F2] dark:bg-[#191D20] border border-[var(--vg-border)]">
                          <p className="text-[11.5px] font-medium text-[var(--vg-ink-2)] mb-1">
                            Question
                          </p>
                          <p className="text-[14.5px] font-medium text-[#101211] dark:text-[#F4F6F2]">
                            &ldquo;What did my project deadline notes say for October?&rdquo;
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#090B0D] border border-[#087F5B]/40 dark:border-[#CDFF45]/45 space-y-2">
                          <p className="font-mono text-[11px] font-semibold text-[#087F5B] dark:text-[#CDFF45]">
                            Source · project_deadline_notes.webp
                          </p>
                          <p className="text-[14px] leading-[1.6] text-[#101211] dark:text-[#F4F6F2]">
                            Your handwritten grid note lists three dates: <strong>Final archive QA</strong> on Oct 18, <strong>Mobile backup test</strong> on Oct 21, and <strong>Public release tag</strong> on Oct 25.
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-6 rounded-2xl overflow-hidden border border-[var(--vg-border)] shadow-sm">
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
