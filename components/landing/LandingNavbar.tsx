import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Github, Menu, Star, X } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_COMPONENTS } from '@/components/landing/design-system'
import { ThemeSwitch } from '@/components/landing/ThemeSwitch'
import { REPO_URL } from '@/components/landing/tokens'
import { cn } from '@/lib/utils'

interface LandingNavbarProps {
  stars?: number | null
  hasLocalApk?: boolean
}

const NAV_LINKS = [
  { href: '#showcase', label: 'Product' },
  { href: '#mobile', label: 'Mobile' },
  { href: '#privacy', label: 'Open Source' },
]

export function LandingNavbar({ stars, hasLocalApk = false }: LandingNavbarProps) {
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
      if (e.key === 'Escape') {
        setMobileOpen(false)
      }
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
          ? 'bg-[#FAFAF7]/85 dark:bg-[#0B0D0C]/85 backdrop-blur-xl border-b border-[var(--vg-border)] shadow-[0_4px_24px_-12px_rgba(24,28,25,0.08)]'
          : 'vg-transparent-header bg-transparent border-b border-transparent'
      )}
    >
      <a href="#main-content" className="vg-skip-link">
        Skip to main content
      </a>

      <div className="max-w-[1340px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="VectorGallery Home"
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)] rounded-full"
        >
          <VectorGalleryLogo variant="animated" size="md" />
        </Link>

        {/* Center Navigation — Strictly 3 links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-1 text-[14px] font-medium text-[var(--vg-ink-2)]"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={VG_COMPONENTS.buttons.ghost}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <ThemeSwitch />

          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="VectorGallery on GitHub"
            className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[#F0F1EC]/90 dark:hover:bg-[#171A18] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
            {showStars && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[var(--vg-surface-2)] text-[var(--vg-brand)]">
                <Star className="w-3 h-3 fill-current" />
                {stars}
              </span>
            )}
          </a>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center h-9 px-3.5 rounded-full text-[13.5px] font-medium text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[#F0F1EC]/90 dark:hover:bg-[#171A18] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
          >
            Sign in
          </Link>

          <Link href="/app" className={cn(VG_COMPONENTS.buttons.primarySm, 'hidden sm:inline-flex')}>
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface)] text-[var(--vg-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
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
            initial={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden border-t border-[var(--vg-border)] bg-[#FAFAF7]/96 dark:bg-[#0B0D0C]/96 backdrop-blur-2xl"
          >
            <div className="px-5 py-5 space-y-1.5">
              {[
                ...NAV_LINKS,
                { href: '#faq', label: 'FAQ' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-[15px] font-medium text-[var(--vg-ink)] hover:text-[var(--vg-brand)] transition-colors"
                >
                  {link.label}
                </a>
              ))}

              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-2.5 text-[15px] font-medium text-[var(--vg-ink)] hover:text-[var(--vg-brand)] transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </span>
                {showStars && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[var(--vg-surface-2)] text-[var(--vg-brand)]">
                    <Star className="w-3 h-3 fill-current" />
                    {stars}
                  </span>
                )}
              </a>

              <div className="pt-3 border-t border-[var(--vg-border)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[var(--vg-ink-2)]">Appearance</span>
                  <ThemeSwitch mode="segmented" />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className={cn(VG_COMPONENTS.buttons.secondary, 'h-11')}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/app"
                    onClick={() => setMobileOpen(false)}
                    className={cn(VG_COMPONENTS.buttons.primary, 'h-11')}
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
