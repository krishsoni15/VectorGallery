import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, Eye, FolderOpen, Search, UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MotionReveal, VG_EASE } from './motion'
import { CURATED_PHOTOS, type ShowcasePhoto } from './tokens'
import { Container, Section, SectionHeading } from './ui'

const PIPELINE_STEPS = [
  {
    step: '01',
    title: 'Capture',
    headline: 'Drop files on web or queue passively from Android',
    description:
      'Upload photos, PDFs, Office files, or Markdown up to 50 MB directly in the browser, or let Flutter scan camera roll and screenshots into its local SQLite queue.',
    badge: 'Web Dropzone + Flutter Queue',
    icon: UploadCloud,
    photo: '/landing/photos/lake-morning.webp',
  },
  {
    step: '02',
    title: 'Understand',
    headline: 'Extract text, OCR screens & parse structured documents',
    description:
      'Dual-path optical OCR reads receipts and terminal captures while unpdf, XML, and spreadsheet parsers chunk readable passages without touching raw originals.',
    badge: 'OCR + unpdf + XLSX/DOCX',
    icon: Eye,
    photo: '/landing/photos/workspace-journal.webp',
  },
  {
    step: '03',
    title: 'Connect',
    headline: 'Index SHA-256 identities into unified searchable clusters',
    description:
      'Optionally pair external Gemini, Cohere, or OpenAI embeddings with PostgreSQL pgvector, or keep 100% deterministic multilingual matching purely on disk.',
    badge: 'pgvector + SHA-256 Index',
    icon: FolderOpen,
    photo: '/landing/photos/mountain-pass.webp',
  },
  {
    step: '04',
    title: 'Rediscover',
    headline: 'Recall the exact frame, page, or cited answer in seconds',
    description:
      'Ask naturally across albums and folders. Every answer links directly back to the source filename, extracted passage, and full-resolution preview.',
    badge: 'Cited Natural Search',
    icon: Search,
    photo: '/landing/photos/fjord-overlook.webp',
  },
]

const CATEGORIES: Array<'All' | ShowcasePhoto['category']> = [
  'All',
  'Travel',
  'Personal',
  'Work',
  'Documents',
]

export function HowItWorksAndMemories() {
  const [activeStage, setActiveStage] = useState(0)
  const [category, setCategory] = useState<'All' | ShowcasePhoto['category']>('All')
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || paused) return
    const timer = window.setInterval(() => {
      setActiveStage((prev) => (prev + 1) % PIPELINE_STEPS.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [reduced, paused])

  const filteredPhotos =
    category === 'All'
      ? CURATED_PHOTOS
      : CURATED_PHOTOS.filter((item) => item.category === category)

  const currentStage = PIPELINE_STEPS[activeStage]
  const StageIcon = currentStage.icon

  return (
    <>
      {/* SECTION: Animated 4-Stage Pipeline */}
      <Section id="how-it-works" surface="secondary" ariaLabel="How VectorGallery works">
        <Container>
          <MotionReveal>
            <SectionHeading
              eyebrow="Workflow Architecture"
              title={
                <>
                  From raw camera capture to{' '}
                  <span className="text-[var(--vg-brand)] dark:text-[var(--vg-sky)]">
                    calm, cited recall
                  </span>
                </>
              }
              subtitle="Click any stage below to inspect how VectorGallery ingests, indexes, and surfaces your library while leaving originals untouched."
            />
          </MotionReveal>

          <div
            className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Left stage buttons */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PIPELINE_STEPS.map((item, idx) => {
                const Icon = item.icon
                const active = idx === activeStage
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      setPaused(true)
                      setActiveStage(idx)
                    }}
                    className={cn(
                      'text-left rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                      active
                        ? 'bg-[var(--vg-surface)] border-[var(--vg-brand)] shadow-[var(--vg-shadow-card)]'
                        : 'bg-[var(--vg-surface)]/70 border-[var(--vg-border)] hover:bg-[var(--vg-surface)]'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={cn(
                          'font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full',
                          active
                            ? 'bg-[#2563EB] text-[#FFFFFF]'
                            : 'bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)]'
                        )}
                      >
                        Stage {item.step}
                      </span>
                      <Icon
                        className={cn(
                          'w-4 h-4',
                          active ? 'text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]' : 'text-[var(--vg-ink-3)]'
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="font-display text-[18px] font-bold text-[var(--vg-ink)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-[var(--vg-ink-2)]">
                        {item.badge}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right stage visualizer */}
            <div className="lg:col-span-6 rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-6 sm:p-8 shadow-[var(--vg-shadow-hero)] flex flex-col justify-between gap-6 relative overflow-hidden">
              {/* Subtle Soft-Blue SVG flow arc */}
              <svg
                viewBox="0 0 420 60"
                className="w-full h-8 text-[var(--vg-brand)]/35 dark:text-[var(--vg-sky)]/35"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 30 C110 4, 310 56, 408 30"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
                {PIPELINE_STEPS.map((_, idx) => {
                  const cx = 12 + idx * 132
                  const active = idx <= activeStage
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={30}
                      r={idx === activeStage ? 7 : 5}
                      fill={active ? '#397BEE' : 'currentColor'}
                    />
                  )
                })}
              </svg>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStage.step}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: VG_EASE }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center"
                >
                  <div className="sm:col-span-7 space-y-3">
                    <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                      <StageIcon className="w-4 h-4" />
                      <span>
                        {currentStage.step} · {currentStage.title}
                      </span>
                    </div>
                    <h3 className="font-display text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-[var(--vg-ink)] leading-snug">
                      {currentStage.headline}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-[var(--vg-ink-2)]">
                      {currentStage.description}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--vg-ink)] pt-1">
                      <Check className="w-3.5 h-3.5 text-[var(--vg-brand)]" />
                      <span>Verified inside VectorGallery runtime</span>
                    </div>
                  </div>
                  <div className="sm:col-span-5">
                    <div className="rounded-2xl overflow-hidden border border-[var(--vg-border)] aspect-[4/3] shadow-sm">
                      <img
                        src={currentStage.photo}
                        alt={currentStage.headline}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION: Curated Visual Memory Wall */}
      <Section id="memories" surface="default" ariaLabel="Photo and memories experience">
        <Container>
          <MotionReveal>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Editorial Memory Wall"
                title={
                  <>
                    Rediscover the moments that{' '}
                    <span className="text-[var(--vg-brand)] dark:text-[var(--vg-sky)]">
                      matter most
                    </span>
                  </>
                }
                subtitle="Filter across real photographs, study notes, and scanned records with crisp metadata and instant album browsing."
              />

              <div
                role="tablist"
                aria-label="Filter curated memories"
                className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] self-start lg:self-auto"
              >
                {CATEGORIES.map((cat) => {
                  const active = category === cat
                  return (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={active}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all',
                        active
                          ? 'bg-[#2563EB] text-[#FFFFFF] shadow-sm'
                          : 'text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[var(--vg-surface)]'
                      )}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>
          </MotionReveal>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {filteredPhotos.map((photo, idx) => {
              const isAll = category === 'All'
              const spanClass = isAll
                ? idx === 0 || idx === 5 || idx === 10 || idx === 11
                  ? 'lg:col-span-6 h-[260px]'
                  : 'lg:col-span-3 h-[260px]'
                : 'sm:col-span-1 lg:col-span-4 h-[250px]'
              return (
                <div
                  key={photo.id}
                  className={cn(
                    'group relative rounded-3xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-card)] transition-transform duration-300 hover:-translate-y-1',
                    spanClass
                  )}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090F1C]/95 via-[#090F1C]/45 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#090F1C]/70 backdrop-blur-md text-[11px] font-medium text-[#F1F5FF] border border-white/15">
                      {photo.category}
                    </span>
                  </div>
                  <div className="vg-photo-caption absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-[15px] font-semibold truncate">
                        {photo.title}
                      </p>
                      <p className="text-[11.5px] opacity-90 truncate">{photo.meta}</p>
                    </div>
                    <span className="font-mono text-[11px] opacity-85 shrink-0">{photo.date}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Container>
      </Section>
    </>
  )
}
