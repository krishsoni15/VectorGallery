import React, { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Smartphone } from 'lucide-react'
import { VG_LAYOUT, VG_MOTION, VG_TYPOGRAPHY } from '@/components/landing/design-system'
import {
  InteractiveTriadIndex,
  MagneticCircleButton,
  type TriadItem,
} from '@/components/landing/motion/LivingMotionPrimitives'
import { MemorySphereCanvas } from '@/components/landing/sculpture/MemorySphereCanvas'
import { LivingAuraCanvas } from '@/components/landing/shaders/LivingAuraCanvas'
import { MaskedReveal } from '@/components/landing/motion'

const HERO_TRIAD: TriadItem[] = [
  { numeral: '01', label: 'Capture', href: '#scroll-story', hint: 'Auto-backup & disk vault' },
  { numeral: '02', label: 'Connect', href: '#search', hint: 'Photos, notes & PDFs' },
  { numeral: '03', label: 'Remember', href: '#showcase', hint: 'Recall in plain words' },
]

const STACKED_THUMBNAILS = [
  { src: '/landing/photos/aura-coastal-path.webp', alt: 'Coastal cliff memory capture' },
  { src: '/landing/photos/aura-journal-desk.webp', alt: 'Handwritten journal capture' },
  { src: '/landing/photos/aura-ticket-coastal.webp', alt: 'Travel boarding pass OCR capture' },
]

/**
 * Project Living Matter Hero Composition.
 * Reconstructs the benchmark depth architecture:
 * - Pure upper gallery band (#FFFFFF / #090B0A) dissolving seamlessly at equator into liquid atmosphere
 * - Full-width monumental VECTORGALLERY. grotesk wordmark partially overlapped in depth by the 3D Memory Sphere
 * - Balanced lower-left manifesto + dotted rule & lower-right numbered triad + magnetic circular lime CTA
 */
export function HeroLivingMatter() {
  const reduced = useReducedMotion()
  const [activeTriad, setActiveTriad] = useState(0)

  return (
    <section
      id="overview"
      aria-labelledby="hero-monument-heading"
      className="relative overflow-hidden bg-[#FFFFFF] dark:bg-[#090B0A] lg:min-h-[calc(100vh-64px)] flex flex-col justify-center border-b border-[var(--vg-border)]"
    >
      {/* Liquid Silver / Liquid Carbon Atmospheric Wave Backdrop in Lower Half */}
      <LivingAuraCanvas
        variant="auto"
        intensity={0.96}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Crisp Upper White / Obsidian Floor cleanly framing Monumental Wordmark -> fades behind Sphere equator */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[44%] z-[1] bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF]/96 to-transparent dark:from-[#090B0A] dark:via-[#090B0A]/96 dark:to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] vg-grain opacity-30"
      />

      <div
        className={`${VG_LAYOUT.containers.heroStage} relative z-10 w-full flex-1 flex flex-col justify-center pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-10 lg:pb-12`}
      >
        {/* Monumental Typographic Stage spanning ~88-92% of desktop container behind Sculpture */}
        <MaskedReveal immediate direction="up" delay={0.02} className="relative z-10 w-full">
          <div className="w-full flex justify-center pt-1 sm:pt-2">
            <h1
              id="hero-monument-heading"
              className="font-display font-bold uppercase text-center select-none whitespace-nowrap text-[#101211] dark:text-[#F3F5F1] w-fit mx-auto"
              style={{
                fontSize: 'clamp(2.2rem, 10.5vw, 10.75rem)',
                lineHeight: VG_TYPOGRAPHY.scale.monumentalWordmark.lineHeight,
                letterSpacing: '-0.056em',
              }}
            >
              VECTORGALLERY<span className="text-[#101211] dark:text-[#CFFF49]">.</span>
            </h1>
          </div>
        </MaskedReveal>

        {/* Overlapping 3D Sculpture + Balanced Asymmetric Studio Grid */}
        <div className="relative z-20 -mt-6 sm:-mt-14 md:-mt-20 lg:-mt-[7.2rem] xl:-mt-[8.0rem] grid grid-cols-1 lg:grid-cols-12 items-end gap-8 lg:gap-4">
          {/* LEFT QUADRANT: Stacked Provenance Preview + Statement + Dotted Rule */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0.94, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: VG_MOTION.ease }}
            className="order-2 lg:order-1 lg:col-span-4 flex flex-col justify-between gap-8 lg:gap-28 self-stretch lg:pt-28 lg:pb-4"
          >
            {/* Honest Open-Source Memory Stack directly below left wordmark shoulder */}
            <div className="flex items-center gap-3.5">
              <div className="flex -space-x-2.5 shrink-0">
                {STACKED_THUMBNAILS.map((item) => (
                  <div
                    key={item.src}
                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#FFFFFF] dark:border-[#090B0A] shadow-sm bg-[var(--vg-surface-2)]"
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
                <p className="text-[13.5px] font-bold tracking-[-0.02em] text-[#101211] dark:text-[#F3F5F1]">
                  Open Source
                </p>
                <p className="text-[11.5px] text-[var(--vg-ink-2)]">
                  Personal AI cloud &amp; vault
                </p>
              </div>
            </div>

            {/* Bottom-Left Manifesto + Dotted Horizontal Rule */}
            <div className="max-w-[330px]">
              <p className="font-display text-[21px] sm:text-[24px] font-semibold leading-[1.18] tracking-[-0.03em] text-[#101211] dark:text-[#F3F5F1]">
                Everything you save.
                <br />
                Everything you remember.
              </p>

              <div
                aria-hidden="true"
                className="my-3.5 w-full border-b-2 border-dotted border-[#101211]/35 dark:border-[#F3F5F1]/30"
              />

              <p className="text-[13.5px] leading-[1.52] text-[var(--vg-ink-2)]">
                Private photo library, OCR document recall, and automatic Android backup on storage you own.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#101211] dark:text-[#F3F5F1] hover:text-[#087F5B] dark:hover:text-[#CFFF49] transition-colors"
                >
                  <span>Open Web Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span aria-hidden="true" className="text-[var(--vg-border-strong)]">
                  /
                </span>
                <Link
                  href="/install"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F3F5F1] transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android APK</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* CENTER STAGE: Dominant 3D Memory Sphere Sculpture overlapping wordmark lower edge */}
          <div className="order-1 lg:order-2 lg:col-span-4 relative flex items-center justify-center self-center">
            <MemorySphereCanvas
              mode="hero"
              priority
              className="w-[310px] h-[310px] sm:w-[400px] sm:h-[400px] md:w-[460px] md:h-[460px] lg:w-[500px] lg:h-[500px] xl:w-[550px] xl:h-[550px] lg:-mx-14"
            />
          </div>

          {/* RIGHT QUADRANT: Triad Index + Magnetic Circular Lime CTA */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0.94, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: VG_MOTION.ease }}
            className="order-3 lg:col-span-4 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-6 self-stretch lg:pt-28 lg:pb-4"
          >
            {/* Top-Right Numbered Triad matching benchmark right shoulder */}
            <div>
              <InteractiveTriadIndex
                items={HERO_TRIAD}
                activeIndex={activeTriad}
                onSelect={setActiveTriad}
              />
            </div>

            {/* Bottom-Right Magnetic Acid-Lime Circular CTA */}
            <div className="shrink-0">
              <MagneticCircleButton
                label="Explore"
                sublabel="the experience"
                href="#scroll-story"
                size="lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
