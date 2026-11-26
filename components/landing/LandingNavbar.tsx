import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronDown,
  Download,
  FolderHeart,
  Github,
  Menu,
  Search,
  Smartphone,
  Star,
  X,
} from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { ThemeSwitch } from '@/components/landing/ThemeSwitch'
import { REPO_URL } from '@/components/landing/tokens'
import { cn } from '@/lib/utils'

interface LandingNavbarProps {
  stars?: number | null
  hasLocalApk?: boolean
}

const FEATURE_DROPDOWN = [
  {
    href: '#search-demo',
    title: 'Interactive Search',
    desc: 'Try natural-language retrieval on a sample workspace.',
    icon: Search,
  },
  {
    href: '#features',
    title: 'Core Capabilities',
    desc: 'OCR extraction, AI chat citations & SHA-256 dedupe.',
    icon: FolderHeart,
  },
  {
    href: '#memories',
    title: 'Photo Memories',
    desc: 'Organize photography, travel frames & screenshots.',
    icon: Smartphone,
  },
  {
    href: '#formats',
    title: 'Supported Formats',
    desc: 'Images, PDFs, Office files, video & audio specs.',
    icon: Download,
  },
]

export function LandingNavbar({ stars, hasLocalApk = false }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-[#FFFFFF]/88 dark:bg-[#111B2D]/88 backdrop-blur-2xl border-b border-[var(--vg-border)] shadow-[0_4px_24px_-8px_rgba(20,35,59,0.08)]'
          : 'vg-transparent-header bg-transparent border-b border-transparent'
      )}
    >
      <a href="#main-content" className="vg-skip-link">
        Skip to main content
      </a>

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="VectorGallery Home"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)] rounded-xl"
        >
          <VectorGalleryLogo variant="animated" size="md" />
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 text-[14px] font-medium text-[var(--vg-ink-2)]">
          {/* Features Accessible Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              onClick={() => setDropdownOpen((v) => !v)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg hover:text-[var(--vg-ink)] hover:bg-[var(--vg-surface-soft)]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
            >
              <span>Features</span>
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', dropdownOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 mt-2 w-80 p-2 rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-card)] z-50"
                >
                  {FEATURE_DROPDOWN.map((item) => {
                    const Icon = item.icon
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--vg-surface-2)] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[var(--vg-ink)]">{item.title}</p>
                          <p className="text-[12px] text-[var(--vg-ink-2)] leading-snug">{item.desc}</p>
                        </div>
                      </a>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="#how-it-works" className="px-3 py-2 rounded-lg hover:text-[var(--vg-ink)] hover:bg-[var(--vg-surface-soft)]/60 transition-colors">
            How it works
          </a>
          <a href="#mobile" className="px-3 py-2 rounded-lg hover:text-[var(--vg-ink)] hover:bg-[var(--vg-surface-soft)]/60 transition-colors">
            Mobile
          </a>
          <a href="#developers" className="px-3 py-2 rounded-lg hover:text-[var(--vg-ink)] hover:bg-[var(--vg-surface-soft)]/60 transition-colors">
            Developers
          </a>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-[var(--vg-ink)] hover:bg-[var(--vg-surface-soft)]/60 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
            {typeof stars === 'number' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[var(--vg-surface-soft)] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
                <Star className="w-3 h-3 fill-current" />
                {stars}
              </span>
            )}
          </a>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <ThemeSwitch />

          <Link
            href="/install"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[13px] font-medium border border-[var(--vg-border)] bg-[var(--vg-surface)] hover:bg-[var(--vg-surface-2)] text-[var(--vg-ink)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
          >
            <Download className="w-3.5 h-3.5 text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]" />
            <span>{hasLocalApk ? 'Download APK' : 'Android App'}</span>
          </Link>

          <Link
            href="/app"
            className="vg-blue-cta hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] shadow-sm transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB8FF]"
          >
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--vg-border)] bg-[var(--vg-surface)] text-[var(--vg-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24 }}
            className="lg:hidden overflow-hidden border-t border-[var(--vg-border)] bg-[var(--vg-surface)]/95 backdrop-blur-2xl"
          >
            <div className="px-5 py-5 space-y-2">
              {[
                { href: '#features', label: 'Features' },
                { href: '#search-demo', label: 'Interactive Search' },
                { href: '#how-it-works', label: 'How it works' },
                { href: '#mobile', label: 'Mobile & Backup' },
                { href: '#developers', label: 'Developers & Install' },
                { href: '#faq', label: 'FAQ' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-[15px] font-medium text-[var(--vg-ink)] hover:text-[var(--vg-brand-interactive)]"
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-3 border-t border-[var(--vg-border)] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[var(--vg-ink-2)]">Appearance</span>
                  <ThemeSwitch mode="segmented" />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <Link
                    href="/install"
                    onClick={() => setMobileOpen(false)}
                    className="h-11 rounded-xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)] text-[13px] font-semibold text-[var(--vg-ink)] flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-[var(--vg-brand-interactive)]" />
                    <span>Android App</span>
                  </Link>
                  <Link
                    href="/app"
                    onClick={() => setMobileOpen(false)}
                    className="vg-blue-cta h-11 rounded-xl bg-[#2563EB] text-[#FFFFFF] text-[13px] font-semibold flex items-center justify-center gap-1.5"
                  >
                    <span>Get started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

