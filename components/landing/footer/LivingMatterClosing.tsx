import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Github, Plus } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_COMPONENTS, VG_LAYOUT, VG_SPHERE_THEME_SPEC } from '@/components/landing/design-system'
import { SplitTextReveal } from '@/components/landing/motion/LivingMotionPrimitives'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { ThemeSwitch } from '@/components/landing/ThemeSwitch'
import {
  CONTRIBUTING_URL,
  FAQ_ITEMS,
  ISSUES_URL,
  LICENSE_URL,
  RELEASES_URL,
  REPO_URL,
  SECURITY_DOC_URL,
} from '@/components/landing/tokens'
import { Container } from '@/components/landing/ui'
import { cn } from '@/lib/utils'

const CONVERGING_MEMORIES = [
  {
    src: '/landing/photos/aura-celebration-toast.webp',
    alt: 'Terrace celebration toast memory',
    label: 'Celebration',
    x: -245,
    y: -62,
    rotate: -8,
  },
  {
    src: '/landing/photos/aura-ticket-coastal.webp',
    alt: 'Coastal rail boarding pass',
    label: 'Pass',
    x: -225,
    y: 66,
    rotate: 6,
  },
  {
    src: '/landing/photos/aura-deadline-notes.webp',
    alt: 'Handwritten deadline notes',
    label: 'Notes',
    x: 235,
    y: -58,
    rotate: 7,
  },
  {
    src: '/landing/photos/aura-personal-travel.webp',
    alt: 'Summer harbor walk memory',
    label: 'Travel',
    x: 245,
    y: 66,
    rotate: -7,
  },
]

/**
 * Chapter 07 — Final Brand Conclusion ("EVERYTHING WORTH KEEPING.")
 * Avoids muddy olive background wash via Obsidian Volt #090B0D, cool titanium-silver studio aura,
 * and converging memory fragments re-uniting into the iconic studio Memory Sphere.
 */
export function FinalBrandMomentSection() {
  const reduced = useReducedMotion()

  return (
    <section
      aria-labelledby="final-moment-heading"
      className="relative overflow-hidden bg-gradient-to-b from-[#E9EDE8]/45 via-[#F4F5F2] to-[#FFFFFF] dark:from-[#090B0D] dark:via-[#090B0D] dark:to-[#090B0D] text-[#101211] dark:text-[#F4F6F2] border-y border-[var(--vg-border)] py-16 sm:py-20 lg:py-24"
    >
      {/* Clean Titanium & Silver Studio Field (Light + Dark coherent) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          background:
            'radial-gradient(ellipse 56% 52% at 50% 52%, rgba(205,255,69,0.12), rgba(227,232,234,0.45) 48%, transparent 78%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background:
            'radial-gradient(ellipse 56% 48% at 50% 52%, rgba(184,197,204,0.10), rgba(70,214,164,0.05) 42%, #090B0D 76%)',
        }}
      />

      <Container wide className="relative z-10">
        <div className="max-w-6xl mx-auto text-center space-y-5 sm:space-y-6">
          <div>
            <p className="text-[13px] font-medium text-[#087F5B] dark:text-[#46D6A4] mb-3">
              Begin With Your Archive
            </p>

            <h2
              id="final-moment-heading"
              className="font-display font-bold uppercase tracking-[-0.05em] leading-[0.91] text-[#101211] dark:text-[#F4F6F2]"
              style={{ fontSize: 'clamp(2.35rem, 7.2vw, 6.8rem)' }}
            >
              EVERYTHING. REMEMBERED<span className="text-[#101211] dark:text-[#CDFF45]">.</span>
            </h2>
          </div>

          {/* Reconverging Memory Constellation & Reformed Sculpture Stage */}
          <div className="relative mx-auto flex items-center justify-center py-4 sm:py-6 min-h-[210px] sm:min-h-[250px]">
            {/* Converging Curved Orbital Guides */}
            <svg
              aria-hidden="true"
              viewBox="-360 -130 720 260"
              className="hidden md:block pointer-events-none absolute inset-0 w-full h-full"
            >
              <ellipse
                rx="220"
                ry="84"
                fill="none"
                stroke="currentColor"
                className="text-[#101211]/15 dark:text-[#B8C5CC]/[0.18]"
                strokeWidth="1"
              />
              <path
                d="M -220 -55 Q -95 0 0 0 M -205 60 Q -85 10 0 0 M 220 -50 Q 95 0 0 0 M 205 60 Q 85 10 0 0"
                fill="none"
                stroke="currentColor"
                className="text-[#087F5B]/30 dark:text-[#CDFF45]/[0.30]"
                strokeWidth="1.1"
              />
            </svg>

            {/* Surrounding Archival Fragments Gently Converging Toward Core */}
            <div className="hidden md:block absolute inset-0 pointer-events-none">
              {CONVERGING_MEMORIES.map((frag, idx) => (
                <motion.div
                  key={frag.label}
                  initial={
                    reduced
                      ? undefined
                      : { x: frag.x * 1.32, y: frag.y * 1.2, opacity: 0.45, scale: 0.92 }
                  }
                  whileInView={
                    reduced
                      ? undefined
                      : { x: frag.x, y: frag.y, opacity: 0.92, scale: 1 }
                  }
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.85, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{ left: '50%', top: '50%', rotate: frag.rotate }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-28 xl:w-32 rounded-2xl overflow-hidden border border-[var(--vg-border-strong)] bg-[var(--vg-surface)] shadow-xl"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img src={frag.src} alt={frag.alt} className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Restored Centerpiece Memory Sphere Core */}
            <div className="relative z-10 w-[190px] h-[190px] sm:w-[225px] sm:h-[225px] xl:w-[250px] xl:h-[250px] shrink-0">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-6 rounded-full blur-3xl opacity-55"
                style={{
                  background:
                    'radial-gradient(circle, rgba(205,255,69,0.22) 0%, rgba(70,214,164,0.12) 45%, transparent 72%)',
                }}
              />
              <img
                src={reduced ? VG_SPHERE_THEME_SPEC.heroVideoPoster : VG_SPHERE_THEME_SPEC.heroAnimWebp}
                alt="VectorGallery Memory Sphere reformed core"
                className="relative z-10 w-full h-full object-contain scale-[1.06]"
              />
            </div>
          </div>

          <div className="max-w-xl mx-auto space-y-5">
            <p className="text-[16.5px] sm:text-[18px] leading-[1.6] text-[var(--vg-ink-2)]">
              One intelligent home for your digital life.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
              <Link href="/app" className={VG_COMPONENTS.buttons.limePill}>
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/install" className={VG_COMPONENTS.buttons.secondary}>
                <Download className="w-4 h-4" />
                <span>Download Android</span>
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-4 rounded-full text-[14px] font-medium text-[var(--vg-ink-2)] hover:text-[#101211] dark:hover:text-[#F4F6F2] transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function CompactFaqAndFooter({ apkSizeLabel }: { apkSizeLabel?: string }) {
  void apkSizeLabel
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const faqList = FAQ_ITEMS.slice(0, 6)

  return (
    <>
      <div
        id="faq"
        role="region"
        aria-labelledby="faq-heading"
        className={cn(VG_LAYOUT.sectionPadding.standard, 'bg-[var(--vg-bg)]')}
      >
        <Container className="scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
              <SplitTextReveal
                as="h2"
                text="Common questions, straight answers."
                className="font-display font-bold tracking-[-0.036em] leading-[1.06] text-[var(--vg-ink)]"
                style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.85rem)' }}
              />
              <p className="text-[15.5px] leading-[1.65] text-[var(--vg-ink-2)] max-w-md">
                Clear facts on local mode, read-only mobile backup safety, and optional AI keys.
              </p>
            </div>

            <div className="lg:col-span-7 border-t border-[var(--vg-border)]">
              {faqList.map((item, idx) => {
                const isOpen = openIndex === idx
                const panelId = `faq-panel-${idx}`
                return (
                  <div key={item.q} className="border-b border-[var(--vg-border)]">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full py-5 text-left flex items-center justify-between gap-6 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45] rounded-lg"
                    >
                      <span className="font-display text-[16.5px] sm:text-[18px] font-semibold tracking-[-0.015em] text-[var(--vg-ink)] group-hover:text-[#087F5B] dark:group-hover:text-[#CDFF45] transition-colors">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300',
                          isOpen
                            ? 'bg-[#CDFF45] border-[#101211]/15 text-[#101211] rotate-45'
                            : 'border-[var(--vg-border)] text-[var(--vg-ink-2)] group-hover:border-[var(--vg-border-strong)] group-hover:text-[var(--vg-ink)]'
                        )}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </button>

                    {/* Smooth CSS Grid-Row Height Transition (#22) */}
                    <div
                      id={panelId}
                      className={cn(
                        'grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'
                      )}
                    >
                      <div className="overflow-hidden pr-8 text-[15px] leading-[1.68] text-[var(--vg-ink-2)]">
                        <p>{item.a}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Container>
      </div>

      {/* Architectural Editorial Footer */}
      <footer className="border-t border-[var(--vg-border)] bg-[var(--vg-bg)] overflow-hidden">
        <Container className="pt-14 sm:pt-16 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[var(--vg-border)]">
            <div className="lg:col-span-5 space-y-4">
              <VectorGalleryLogo size="md" />
              <p className="text-[13.5px] leading-[1.6] text-[var(--vg-ink-2)] max-w-xs">
                Open-source Personal AI Cloud. Find what you remember, without remembering where you saved it.
              </p>
              <ThemeSwitch mode="segmented" />
            </div>

            <div className="lg:col-span-2 space-y-3 text-[13.5px]">
              <div className="text-[12px] font-semibold text-[var(--vg-ink)]">Product</div>
              <ul className="space-y-2 text-[var(--vg-ink-2)]">
                <li>
                  <Link href="/app" className="hover:text-[var(--vg-ink)] transition-colors">
                    Open Vault
                  </Link>
                </li>
                <li>
                  <a href="#search" className="hover:text-[var(--vg-ink)] transition-colors">
                    Search &amp; Recall
                  </a>
                </li>
                <li>
                  <a href="#showcase" className="hover:text-[var(--vg-ink)] transition-colors">
                    Workspace
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[var(--vg-ink)] transition-colors">
                    Questions
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-3 text-[13.5px]">
              <div className="text-[12px] font-semibold text-[var(--vg-ink)]">Open Source</div>
              <ul className="space-y-2 text-[var(--vg-ink-2)]">
                <li>
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                    GitHub Repo
                  </a>
                </li>
                <li>
                  <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                    Apache-2.0 License
                  </a>
                </li>
                <li>
                  <a href={SECURITY_DOC_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href={CONTRIBUTING_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                    Contribute
                  </a>
                </li>
                <li>
                  <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                    Issues
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3 text-[13.5px]">
              <div className="text-[12px] font-semibold text-[var(--vg-ink)]">Apps &amp; Access</div>
              <ul className="space-y-2 text-[var(--vg-ink-2)]">
                <li>
                  <Link href="/install" className="hover:text-[var(--vg-ink)] transition-colors">
                    Android Download &amp; Guide
                  </Link>
                </li>
                <li>
                  <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                    GitHub Releases
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[var(--vg-ink)] transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-[var(--vg-ink)] transition-colors">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12.5px] text-[var(--vg-ink-2)]">
            <span>VectorGallery · Open Source (Apache-2.0) · Personal AI Cloud</span>
            <span>Built by Krish Soni</span>
          </div>

          {/* Monumental Architectural Closing Graphic Wordmark */}
          <div
            aria-hidden="true"
            className="select-none pointer-events-none pt-3 border-t border-[var(--vg-border)]"
          >
            <p
              className="font-display font-bold uppercase tracking-[-0.055em] leading-[0.86] text-[#101211]/[0.06] dark:text-[#F4F6F2]/[0.06] text-center whitespace-nowrap"
              style={{ fontSize: 'clamp(2.1rem, 11vw, 13rem)' }}
            >
              VECTORGALLERY<span className="text-[#101211]/20 dark:text-[#CDFF45]/25">.</span>
            </p>
          </div>
        </Container>
      </footer>
    </>
  )
}
