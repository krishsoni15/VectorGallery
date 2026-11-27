import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Smartphone } from 'lucide-react'
import { VG_LAYOUT, VG_MOTION, VG_TYPOGRAPHY } from '@/components/landing/design-system'
import {
  InteractiveTriadIndex,
  MagneticCircleButton,
  useClientReducedMotion,
  type TriadItem,
} from '@/components/landing/motion/LivingMotionPrimitives'
import { MemorySphereCanvas } from '@/components/landing/sculpture/MemorySphereCanvas'
import { LivingAuraCanvas } from '@/components/landing/shaders/LivingAuraCanvas'
import { MaskedReveal } from '@/components/landing/motion'

const HERO_TRIAD: TriadItem[] = [
  {
    numeral: '01',
    label: 'Capture',
    href: '#scroll-story',
    hint: 'Auto-backup photos, screenshots & PDFs',
  },
  {
    numeral: '02',
    label: 'Connect',
    href: '#search',
    hint: 'AI vision & OCR index every visual detail',
  },
  {
    numeral: '03',
    label: 'Remember',
    href: '#showcase',
    hint: 'Ask in plain words, find instantly',
  },
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
  const reduced = useClientReducedMotion()
  const [activeTriad, setActiveTriad] = useState(0)

  return (
    <section
      id="overview"
      aria-labelledby="hero-monument-heading"
      className="relative overflow-hidden bg-[#FFFFFF] dark:bg-[#090B0A] lg:min-h-[calc(100vh-74px)] flex flex-col justify-center border-b border-[var(--vg-border)]"
    >
      {/* Liquid Silver / Liquid Carbon Atmospheric Wave Backdrop in Lower Half */}
      <LivingAuraCanvas
        variant="auto"
        intensity={0.96}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Upper Pure Studio Horizon Band ending cleanly behind Sphere equator like benchmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[43%] z-[1] rounded-b-[28px] sm:rounded-b-[42px] bg-[#FFFFFF] dark:bg-[#090B0A] shadow-[0_18px_46px_-28px_rgba(16,18,17,0.10)] dark:shadow-[0_22px_50px_-28px_rgba(0,0,0,0.75)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] vg-grain opacity-30"
      />

      <div
        className={`${VG_LAYOUT.containers.heroStage} relative z-10 w-full flex-1 flex flex-col justify-center pt-2 sm:pt-4 lg:pt-5 xl:pt-8 pb-6 sm:pb-8 lg:pb-9 xl:pb-14`}
      >
        {/* Monumental Typographic Stage spanning full container rail edge-to-edge */}
        <MaskedReveal immediate direction="up" delay={0.02} className="relative z-10 w-full">
          <div className="w-full flex justify-center pt-1 sm:pt-2">
            <h1
              id="hero-monument-heading"
              className="font-display font-bold uppercase text-center select-none whitespace-nowrap text-[#101211] dark:text-[#F3F5F1] w-fit mx-auto"
              style={{
                fontSize: VG_TYPOGRAPHY.scale.monumentalWordmark.fontSize,
                lineHeight: VG_TYPOGRAPHY.scale.monumentalWordmark.lineHeight,
                letterSpacing: VG_TYPOGRAPHY.scale.monumentalWordmark.letterSpacing,
              }}
            >
              VECTORGALLERY<span className="text-[#101211] dark:text-[#CFFF49]">.</span>
            </h1>
          </div>
        </MaskedReveal>

        {/* Overlapping 3D Sculpture + Edge-Aligned Asymmetric Studio Grid */}
        <div className="relative z-20 mt-2 sm:mt-5 lg:mt-6 xl:mt-10 2xl:mt-12 grid grid-cols-1 lg:grid-cols-12 items-end gap-5 sm:gap-7 lg:gap-4">
          {/* LEFT QUADRANT: Core Product Clarity + Provenance + Direct Entry Actions */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0.94, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: VG_MOTION.ease }}
            className="order-2 lg:order-1 lg:col-span-4 flex flex-col justify-between gap-5 sm:gap-7 lg:gap-16 xl:gap-32 2xl:gap-40 self-stretch lg:pb-3 xl:pb-4"
          >
            {/* Provenance captures + clear product category */}
            <div className="flex items-center gap-3.5 xl:gap-4">
              <div className="flex -space-x-2.5 shrink-0">
                {STACKED_THUMBNAILS.map((item) => (
                  <div
                    key={item.src}
                    className="w-9 h-9 xl:w-11 xl:h-11 rounded-full overflow-hidden border-2 border-[#FFFFFF] dark:border-[#090B0A] shadow-sm bg-[var(--vg-surface-2)]"
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
                <p className="text-[14px] xl:text-[16px] font-bold tracking-[-0.02em] text-[#101211] dark:text-[#F3F5F1]">
                  Personal AI Cloud &amp; Vault
                </p>
                <p className="text-[12px] xl:text-[13.5px] text-[var(--vg-ink-2)] mt-0.5">
                  Open-source · Photos, OCR docs &amp; Android sync
                </p>
              </div>
            </div>

            {/* Bottom-Left Product Promise + Dotted Hairline + Unambiguous Explainer */}
            <div className="max-w-[440px] xl:max-w-[480px] 2xl:max-w-[530px]">
              <p className="font-display text-[21px] sm:text-[23px] lg:text-[24px] xl:text-[31px] 2xl:text-[36px] font-bold leading-[1.12] tracking-[-0.032em] text-[#101211] dark:text-[#F3F5F1]">
                Every photo, note &amp; receipt.
                <br />
                Found in seconds by meaning.
              </p>

              <div
                aria-hidden="true"
                className="my-3.5 xl:my-4 w-full border-b-2 border-dotted border-[#101211]/35 dark:border-[#F3F5F1]/30"
              />

              <p className="text-[14px] sm:text-[15px] xl:text-[16px] 2xl:text-[17px] leading-[1.56] text-[var(--vg-ink-2)]">
                Search camera rolls, scanned receipts, and handwritten notes using plain language AI — synced automatically from Android to storage you own.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 h-10 xl:h-11 px-5 rounded-full bg-[#101211] text-[#F3F5F1] dark:bg-[#F3F5F1] dark:text-[#090B0A] text-[13.5px] xl:text-[14px] font-semibold tracking-[-0.01em] hover:opacity-90 transition-all shadow-sm"
                >
                  <span>Open Web Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/install"
                  className="inline-flex items-center gap-1.5 h-10 xl:h-11 px-3.5 rounded-full text-[13.5px] xl:text-[14px] font-medium text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F3F5F1] transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android APK</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* CENTER STAGE: Larger Sculptural Sphere overlapping wordmark horizon boldly on desktop */}
          <div className="order-1 lg:order-2 lg:col-span-4 relative flex items-center justify-center self-center lg:-mt-28 xl:-mt-40 2xl:-mt-52">
            <MemorySphereCanvas
              mode="hero"
              priority
              className="w-[265px] h-[265px] sm:w-[390px] sm:h-[390px] md:w-[460px] md:h-[460px] lg:w-[510px] lg:h-[510px] xl:w-[640px] xl:h-[640px] 2xl:w-[760px] 2xl:h-[760px] lg:-mx-14 xl:-mx-20"
            />
          </div>

          {/* RIGHT QUADRANT: Workflow Triad + Live Step Hint + Magnetic Circular Lime CTA */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0.94, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: VG_MOTION.ease }}
            className="order-3 lg:col-span-4 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-6 self-stretch lg:pb-4"
          >
            {/* Top-Right Numbered Triad + concise active explanation */}
            <div className="flex flex-col lg:items-end gap-3">
              <InteractiveTriadIndex
                items={HERO_TRIAD}
                activeIndex={activeTriad}
                onSelect={setActiveTriad}
              />
              <p className="hidden sm:block text-[12px] xl:text-[13px] font-mono text-[var(--vg-ink-2)] lg:text-right max-w-[230px] leading-snug">
                {HERO_TRIAD[activeTriad]?.hint}
              </p>
            </div>

            {/* Bottom-Right Magnetic Acid-Lime Circular CTA */}
            <div className="shrink-0">
              <MagneticCircleButton
                label="Explore"
                sublabel="See how it works"
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
