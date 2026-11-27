import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Github, Menu, Smartphone, X } from 'lucide-react'
import { AccountMenu } from '@/components/AccountMenu'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_LAYOUT } from '@/components/landing/design-system'
import { ThemeSwitch } from '@/components/landing/ThemeSwitch'
import { REPO_URL } from '@/components/landing/tokens'
import { cn } from '@/lib/utils'

interface SiteHeaderProps {
  minimal?: boolean
}

const NAV_LINKS = [
  { href: '/#scroll-story', label: 'Experience' },
  { href: '/#search', label: 'Product' },
  { href: '/#mobile', label: 'Mobile' },
  { href: '/#privacy', label: 'Open source' },
]

export function SiteHeader({ minimal = false }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [router.asPath])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300',
        scrolled
          ? 'bg-[#FFFFFF]/95 dark:bg-[#090B0D]/95 backdrop-blur-2xl backdrop-saturate-150 border-b border-[#101211]/[0.08] dark:border-white/[0.10] shadow-sm'
          : 'bg-[#FFFFFF]/85 dark:bg-[#090B0D]/85 backdrop-blur-2xl backdrop-saturate-150 border-b border-[#101211]/[0.06] dark:border-white/[0.08]'
      )}
    >
      <div className={cn(VG_LAYOUT.containers.navbar, 'h-14 flex items-center justify-between gap-4')}>
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <Link href="/" className="shrink-0">
            <VectorGalleryLogo size="sm" variant="horizontal" />
          </Link>

          {!minimal && (
            <nav
              aria-label="Secondary navigation"
              className="hidden md:inline-flex isolate items-center gap-0.5 p-1 rounded-full bg-[#FFFFFF]/75 dark:bg-[#111416]/75 backdrop-blur-xl border border-[#101211]/[0.07] dark:border-white/[0.09]"
            >
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3.5 py-1 rounded-full text-[12.5px] font-medium text-[#606961] dark:text-[#A4AEA9] hover:text-[#101211] dark:hover:text-[#F4F6F2] transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/install"
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12.5px] font-medium transition-colors whitespace-nowrap',
                  router.pathname === '/install'
                    ? 'bg-[#E9EDE8] dark:bg-white/[0.15] text-[#101211] dark:text-[#F4F6F2] font-semibold border border-[#101211]/[0.06] dark:border-white/[0.12]'
                    : 'text-[#606961] dark:text-[#A4AEA9] hover:text-[#101211] dark:hover:text-[#F4F6F2]'
                )}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CDFF45]" />
                <span>Android App</span>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Source Repository on GitHub"
            className="hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px] font-medium text-[#606961] dark:text-[#A4AEA9] hover:text-[#101211] dark:hover:text-[#F4F6F2] hover:bg-[#FFFFFF]/75 dark:hover:bg-white/[0.08] border border-transparent hover:border-[#101211]/[0.08] dark:hover:border-white/[0.10] transition-colors whitespace-nowrap"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          <ThemeSwitch />

          {!minimal && (
            <div className="hidden sm:flex items-center gap-2">
              <AccountMenu />
            </div>
          )}

          {minimal && (
            <Link
              href="/install"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium border border-[var(--vg-border)] bg-[var(--vg-surface)] text-[var(--vg-ink)] hover:border-[#087F5B]/45 dark:hover:border-[#CDFF45]/45 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CDFF45]" />
              <span>Android App</span>
            </Link>
          )}

          {!minimal && (
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface)] text-[var(--vg-ink)]"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {!minimal && (
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden overflow-hidden border-t border-[var(--vg-border)] bg-[#FFFFFF]/95 dark:bg-[#111416]/95 backdrop-blur-2xl"
            >
              <div className="px-5 py-4 space-y-2">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-sm font-medium text-[#101211] dark:text-[#F4F6F2]"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/install"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-2.5 text-sm font-medium text-[#087F5B] dark:text-[#CDFF45]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Download Android App
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="pt-3 border-t border-[var(--vg-border)] flex items-center justify-between">
                  <AccountMenu />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </header>
  )
}
