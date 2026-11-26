import React from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { FileText, Github, HardDrive, Image as ImageIcon, Search, Smartphone } from 'lucide-react'
import { Container, PrimaryButton, SecondaryButton } from '@/components/landing/ui'
import { REPO_URL } from '@/components/landing/tokens'
import { VG_EASE } from '@/components/landing/motion'

export function HeroSection() {
  const reduced = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 100, damping: 24 })
  const sy = useSpring(my, { stiffness: 100, damping: 24 })

  const parallaxLeftX = useTransform(sx, [-0.5, 0.5], [14, -14])
  const parallaxRightX = useTransform(sx, [-0.5, 0.5], [-16, 16])
  const parallaxY = useTransform(sy, [-0.5, 0.5], [10, -10])

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  const handleLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <section
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-label="VectorGallery overview"
      className="relative pt-10 sm:pt-16 pb-20 sm:pb-28 overflow-hidden"
    >
      {/* Airy Soft-Blue Atmospheric Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 inset-x-0 h-[720px] bg-[radial-gradient(ellipse_78%_58%_at_50%_10%,rgba(57,123,238,0.16),rgba(125,184,255,0.08)_45%,transparent_75%)] dark:bg-[radial-gradient(ellipse_78%_58%_at_50%_10%,rgba(57,123,238,0.22),rgba(28,49,80,0.25)_45%,transparent_75%)]"
      />

      <Container wide className="relative z-10">
        {/* Centered Editorial Copy */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={reduced ? false : { opacity: 0.9, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: VG_EASE }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--vg-surface)] border border-[var(--vg-border)] shadow-sm text-[12px] font-medium text-[var(--vg-ink-2)] mb-7"
          >
            <span className="w-2 h-2 rounded-full bg-[#397BEE] dark:bg-[#60A5FA]" />
            <span>Personal AI Cloud &amp; Digital Memory Platform</span>
          </motion.div>

          <motion.h1
            initial={reduced ? false : { opacity: 0.92, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: VG_EASE }}
            className="font-display font-bold tracking-[-0.04em] leading-[0.98] text-[var(--vg-ink)]"
            style={{ fontSize: 'clamp(2.5rem, 6.2vw, 5.4rem)' }}
          >
            Your digital life.
            <span className="block text-[#397BEE] dark:text-[#60A5FA] mt-1">
              Beautifully connected.
            </span>
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0.92, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12, ease: VG_EASE }}
            className="mt-6 text-[17px] sm:text-[19px] leading-[1.6] text-[var(--vg-ink-2)] max-w-2xl mx-auto"
          >
            Your photos, files, screenshots, documents, and memories — organized in one
            intelligent space. Find anything with a question, not a folder.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0.95, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: VG_EASE }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
          >
            <PrimaryButton href="/app" showArrow>
              Get started
            </PrimaryButton>
            <SecondaryButton href={REPO_URL} external>
              <Github className="w-4 h-4" />
              <span>View on GitHub</span>
            </SecondaryButton>
          </motion.div>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-4 text-[13px] text-[var(--vg-ink-muted)] font-medium"
          >
            Open source. Self-hostable. Built around your data.
          </motion.p>
        </div>

        {/* ── Signature Floating Memory Ecosystem Composition ── */}
        <div className="mt-14 sm:mt-20 relative max-w-[1160px] mx-auto">
          {/* Desktop Connected Vector Field */}
          <div className="hidden lg:block relative h-[520px]">
            {/* Subtle Animated Vector SVG Connection Lines */}
            <svg
              aria-hidden="true"
              viewBox="0 0 1160 520"
              fill="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <defs>
                <linearGradient id="vg-line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7DB8FF" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="#397BEE" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#7DB8FF" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <motion.path
                d="M205 140 C320 140, 340 245, 435 260"
                stroke="url(#vg-line-grad)"
                strokeWidth="1.75"
                strokeDasharray="6 6"
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.35, ease: VG_EASE }}
              />
              <motion.path
                d="M230 390 C340 390, 360 285, 435 270"
                stroke="url(#vg-line-grad)"
                strokeWidth="1.75"
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.45, ease: VG_EASE }}
              />
              <motion.path
                d="M950 135 C830 135, 810 245, 725 260"
                stroke="url(#vg-line-grad)"
                strokeWidth="1.75"
                strokeDasharray="6 6"
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.4, ease: VG_EASE }}
              />
              <motion.path
                d="M930 395 C815 395, 795 290, 725 275"
                stroke="url(#vg-line-grad)"
                strokeWidth="1.75"
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.5, ease: VG_EASE }}
              />
            </svg>

            {/* Top-Left: Real Mountain Photo Memory */}
            <motion.div
              style={reduced ? undefined : { x: parallaxLeftX, y: parallaxY }}
              initial={reduced ? false : { opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.24, ease: VG_EASE }}
              className="absolute left-2 top-3 w-[250px] rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-2 shadow-[var(--vg-shadow-card)] -rotate-2"
            >
              <div className="relative h-36 rounded-xl overflow-hidden">
                <img
                  src="/landing/photos/mountain-pass.webp"
                  alt="Mountain pass landscape photo memory"
                  className="w-full h-full object-cover"
                />
                <span className="vg-photo-caption absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#090F1C]/65 text-white backdrop-blur-md">
                  RAW · 35mm
                </span>
              </div>
              <div className="px-2 pt-2.5 pb-1 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[var(--vg-ink)]">Highland_Pass.webp</span>
                <ImageIcon className="w-3.5 h-3.5 text-[#397BEE]" />
              </div>
            </motion.div>

            {/* Bottom-Left: Admission PDF Document Preview */}
            <motion.div
              style={reduced ? undefined : { x: parallaxLeftX }}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.34, ease: VG_EASE }}
              className="absolute left-6 bottom-6 w-[255px] rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-4 shadow-[var(--vg-shadow-card)] rotate-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E0EDFF] dark:bg-[#1C3150] text-[#2563EB] dark:text-[#93C5FD] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border border-[var(--vg-border)]">
                  PDF · Page 1
                </span>
              </div>
              <p className="mt-3 text-[13px] font-semibold text-[var(--vg-ink)] truncate">
                college_admission_letter.pdf
              </p>
              <p className="mt-1 text-[11px] text-[var(--vg-ink-2)] line-clamp-2">
                Extracted text indexed cleanly for citation lookup &amp; downloads.
              </p>
            </motion.div>

            {/* Top-Right: Calm Lake Photo Card */}
            <motion.div
              style={reduced ? undefined : { x: parallaxRightX, y: parallaxY }}
              initial={reduced ? false : { opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.28, ease: VG_EASE }}
              className="absolute right-2 top-3 w-[250px] rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-2 shadow-[var(--vg-shadow-card)] rotate-2"
            >
              <div className="relative h-36 rounded-xl overflow-hidden">
                <img
                  src="/landing/photos/lake-morning.webp"
                  alt="Morning canoe across calm alpine lake"
                  className="w-full h-full object-cover"
                />
                <span className="vg-photo-caption absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#090F1C]/65 text-white backdrop-blur-md">
                  Android Backup
                </span>
              </div>
              <div className="px-2 pt-2.5 pb-1 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[var(--vg-ink)]">Morning_Lake.webp</span>
                <Smartphone className="w-3.5 h-3.5 text-[#397BEE]" />
              </div>
            </motion.div>

            {/* Bottom-Right: Screenshot OCR Intel Card */}
            <motion.div
              style={reduced ? undefined : { x: parallaxRightX }}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.38, ease: VG_EASE }}
              className="absolute right-6 bottom-6 w-[260px] rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-4 shadow-[var(--vg-shadow-card)] -rotate-1"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
                  OCR Screenshot Layer
                </span>
                <span className="w-2 h-2 rounded-full bg-[#397BEE]" />
              </div>
              <p className="text-[13px] font-semibold text-[var(--vg-ink)] truncate">
                aws_ec2_pricing_table.png
              </p>
              <div className="mt-2 p-2 rounded-lg bg-[var(--vg-surface-2)] border border-[var(--vg-border)] font-mono text-[11px] text-[var(--vg-ink-2)]">
                t3.medium · $0.0416/hr · EBS gp3
              </div>
            </motion.div>

            {/* Center: Intelligent Search & Organized Vault Hub */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.42, ease: VG_EASE }}
              className="relative z-20 mx-auto top-[52px] w-[460px] rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)]/95 backdrop-blur-2xl shadow-[var(--vg-shadow-hero)] p-5"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[var(--vg-border)]">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--vg-ink)]">
                  <img src="/brand/favicon.svg" alt="" className="w-5 h-5 rounded-md" />
                  <span>VectorGallery Vault</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2563EB] dark:text-[#60A5FA]">
                  <HardDrive className="w-3 h-3" /> Local + Cloud Ready
                </span>
              </div>

              {/* Simulated Intelligent Search Bar */}
              <div className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[var(--vg-surface-2)] border border-[#7DB8FF]/50 dark:border-[#60A5FA]/35">
                <Search className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                <span className="text-[13px] font-medium text-[var(--vg-ink)] truncate">
                  Find my photos from the mountains
                </span>
                <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[var(--vg-ink-muted)]">
                  ⌘K
                </kbd>
              </div>

              {/* Instant Grounded Result Collage */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface-2)]">
                  <img
                    src="/landing/photos/fjord-overlook.webp"
                    alt="Fjord cliff overlooking mountain water"
                    className="w-full h-28 object-cover"
                  />
                  <div className="p-2.5">
                    <p className="text-[11px] font-semibold text-[var(--vg-ink)] truncate">
                      Nordic_Fjord.webp
                    </p>
                    <p className="text-[10px] font-mono text-[#2563EB] dark:text-[#60A5FA]">
                      Travel · Verified
                    </p>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface-2)]">
                  <img
                    src="/landing/photos/valley-reflection.webp"
                    alt="Mountain stream reflecting pine trees"
                    className="w-full h-28 object-cover"
                  />
                  <div className="p-2.5">
                    <p className="text-[11px] font-semibold text-[var(--vg-ink)] truncate">
                      Valley_Stream.webp
                    </p>
                    <p className="text-[10px] font-mono text-[#2563EB] dark:text-[#60A5FA]">
                      Photos · Indexed
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile & Tablet Simplified Composition */}
          <div className="lg:hidden rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] p-4 sm:p-5 shadow-[var(--vg-shadow-card)] space-y-4">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)]">
              <Search className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
              <span className="text-[13px] font-medium text-[var(--vg-ink)] truncate">
                Find my photos from the mountains
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl overflow-hidden border border-[var(--vg-border)]">
                <img src="/landing/photos/mountain-pass.webp" alt="Mountain road" className="w-full h-28 object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden border border-[var(--vg-border)]">
                <img src="/landing/photos/lake-morning.webp" alt="Morning lake" className="w-full h-28 object-cover" />
              </div>
              <div className="hidden sm:block rounded-xl overflow-hidden border border-[var(--vg-border)]">
                <img src="/landing/photos/workspace-journal.webp" alt="Notebook and camera" className="w-full h-28 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

