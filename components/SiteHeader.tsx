import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Menu, Smartphone, X } from 'lucide-react'
import { AccountMenu } from '@/components/AccountMenu'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

interface SiteHeaderProps {
  minimal?: boolean
}

const NAV_LINKS = [
  { href: '/#search-demo', label: 'Search' },
  { href: '/#features', label: 'Capabilities' },
  { href: '/#memories', label: 'Photos' },
  { href: '/#mobile', label: 'Android App' },
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
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-[#FFFFFF]/88 dark:bg-[#090F1C]/88 backdrop-blur-2xl border-b border-[#DCE6F3] dark:border-white/10 shadow-sm'
          : 'vg-transparent-header bg-transparent border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <VectorGalleryLogo size="sm" variant="horizontal" />
        </Link>

        {!minimal && (
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-[#14233B] dark:hover:text-[#F1F5FF] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/install"
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors',
                router.pathname === '/install'
                  ? 'border-[#397BEE]/40 bg-[#E0EDFF] dark:bg-[#1C3150] text-[#2563EB] dark:text-[#93C5FD]'
                  : 'border-[#DCE6F3] dark:border-white/15 bg-[#FFFFFF]/85 dark:bg-[#111B2D]/85 hover:border-[#397BEE]/45 text-[#14233B] dark:text-[#F1F5FF]'
              )}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
              <span>Download APK</span>
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {!minimal && (
            <div className="hidden sm:flex items-center gap-2">
              <AccountMenu />
            </div>
          )}

          {minimal && (
            <Link
              href="/install"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-medium border border-[#DCE6F3] dark:border-white/15 bg-[#FFFFFF] dark:bg-[#111B2D] text-[#14233B] dark:text-[#F1F5FF] hover:border-[#397BEE]/45 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
              <span>Android App</span>
            </Link>
          )}

          {!minimal && (
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#DCE6F3] dark:border-white/15 bg-[#FFFFFF] dark:bg-[#111B2D] text-[#14233B] dark:text-[#F1F5FF]"
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
              className="md:hidden overflow-hidden border-t border-[#DCE6F3] dark:border-white/10 bg-[#FFFFFF]/95 dark:bg-[#090F1C]/95 backdrop-blur-2xl"
            >
              <div className="px-5 py-4 space-y-2">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-sm font-medium text-[#14233B] dark:text-[#F1F5FF]"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/install"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-2.5 text-sm font-medium text-[#2563EB] dark:text-[#93C5FD]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Download Android App
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="pt-3 border-t border-[#DCE6F3] dark:border-white/10 flex items-center justify-between">
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
