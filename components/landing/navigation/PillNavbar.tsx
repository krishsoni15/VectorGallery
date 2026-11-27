import React, { useEffect, useRef, useState } from 'react'
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
  { id: 'experience', href: '#scroll-story', label: 'Experience' },
  { id: 'product', href: '#search', label: 'Product' },
  { id: 'mobile', href: '#mobile', label: 'Mobile' },
  { id: 'opensource', href: '#privacy', label: 'Open source' },
]

/**
 * Slim, symmetrical Liquid Titanium / Obsidian Volt Navigation Bar.
 * Places brand + minimal navigation pill cleanly on the left balanced against compact utilities on the right,
 * smoothly hides when scrolling down so full-viewport scroll scenes breathe cleanly, and reappears on upward scroll.
 */
export function PillNavbar({ stars, hasLocalApk = false }: PillNavbarProps) {
  void hasLocalApk
  const [scrolled, setScrolled] = useState(false)
  const [hiddenOnDown, setHiddenOnDown] = useState(false)
  const [activeId, setActiveId] = useState<string>('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const lastYRef = useRef(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (typeof window === 'undefined') return
    lastYRef.current = window.scrollY

    let ticking = false
    const updateNav = () => {
      ticking = false
      const y = window.scrollY
      setScrolled(y > 16)

      if (y <= 80 || mobileOpen) {
        setHiddenOnDown(false)
      } else {
        const delta = y - lastYRef.current
        if (delta > 6) setHiddenOnDown(true)
        else if (delta < -5) setHiddenOnDown(false)
      }
      lastYRef.current = y

      // Accurate vertical center scroll-spy
      const midY = y + window.innerHeight * 0.42
      const probes: Array<{ el: HTMLElement | null; navId: string }> = [
        { el: document.getElementById('overview'), navId: '' },
        { el: document.getElementById('scroll-story'), navId: 'experience' },
        { el: document.getElementById('search'), navId: 'product' },
        { el: document.getElementById('showcase'), navId: 'product' },
        { el: document.getElementById('mobile'), navId: 'mobile' },
        { el: document.getElementById('privacy'), navId: 'opensource' },
      ]

      let current = ''
      for (const p of probes) {
        if (!p.el) continue
        const top = p.el.getBoundingClientRect().top + y
        if (midY >= top) current = p.navId
      }
      setActiveId(current)
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(updateNav)
      }
    }

    updateNav()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [mobileOpen])

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
        'fixed top-0 inset-x-0 z-50 w-full transition-[transform,opacity,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        hiddenOnDown && !mobileOpen
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100',
        scrolled
          ? 'bg-[#FFFFFF]/95 dark:bg-[#090B0D]/95 backdrop-blur-2xl backdrop-saturate-150 border-b border-[#101211]/[0.08] dark:border-white/[0.10] shadow-[0_8px_24px_-14px_rgba(16,18,17,0.12)] dark:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.68)]'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <a href="#main-content" className="vg-skip-link">
        Skip to main content
      </a>

      <div className={cn(VG_LAYOUT.containers.navbar, 'h-14 flex items-center justify-between gap-4')}>
        {/* LEFT GROUP: Brand Identity + Clean Minimalist Navigation Pill */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <Link
            href="/"
            aria-label="VectorGallery Home"
            onClick={() => setActiveId('')}
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45] rounded-full"
          >
            <VectorGalleryLogo variant="animated" size="sm" />
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden lg:inline-flex isolate items-center gap-0.5 p-1 rounded-full bg-[#FFFFFF]/75 dark:bg-[#111416]/75 backdrop-blur-xl border border-[#101211]/[0.07] dark:border-white/[0.09]"
          >
            {NAV_LINKS.map((item) => {
              const isActive = activeId === item.id
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'location' : undefined}
                  data-active={isActive ? 'true' : undefined}
                  onClick={() => setActiveId(item.id)}
                  className={cn(
                    'relative px-3.5 py-1 rounded-full text-[12.5px] font-medium transition-[background-color,border-color] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]',
                    isActive
                      ? 'text-[#101211] dark:text-[#F4F6F2] font-semibold'
                      : 'text-[#606961] dark:text-[#A4AEA9] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId={reduced ? undefined : 'nav-active-pill'}
                      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-[#E9EDE8] dark:bg-white/[0.15] border border-[#101211]/[0.06] dark:border-white/[0.12] z-0"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              )
            })}
          </nav>
        </div>

        {/* RIGHT GROUP: Symmetric Utility Actions + Primary CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={showStars ? `Open Source on GitHub (${stars} stars)` : 'Open Source Repository on GitHub'}
            className="hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px] font-medium text-[#606961] dark:text-[#A4AEA9] hover:text-[#101211] dark:hover:text-[#F4F6F2] hover:bg-[#FFFFFF]/75 dark:hover:bg-white/[0.08] border border-transparent hover:border-[#101211]/[0.08] dark:hover:border-white/[0.10] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
            {showStars && (
              <span className="font-mono text-[11px] text-[#087F5B] dark:text-[#CDFF45]">
                {stars}
              </span>
            )}
          </a>

          <ThemeSwitch className="w-8 h-8" />

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center h-8 px-3 rounded-full text-[12.5px] font-medium text-[#606961] dark:text-[#A4AEA9] hover:text-[#101211] dark:hover:text-[#F4F6F2] hover:bg-[#FFFFFF]/75 dark:hover:bg-white/[0.08] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]"
          >
            Sign in
          </Link>

          <Link
            href="/app"
            className={cn(VG_COMPONENTS.buttons.primarySm, 'hidden sm:inline-flex h-8 lg:h-8 px-3.5 lg:px-4 text-[12.5px] whitespace-nowrap')}
          >
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface)] text-[var(--vg-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]"
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
            className="lg:hidden overflow-hidden border-t border-[var(--vg-border)] bg-[#FFFFFF]/95 dark:bg-[#111416]/95 backdrop-blur-xl px-5 py-4"
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
