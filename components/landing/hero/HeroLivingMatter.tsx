import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring } from 'framer-motion'
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
 * Structural two-band architecture eliminating seam collisions at all viewports:
 * - Zone 1 (z-10): Rounded studio upper shelf housing the monumental VECTORGALLERY. typographic wall + subtle ambient depth relief
 * - Zone 2 (z-20/z-30): Living Silver/Carbon lower stage where the enlarged Memory Sphere rises cleanly in front of the
 *   shelf horizon and wordmark with pointer counter-parallax, flanked by edge-aligned UI quadrants safely below the shelf curve.
 */
export function HeroLivingMatter() {
  const reduced = useClientReducedMotion()
  const [activeTriad, setActiveTriad] = useState(0)

  const wordShiftXRaw = useMotionValue(0)
  const wordShiftYRaw = useMotionValue(0)
  const sphereShiftXRaw = useMotionValue(0)
  const sphereShiftYRaw = useMotionValue(0)

  const wordShiftX = useSpring(wordShiftXRaw, { stiffness: 90, damping: 22 })
  const wordShiftY = useSpring(wordShiftYRaw, { stiffness: 90, damping: 22 })
  const sphereShiftX = useSpring(sphereShiftXRaw, { stiffness: 105, damping: 20 })
  const sphereShiftY = useSpring(sphereShiftYRaw, { stiffness: 105, damping: 20 })

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return
    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
      // Opposite subtle translation gives true foreground/background Z-plane separation
      wordShiftXRaw.set(-nx * 8)
      wordShiftYRaw.set(-ny * 5)
      sphereShiftXRaw.set(nx * 9)
      sphereShiftYRaw.set(ny * 6)
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [reduced, wordShiftXRaw, wordShiftYRaw, sphereShiftXRaw, sphereShiftYRaw])

  return (
    <section
      id="overview"
      aria-labelledby="hero-monument-heading"
      className="relative overflow-hidden bg-[#FFFFFF] dark:bg-[#090B0A] lg:min-h-[calc(100vh-76px)] flex flex-col border-b border-[var(--vg-border)]"
    >
      {/* Full-bleed Liquid Silver / Liquid Carbon Atmospheric Wave Backdrop visible across lower zone & shelf corners */}
      <LivingAuraCanvas
        variant="auto"
        intensity={0.98}
        className="absolute inset-0 z-0 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] vg-grain opacity-30"
      />

      {/* ZONE 1: Pure Studio Upper Horizon Shelf wrapping VECTORGALLERY. cleanly above all lower UI text */}
      <div className="relative z-10 w-full rounded-b-[28px] sm:rounded-b-[40px] lg:rounded-b-[48px] bg-[#FFFFFF] dark:bg-[#090B0A] shadow-[0_18px_48px_-28px_rgba(16,18,17,0.12)] dark:shadow-[0_24px_56px_-26px_rgba(0,0,0,0.82)]">
        <div
          className={`${VG_LAYOUT.containers.heroStage} relative pt-3 sm:pt-5 lg:pt-4 xl:pt-5 2xl:pt-7 pb-4 sm:pb-5 lg:pb-5 xl:pb-6 2xl:pb-7`}
        >
          {/* Ambient optical caustic bounce & sculptural occlusion right behind where the sphere overlaps */}
          <div
            aria-hidden="true"
            className="pointer-events-none hidden lg:block absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[10%] w-[52%] h-[96%] z-[15] rounded-full blur-3xl opacity-85 dark:opacity-100"
            style={{
              background:
                'radial-gradient(ellipse at 50% 70%, rgba(207,255,73,0.22) 0%, rgba(16,18,17,0.10) 42%, transparent 74%)',
            }}
          />

          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0.94, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.02, ease: VG_MOTION.ease }}
            style={reduced ? undefined : { x: wordShiftX, y: wordShiftY }}
            className="relative z-10 w-full flex justify-center will-change-transform"
          >
            <h1
              id="hero-monument-heading"
              className="relative font-display font-bold uppercase text-center select-none whitespace-nowrap w-full max-w-full"
              style={{
                fontSize: VG_TYPOGRAPHY.scale.monumentalWordmark.fontSize,
                lineHeight: VG_TYPOGRAPHY.scale.monumentalWordmark.lineHeight,
                letterSpacing: VG_TYPOGRAPHY.scale.monumentalWordmark.letterSpacing,
              }}
            >
              {/* Soft recessed relief echo behind main wordmark for architectural Z-depth */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 translate-y-[4px] lg:translate-y-[6px] text-[#101211]/[0.07] dark:text-[#CFFF49]/[0.08] blur-[1px]"
              >
                VECTORGALLERY.
              </span>
              <span className="relative inline-block py-[0.04em] -my-[0.04em] bg-gradient-to-b from-[#080A09] via-[#151917] to-[#434C48] dark:from-[#FFFFFF] dark:via-[#E2E9E1] dark:to-[#6C7771] bg-clip-text text-transparent">
                VECTORGALLERY
              </span>
              <span className="relative text-[#101211] dark:text-[#CFFF49]">.</span>
            </h1>
          </motion.div>
        </div>
      </div>

      {/* ZONE 2: Lower Atmospheric Stage — enlarged Memory Sphere rises over Zone 1 while text stays cleanly below seam */}
      <div
        className={`${VG_LAYOUT.containers.heroStage} relative z-20 flex-1 flex flex-col justify-between pt-4 sm:pt-6 lg:pt-6 xl:pt-8 2xl:pt-10 pb-6 sm:pb-8 lg:pb-8 xl:pb-10 2xl:pb-12`}
      >
        {/* Mobile/Tablet Sphere placement cleanly bridging shelf horizon above stacked info */}
        <div className="lg:hidden relative z-20 -mt-8 sm:-mt-12 mb-3 flex justify-center pointer-events-none">
          <MemorySphereCanvas
            mode="hero"
            priority
            className="w-[min(92vw,345px)] sm:w-[465px] md:w-[540px]"
          />
        </div>

        {/* Desktop Monumental Floating Sculpture Layer — rises boldly across shelf seam into VECTORGALLERY. */}
        <motion.div
          style={reduced ? undefined : { x: sphereShiftX, y: sphereShiftY }}
          className="hidden lg:flex pointer-events-none absolute inset-x-0 top-0 -mt-[78px] xl:-mt-[96px] 2xl:-mt-[114px] justify-center z-20 will-change-transform"
        >
          <MemorySphereCanvas
            mode="hero"
            priority
            className="w-[clamp(540px,49vw,860px)]"
          />
        </motion.div>

        {/* Edge-Aligned Studio UI Quadrants safely flanking Sphere & cleanly clear of Zone 1 curve */}
        <div className="relative z-30 flex-1 grid grid-cols-1 lg:grid-cols-12 items-stretch gap-7 sm:gap-8 lg:gap-4 lg:min-h-[340px] xl:min-h-[415px] 2xl:min-h-[490px]">
          {/* LEFT QUADRANT: Core Product Provenance + Promise + Actions */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0.94, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: VG_MOTION.ease }}
            className="lg:col-span-4 flex flex-col justify-between gap-6 sm:gap-8 lg:gap-12 xl:gap-16"
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
                <p className="text-[14px] xl:text-[15.5px] font-bold tracking-[-0.02em] text-[#101211] dark:text-[#F3F5F1]">
                  Personal AI Cloud &amp; Vault
                </p>
                <p className="text-[12px] xl:text-[13px] text-[var(--vg-ink-2)] mt-0.5">
                  Open-source · Photos, OCR docs &amp; Android sync
                </p>
              </div>
            </div>

            {/* Bottom-Left Product Promise + Dotted Hairline + Unambiguous Explainer */}
            <div className="max-w-[420px] lg:max-w-[310px] xl:max-w-[355px] 2xl:max-w-[450px]">
              <p className="font-display text-[21px] sm:text-[23px] lg:text-[22px] xl:text-[28px] 2xl:text-[34px] font-bold leading-[1.12] tracking-[-0.032em] text-[#101211] dark:text-[#F3F5F1]">
                Every photo, note &amp; receipt.
                <br />
                Found in seconds by meaning.
              </p>

              <div
                aria-hidden="true"
                className="my-3 xl:my-4 w-full border-b-2 border-dotted border-[#101211]/35 dark:border-[#F3F5F1]/30"
              />

              <p className="text-[14px] sm:text-[14.5px] lg:text-[13.5px] xl:text-[15px] 2xl:text-[16px] leading-[1.54] text-[var(--vg-ink-2)]">
                Search camera rolls, scanned receipts, and handwritten notes using plain language AI — synced automatically from Android to storage you own.
              </p>

              <div className="mt-4 xl:mt-5 flex flex-wrap items-center gap-3.5">
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

          {/* RIGHT QUADRANT: Workflow Triad + Live Step Hint + Magnetic Circular Lime CTA */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0.94, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: VG_MOTION.ease }}
            className="lg:col-span-4 lg:col-start-9 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-6"
          >
            {/* Top-Right Numbered Triad + concise active explanation */}
            <div className="flex flex-col lg:items-end gap-2.5">
              <InteractiveTriadIndex
                items={HERO_TRIAD}
                activeIndex={activeTriad}
                onSelect={setActiveTriad}
              />
              <p className="hidden sm:block text-[12px] xl:text-[13px] font-mono text-[var(--vg-ink-2)] lg:text-right max-w-[220px] leading-snug">
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
