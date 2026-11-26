import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  ArrowRight,
  FileText,
  Github,
  HardDrive,
  Image as ImageIcon,
  Search,
  Smartphone,
} from 'lucide-react'
import DarkVeil from '@/components/DarkVeil'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import {
  VG_COMPONENTS,
  VG_LAYOUT,
  VG_MOTION,
  VG_TYPOGRAPHY,
} from '@/components/landing/design-system'
import {
  MotionPathTrace,
  VG_EASE,
  VG_SPRING_PARALLAX,
  VG_SPRING_SNAPPY,
} from '@/components/landing/motion'
import { REPO_URL } from '@/components/landing/tokens'
import { cn } from '@/lib/utils'

type CanvasFilter = 'all' | 'mountains' | 'notes'

const VAULT_FILTERS: { id: CanvasFilter; label: string; query: string }[] = [
  {
    id: 'all',
    label: 'All memories',
    query: 'Find my photos from the mountains',
  },
  {
    id: 'mountains',
    label: 'Mountains',
    query: 'Show high-altitude lake & fjord photos',
  },
  {
    id: 'notes',
    label: 'OCR & Docs',
    query: 'Find AWS pricing & admission notes',
  },
]

export function HeroSection() {
  const reduced = useReducedMotion()
  const [isDark, setIsDark] = useState(false)
  const [activeFilter, setActiveFilter] = useState<CanvasFilter>('all')

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const sync = () => setIsDark(root.classList.contains('dark'))
    sync()

    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    window.addEventListener('vm_theme_change', sync)
    window.addEventListener('storage', sync)

    return () => {
      observer.disconnect()
      window.removeEventListener('vm_theme_change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, VG_SPRING_PARALLAX)
  const sy = useSpring(my, VG_SPRING_PARALLAX)

  const parallaxLeftX = useTransform(sx, [-0.5, 0.5], [10, -10])
  const parallaxRightX = useTransform(sx, [-0.5, 0.5], [-12, 12])
  const parallaxTopY = useTransform(sy, [-0.5, 0.5], [9, -9])
  const parallaxMidY = useTransform(sy, [-0.5, 0.5], [-7, 7])

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => {
    mx.set(0)
    my.set(0)
  }

  const currentQuery =
    VAULT_FILTERS.find((item) => item.id === activeFilter)?.query ??
    VAULT_FILTERS[0].query

  const photoDimmed = activeFilter === 'notes'
  const docDimmed = activeFilter === 'mountains'

  return (
    <section
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-label="VectorGallery overview"
      className={cn(
        'relative overflow-hidden bg-[var(--vg-bg)]',
        VG_LAYOUT.sectionPadding.hero
      )}
    >
      {/* Botanical Green Atmospheric Aura (WebGL CPPN + CSS Gradient Fallback) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <DarkVeil
          lightMode={!isDark}
          speed={0.34}
          resolutionScale={0.55}
          warpAmount={0.16}
          noiseIntensity={0.01}
        />
        {/* Soft sanctuary vignette dissolving cleanly into section background */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 85% 70% at 64% 38%, transparent 25%, rgba(8,14,12,0.58) 76%, #080E0C 100%), linear-gradient(180deg, rgba(8,14,12,0.22) 0%, transparent 26%, transparent 72%, #080E0C 100%)'
              : 'radial-gradient(ellipse 85% 70% at 64% 38%, transparent 28%, rgba(247,248,243,0.62) 78%, #F7F8F3 100%), linear-gradient(180deg, rgba(247,248,243,0.28) 0%, transparent 24%, transparent 74%, #F7F8F3 100%)',
          }}
        />
      </div>

      <div className={cn(VG_LAYOUT.containers.wide, 'relative z-10')}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 xl:gap-12 items-center">
          {/* ── Left Column (~60%): Editorial Copy ── */}
          <div className="lg:col-span-7 text-left">
            <motion.div
              initial={reduced ? false : { opacity: 0.92, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: VG_MOTION.durations.standard,
                delay: 0,
                ease: VG_EASE,
              }}
              className={VG_COMPONENTS.badges.sage}
            >
              <span className="w-2 h-2 rounded-full bg-[#087F5B] dark:bg-[#53D9A3]" />
              <span>Personal AI Cloud &amp; Digital Memory Vault</span>
            </motion.div>

            <motion.h1
              initial={reduced ? false : { opacity: 0.94, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: VG_MOTION.durations.editorial,
                delay: 0.05,
                ease: VG_EASE,
              }}
              className="mt-6 font-display font-bold text-[var(--vg-ink)] max-w-[14ch] sm:max-w-none"
              style={VG_TYPOGRAPHY.scale.h1}
            >
              Life is worth{' '}
              <em className={VG_TYPOGRAPHY.editorialWordClass}>remembering</em>.
            </motion.h1>

            <motion.p
              initial={reduced ? false : { opacity: 0.92, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: VG_MOTION.durations.editorial,
                delay: 0.1,
                ease: VG_EASE,
              }}
              className="mt-6 text-[var(--vg-ink-2)] max-w-[38rem]"
              style={VG_TYPOGRAPHY.scale.lead}
            >
              One serene, open-source sanctuary for every photograph, screenshot,
              PDF, and field note you keep. Search by memory, not by filename.
            </motion.p>

            <motion.div
              initial={reduced ? false : { opacity: 0.94, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: VG_MOTION.durations.standard,
                delay: 0.15,
                ease: VG_EASE,
              }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <Link
                href="/app"
                className={cn(VG_COMPONENTS.buttons.primary, 'group')}
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className={VG_COMPONENTS.buttons.secondary}
              >
                <Github className="w-4 h-4" />
                <span>View on GitHub</span>
              </a>
            </motion.div>

            <motion.p
              initial={reduced ? false : { opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: VG_MOTION.durations.standard,
                delay: 0.2,
                ease: VG_EASE,
              }}
              className="mt-5 flex items-start sm:items-center gap-2 text-[13px] font-medium text-[var(--vg-ink-muted)]"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--vg-brand)] shrink-0 mt-1.5 sm:mt-0" />
              <span>
                Open source under Apache-2.0. Self-host locally or bring your own
                storage.
              </span>
            </motion.p>
          </div>

          {/* ── Right Column (~40%): Interactive Memory Canvas (Chaos → Organized → Searchable) ── */}
          <div className="lg:col-span-5">
            {/* Desktop Spatial Constellation */}
            <div className="hidden lg:block relative h-[536px] xl:h-[556px] w-full">
              {/* Emerald/Jade SVG Vector Paths converging scattered memories into the Vault Hub */}
              <svg
                aria-hidden="true"
                viewBox="0 0 500 540"
                fill="none"
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
              >
                <defs>
                  <linearGradient
                    id="vg-hero-vector-line"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={isDark ? '#B8E7D4' : '#087F5B'}
                      stopOpacity="0.24"
                    />
                    <stop
                      offset="55%"
                      stopColor={isDark ? '#53D9A3' : '#087F5B'}
                      stopOpacity="0.72"
                    />
                    <stop
                      offset="100%"
                      stopColor={isDark ? '#53D9A3' : '#087F5B'}
                      stopOpacity="0.16"
                    />
                  </linearGradient>
                </defs>
                <MotionPathTrace
                  d="M115 112 C115 215, 200 245, 236 322"
                  stroke="url(#vg-hero-vector-line)"
                  strokeDasharray="5 5"
                  delay={0.25}
                />
                <MotionPathTrace
                  d="M385 126 C385 220, 300 250, 264 322"
                  stroke="url(#vg-hero-vector-line)"
                  strokeDasharray="5 5"
                  delay={0.3}
                />
                <MotionPathTrace
                  d="M118 265 C155 292, 195 302, 224 326"
                  stroke="url(#vg-hero-vector-line)"
                  delay={0.35}
                />
                <MotionPathTrace
                  d="M382 274 C345 296, 305 306, 276 326"
                  stroke="url(#vg-hero-vector-line)"
                  delay={0.4}
                />
              </svg>

              {/* 1. Scattered Photo Memory: Mountain Pass */}
              <motion.div
                style={
                  reduced
                    ? undefined
                    : { x: parallaxLeftX, y: parallaxTopY }
                }
                initial={
                  reduced
                    ? false
                    : { opacity: 0.88, x: -20, y: -14, rotate: -7, scale: 0.94 }
                }
                animate={{
                  opacity: photoDimmed ? 0.5 : 1,
                  x: 0,
                  y: 0,
                  rotate: -2.5,
                  scale: activeFilter === 'mountains' ? 1.02 : 1,
                }}
                transition={{
                  ...VG_SPRING_SNAPPY,
                  delay: 0.15,
                }}
                className={cn(
                  VG_COMPONENTS.cards.photoFrame,
                  'absolute left-0 top-1 z-10 w-[47%] max-w-[228px] p-2 transition-opacity duration-300'
                )}
              >
                <div className="relative h-28 rounded-xl overflow-hidden">
                  <img
                    src="/landing/photos/mountain-pass.webp"
                    alt="Winding mountain pass landscape memory"
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={cn(
                      VG_COMPONENTS.badges.photoScrim,
                      'absolute bottom-1.5 left-1.5 text-[10px] bg-[#080E0C]/80'
                    )}
                  >
                    RAW · 35mm
                  </span>
                </div>
                <div className="px-1.5 pt-2 pb-0.5 flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-semibold text-[var(--vg-ink)] truncate">
                    Highland_Pass.webp
                  </span>
                  <ImageIcon className="w-3.5 h-3.5 text-[var(--vg-brand)] shrink-0" />
                </div>
              </motion.div>

              {/* 2. Scattered Photo Memory: Calm Morning Lake */}
              <motion.div
                style={
                  reduced
                    ? undefined
                    : { x: parallaxRightX, y: parallaxTopY }
                }
                initial={
                  reduced
                    ? false
                    : { opacity: 0.88, x: 20, y: -12, rotate: 7, scale: 0.94 }
                }
                animate={{
                  opacity: photoDimmed ? 0.5 : 1,
                  x: 0,
                  y: 0,
                  rotate: 2.5,
                  scale: activeFilter === 'mountains' ? 1.02 : 1,
                }}
                transition={{
                  ...VG_SPRING_SNAPPY,
                  delay: 0.2,
                }}
                className={cn(
                  VG_COMPONENTS.cards.photoFrame,
                  'absolute right-0 top-5 z-10 w-[47%] max-w-[228px] p-2 transition-opacity duration-300'
                )}
              >
                <div className="relative h-28 rounded-xl overflow-hidden">
                  <img
                    src="/landing/photos/lake-morning.webp"
                    alt="Morning canoe gliding across calm mountain lake"
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={cn(
                      VG_COMPONENTS.badges.photoScrim,
                      'absolute bottom-1.5 left-1.5 text-[10px] bg-[#080E0C]/80'
                    )}
                  >
                    Android Sync
                  </span>
                </div>
                <div className="px-1.5 pt-2 pb-0.5 flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-semibold text-[var(--vg-ink)] truncate">
                    Morning_Lake.webp
                  </span>
                  <Smartphone className="w-3.5 h-3.5 text-[var(--vg-brand)] shrink-0" />
                </div>
              </motion.div>

              {/* 3. Converging PDF Document Card */}
              <motion.div
                style={
                  reduced
                    ? undefined
                    : { x: parallaxLeftX, y: parallaxMidY }
                }
                initial={
                  reduced
                    ? false
                    : { opacity: 0.88, x: -16, y: 12, rotate: -4 }
                }
                animate={{
                  opacity: docDimmed ? 0.5 : 1,
                  x: 0,
                  y: 0,
                  rotate: 1.5,
                  scale: activeFilter === 'notes' ? 1.02 : 1,
                }}
                transition={{
                  ...VG_SPRING_SNAPPY,
                  delay: 0.25,
                }}
                className={cn(
                  VG_COMPONENTS.cards.elevated,
                  'absolute left-1 top-[182px] z-10 w-[47%] max-w-[224px] p-3.5 transition-opacity duration-300'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E6EDE4] dark:bg-[#1C3329] text-[#087F5B] dark:text-[#53D9A3] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className={VG_COMPONENTS.badges.monoTag}>
                    PDF · p.1
                  </span>
                </div>
                <p className="mt-2.5 text-[12px] font-semibold text-[var(--vg-ink)] truncate">
                  admission_letter_2026.pdf
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--vg-ink-2)] truncate">
                  Extracted text ready for citation
                </p>
              </motion.div>

              {/* 4. Converging OCR Screenshot Card */}
              <motion.div
                style={
                  reduced
                    ? undefined
                    : { x: parallaxRightX, y: parallaxMidY }
                }
                initial={
                  reduced
                    ? false
                    : { opacity: 0.88, x: 16, y: 12, rotate: 4 }
                }
                animate={{
                  opacity: docDimmed ? 0.5 : 1,
                  x: 0,
                  y: 0,
                  rotate: -1.5,
                  scale: activeFilter === 'notes' ? 1.02 : 1,
                }}
                transition={{
                  ...VG_SPRING_SNAPPY,
                  delay: 0.3,
                }}
                className={cn(
                  VG_COMPONENTS.cards.elevated,
                  'absolute right-0 top-[194px] z-10 w-[48%] max-w-[232px] p-3.5 transition-opacity duration-300'
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--vg-brand)] font-semibold">
                    OCR Screenshot
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--vg-brand)]" />
                </div>
                <p className="text-[12px] font-semibold text-[var(--vg-ink)] truncate">
                  aws_ec2_pricing.png
                </p>
                <div className="mt-2 px-2 py-1.5 rounded-lg bg-[var(--vg-surface-2)] border border-[var(--vg-border)] font-mono text-[10.5px] text-[var(--vg-ink-2)] truncate">
                  t3.medium · $0.0416/hr · gp3
                </div>
              </motion.div>

              {/* 5. Organized & Searchable Vault Hub (Foreground Focal Anchor) */}
              <motion.div
                initial={reduced ? false : { opacity: 0.92, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: VG_MOTION.durations.editorial,
                  delay: 0.35,
                  ease: VG_EASE,
                }}
                className={cn(
                  VG_COMPONENTS.cards.glass,
                  'absolute inset-x-0 top-[312px] z-20 mx-auto w-full max-w-[464px] p-4'
                )}
              >
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--vg-border)]">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-ink)]">
                    <VectorGalleryLogo
                      variant="mark"
                      size="sm"
                      showWordmark={false}
                    />
                    <span>VectorGallery Vault</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-[var(--vg-brand)]">
                    <HardDrive className="w-3 h-3" /> Indexed &amp; Searchable
                  </span>
                </div>

                {/* Interactive Query Bar */}
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border-strong)]">
                  <Search className="w-3.5 h-3.5 text-[var(--vg-brand)] shrink-0" />
                  <span className="text-[12.5px] font-medium text-[var(--vg-ink)] truncate">
                    {currentQuery}
                  </span>
                  <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[var(--vg-ink-muted)] shrink-0">
                    ⌘K
                  </kbd>
                </div>

                {/* Interactive Filter Chips */}
                <div className="mt-2.5 flex items-center gap-1.5">
                  {VAULT_FILTERS.map((filter) => {
                    const active = activeFilter === filter.id
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setActiveFilter(filter.id)}
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                          active
                            ? VG_COMPONENTS.buttons.tabActive
                            : VG_COMPONENTS.buttons.tabIdle
                        )}
                      >
                        {filter.label}
                      </button>
                    )
                  })}
                </div>

                {/* Vault Hub Grounded Results (ARCHITECTURE.md photos) */}
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <div
                    className={cn(
                      'rounded-xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface-2)] transition-opacity duration-200',
                      activeFilter === 'notes' && 'opacity-50'
                    )}
                  >
                    <img
                      src="/landing/photos/fjord-overlook.webp"
                      alt="Nordic fjord overlook memory"
                      className="w-full h-20 object-cover"
                    />
                    <div className="px-2.5 py-1.5 flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold text-[var(--vg-ink)] truncate">
                        Nordic_Fjord.webp
                      </span>
                      <span className="text-[10px] font-mono text-[var(--vg-brand)] shrink-0">
                        Verified
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'rounded-xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface-2)] transition-opacity duration-200',
                      activeFilter === 'mountains' && 'opacity-50'
                    )}
                  >
                    <img
                      src="/landing/photos/workspace-journal.webp"
                      alt="Handwritten grid notebook and camera on wooden desk"
                      className="w-full h-20 object-cover"
                    />
                    <div className="px-2.5 py-1.5 flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold text-[var(--vg-ink)] truncate">
                        Studio_Notes.webp
                      </span>
                      <span className="text-[10px] font-mono text-[var(--vg-brand)] shrink-0">
                        OCR
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Mobile & Tablet Stacked Simplified Composition */}
            <div
              className={cn(
                VG_COMPONENTS.cards.surface,
                'lg:hidden p-4 sm:p-5 space-y-3.5'
              )}
            >
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--vg-border)]">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-ink)]">
                  <VectorGalleryLogo
                    variant="mark"
                    size="sm"
                    showWordmark={false}
                  />
                  <span>VectorGallery Vault</span>
                </div>
                <span className={VG_COMPONENTS.badges.mint}>
                  <HardDrive className="w-3 h-3" /> Searchable
                </span>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                <Search className="w-4 h-4 text-[var(--vg-brand)] shrink-0" />
                <span className="text-[13px] font-medium text-[var(--vg-ink)] truncate">
                  Find my photos from the mountains
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl overflow-hidden border border-[var(--vg-border)]">
                  <img
                    src="/landing/photos/mountain-pass.webp"
                    alt="Winding mountain road"
                    className="w-full h-24 object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-[var(--vg-border)]">
                  <img
                    src="/landing/photos/lake-morning.webp"
                    alt="Calm morning lake"
                    className="w-full h-24 object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-[var(--vg-border)]">
                  <img
                    src="/landing/photos/fjord-overlook.webp"
                    alt="Nordic fjord overlook"
                    className="w-full h-24 object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-[var(--vg-border)]">
                  <img
                    src="/landing/photos/workspace-journal.webp"
                    alt="Workspace journal and camera"
                    className="w-full h-24 object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                  <span className="font-medium text-[var(--vg-ink)] truncate">
                    admission_letter_2026.pdf
                  </span>
                  <span className="font-mono text-[10px] text-[var(--vg-brand)] ml-2 shrink-0">
                    PDF · p.1
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
                  <span className="font-medium text-[var(--vg-ink)] truncate">
                    aws_ec2_pricing.png
                  </span>
                  <span className="font-mono text-[10px] text-[var(--vg-brand)] ml-2 shrink-0">
                    OCR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
