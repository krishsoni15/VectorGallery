import React, { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, CheckCircle2, FileText, Image as ImageIcon, Search } from 'lucide-react'
import { Container, SectionHeading } from '@/components/landing/ui'

/**
 * Signature native scroll-driven storytelling (no scroll-hijacking, mobile simplified).
 * Transitions scattered captures along vector paths into an organized VectorGallery answer.
 */
export function ScrollMemoryStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const leftSpreadX = useTransform(scrollYProgress, [0.15, 0.55], [-44, 0])
  const rightSpreadX = useTransform(scrollYProgress, [0.15, 0.55], [44, 0])
  const spreadRotateL = useTransform(scrollYProgress, [0.15, 0.55], [-5, 0])
  const spreadRotateR = useTransform(scrollYProgress, [0.15, 0.55], [5, 0])
  const pathOpacity = useTransform(scrollYProgress, [0.25, 0.6], [0.25, 1])

  return (
    <section
      ref={containerRef}
      aria-label="How scattered memories become organized knowledge"
      className="py-20 sm:py-28 border-y border-[var(--vg-border)] bg-[var(--vg-surface-2)] overflow-hidden"
    >
      <Container>
        <SectionHeading
          align="center"
          eyebrow="From Clutter To Clarity"
          title="Watch scattered files assemble into answers."
          subtitle="Photos, mobile screenshots, admission letters, and notes enter from everywhere — VectorGallery connects them into one searchable index as you go."
        />

        <div className="mt-14 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Scattered Inputs converging on scroll */}
          <motion.div
            style={reduced ? undefined : { x: leftSpreadX, rotate: spreadRotateL }}
            className="lg:col-span-5 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            <div className="min-w-0 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-2.5 shadow-sm">
              <img
                src="/landing/photos/coastal-cliffs.webp"
                alt="Coastal vacation photograph"
                className="w-full h-24 rounded-xl object-cover"
              />
              <div className="pt-2 px-1 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-medium truncate">Coastal_Trip.webp</span>
                <ImageIcon className="w-3.5 h-3.5 text-[#397BEE] shrink-0" />
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-3.5 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-mono text-[#2563EB] dark:text-[#60A5FA]">SCREENSHOT</span>
              <p className="text-[12px] font-semibold leading-snug mt-2 truncate">
                aws_pricing_capture.png
              </p>
              <span className="text-[11px] font-mono text-[var(--vg-ink-2)] mt-2">$0.0416/hr</span>
            </div>

            <div className="min-w-0 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-3.5 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-mono text-[#2563EB] dark:text-[#60A5FA]">PDF LETTER</span>
              <p className="text-[12px] font-semibold leading-snug mt-2 truncate">
                admission_letter.pdf
              </p>
              <span className="text-[11px] text-[var(--vg-ink-2)] mt-2">Page 1 extracted</span>
            </div>

            <div className="min-w-0 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-3.5 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-mono text-[#2563EB] dark:text-[#60A5FA]">RECEIPT</span>
              <p className="text-[12px] font-semibold leading-snug mt-2 truncate">
                supplies_oct.pdf
              </p>
              <span className="text-[11px] font-mono text-[var(--vg-ink-2)] mt-2">$138.67 total</span>
            </div>
          </motion.div>

          {/* Animated Connection Bridge */}
          <motion.div
            style={reduced ? undefined : { opacity: pathOpacity }}
            className="lg:col-span-2 flex flex-col items-center justify-center gap-2 py-2 text-center"
          >
            <div className="w-11 h-11 rounded-full bg-[#E0EDFF] dark:bg-[#1C3150] border border-[#7DB8FF]/50 flex items-center justify-center text-[#2563EB] dark:text-[#93C5FD] shadow-sm">
              <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0" />
            </div>
            <span className="text-[11px] font-mono text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
              OCR + Vector Links
            </span>
          </motion.div>

          {/* Organized Retrieval Workspace Output */}
          <motion.div
            style={reduced ? undefined : { x: rightSpreadX, rotate: spreadRotateR }}
            className="lg:col-span-5 min-w-0 rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-5 sm:p-6 shadow-[var(--vg-shadow-card)] space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] min-w-0">
              <Search className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
              <span className="text-[13px] font-medium text-[var(--vg-ink)] truncate">
                Show my college admission PDF
              </span>
            </div>

            <div className="rounded-2xl bg-[var(--vg-surface-2)] border border-[#7DB8FF]/45 p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> RETRIEVED SOURCE
                </span>
                <span className="text-[11px] font-mono text-[var(--vg-ink-2)] shrink-0">Page 1</span>
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E0EDFF] dark:bg-[#1C3150] flex items-center justify-center text-[#2563EB] dark:text-[#93C5FD] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[var(--vg-ink)] truncate">
                    university_admission_letter_2026.pdf
                  </p>
                  <p className="text-[12px] text-[var(--vg-ink-2)] truncate">
                    Offer of Admission — Fall Enrollment &amp; Verification ID #AD-4092
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
