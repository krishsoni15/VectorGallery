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
  { href: '/#showcase', label: 'Product' },
  { href: '/#mobile', label: 'Mobile' },
  { href: '/#privacy', label: 'Open Source' },
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
          ? 'bg-[#FFFFFF]/90 dark:bg-[#090B0A]/90 backdrop-blur-2xl border-b border-[#DDE2DC] dark:border-white/[0.10] shadow-sm'
          : 'vg-transparent-header bg-transparent border-b border-transparent'
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-7 lg:px-10 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <VectorGalleryLogo size="sm" variant="horizontal" />
        </Link>

        {!minimal && (
          <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-medium text-[#555E58] dark:text-[#9AA69E]">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-[#101211] dark:hover:text-[#F3F5F1] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/install"
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[13px] transition-colors',
                router.pathname === '/install'
                  ? 'border-[#101211]/15 bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] font-semibold'
                  : 'border-[#DDE2DC] dark:border-white/[0.10] bg-[#FFFFFF] dark:bg-[#131715] hover:border-[#087F5B]/45 dark:hover:border-[#CFFF49]/45 text-[#101211] dark:text-[#F3F5F1]'
              )}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" />
              <span>Android App</span>
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
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium border border-[#E0E4DD] dark:border-white/[0.09] bg-[#FFFFFF] dark:bg-[#131614] text-[#181C19] dark:text-[#F2F3EF] hover:border-[#087F5B]/45 dark:hover:border-[#58D6A8]/45 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#58D6A8]" />
              <span>Android App</span>
            </Link>
          )}

          {!minimal && (
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#E0E4DD] dark:border-white/[0.09] bg-[#FFFFFF] dark:bg-[#131614] text-[#181C19] dark:text-[#F2F3EF]"
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
              className="md:hidden overflow-hidden border-t border-[#E0E4DD] dark:border-white/[0.09] bg-[#F2F3F0]/95 dark:bg-[#090B0A]/95 backdrop-blur-2xl"
            >
              <div className="px-5 py-4 space-y-2">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-sm font-medium text-[#181C19] dark:text-[#F2F3EF]"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/install"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-2.5 text-sm font-medium text-[#087F5B] dark:text-[#58D6A8]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Download Android App
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="pt-3 border-t border-[#E0E4DD] dark:border-white/[0.09] flex items-center justify-between">
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
