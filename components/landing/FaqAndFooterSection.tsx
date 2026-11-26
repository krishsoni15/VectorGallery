import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
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

const CORE_FAQ_QUESTIONS = new Set([
  'What is VectorGallery?',
  'How does AI search work?',
  'Is VectorGallery open source?',
  'Can I run it locally?',
  'Do I need AI API keys?',
  'Can I back up my Android phone?',
])

export function FaqAndFooterSection({ apkSizeLabel }: { apkSizeLabel?: string }) {
  void apkSizeLabel
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const filteredFaqs = FAQ_ITEMS.filter((item) => CORE_FAQ_QUESTIONS.has(item.q)).slice(0, 6)
  const faqList = filteredFaqs.length > 0 ? filteredFaqs : FAQ_ITEMS.slice(0, 6)

  return (
    <>
      {/* Compact FAQ Region (outside the 6 <section> landmarks) */}
      <div
        id="faq"
        role="region"
        aria-labelledby="faq-heading"
        className={cn(VG_LAYOUT.sectionPadding.compact, 'bg-[var(--vg-bg)]')}
      >
        <Container>
          <MotionReveal>
            <div className="text-center mx-auto max-w-3xl space-y-3.5">
              <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--vg-brand)]">
                Frequently Asked Questions
              </p>
              <h2
                id="faq-heading"
                className="font-display font-bold tracking-[-0.03em] leading-[1.08] text-[var(--vg-ink)]"
                style={{ fontSize: VG_TYPOGRAPHY.scale.h2.fontSize, textWrap: 'balance' }}
              >
                Clear <em className={VG_TYPOGRAPHY.editorialWordClass}>answers</em>, before you{'\u00A0'}start.
              </h2>
              <p className="text-[15.5px] sm:text-[17px] leading-[1.65] text-[var(--vg-ink-2)] max-w-2xl mx-auto">
                Six essentials verified directly against the VectorGallery codebase and documentation.
              </p>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} className="mt-10 max-w-[780px] mx-auto space-y-3">
            {faqList.map((item, idx) => {
              const isOpen = openIndex === idx
              const panelId = `faq-panel-${idx}`
              return (
                <div
                  key={item.q}
                  className={cn(
                    'rounded-2xl border transition-colors overflow-hidden bg-[var(--vg-surface)]',
                    isOpen
                      ? 'border-[#087F5B]/40 dark:border-[#53D9A3]/40 shadow-[var(--vg-shadow-card)]'
                      : 'border-[var(--vg-border)] shadow-sm'
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--vg-brand)]"
                  >
                    <span className="font-display text-[15.5px] sm:text-[16.5px] font-semibold text-[var(--vg-ink)]">
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
                      className="px-5 sm:px-6 pb-5 pt-0 text-[14px] leading-relaxed text-[var(--vg-ink-2)] border-t border-[var(--vg-border)]"
                    >
                      <p className="pt-3">{item.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </MotionReveal>
        </Container>
      </div>

      {/* Streamlined 3-Column Footer */}
      <footer className="bg-[var(--vg-surface-2)] border-t border-[var(--vg-border)] pt-14 pb-10 overflow-hidden">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[var(--vg-border)]">
            <div className="md:col-span-5 space-y-4">
              <VectorGalleryLogo size="md" variant="horizontal" />
              <p className="text-[13.5px] leading-relaxed text-[var(--vg-ink-2)] max-w-sm">
                Open-source Personal AI Cloud &amp; Digital Memory Vault. Quietly organized, searchable by meaning, and always yours.
              </p>
              <div className="pt-1">
                <ThemeSwitch mode="segmented" />
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-[13.5px]">
              <div className="space-y-3">
                <p className="font-display font-semibold text-[var(--vg-ink)]">Product</p>
                <ul className="space-y-2 text-[var(--vg-ink-2)]">
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
                      Product Showcase
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
                <ul className="space-y-2 text-[var(--vg-ink-2)]">
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
                <p className="font-display font-semibold text-[var(--vg-ink)]">Legal</p>
                <ul className="space-y-2 text-[var(--vg-ink-2)]">
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
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] text-[var(--vg-ink-muted)]">
            <span>© {new Date().getFullYear()} VectorGallery · Open Source Personal AI Cloud (Apache-2.0)</span>
            <span>Sample photography attribution in public/landing/photos/ATTRIBUTION.md</span>
          </div>

          <div className="mt-8 select-none pointer-events-none text-center overflow-hidden" aria-hidden="true">
            <p
              className="font-display font-extrabold tracking-[-0.045em] leading-[0.88] text-[#0F241B]/[0.045] dark:text-[#53D9A3]/[0.055]"
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
