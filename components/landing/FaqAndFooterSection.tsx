import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Download, Github } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { cn } from '@/lib/utils'
import { MotionReveal } from './motion'
import { ThemeSwitch } from './ThemeSwitch'
import {
  CONTRIBUTING_URL,
  FAQ_ITEMS,
  ISSUES_URL,
  LICENSE_URL,
  RELEASES_URL,
  REPO_URL,
  SECURITY_DOC_URL,
} from './tokens'
import { Container, PrimaryButton, SecondaryButton, Section, SectionHeading } from './ui'

export function FaqAndFooterSection({ apkSizeLabel = '107.8 MB' }: { apkSizeLabel?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <>
      {/* SECTION: FAQ Accordion */}
      <Section id="faq" surface="default" ariaLabel="Frequently asked questions">
        <Container>
          <MotionReveal>
            <SectionHeading
              align="center"
              eyebrow="Frequently Asked Questions"
              title="Straight answers on privacy, search & setup"
              subtitle="Everything verified against the VectorGallery codebase and deployment documentation."
            />
          </MotionReveal>

          <MotionReveal delay={0.08} className="mt-10 max-w-3xl mx-auto space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx
              const panelId = `faq-panel-${idx}`
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--vg-brand)]"
                  >
                    <span className="font-display text-[16px] sm:text-[17px] font-semibold text-[var(--vg-ink)]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-[var(--vg-ink-2)] shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180 text-[var(--vg-brand)]'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={panelId}
                      className="px-5 sm:px-6 pb-5 pt-0 text-[14px] leading-relaxed text-[var(--vg-ink-2)] border-t border-[var(--vg-border)]/50"
                    >
                      <p className="pt-3">{item.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </MotionReveal>
        </Container>
      </Section>

      {/* SECTION: Closing CTA */}
      <Section id="get-started" surface="soft" ariaLabel="Get started with VectorGallery">
        <Container>
          <MotionReveal>
            <div className="rounded-[2rem] border border-[var(--vg-border)] bg-[var(--vg-surface)] p-8 sm:p-12 lg:p-16 shadow-[var(--vg-shadow-hero)] relative overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-35 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(57,123,238,0.28), transparent 70%)' }}
              />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <VectorGalleryLogo size="md" variant="horizontal" />
                  <h2
                    className="font-display font-bold tracking-[-0.03em] leading-[1.06] text-[var(--vg-ink)]"
                    style={{ fontSize: 'clamp(2rem, 4.4vw, 3.6rem)' }}
                  >
                    Everything you remember.{' '}
                    <span className="text-[var(--vg-brand)] dark:text-[var(--vg-sky)]">
                      Right where you need it.
                    </span>
                  </h2>
                  <p className="text-[16px] sm:text-[18px] leading-relaxed text-[var(--vg-ink-2)] max-w-xl">
                    Start locally on your own machine or connect Android mobile sync cleanly over Wi-Fi — open source under Apache-2.0.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <PrimaryButton href="/app" showArrow>
                      Open Web Workspace
                    </PrimaryButton>
                    <a
                      href="/vectorgallery.apk"
                      download="VectorGallery.apk"
                      className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[14px] font-semibold bg-[#EDF4FF] hover:bg-[#E0EDFF] dark:bg-[#1C3150] dark:hover:bg-[#233D63] text-[#1D4ED8] dark:text-[#93C5FD] border border-[#397BEE]/30 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397BEE]"
                    >
                      <Download className="w-4 h-4" />
                      <span>Android APK ({apkSizeLabel})</span>
                    </a>
                    <SecondaryButton href={REPO_URL} external>
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </SecondaryButton>
                  </div>
                </div>

                <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                  <div className="rounded-2xl overflow-hidden border border-[var(--vg-border)] aspect-[4/5] shadow-md">
                    <img
                      src="/landing/photos/mountain-pass.webp"
                      alt="Curated mountain landscape memory"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3.5">
                    <div className="rounded-2xl overflow-hidden border border-[var(--vg-border)] aspect-[4/3] shadow-md">
                      <img
                        src="/landing/photos/lake-morning.webp"
                        alt="Calm morning lake frame"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-[var(--vg-border)] aspect-[4/3] shadow-md">
                      <img
                        src="/landing/photos/coffee-ritual.webp"
                        alt="Personal daily photography"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionReveal>
        </Container>
      </Section>

      {/* SECTION: Balanced 4-Column Footer */}
      <footer className="bg-[var(--vg-bg)] border-t border-[var(--vg-border)] pt-16 pb-10 overflow-hidden">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-[var(--vg-border)]">
            <div className="md:col-span-4 space-y-4">
              <VectorGalleryLogo size="md" variant="horizontal" />
              <p className="text-[13.5px] leading-relaxed text-[var(--vg-ink-2)] max-w-sm">
                Open-source Personal AI Cloud & Digital Memory Vault. Your digital memories, beautifully connected.
              </p>
              <div className="pt-1">
                <ThemeSwitch mode="segmented" />
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-[13.5px]">
              <div className="space-y-3">
                <p className="font-display font-semibold text-[var(--vg-ink)]">Product</p>
                <ul className="space-y-2 text-[var(--vg-ink-2)]">
                  <li>
                    <Link href="/app" className="hover:text-[var(--vg-ink)] transition-colors">
                      Web Workspace
                    </Link>
                  </li>
                  <li>
                    <a href="#search-demo" className="hover:text-[var(--vg-ink)] transition-colors">
                      Search Demo
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="hover:text-[var(--vg-ink)] transition-colors">
                      Capabilities
                    </a>
                  </li>
                  <li>
                    <a href="#formats" className="hover:text-[var(--vg-ink)] transition-colors">
                      File Formats
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-display font-semibold text-[var(--vg-ink)]">Resources</p>
                <ul className="space-y-2 text-[var(--vg-ink-2)]">
                  <li>
                    <Link href="/install" className="hover:text-[var(--vg-ink)] transition-colors">
                      Android Install
                    </Link>
                  </li>
                  <li>
                    <a href="/vectorgallery.apk" download="VectorGallery.apk" className="hover:text-[var(--vg-ink)] transition-colors">
                      Download APK
                    </a>
                  </li>
                  <li>
                    <a href={SECURITY_DOC_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                      Security Doc
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-[var(--vg-ink)] transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-display font-semibold text-[var(--vg-ink)]">Community</p>
                <ul className="space-y-2 text-[var(--vg-ink-2)]">
                  <li>
                    <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                      GitHub Repo
                    </a>
                  </li>
                  <li>
                    <a href={RELEASES_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                      Releases
                    </a>
                  </li>
                  <li>
                    <a href={ISSUES_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                      Issues
                    </a>
                  </li>
                  <li>
                    <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                      Contributing
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-display font-semibold text-[var(--vg-ink)]">Account & Legal</p>
                <ul className="space-y-2 text-[var(--vg-ink-2)]">
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
                  <li>
                    <a href={LICENSE_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-ink)] transition-colors">
                      Apache-2.0 License
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] text-[var(--vg-ink-3)]">
            <span>VectorGallery · Open Source Personal AI Cloud (Apache-2.0)</span>
            <span>Curated sample photography attribution documented in public/landing/photos/ATTRIBUTION.md</span>
          </div>

          {/* Architectural restrained oversized wordmark */}
          <div className="mt-8 select-none pointer-events-none text-center overflow-hidden" aria-hidden="true">
            <p
              className="font-display font-extrabold tracking-[-0.045em] leading-[0.88] text-[#14233B]/[0.055] dark:text-[#93C5FD]/[0.06]"
              style={{ fontSize: 'clamp(3rem, 9.5vw, 8.2rem)' }}
            >
              VectorGallery
            </p>
          </div>
        </Container>
      </footer>
    </>
  )
}
