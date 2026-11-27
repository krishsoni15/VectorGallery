import React, { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_LAYOUT, VG_TYPOGRAPHY } from '@/components/landing/design-system'
import { cn } from '@/lib/utils'
import { MotionReveal } from './motion'
import { ThemeSwitch } from './ThemeSwitch'
import {
  CONTRIBUTING_URL,
  FAQ_ITEMS,
  LICENSE_URL,
  RELEASES_URL,
  REPO_URL,
  SECURITY_DOC_URL,
} from './tokens'
import { Container } from './ui'

export function FaqAndFooterSection({ apkSizeLabel }: { apkSizeLabel?: string }) {
  void apkSizeLabel
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqList = FAQ_ITEMS.slice(0, 6)

  return (
    <>
      {/* 2-Column Unboxed Editorial FAQ (outside the 6 <section> landmarks) */}
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
                style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.85rem)', textWrap: 'balance' }}
              >
                A few things you might want to{'\u00A0'}know.
              </h2>
              <p className="text-[15.5px] leading-[1.65] text-[var(--vg-ink-2)] max-w-md">
                Plain answers about how VectorGallery keeps your photographs, notes, and documents private, searchable, and yours.
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
                      className="w-full py-5 text-left flex items-center justify-between gap-6 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)] rounded-lg"
                    >
                      <span
                        className={cn(
                          'font-display text-[16.5px] sm:text-[18px] font-semibold tracking-[-0.015em] transition-colors',
                          isOpen
                            ? 'text-[var(--vg-ink)]'
                            : 'text-[var(--vg-ink)] group-hover:text-[var(--vg-brand)]'
                        )}
                      >
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                          isOpen
                            ? 'border-[#087F5B]/35 dark:border-[#58D6A8]/35 bg-[#C4EDE1]/45 dark:bg-[#252A26] text-[var(--vg-brand)]'
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

      {/* Minimal 3-Column Footer */}
      <footer className="bg-[var(--vg-surface-2)] border-t border-[var(--vg-border)] pt-14 pb-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[var(--vg-border)]">
            <div className="md:col-span-5 space-y-4">
              <VectorGalleryLogo size="md" variant="horizontal" />
              <p
                className="text-[14px] leading-relaxed text-[var(--vg-ink-2)] max-w-sm"
                style={{ fontFamily: VG_TYPOGRAPHY.fonts.body }}
              >
                Open-source Personal AI Cloud. Quietly organized, searchable by memory, and always yours.
              </p>
              <div className="pt-1">
                <ThemeSwitch mode="segmented" />
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-[13.5px]">
              <div className="space-y-3">
                <p className="font-display font-semibold text-[var(--vg-ink)]">Product</p>
                <ul className="space-y-2.5 text-[var(--vg-ink-2)]">
                  <li>
                    <Link href="/app" className="hover:text-[var(--vg-brand)] transition-colors">
                      Web Workspace
                    </Link>
                  </li>
                  <li>
                    <a href="#search-demo" className="hover:text-[var(--vg-brand)] transition-colors">
                      Search Demo
                    </a>
                  </li>
                  <li>
                    <a href="#showcase" className="hover:text-[var(--vg-brand)] transition-colors">
                      Workspace Showcase
                    </a>
                  </li>
                  <li>
                    <Link href="/install" className="hover:text-[var(--vg-brand)] transition-colors">
                      Android App
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-display font-semibold text-[var(--vg-ink)]">Resources</p>
                <ul className="space-y-2.5 text-[var(--vg-ink-2)]">
                  <li>
                    <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-brand)] transition-colors">
                      GitHub Repository
                    </a>
                  </li>
                  <li>
                    <a href={RELEASES_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-brand)] transition-colors">
                      Releases &amp; APK
                    </a>
                  </li>
                  <li>
                    <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-brand)] transition-colors">
                      Contributing
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-[var(--vg-brand)] transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-display font-semibold text-[var(--vg-ink)]">Account &amp; Legal</p>
                <ul className="space-y-2.5 text-[var(--vg-ink-2)]">
                  <li>
                    <Link href="/login" className="hover:text-[var(--vg-brand)] transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="hover:text-[var(--vg-brand)] transition-colors">
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <a href={LICENSE_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-brand)] transition-colors">
                      Apache-2.0 License
                    </a>
                  </li>
                  <li>
                    <a href={SECURITY_DOC_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--vg-brand)] transition-colors">
                      Security Architecture
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px] text-[var(--vg-ink-muted)]">
            <span>© {new Date().getFullYear()} VectorGallery · Open Source under Apache-2.0</span>
            <span>Designed for personal archives &amp; local ownership</span>
          </div>
        </Container>
      </footer>
    </>
  )
}
