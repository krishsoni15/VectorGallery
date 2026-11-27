import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_SPHERE_THEME_SPEC } from '@/components/landing/design-system'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { LivingAuraCanvas } from '@/components/landing/shaders/LivingAuraCanvas'

interface AuthShowcasePanelProps {
  badgeText: string
  headline: string
  description: string
  footerLeft: string
  footerRight: string
}

const PREVIEW_CAPTURES = [
  { src: '/landing/photos/aura-celebration-toast.webp', alt: 'Terrace celebration memory capture' },
  { src: '/landing/photos/aura-journal-desk.webp', alt: 'Handwritten study notebook capture' },
  { src: '/landing/photos/aura-ticket-coastal.webp', alt: 'Scanned rail pass capture' },
]

/**
 * Shared Project Liquid Intelligence visual stage for /login and /signup.
 * Features unified Liquid Titanium / Obsidian Volt aura lighting and calm breathing sphere.
 */
export function AuthShowcasePanel({
  badgeText,
  headline,
  description,
  footerLeft,
  footerRight,
}: AuthShowcasePanelProps) {
  const reduced = useReducedMotion()

  return (
    <div className="hidden lg:flex lg:col-span-6 relative overflow-hidden bg-[#F4F5F2] dark:bg-[#090B0D] border-r border-[var(--vg-border)] flex-col justify-between p-10 xl:p-14">
      {/* Unified Liquid Titanium / Obsidian Volt Studio Aura */}
      <LivingAuraCanvas
        variant="auto"
        intensity={0.92}
        className="absolute inset-0 z-0 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] vg-grain opacity-25"
      />

      {/* Top Brand Bar */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <VectorGalleryLogo size="md" variant="horizontal" />
        </Link>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF]/80 dark:bg-[#111416]/85 border border-[var(--vg-border)] text-[12px] font-medium text-[#087F5B] dark:text-[#CDFF45]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-[#CDFF45]" />
          {badgeText}
        </span>
      </div>

      {/* Center Transparent Sculpture Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
        <div
          aria-hidden="true"
          className="font-display font-bold uppercase tracking-[-0.055em] leading-none text-[#101211]/[0.06] dark:text-[#F4F6F2]/[0.06] select-none pointer-events-none text-center whitespace-nowrap"
          style={{ fontSize: 'clamp(3.2rem, 6.2vw, 6.4rem)' }}
        >
          VECTORGALLERY.
        </div>

        <motion.div
          animate={reduced ? undefined : { y: [-3, 3, -3] }}
          transition={reduced ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="relative -mt-12 xl:-mt-16 w-[310px] h-[310px] xl:w-[380px] xl:h-[380px] flex items-center justify-center"
        >
          <img
            src={reduced ? VG_SPHERE_THEME_SPEC.heroVideoPoster : VG_SPHERE_THEME_SPEC.heroAnimWebp}
            alt="VectorGallery translucent acid-lime and liquid-titanium Memory Sphere sculpture"
            className="w-full h-full object-contain scale-[1.08]"
          />
        </motion.div>

        <div className="max-w-lg text-center space-y-3 mt-2">
          <h2
            className="font-display text-3xl xl:text-[2.45rem] font-bold tracking-[-0.036em] leading-[1.06] text-[#101211] dark:text-[#F4F6F2]"
            style={{ textWrap: 'balance' }}
          >
            {headline}
          </h2>
          <p className="text-[14.5px] xl:text-[15.5px] leading-relaxed text-[var(--vg-ink-2)] max-w-md mx-auto">
            {description}
          </p>
        </div>
      </div>

      {/* Bottom Provenance & Ownership Footer */}
      <div className="relative z-10 flex items-center justify-between gap-4 pt-5 border-t border-[var(--vg-border)]">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {PREVIEW_CAPTURES.map((cap) => (
              <div
                key={cap.src}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FFFFFF] dark:border-[#090B0D] shadow-sm"
              >
                <img src={cap.src} alt={cap.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-[12px] font-medium text-[var(--vg-ink-2)]">{footerLeft}</span>
        </div>

        <span className="text-[12px] font-medium text-[var(--vg-ink-2)]">{footerRight}</span>
      </div>
    </div>
  )
}
