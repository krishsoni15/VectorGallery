import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Github, Menu, X } from 'lucide-react'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_COMPONENTS, VG_LAYOUT } from '@/components/landing/design-system'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { ThemeSwitch } from '@/components/landing/ThemeSwitch'
import { REPO_URL } from '@/components/landing/tokens'
import { cn } from '@/lib/utils'

interface PillNavbarProps {
  stars?: number | null
  hasLocalApk?: boolean
}

const NAV_LINKS = [
  { id: 'showcase', href: '#search', label: 'Product' },
  { id: 'scroll-story', href: '#scroll-story', label: 'Experience' },
  { id: 'mobile', href: '#mobile', label: 'Mobile' },
  { id: 'privacy', href: '#privacy', label: 'Open source' },
]

/**
 * Refined Floating Inner Navigation Dock with animated active-section indicator,
 * scroll-reactive blur surface, and clean accessible mobile drawer.
 */
export function PillNavbar({ stars, hasLocalApk = false }: PillNavbarProps) {
  void hasLocalApk
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string>('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
    const sectionMap: Record<string, string> = {
      overview: 'overview',
      'scroll-story': 'scroll-story',
      search: 'showcase',
      showcase: 'showcase',
      mobile: 'mobile',
      privacy: 'privacy',
    }
    const targets = Object.keys(sectionMap)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (targets.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setActiveId(sectionMap[visible[0].target.id] || 'overview')
        }
      },
      { rootMargin: '-28% 0px -52% 0px', threshold: [0.05, 0.25, 0.5] }
    )

    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
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
          ? 'bg-[#FFFFFF]/82 dark:bg-[#090B0D]/84 backdrop-blur-2xl backdrop-saturate-150 border-b border-[#101211]/[0.08] dark:border-white/[0.10] shadow-[0_8px_28px_-14px_rgba(16,18,17,0.12)] dark:shadow-[0_10px_32px_-14px_rgba(0,0,0,0.65)]'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <a href="#main-content" className="vg-skip-link">
        Skip to main content
      </a>

      <div className={cn(VG_LAYOUT.containers.navbar, 'h-16 lg:h-[74px] flex items-center justify-between gap-4')}>
        {/* Left: Brand Wordmark + Original Symbol */}
        <Link
          href="/"
          aria-label="VectorGallery Home"
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45] rounded-full"
        >
          <VectorGalleryLogo variant="animated" size="md" />
        </Link>

        {/* Center: Floating Inner Dock with Active Section Indicator */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:inline-flex items-center gap-0.5 p-1 rounded-full bg-[#FFFFFF]/82 dark:bg-[#111416]/82 backdrop-blur-2xl border border-[#101211]/[0.08] dark:border-white/[0.10] shadow-sm"
        >
          {NAV_LINKS.map((item) => {
            const isActive = activeId === item.id
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setActiveId(item.id)}
                className={cn(
                  'relative px-4 py-1.5 rounded-full text-[13px] xl:text-[13.5px] font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]',
                  isActive
                    ? 'text-[#101211] dark:text-[#F4F6F2] font-semibold'
                    : 'text-[#606961] dark:text-[#A4AEA9] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={reduced ? undefined : 'nav-active-pill'}
                    transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-[#E9EDE8] dark:bg-white/[0.11] -z-10"
                  />
                )}
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={showStars ? `Open Source on GitHub (${stars} stars)` : 'Open Source Repository on GitHub'}
            className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12.5px] font-medium text-[#606961] dark:text-[#A4AEA9] hover:text-[#101211] dark:hover:text-[#F4F6F2] hover:bg-[#E9EDE8]/70 dark:hover:bg-white/[0.08] border border-transparent hover:border-[#101211]/[0.08] dark:hover:border-white/[0.10] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
            {showStars && (
              <span className="font-mono text-[11px] text-[#087F5B] dark:text-[#CDFF45]">
                {stars}
              </span>
            )}
          </a>

          <ThemeSwitch />

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center h-9 px-3.5 rounded-full text-[13px] font-medium text-[#606961] dark:text-[#A4AEA9] hover:text-[#101211] dark:hover:text-[#F4F6F2] hover:bg-[#E9EDE8]/70 dark:hover:bg-white/[0.08] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]"
          >
            Sign in
          </Link>

          <Link
            href="/app"
            className={cn(VG_COMPONENTS.buttons.primarySm, 'hidden sm:inline-flex h-9 lg:h-9 px-4 lg:px-5 whitespace-nowrap')}
          >
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface)] text-[var(--vg-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
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
