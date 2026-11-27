import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Download, FileText, Github, Plus, Search, ShieldCheck, Smartphone } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_COMPONENTS, VG_LAYOUT } from '@/components/landing/design-system'
import { SplitTextReveal } from '@/components/landing/motion/LivingMotionPrimitives'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { MemorySphereCanvas } from '@/components/landing/sculpture/MemorySphereCanvas'
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
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'

const CLOSING_PILLARS = [
  {
    icon: Search,
    title: 'Visual & OCR Recall',
    detail: 'Search scenes, tickets & receipts in plain words.',
  },
  {
    icon: FileText,
    title: 'Grounded Answers',
    detail: 'Cited directly from your documents and scans.',
  },
  {
    icon: Smartphone,
    title: 'Android Auto-Sync',
    detail: 'Read-only Wi-Fi backup that preserves phone originals.',
  },
  {
    icon: ShieldCheck,
    title: 'Open & Local-First',
    detail: 'Run offline on your disk or own S3/Supabase keys.',
  },
]

/**
 * Chapter 07 — Apple-Caliber Obsidian Volt Closing Sanctuary ("EVERYTHING. REMEMBERED.")
 * Creates purposeful double-color architectural contrast between the bright Liquid Titanium page
 * and a monumental dark Obsidian sanctuary stage framing the Memory Sphere sculpture.
 */
export function FinalBrandMomentSection() {
  const reduced = useReducedMotion()
  const { user } = useAuth()

  return (
    <section
      aria-labelledby="final-moment-heading"
      className="relative bg-[#F4F5F2] dark:bg-[#090B0D] py-12 sm:py-16 lg:py-20 border-t border-[var(--vg-border)]"
    >
      <Container wide>
        <div className="relative overflow-hidden rounded-[2.2rem] sm:rounded-[2.6rem] bg-[#0B0E11] text-[#F4F6F2] border border-[#101211]/15 dark:border-white/[0.12] shadow-[0_48px_120px_-28px_rgba(9,11,13,0.48)] px-6 sm:px-10 lg:px-14 py-14 sm:py-18 lg:py-20">
          {/* Luminous Obsidian-Silver & Emerald Studio Field */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 62% 52% at 50% 44%, rgba(205,255,69,0.12) 0%, rgba(70,214,164,0.08) 38%, rgba(25,29,32,0.42) 66%, transparent 100%)',
            }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 vg-grain opacity-30" />

          <div className="relative z-10 max-w-6xl mx-auto">
            {/* Top Monumental Display Typography */}
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] text-[12px] font-medium text-[#CDFF45] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CDFF45]" />
                <span>Begin With Your Archive</span>
              </div>

              <h2
                id="final-moment-heading"
                className="font-display font-bold uppercase tracking-[-0.052em] leading-[0.9] text-[#F4F6F2]"
                style={{ fontSize: 'clamp(2.2rem, 6.4vw, 5.75rem)' }}
              >
                EVERYTHING.
                <br />
                REMEMBERED<span className="text-[#CDFF45]">.</span>
              </h2>
            </div>

            {/* Centerpiece Studio Sculpture Flanked by Balanced Capability Pills */}
            <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-4">
              {/* Left 2 Capability Specs */}
              <div className="lg:col-span-4 space-y-3 order-2 lg:order-1">
                {CLOSING_PILLARS.slice(0, 2).map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.title}
                      initial={reduced ? undefined : { opacity: 0.85, x: -12 }}
                      whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="p-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.10] backdrop-blur-md transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#CDFF45]/15 border border-[#CDFF45]/25 flex items-center justify-center text-[#CDFF45] shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div>
                          <p className="text-[13.5px] font-semibold text-[#F4F6F2]">{item.title}</p>
                          <p className="text-[12.5px] text-[#A4AEA9] leading-snug mt-0.5">{item.detail}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Center Transformed Volumetric Sculpture */}
              <div className="lg:col-span-4 flex items-center justify-center order-1 lg:order-2">
                <div className="relative w-[220px] sm:w-[265px] lg:w-[295px] flex items-center justify-center">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-4 rounded-full border border-white/[0.08]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-10 rounded-full border border-[#CDFF45]/20"
                  />
                  <MemorySphereCanvas mode="closing" themeMode="dark" priority={false} className="w-full" />
                </div>
              </div>

              {/* Right 2 Capability Specs */}
              <div className="lg:col-span-4 space-y-3 order-3">
                {CLOSING_PILLARS.slice(2, 4).map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.title}
                      initial={reduced ? undefined : { opacity: 0.85, x: 12 }}
                      whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="p-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.10] backdrop-blur-md transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#46D6A4]/15 border border-[#46D6A4]/25 flex items-center justify-center text-[#46D6A4] shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div>
                          <p className="text-[13.5px] font-semibold text-[#F4F6F2]">{item.title}</p>
                          <p className="text-[12.5px] text-[#A4AEA9] leading-snug mt-0.5">{item.detail}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Apple Sanctuary Action Dock */}
            <div className="mt-10 sm:mt-12 pt-8 border-t border-white/[0.10] flex flex-col sm:flex-row items-center justify-between gap-5">
              <p className="text-[15.5px] sm:text-[17px] text-[#B8C5CC] text-center sm:text-left">
                One intelligent sanctuary for your digital life.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <Link href={user ? '/app' : '/signup'} className={VG_COMPONENTS.buttons.forestPrimary}>
                  <span>{user ? 'Open Web Vault' : 'Get started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/install" className={VG_COMPONENTS.buttons.forestSecondary}>
                  <Download className="w-4 h-4" />
                  <span>Download Android</span>
                </Link>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-4 rounded-full text-[14px] font-medium text-[#A4AEA9] hover:text-[#F4F6F2] transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function CompactFaqAndFooter({ apkSizeLabel }: { apkSizeLabel?: string }) {
  void apkSizeLabel
  const { user } = useAuth()
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
                  <Link href={user ? '/app' : '/signup'} className="hover:text-[var(--vg-ink)] transition-colors">
                    {user ? 'Open Vault' : 'Get started'}
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
                <li>
                  <Link href="/guide" className="hover:text-[var(--vg-ink)] transition-colors">
                    User Guide
                  </Link>
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
