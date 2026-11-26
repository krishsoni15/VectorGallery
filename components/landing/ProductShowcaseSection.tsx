import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  FolderHeart,
  HardDrive,
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
import {
  BrowserFrame,
  Container,
  Section,
  SectionHeading,
} from '@/components/landing/ui'
import { cn } from '@/lib/utils'

type ShowcaseTabId = 'timeline' | 'search' | 'assistant' | 'viewer'

interface ShowcaseTab {
  id: ShowcaseTabId
  label: string
  navLabel: string
  icon: typeof ImageIcon
  status: string
}

const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    id: 'timeline',
    label: 'Photos timeline',
    navLabel: 'Photos',
    icon: ImageIcon,
    status: 'SHA-256 deduplicated · Original quality',
  },
  {
    id: 'search',
    label: 'Search results',
    navLabel: 'Search',
    icon: Search,
    status: 'pgvector Hybrid + Offline Unicode',
  },
  {
    id: 'assistant',
    label: 'AI Assistant',
    navLabel: 'Assistant',
    icon: MessageSquare,
    status: 'Grounded BYOK · Source citations',
  },
  {
    id: 'viewer',
    label: 'Document viewer',
    navLabel: 'Documents',
    icon: FileText,
    status: 'PDF, DOCX, XLSX, MD + Media Archive',
  },
]

const TIMELINE_PHOTOS = [
  {
    src: '/landing/photos/coastal-cliffs.webp',
    alt: 'Sea stacks and rugged sandstone cliffs washed by turquoise ocean waves',
    title: 'Coastal_Cliffs.webp',
    meta: 'Oct 02 · Mobile Backup',
    fav: true,
  },
  {
    src: '/landing/photos/analog-camera.webp',
    alt: 'Classic silver rangefinder lens resting on studio keys',
    title: 'Analog_Rangefinder.webp',
    meta: 'Oct 08 · Archive PNG',
    fav: false,
  },
  {
    src: '/landing/photos/mountain-pass.webp',
    alt: 'Winding mountain road beneath green highland cliffs in misty light',
    title: 'Highland_Pass_Horizon.webp',
    meta: 'Nov 24 · 35mm RAW',
    fav: true,
  },
  {
    src: '/landing/photos/lake-morning.webp',
    alt: 'Quiet canoe gliding across calm turquoise mountain lake at sunrise',
    title: 'Calm_Morning_Lake.webp',
    meta: 'Nov 19 · 24 MP',
    fav: false,
  },
]

const KEY_BENEFITS = [
  {
    title: 'One timeline for photos and paperwork',
    description:
      'Browse camera rolls alongside scanned receipts, PDFs, and Markdown notes inside a single workspace without folder sprawl.',
  },
  {
    title: 'Hybrid retrieval that works offline too',
    description:
      'Pair PostgreSQL pgvector embeddings with dual optical OCR, or fall back seamlessly to deterministic Unicode matching with zero API keys.',
  },
  {
    title: 'Original assets, zero lock-in',
    description:
      'Every upload up to 50 MB is SHA-256 deduplicated and preserved in your chosen driver so you can inspect or download originals anytime.',
  },
]

export function ProductShowcaseSection() {
  const prefersReducedMotion = useReducedMotion()
  const [activeTab, setActiveTab] = useState<ShowcaseTabId>('timeline')

  const currentTab = SHOWCASE_TABS.find((tab) => tab.id === activeTab) || SHOWCASE_TABS[0]

  return (
    <Section id="showcase" surface="secondary" ariaLabel="Product workspace showcase">
      <Container>
        <MotionReveal>
          <SectionHeading
            align="center"
            eyebrow="Product Experience"
            title={
              <>
                Everything you keep,{' '}
                <em className={VG_TYPOGRAPHY.editorialWordClass}>beautifully</em>{' '}
                together.
              </>
            }
            subtitle="Photos, scanned paperwork, Markdown notes, and grounded AI answers live inside one calm workspace — without folders getting in the way."
          />
        </MotionReveal>

        <MotionReveal delay={0.08} className="mt-10 max-w-[1200px] mx-auto">
          <BrowserFrame
            title="VectorGallery · Personal Cloud Workspace"
            toolbarRight={
              <div
                role="tablist"
                aria-label="Product workspace screens"
                className="flex flex-wrap items-center gap-1.5"
              >
                {SHOWCASE_TABS.map((tab) => {
                  const Icon = tab.icon
                  const active = tab.id === activeTab
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={active}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                        active ? VG_COMPONENTS.buttons.tabActive : VG_COMPONENTS.buttons.tabIdle
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
              {/* Left App Sidebar Mockup */}
              <aside
                aria-label="Workspace navigation preview"
                className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[var(--vg-border)] bg-[#EEF3EC]/85 dark:bg-[#111C17]/85 p-4 sm:p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--vg-ink-muted)]">
                      Library Vault
                    </span>
                    <span className={VG_COMPONENTS.badges.mint}>Private</span>
                  </div>

                  <nav className="grid grid-cols-2 lg:grid-cols-1 gap-1.5" aria-label="Workspace views">
                    {SHOWCASE_TABS.map((tab) => {
                      const Icon = tab.icon
                      const active = tab.id === activeTab
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-left transition-colors',
                            active
                              ? 'bg-[var(--vg-surface)] text-[var(--vg-brand)] border border-[var(--vg-border)] shadow-sm font-semibold'
                              : 'text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[#FFFFFF]/70 dark:hover:bg-[#101914]/70'
                          )}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{tab.navLabel}</span>
                        </button>
                      )
                    })}
                    <div className="hidden lg:flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[var(--vg-ink-muted)]">
                      <FolderHeart className="w-4 h-4 shrink-0" />
                      <span>Collections</span>
                    </div>
                  </nav>
                </div>

                <div className="hidden lg:block rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--vg-ink)]">
                      <HardDrive className="w-3.5 h-3.5 text-[var(--vg-brand)]" />
                      Storage Driver
                    </span>
                    <span className="font-mono text-[10.5px] text-[var(--vg-brand)]">Ready</span>
                  </div>
                  <p className="font-mono text-[11px] text-[var(--vg-ink-2)]">
                    Local Disk · 50 MB/file
                  </p>
                  <div className="h-1.5 rounded-full bg-[var(--vg-surface-2)] overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-[var(--vg-brand)]" />
                  </div>
                </div>
              </aside>

              {/* Right Workspace Screen Viewport */}
              <div className="lg:col-span-9 p-5 sm:p-7 bg-[var(--vg-surface)] flex flex-col justify-between gap-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--vg-border)]">
                  <span className="text-[13px] font-semibold text-[var(--vg-ink)]">
                    {currentTab.label}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--vg-ink-2)]">
                    {currentTab.status}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.28,
                      ease: VG_MOTION.ease,
                    }}
                    className="flex-1"
                  >
                    {activeTab === 'timeline' && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[var(--vg-ink)]">
                            <Calendar className="w-4 h-4 text-[var(--vg-brand)]" />
                            <span>Autumn 2026 · Chronological Roll</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11.5px]">
                            <span className="px-2.5 py-1 rounded-full bg-[var(--vg-surface-soft)] text-[var(--vg-brand)] font-semibold">
                              All Photos
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)]">
                              Travel
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)]">
                              Favorites
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {TIMELINE_PHOTOS.map((photo) => (
                            <div
                              key={photo.title}
                              className="group relative rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface-2)] aspect-[4/5]"
                            >
                              <img
                                src={photo.src}
                                alt={photo.alt}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#080E0C]/80 via-transparent to-transparent" />
                              {photo.fav && (
                                <span
                                  aria-label="Favorited memory"
                                  className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#080E0C]/65 text-[#53D9A3] flex items-center justify-center backdrop-blur-sm"
                                >
                                  <Heart className="w-3 h-3 fill-current" />
                                </span>
                              )}
                              <div className="vg-photo-caption absolute inset-x-2.5 bottom-2.5 space-y-0.5">
                                <p className="text-[11.5px] font-semibold truncate">{photo.title}</p>
                                <p className="font-mono text-[10px] opacity-85 truncate">{photo.meta}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                          <span className="inline-flex items-center gap-2 font-medium text-[var(--vg-ink)]">
                            <CheckCircle2 className="w-4 h-4 text-[var(--vg-brand)]" />
                            Coastal_Cliffs.webp · Verified unique SHA-256 content hash
                          </span>
                          <span className="font-mono text-[11px] text-[var(--vg-ink-muted)]">
                            PNG · JPG · WEBP · GIF · HEIC
                          </span>
                        </div>
                      </div>
                    )}

                    {activeTab === 'search' && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)]">
                          <Search className="w-4 h-4 text-[var(--vg-brand)] shrink-0" />
                          <span className="text-[13.5px] font-medium text-[var(--vg-ink)]">
                            stone towers hillside or aws pricing screenshot
                          </span>
                          <span className="ml-auto font-mono text-[10.5px] px-2 py-0.5 rounded bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[var(--vg-brand)]">
                            Hybrid + OCR
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-3.5 flex gap-3.5 items-start">
                            <img
                              src="/landing/photos/stone-architecture.webp"
                              alt="Historic stone towers perched along a green European hillside"
                              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[var(--vg-border)]"
                            />
                            <div className="min-w-0 space-y-1.5">
                              <span className={VG_COMPONENTS.badges.mint}>EXIF + Visual</span>
                              <p className="text-[13px] font-semibold text-[var(--vg-ink)] truncate">
                                Ridge_Stonework.webp
                              </p>
                              <p className="text-[12px] text-[var(--vg-ink-2)] line-clamp-2">
                                Historic stone towers on green hillside · SHA-256 verified travel archive.
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-3.5 flex gap-3.5 items-start">
                            <img
                              src="/landing/photos/studio-desk.webp"
                              alt="Workspace monitor displaying cloud console screenshot"
                              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[var(--vg-border)]"
                            />
                            <div className="min-w-0 space-y-1.5">
                              <span className={VG_COMPONENTS.badges.mint}>Dual OCR Match</span>
                              <p className="text-[13px] font-semibold text-[var(--vg-ink)] truncate">
                                aws_ec2_pricing_console.png
                              </p>
                              <p className="text-[12px] text-[var(--vg-ink-2)] line-clamp-2">
                                Extracted OCR: c6i.large $0.085/hr · t3.medium $0.0416/hr · EBS gp3.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-3.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[var(--vg-surface-soft)] text-[var(--vg-brand)] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-[var(--vg-ink)] truncate">
                                university_admission_letter_2026.pdf
                              </p>
                              <p className="text-[11.5px] text-[var(--vg-ink-2)] truncate">
                                Chunk §1 · Parsed via unpdf text extraction
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-[11px] text-[var(--vg-brand)] shrink-0">
                            Page 1
                          </span>
                        </div>
                      </div>
                    )}

                    {activeTab === 'assistant' && (
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <div className="max-w-md rounded-2xl rounded-br-md bg-[var(--vg-surface-soft)] border border-[var(--vg-border)] px-4 py-2.5 text-[13px] font-medium text-[var(--vg-ink)]">
                            Summarize my autumn trip notes and point to the valley stream photo.
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className={VG_COMPONENTS.badges.mint}>
                              <MessageSquare className="w-3.5 h-3.5" />
                              Vault Assistant
                            </span>
                            <span className="font-mono text-[11px] text-[var(--vg-ink-muted)]">
                              Gemini · Groq · Cohere · OpenAI (BYOK)
                            </span>
                          </div>

                          <p className="text-[13.5px] leading-relaxed text-[var(--vg-ink)]">
                            Your October expedition archive captures the granite valley reflection stream on Oct 21 along with architecture notes stored in Markdown.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)]">
                              <img
                                src="/landing/photos/valley-reflection.webp"
                                alt="Granite peaks reflected in crystal alpine stream bordered by pine trees"
                                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[var(--vg-border)]"
                              />
                              <div className="min-w-0">
                                <p className="font-mono text-[10.5px] text-[var(--vg-brand)]">
                                  [1] Photo Source
                                </p>
                                <p className="text-[12.5px] font-semibold text-[var(--vg-ink)] truncate">
                                  Valley_Mirror_Stream.webp
                                </p>
                                <p className="text-[11px] text-[var(--vg-ink-2)] truncate">
                                  50mm · f/4.0 · Oct 21
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)]">
                              <div className="w-14 h-14 rounded-lg bg-[var(--vg-surface-soft)] text-[var(--vg-brand)] flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-mono text-[10.5px] text-[var(--vg-brand)]">
                                  [2] Markdown Note
                                </p>
                                <p className="text-[12.5px] font-semibold text-[var(--vg-ink)] truncate">
                                  docker_compose_architecture.md
                                </p>
                                <p className="text-[11px] text-[var(--vg-ink-2)] truncate">
                                  Section 2 · Cited chunk
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-[12px] text-[var(--vg-ink-muted)] flex items-center justify-between">
                          <span>No API key configured? Falls back cleanly to direct matching excerpts.</span>
                          <span className="font-mono text-[11px] text-[var(--vg-brand)]">AES-256-GCM BYOK</span>
                        </div>
                      </div>
                    )}

                    {activeTab === 'viewer' && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5 space-y-2">
                          {[
                            {
                              name: 'project_requirements_v2_spec.docx',
                              tag: 'DOCX · XML',
                              active: true,
                              icon: FileText,
                            },
                            {
                              name: 'q4_studio_expenses.xlsx',
                              tag: 'XLSX · Rows',
                              active: false,
                              icon: FileSpreadsheet,
                            },
                            {
                              name: 'studio_receipt_oct.pdf',
                              tag: 'PDF · Page 1',
                              active: false,
                              icon: FileText,
                            },
                            {
                              name: 'field_recording_nov.m4a',
                              tag: 'Audio · Metadata',
                              active: false,
                              icon: HardDrive,
                            },
                          ].map((doc) => {
                            const Icon = doc.icon
                            return (
                              <div
                                key={doc.name}
                                className={cn(
                                  'p-3 rounded-xl border flex items-center gap-2.5',
                                  doc.active
                                    ? 'bg-[var(--vg-surface-soft)] border-[#087F5B]/45 dark:border-[#53D9A3]/45'
                                    : 'bg-[var(--vg-surface-2)] border-[var(--vg-border)]'
                                )}
                              >
                                <Icon className="w-4 h-4 text-[var(--vg-brand)] shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[12px] font-semibold text-[var(--vg-ink)] truncate">
                                    {doc.name}
                                  </p>
                                  <p className="font-mono text-[10.5px] text-[var(--vg-ink-2)]">
                                    {doc.tag}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="md:col-span-7 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-semibold text-[var(--vg-brand)]">
                              Inline Reader · Extracted Chunks
                            </span>
                            <span className={VG_COMPONENTS.badges.monoTag}>310 KB</span>
                          </div>
                          <div className="flex gap-3.5 items-center">
                            <img
                              src="/landing/photos/coffee-ritual.webp"
                              alt="Pour-over glass carafe coffee brewing on a warm natural wood counter"
                              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[var(--vg-border)]"
                            />
                            <div className="space-y-1 text-[12.5px]">
                              <p className="font-semibold text-[var(--vg-ink)]">
                                Workspace Reference & Spec Preview
                              </p>
                              <p className="text-[var(--vg-ink-2)] leading-relaxed">
                                Extracts PDF pages, DOCX paragraphs, Markdown, CSV, and XLSX headers for instant search. Video & audio remain archived cleanly with metadata.
                              </p>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] font-mono text-[11.5px] text-[var(--vg-ink-2)] space-y-1">
                            <p className="text-[var(--vg-ink)] font-semibold">§4 Storage & Deduplication</p>
                            <p>• 50 MB upload bound · SHA-256 unique check</p>
                            <p>• Recoverable trash + signed original downloads</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </BrowserFrame>
        </MotionReveal>

        {/* 3 Clean Key Benefits Below (No Bento Grid) */}
        <MotionReveal delay={0.14} className="mt-12 max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-[var(--vg-border)]">
            {KEY_BENEFITS.map((benefit, index) => (
              <div key={benefit.title} className="space-y-2.5">
                <span className="font-mono text-[11.5px] font-semibold text-[var(--vg-brand)]">
                  0{index + 1}
                </span>
                <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-[var(--vg-ink)]">
                  {benefit.title}
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--vg-ink-2)]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </MotionReveal>
      </Container>
    </Section>
  )
}
