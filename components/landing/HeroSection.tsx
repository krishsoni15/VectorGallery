import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'
import DarkVeil from '@/components/DarkVeil'
import {
  VG_COMPONENTS,
  VG_LAYOUT,
  VG_MOTION,
  VG_TYPOGRAPHY,
} from '@/components/landing/design-system'
import {
  MaskedReveal,
  VG_EASE,
  VG_SPRING_PARALLAX,
} from '@/components/landing/motion'
import { cn } from '@/lib/utils'

const HERO_SAMPLE_PROMPTS = [
  {
    query: 'handwritten coffee sketch from October 14',
    matches: '2 matches',
    caption: 'Journal · Oct 14',
  },
  {
    query: 'notebook notes next to morning espresso',
    matches: '3 matches',
    caption: 'Notes · Desk',
  },
] as const

export function HeroSection() {
  const reduced = useReducedMotion()
  const [isDark, setIsDark] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)

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

  const sliceX = useTransform(sx, [-0.5, 0.5], [8, -8])
  const sliceY = useTransform(sy, [-0.5, 0.5], [6, -6])

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

  const handleTryExperience = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('search-demo')
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  const activePrompt = HERO_SAMPLE_PROMPTS[promptIdx]

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
      {/* Neutral-First Silk Atmospheric Light-Field */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <DarkVeil
          lightMode={!isDark}
          speed={0.32}
          resolutionScale={0.6}
          warpAmount={0.18}
          noiseIntensity={0.014}
        />
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(11,13,12,0.22) 0%, transparent 25%, transparent 78%, #0B0D0C 100%)'
              : 'linear-gradient(180deg, rgba(250,250,247,0.24) 0%, transparent 25%, transparent 78%, #FAFAF7 100%)',
          }}
        />
      </div>

      <div className={cn(VG_LAYOUT.containers.wide, 'relative z-10')}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 xl:gap-10 items-center">
          {/* ── Left Column: Quiet Kicker + Giant Architectural Typography + Pill CTAs ── */}
          <div className="lg:col-span-6 text-left">
            <motion.div
              initial={reduced ? false : { opacity: 0.92, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: VG_MOTION.durations.standard,
                delay: 0,
                ease: VG_EASE,
              }}
              className="inline-flex items-center gap-2.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--vg-ink-2)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-[#58D6A8] shrink-0" />
              <span>Personal AI Cloud · Open Source</span>
            </motion.div>

            <MaskedReveal immediate delay={0.05} y={12} className="mt-6">
              <h1
                className="font-display font-bold text-[var(--vg-ink)]"
                style={VG_TYPOGRAPHY.scale.h1}
              >
                Everything you{' '}
                <em className={VG_TYPOGRAPHY.editorialWordClass}>keep</em>.
                <span className="block text-[var(--vg-ink-2)] mt-1.5 sm:mt-2">
                  Right where you need it.
                </span>
              </h1>
            </MaskedReveal>

            <motion.p
              initial={reduced ? false : { opacity: 0.92, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: VG_MOTION.durations.editorial,
                delay: 0.1,
                ease: VG_EASE,
              }}
              className="mt-7 text-[var(--vg-ink-2)] max-w-[33rem]"
              style={VG_TYPOGRAPHY.scale.lead}
            >
              Photos, files and memories, intelligently connected. Find anything
              with a simple question.
            </motion.p>

            <motion.div
              initial={reduced ? false : { opacity: 0.94, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: VG_MOTION.durations.standard,
                delay: 0.15,
                ease: VG_EASE,
              }}
              className="mt-9 flex flex-wrap items-center gap-3.5"
            >
              <Link
                href="/app"
                className={cn(VG_COMPONENTS.buttons.primary, 'group')}
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#search-demo"
                onClick={handleTryExperience}
                className={VG_COMPONENTS.buttons.secondary}
              >
                Try the experience
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
              className="mt-6 text-[13px] text-[var(--vg-ink-muted)]"
            >
              Open source · Run privately on your own computer or connect your own storage.
            </motion.p>
          </div>

          {/* ── Right Column: Seamless Memory Fold Studio Sculpture + Base Search Slice ── */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto lg:mx-0 lg:-mr-10 xl:-mr-14">
              {/* Studio Sculpture with Seamless Radial Edge Mask */}
              <MaskedReveal
                immediate
                delay={0.12}
                direction="center"
                y={10}
                className="relative"
              >
                <div
                  className="relative overflow-hidden"
                  style={{
                    maskImage:
                      'radial-gradient(ellipse 56% 56% at 58% 50%, #000 30%, rgba(0,0,0,0.62) 52%, transparent 74%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse 56% 56% at 58% 50%, #000 30%, rgba(0,0,0,0.62) 52%, transparent 74%)',
                  }}
                >
                  <img
                    src={
                      isDark
                        ? '/brand/memory-fold-dark.webp'
                        : '/brand/memory-fold-light.webp'
                    }
                    alt="VectorGallery Memory Fold translucent emerald and frosted glass sculpture"
                    className="w-full h-auto max-h-[540px] object-cover select-none"
                  />
                </div>
              </MaskedReveal>

              {/* Single Anchored Editorial Photo Slice + Interactive Glass Search Bar */}
              <motion.div
                style={reduced ? undefined : { x: sliceX, y: sliceY }}
                initial={reduced ? false : { opacity: 0.92, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: VG_MOTION.durations.editorial,
                  delay: 0.22,
                  ease: VG_EASE,
                }}
                className="relative z-20 -mt-10 sm:-mt-14 lg:-mt-16 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-2 sm:px-4"
              >
                {/* Grounded Editorial Photo Slice */}
                <button
                  type="button"
                  onClick={() =>
                    setPromptIdx((prev) => (prev + 1) % HERO_SAMPLE_PROMPTS.length)
                  }
                  aria-label="Preview next memory search prompt"
                  className="group relative shrink-0 w-24 h-20 sm:w-28 sm:h-20 rounded-2xl overflow-hidden border border-[#E0E4DD] dark:border-white/[0.12] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
                >
                  <img
                    src="/landing/photos/aura-journal-desk.webp"
                    alt="Open handwritten notebook with ink sketch and ceramic cup on linen table"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="vg-photo-caption absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#0B0D0C]/75 text-[#F2F3EF] backdrop-blur-md">
                    {activePrompt.caption}
                  </span>
                </button>

                {/* Single Glass Search Pill */}
                <a
                  href="#search-demo"
                  onClick={handleTryExperience}
                  className={cn(
                    VG_COMPONENTS.cards.glass,
                    'flex-1 min-w-0 flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:border-[#087F5B]/40 dark:hover:border-[#58D6A8]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Search className="w-4 h-4 text-[var(--vg-brand)] shrink-0" />
                    <span className="text-[13.5px] sm:text-[14px] text-[var(--vg-ink)] truncate">
                      &ldquo;{activePrompt.query}&rdquo;
                    </span>
                  </div>
                  <span className="shrink-0 text-[12px] font-medium text-[var(--vg-brand)]">
                    {activePrompt.matches}
                  </span>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
