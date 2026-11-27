import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Github, Menu, Star, X } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_COMPONENTS, VG_LAYOUT } from '@/components/landing/design-system'
import { useClientReducedMotion } from '@/components/landing/motion/LivingMotionPrimitives'
import { ThemeSwitch } from '@/components/landing/ThemeSwitch'
import { REPO_URL } from '@/components/landing/tokens'
import { cn } from '@/lib/utils'

interface PillNavbarProps {
  stars?: number | null
  hasLocalApk?: boolean
}

const NAV_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#scroll-story', label: 'How it works' },
  { href: '#search', label: 'Search' },
  { href: '#showcase', label: 'Workspace' },
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
  const reduced = useClientReducedMotion()

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
        'sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-2xl backdrop-saturate-150',
        scrolled
          ? 'bg-[#FFFFFF]/78 dark:bg-[#090B0A]/78 border-b border-[#101211]/[0.08] dark:border-white/[0.10] shadow-[0_8px_32px_-14px_rgba(16,18,17,0.14),inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[0_10px_34px_-14px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.07)]'
          : 'bg-[#FFFFFF]/72 dark:bg-[#090B0A]/68 border-b border-[#101211]/[0.05] dark:border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
      )}
    >
      <a href="#main-content" className="vg-skip-link">
        Skip to main content
      </a>

      <div className={cn(VG_LAYOUT.containers.navbar, 'h-16 lg:h-[76px] flex items-center justify-between gap-4')}>
        {/* Left: Brand Logo (flush with monumental wordmark left rail) */}
        <Link
          href="/"
          aria-label="VectorGallery Home"
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CFFF49] rounded-full"
        >
          <VectorGalleryLogo variant="animated" size="md" />
        </Link>

        {/* Center: Frosted Liquid-Glass Navigation Pill */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:inline-flex items-center gap-0.5 xl:gap-1 px-2.5 py-1.5 rounded-full bg-[#FFFFFF]/60 dark:bg-white/[0.06] backdrop-blur-2xl backdrop-saturate-150 border border-[#101211]/[0.09] dark:border-white/[0.14] shadow-[0_6px_24px_-10px_rgba(16,18,17,0.10),inset_0_1px_1px_rgba(255,255,255,0.92)] dark:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.12)]"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(VG_COMPONENTS.buttons.ghost, 'text-[13.5px] xl:text-[14px] px-3 xl:px-3.5 whitespace-nowrap')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Controls: Theme Toggle + Open-Source GitHub + Sign in + Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0">
          <ThemeSwitch />

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={showStars ? `Open Source on GitHub (${stars} stars)` : 'Open Source Repository on GitHub'}
            className="hidden md:inline-flex items-center gap-1.5 h-9 lg:h-10 px-3.5 rounded-full text-[12.5px] lg:text-[13px] font-medium bg-[#FFFFFF]/65 dark:bg-white/[0.06] backdrop-blur-xl text-[#101211] dark:text-[#F3F5F1] hover:bg-[#FFFFFF] dark:hover:bg-white/[0.12] border border-[#101211]/[0.10] dark:border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-none transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CFFF49]"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
            {showStars && (
              <span className="inline-flex items-center gap-1 pl-1.5 ml-0.5 border-l border-[#101211]/15 dark:border-white/[0.15] font-mono text-[11.5px] text-[#087F5B] dark:text-[#CFFF49]">
                <Star className="w-3 h-3 fill-current" />
                {stars}
              </span>
            )}
          </a>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center h-9 lg:h-10 px-3.5 lg:px-4 rounded-full text-[13.5px] xl:text-[14px] font-medium text-[var(--vg-ink)] hover:bg-[#101211]/[0.05] dark:hover:bg-white/[0.08] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CFFF49]"
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

