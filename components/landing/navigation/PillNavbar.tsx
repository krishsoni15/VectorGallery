import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Github, Menu, Star, X } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_COMPONENTS } from '@/components/landing/design-system'
import { ThemeSwitch } from '@/components/landing/ThemeSwitch'
import { REPO_URL } from '@/components/landing/tokens'
import { cn } from '@/lib/utils'

interface PillNavbarProps {
  stars?: number | null
  hasLocalApk?: boolean
}

const NAV_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#search', label: 'Search' },
  { href: '#mobile', label: 'Mobile' },
  { href: '#privacy', label: 'Open Source' },
]

/**
 * Clean minimal pill navigation inspired directly by the Liquid Silver studio benchmark.
 */
export function PillNavbar({ stars, hasLocalApk = false }: PillNavbarProps) {
  void hasLocalApk
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const showStars = typeof stars === 'number' && stars > 0

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-[#FFFFFF]/88 dark:bg-[#090B0A]/88 backdrop-blur-xl border-b border-[var(--vg-border)] shadow-[0_6px_26px_-14px_rgba(16,18,17,0.12)]'
          : 'bg-[#FFFFFF]/95 dark:bg-[#090B0A]/95 border-b border-transparent'
      )}
    >
      <a href="#main-content" className="vg-skip-link">
        Skip to main content
      </a>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-7 lg:px-10 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Pill Nav Cluster matching benchmark */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <Link
            href="/"
            aria-label="VectorGallery Home"
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CFFF49] rounded-full"
          >
            <VectorGalleryLogo variant="animated" size="md" />
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden lg:inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-[#F2F3F0] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10]"
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(VG_COMPONENTS.buttons.ghost, 'whitespace-nowrap')}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Controls: Theme Toggle + Login + Pill Get Started */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeSwitch />

          {showStars && (
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub Repository (${stars} stars)`}
              className="hidden xl:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px] font-medium bg-[#F2F3F0] dark:bg-[#131715] text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] border border-[var(--vg-border)] transition-colors whitespace-nowrap"
            >
              <Github className="w-3.5 h-3.5" />
              <Star className="w-3 h-3 text-[#087F5B] dark:text-[#CFFF49]" />
              <span className="font-mono">{stars}</span>
            </a>
          )}

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center h-9 px-3.5 rounded-full text-[13.5px] font-medium text-[var(--vg-ink)] hover:bg-[#F2F3F0] dark:hover:bg-[#131715] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CFFF49]"
          >
            Sign in
          </Link>

          <Link
            href="/app"
            className={cn(VG_COMPONENTS.buttons.primarySm, 'hidden sm:inline-flex whitespace-nowrap')}
          >
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface)] text-[var(--vg-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CFFF49]"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-[var(--vg-border)] bg-[var(--vg-surface)]/95 backdrop-blur-xl px-5 py-4"
          >
            <div className="flex flex-col gap-1.5 text-[14.5px] font-medium text-[var(--vg-ink)]">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 px-3 rounded-xl hover:bg-[var(--vg-surface-2)] transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-[var(--vg-surface-2)] transition-colors flex items-center justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Repository
                </span>
                {showStars && <span className="text-[12px] font-mono text-[var(--vg-ink-2)]">{stars}</span>}
              </a>
              <div className="pt-3 mt-2 border-t border-[var(--vg-border)] flex items-center gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 h-10 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface-2)] flex items-center justify-center text-[13.5px] font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/app"
                  onClick={() => setMobileOpen(false)}
                  className={cn(VG_COMPONENTS.buttons.limePill, 'flex-1 h-10 px-4 text-[13.5px]')}
                >
                  <span>Get started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

