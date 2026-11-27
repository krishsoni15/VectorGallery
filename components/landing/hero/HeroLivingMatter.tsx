import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Smartphone } from 'lucide-react'
import { VG_COMPONENTS, VG_LAYOUT } from '@/components/landing/design-system'
import { createHeroTimeline } from '@/components/landing/motion/HeroTimeline'
import {
  InteractiveTriadIndex,
  MagneticCircleButton,
  type TriadItem,
} from '@/components/landing/motion/LivingMotionPrimitives'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { MemorySphereCanvas } from '@/components/landing/sculpture/MemorySphereCanvas'
import { LivingAuraCanvas } from '@/components/landing/shaders/LivingAuraCanvas'
import { useAuth } from '@/lib/AuthContext'

const HERO_TRIAD: TriadItem[] = [
  {
    numeral: '01',
    label: 'Capture',
    href: '#scroll-story',
    hint: 'Automatic mobile camera & screenshot backup',
  },
  {
    numeral: '02',
    label: 'Connect',
    href: '#search',
    hint: 'Optical text and visual details linked naturally',
  },
  {
    numeral: '03',
    label: 'Remember',
    href: '#showcase',
    hint: 'Ask in plain words without remembering folders',
  },
]

const PROVENANCE_CAPTURES = [
  { src: '/landing/photos/aura-celebration-toast.webp', alt: 'Evening terrace celebration toast' },
  { src: '/landing/photos/aura-journal-desk.webp', alt: 'Handwritten journal notebook spread' },
  { src: '/landing/photos/aura-ticket-coastal.webp', alt: 'Coastal rail pass scan' },
]

/**
 * Project Liquid Intelligence — Unified Studio Hero.
 * Full-bleed metallic Liquid Titanium / Obsidian Volt studio space with oversized shadow-free VECTORGALLERY wordmark,
 * real-time articulated Three.js Memory Sphere centerpiece, concise emotional editorial copy,
 * GSAP choreographed launch sequence, and responsive mobile framing.
 */
export function HeroLivingMatter() {
  const reduced = useReducedMotion()
  const { user } = useAuth()
  const [activeTriad, setActiveTriad] = useState(0)
  const [entranceProgress, setEntranceProgress] = useState(0)

  const wordmarkRef = useRef<HTMLHeadingElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const triadRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) {
      setEntranceProgress(1)
      return
    }
    const dispose = createHeroTimeline({
      wordmarkEl: wordmarkRef.current,
      copyEl: copyRef.current,
      triadEl: triadRef.current,
      ctaEl: ctaRef.current,
      onEntranceProgress: (p) => setEntranceProgress(p),
    })
    return dispose
  }, [reduced])

  return (
    <section
      id="overview"
      aria-labelledby="hero-monument-heading"
      className="relative overflow-hidden bg-[#F4F5F2] dark:bg-[#090B0D] min-h-screen flex flex-col justify-between pt-14 sm:pt-16 border-b border-[var(--vg-border)]"
    >
      {/* Unified Studio Atmospheric Shader Canvas */}
      <LivingAuraCanvas
        variant="auto"
        intensity={0.96}
        className="absolute inset-0 z-0 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] vg-grain opacity-25"
      />

      {/* Unified Canvas Layout Container */}
      <div
        className={`${VG_LAYOUT.containers.heroStage} relative z-10 flex-1 flex flex-col justify-between pt-1 sm:pt-3 lg:pt-2 xl:pt-4 pb-6 sm:pb-8 lg:pb-9 xl:pb-12`}
      >
        {/* TOP TIER: Oversized Razor-Sharp VECTORGALLERY. Wordmark (No drop shadow or boxed bar) */}
        <div className="relative z-10 w-full flex justify-center pt-1 pb-2 sm:pb-3 lg:pb-0">
          <h1
            ref={wordmarkRef}
            id="hero-monument-heading"
            className="font-display font-bold uppercase text-center select-none whitespace-nowrap w-full max-w-full tracking-[-0.054em] leading-[0.86] text-[#101211] dark:text-[#F4F6F2]"
            style={{
              fontSize: 'clamp(2.1rem, 11.45vw, 14.8rem)',
            }}
          >
            <span>VECTORGALLERY</span>
            <span className="text-[#101211] dark:text-[#CDFF45]">.</span>
          </h1>
        </div>

        {/* CENTER STAGE: Iconic Smooth Studio Memory Sphere Sculpture */}
        {/* Mobile & Tablet Placement */}
        <div className="lg:hidden relative z-20 mt-1 mb-3 flex justify-center">
          <MemorySphereCanvas
            mode="hero"
            priority
            entranceProgress={entranceProgress}
            className="w-[min(80vw,310px)] sm:w-[390px] md:w-[440px]"
          />
        </div>

        {/* Desktop Centered Dominant Sculpture anchored slightly lower for clear wordmark readability */}
        <div className="hidden lg:flex pointer-events-none absolute inset-x-0 top-[17.5%] xl:top-[18.5%] 2xl:top-[19.5%] justify-center z-20">
          <MemorySphereCanvas
            mode="hero"
            priority
            entranceProgress={entranceProgress}
            showPauseControl
            className="w-[clamp(480px,43.5vw,750px)]"
          />
        </div>

        {/* BOTTOM FLANKING QUADRANTS: Balanced Editorial Copy + Primary Actions + Triad + Magnetic CTA */}
        <div className="relative z-30 flex-1 grid grid-cols-1 lg:grid-cols-12 items-end gap-6 sm:gap-8 lg:gap-4 lg:pt-[205px] xl:pt-[245px] 2xl:pt-[290px]">
          {/* LEFT QUADRANT: Product Descriptor + Main Promise + Action Row */}
          <div
            ref={copyRef}
            className="lg:col-span-4 flex flex-col justify-between gap-6 lg:gap-10"
          >
            {/* Compact Product Provenance */}
            <div className="flex items-center gap-3.5">
              <div className="flex -space-x-2.5 shrink-0">
                {PROVENANCE_CAPTURES.map((item) => (
                  <div
                    key={item.src}
                    className="w-9 h-9 xl:w-10 xl:h-10 rounded-full overflow-hidden border-2 border-[#FFFFFF] dark:border-[#090B0D] shadow-sm bg-[var(--vg-surface-2)]"
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="leading-tight">
                <p className="text-[14px] xl:text-[15px] font-semibold tracking-[-0.018em] text-[#101211] dark:text-[#F4F6F2]">
                  Personal AI Cloud
                </p>
                <p className="text-[12.5px] text-[var(--vg-ink-2)] mt-0.5">
                  Photos, documents &amp; Android sync
                </p>
              </div>
            </div>

            {/* Editorial Manifesto Copy */}
            <div className="max-w-[430px] lg:max-w-[335px] xl:max-w-[390px] 2xl:max-w-[450px]">
              <p className="font-display text-[22px] sm:text-[24px] lg:text-[23px] xl:text-[27px] 2xl:text-[31px] font-bold leading-[1.12] tracking-[-0.03em] text-[#101211] dark:text-[#F4F6F2]">
                EVERYTHING WORTH KEEPING.
              </p>

              <p className="mt-2.5 text-[14.5px] sm:text-[15.5px] font-medium leading-[1.45] text-[#101211]/85 dark:text-[#F4F6F2]/90">
                Photos, files and memories — intelligently connected.
              </p>

              <div
                aria-hidden="true"
                className="my-3 xl:my-4 w-full border-b border-[#101211]/[0.18] dark:border-white/[0.15]"
              />

              <p className="text-[13.5px] sm:text-[14.5px] leading-[1.56] text-[var(--vg-ink-2)]">
                Find what you remember, without remembering where you saved it.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={user ? '/app' : '/signup'}
                  className={VG_COMPONENTS.buttons.limePill}
                >
                  <span>{user ? 'Open Web Vault' : 'Get started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#scroll-story"
                  className="inline-flex items-center gap-1.5 h-12 px-4 rounded-full text-[13.5px] font-medium text-[var(--vg-ink)] hover:bg-[#FFFFFF]/70 dark:hover:bg-white/[0.08] border border-[var(--vg-border)] transition-[background-color,border-color]"
                >
                  <span>Explore the experience</span>
                </a>
                <Link
                  href="/install"
                  className="inline-flex items-center gap-1.5 h-10 px-2.5 text-[13px] font-medium text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#CDFF45] transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Download Android</span>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT QUADRANT: Interactive Triad + Magnetic Circular Volt-Lime CTA */}
          <div className="lg:col-span-4 lg:col-start-9 flex flex-row lg:flex-col items-end justify-between lg:h-full gap-6">
            <div ref={triadRef} className="flex flex-col lg:items-end gap-2">
              <InteractiveTriadIndex
                items={HERO_TRIAD}
                activeIndex={activeTriad}
                onSelect={setActiveTriad}
              />
              <p className="hidden sm:block text-[12px] text-[var(--vg-ink-2)] lg:text-right max-w-[230px] leading-snug">
                {HERO_TRIAD[activeTriad]?.hint}
              </p>
            </div>

            <div ref={ctaRef} className="shrink-0">
              <MagneticCircleButton
                label="Explore"
                sublabel="See the story"
                href="#scroll-story"
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
