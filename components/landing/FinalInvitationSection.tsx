import React from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Download, ExternalLink } from 'lucide-react'
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
        'relative overflow-hidden text-[#F2F3EF]',
        VG_LAYOUT.sectionPadding.finalInvitation
      )}
      style={{
        background:
          'radial-gradient(ellipse 85% 75% at 50% 18%, #0F5C43 0%, #08291D 52%, #05130E 100%)',
      }}
    >
      {/* Signature Emerald Light-Field Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 56% 48% at 50% 34%, rgba(88, 214, 168, 0.16), rgba(196, 237, 225, 0.06) 45%, transparent 74%)',
        }}
      />

      {/* Centered Sculptural Invitation */}
      <div className={cn(VG_LAYOUT.containers.narrow, 'relative z-10 text-center')}>
        {/* Sculptural Memory Fold Mark */}
        <motion.div
          className="inline-flex justify-center mb-8"
          initial={prefersReduced ? false : { opacity: 0, scale: 0.9 }}
          whileInView={prefersReduced ? undefined : { opacity: 1, scale: 1 }}
          viewport={VG_MOTION.viewport}
          transition={{ duration: VG_MOTION.durations.editorial, ease: VG_MOTION.ease }}
        >
          <div className="relative p-3.5 rounded-3xl bg-[#0D261D]/85 border border-[#58D6A8]/25 shadow-[0_24px_60px_-14px_rgba(88,214,168,0.28)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-full bg-[#58D6A8]/15 blur-2xl"
            />
            <div className="relative z-10">
              <VectorGalleryLogo variant="on-dark" size="lg" showWordmark={false} />
            </div>
          </div>
        </motion.div>

        <MotionReveal delay={0.04}>
          <h2
            className="font-display font-bold text-[#F2F3EF]"
            style={{
              fontSize: VG_TYPOGRAPHY.scale.h2.fontSize,
              lineHeight: VG_TYPOGRAPHY.scale.h2.lineHeight,
              letterSpacing: VG_TYPOGRAPHY.scale.h2.letterSpacing,
            }}
          >
            Keep everything that makes{' '}
            <em className={VG_TYPOGRAPHY.editorialWordOnForestClass}>life</em>{' '}
            yours.
          </h2>
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <p
            className="mt-5 text-[#C4EDE1]/85 max-w-xl mx-auto"
            style={{
              fontSize: VG_TYPOGRAPHY.scale.lead.fontSize,
              lineHeight: VG_TYPOGRAPHY.scale.lead.lineHeight,
            }}
          >
            Set up privately on your computer in minutes, or pair your Android phone over Wi-Fi.
          </p>
        </MotionReveal>

        <MotionReveal delay={0.12}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/app" className={VG_COMPONENTS.buttons.forestPrimary}>
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link href="/install" className={VG_COMPONENTS.buttons.forestSecondary}>
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download Android</span>
            </Link>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.16}>
          <div className="mt-7">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#C4EDE1]/80 hover:text-[#F2F3EF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4EDE1] rounded"
            >
              <span>Explore on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}
