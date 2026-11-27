import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Download, Minus, Plus } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_COMPONENTS, VG_LAYOUT } from '@/components/landing/design-system'
import { LivingAuraCanvas } from '@/components/landing/shaders/LivingAuraCanvas'
import { MotionReveal } from '@/components/landing/motion'
import { ThemeSwitch } from '@/components/landing/ThemeSwitch'
import {
  CONTRIBUTING_URL,
  FAQ_ITEMS,
  LICENSE_URL,
  RELEASES_URL,
  REPO_URL,
  SECURITY_DOC_URL,
} from '@/components/landing/tokens'
import { Container } from '@/components/landing/ui'
import { cn } from '@/lib/utils'

/**
 * Chapter 07 — Final Brand Moment ("EVERYTHING WORTH KEEPING.").
 * Converges surrounding memory frames back toward the sculpted acid-lime & silver core
 * inside a dramatic obsidian sanctuary stage, paired cleanly with magnetic lime CTA.
 */
export function FinalBrandMomentSection() {
  return (
    <section
      aria-labelledby="final-moment-heading"
      className="relative overflow-hidden bg-[#090B0A] text-[#F3F5F1] border-y border-white/[0.10] py-24 sm:py-32 lg:py-36"
    >
      <LivingAuraCanvas
        variant="dark"
        intensity={0.96}
        className="absolute inset-0 z-0 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 62% 58% at 50% 50%, rgba(207,255,73,0.10), transparent 65%)',
        }}
      />

      <Container wide className="relative z-10">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <MotionReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.14] text-[11.5px] font-mono uppercase tracking-[0.14em] text-[#CFFF49] mb-5">
              <span>07 · Start Your Vault</span>
            </div>

            <h2
              id="final-moment-heading"
              className="font-display font-bold uppercase tracking-[-0.052em] leading-[0.91] text-[#F3F5F1]"
              style={{ fontSize: 'clamp(2.45rem, 8.2vw, 8rem)' }}
            >
              EVERYTHING WORTH KEEPING<span className="text-[#CFFF49]">.</span>
            </h2>
          </MotionReveal>

          {/* Converged Sphere Focal Stage flanked by miniature archival frames */}
          <div className="relative mx-auto flex items-center justify-center py-4">
            <div className="hidden md:block w-40 xl:w-44 aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.14] opacity-75 -rotate-6 -mr-6 shadow-2xl">
              <img
                src="/landing/photos/aura-personal-travel.webp"
                alt="Harbor travel archive capture"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] xl:w-[280px] xl:h-[280px] relative z-10 shrink-0">
              <img
                src="/landing/artwork/memory-sphere-video-poster.webp"
                alt="VectorGallery Memory Sphere sculpture"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="hidden md:block w-40 xl:w-44 aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.14] opacity-75 rotate-6 -ml-6 shadow-2xl">
              <img
                src="/landing/photos/aura-arch-notes.webp"
                alt="Architectural sketch archive capture"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <MotionReveal delay={0.08} className="max-w-xl mx-auto space-y-6">
            <p className="text-[16.5px] sm:text-[18px] leading-[1.6] text-[#9AA69E]">
              Bring home every photograph, receipt, and handwritten page—searchable in seconds, synced from Android, and owned cleanly on infrastructure you choose.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link href="/app" className={VG_COMPONENTS.buttons.forestPrimary}>
                <span>Open Web Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/install" className={VG_COMPONENTS.buttons.forestSecondary}>
                <Download className="w-4 h-4" />
                <span>Get Android APK</span>
              </Link>
            </div>
          </MotionReveal>
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
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <MotionReveal className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
              <h2
                id="faq-heading"
                className="font-display font-bold tracking-[-0.036em] leading-[1.06] text-[var(--vg-ink)]"
                style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.85rem)' }}
              >
                Common questions, straight answers.
              </h2>
              <p className="text-[15.5px] leading-[1.65] text-[var(--vg-ink-2)] max-w-md">
                Clear details about local mode, Android sync safety, and optional API keys.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.06} className="lg:col-span-7 border-t border-[var(--vg-border)]">
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
                      className="w-full py-5 text-left flex items-center justify-between gap-6 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CFFF49] rounded-lg"
                    >
                      <span className="font-display text-[16.5px] sm:text-[18px] font-semibold tracking-[-0.015em] text-[var(--vg-ink)] group-hover:text-[#087F5B] dark:group-hover:text-[#CFFF49] transition-colors">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                          isOpen
                            ? 'bg-[#D4FF54] border-[#101211]/15 text-[#101211]'
                            : 'border-[var(--vg-border)] text-[var(--vg-ink-2)] group-hover:border-[var(--vg-border-strong)] group-hover:text-[var(--vg-ink)]'
                        )}
                      >
                        {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        id={panelId}
                        className="pb-5 pr-8 text-[15px] leading-[1.68] text-[var(--vg-ink-2)]"
                      >
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </MotionReveal>
          </div>
        </Container>
      </div>

      <footer className="border-t border-[var(--vg-border)] bg-[var(--vg-bg)]">
        <Container className="py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-[var(--vg-border)]">
            <div className="lg:col-span-5 space-y-4">
              <VectorGalleryLogo size="md" />
              <p className="text-[13.5px] leading-[1.6] text-[var(--vg-ink-2)] max-w-xs">
                Open-source Personal AI Cloud. Find what you remember without remembering where you put it.
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
                    Security Docs
                  </a>
                </li>
                <li>
                  <a href={CONTRIBUTING_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                    Contribute
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3 text-[13.5px]">
              <div className="text-[12px] font-semibold text-[var(--vg-ink)]">Apps &amp; Access</div>
              <ul className="space-y-2 text-[var(--vg-ink-2)]">
                <li>
                  <Link href="/install" className="hover:text-[var(--vg-ink)] transition-colors">
                    Android App &amp; QR
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
                    Create Vault Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12.5px] text-[var(--vg-ink-2)]">
            <span>VectorGallery · Open Source (Apache-2.0) · Personal AI Cloud</span>
            <span>Built by Krish Soni</span>
          </div>
        </Container>
      </footer>
    </>
  )
}

