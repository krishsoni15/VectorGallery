import React from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { cn } from '@/lib/utils'
import {
  VG_COMPONENTS,
  VG_LAYOUT,
  VG_MOTION,
  VG_TYPOGRAPHY,
} from './design-system'
import { MotionReveal } from './motion'
import { REPO_URL } from './tokens'

export function FinalInvitationSection() {
  const prefersReduced = useReducedMotion()

  return (
    <section
      id="get-started"
      aria-label="Get started with VectorGallery"
      className={cn(
        'relative overflow-hidden bg-gradient-to-b from-[#0C3526] via-[#092219] to-[#071A13] text-[#EFF7F3]',
        VG_LAYOUT.sectionPadding.finalInvitation
      )}
    >
      {/* Subtle Sanctuary Mint Atmospheric Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 68% 58% at 50% 35%, rgba(83, 217, 163, 0.14), rgba(8, 127, 91, 0.08) 45%, transparent 75%)',
        }}
      />

      {/* Fine Botanical Dot Grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage: 'radial-gradient(rgba(184, 231, 212, 0.08) 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Peripheral Framed Memory Accents on Wide Viewports */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute left-8 xl:left-16 top-1/2 -translate-y-1/2 w-44 -rotate-6 rounded-2xl overflow-hidden border border-[#B8E7D4]/20 shadow-2xl opacity-75"
      >
        <img
          src="/landing/photos/valley-reflection.webp"
          alt=""
          className="w-full h-32 object-cover"
        />
        <div className="px-3 py-1.5 bg-[#071A13]/90 text-[10px] font-mono text-[#B8E7D4]">
          Valley_Stream.webp
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 w-44 rotate-6 rounded-2xl overflow-hidden border border-[#B8E7D4]/20 shadow-2xl opacity-75"
      >
        <img
          src="/landing/photos/coffee-ritual.webp"
          alt=""
          className="w-full h-32 object-cover"
        />
        <div className="px-3 py-1.5 bg-[#071A13]/90 text-[10px] font-mono text-[#B8E7D4]">
          Sunday_Pour_Over.webp
        </div>
      </div>

      {/* Centered Monumental Invitation */}
      <div className={cn(VG_LAYOUT.containers.narrow, 'relative z-10 text-center')}>
        {/* Animated VectorGallery Connected Frames Mark */}
        <motion.div
          className="inline-flex justify-center mb-7"
          initial={prefersReduced ? false : { opacity: 0, scale: 0.88 }}
          whileInView={prefersReduced ? undefined : { opacity: 1, scale: 1 }}
          viewport={VG_MOTION.viewport}
          transition={{ duration: VG_MOTION.durations.editorial, ease: VG_MOTION.ease }}
        >
          <div className="p-2.5 rounded-[1.35rem] bg-[#0E2E22]/85 border border-[#53D9A3]/30 shadow-[0_18px_48px_-14px_rgba(83,217,163,0.28)]">
            <VectorGalleryLogo variant="on-dark" size="lg" showWordmark={false} />
          </div>
        </motion.div>

        <MotionReveal delay={0.04}>
          <h2
            className="font-display font-bold tracking-[-0.03em] text-[#EFF7F3]"
            style={{
              fontSize: VG_TYPOGRAPHY.scale.h2.fontSize,
              lineHeight: VG_TYPOGRAPHY.scale.h2.lineHeight,
              letterSpacing: VG_TYPOGRAPHY.scale.h2.letterSpacing,
            }}
          >
            Keep what makes{' '}
            <em className={VG_TYPOGRAPHY.editorialWordOnForestClass}>life</em>{' '}
            yours.
          </h2>
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <p
            className="mt-5 text-[#B8E7D4]/85 max-w-xl mx-auto"
            style={{
              fontSize: VG_TYPOGRAPHY.scale.lead.fontSize,
              lineHeight: VG_TYPOGRAPHY.scale.lead.lineHeight,
            }}
          >
            Start privately on your own computer in under a minute, or install the Android
            companion for effortless Wi-Fi backup.
          </p>
        </MotionReveal>

        <MotionReveal delay={0.12}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/app" className={VG_COMPONENTS.buttons.forestPrimary}>
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className={VG_COMPONENTS.buttons.forestSecondary}
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.16}>
          <p className="mt-8 font-mono text-[11.5px] tracking-wide text-[#9CB6AA]">
            Apache-2.0 Open Source · Local Disk, Supabase, or Cloudflare R2 · Zero Lock-In
          </p>
        </MotionReveal>
      </div>
    </section>
  )
}
