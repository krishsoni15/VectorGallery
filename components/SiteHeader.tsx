import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Menu, Smartphone, X } from 'lucide-react'
import { AccountMenu } from '@/components/AccountMenu'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_COMPONENTS, VG_LAYOUT } from '@/components/landing/design-system'
import { ThemeSwitch } from '@/components/landing/ThemeSwitch'
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
          ? 'bg-[#FFFFFF]/78 dark:bg-[#090B0A]/78 backdrop-blur-2xl backdrop-saturate-150 border-b border-[#101211]/[0.08] dark:border-white/[0.10] shadow-sm'
          : 'vg-transparent-header bg-[#FFFFFF]/72 dark:bg-[#090B0A]/68 backdrop-blur-2xl backdrop-saturate-150 border-b border-[#101211]/[0.05] dark:border-white/[0.06]'
      )}
    >
      <div className={cn(VG_LAYOUT.containers.navbar, 'h-16 lg:h-[76px] flex items-center justify-between gap-4')}>
        <Link href="/" className="shrink-0">
          <VectorGalleryLogo size="md" variant="horizontal" />
        </Link>

        {!minimal && (
          <nav
            aria-label="Secondary navigation"
            className="hidden md:inline-flex items-center gap-0.5 xl:gap-1 px-2.5 py-1.5 rounded-full bg-[#FFFFFF]/60 dark:bg-white/[0.06] backdrop-blur-2xl border border-[#101211]/[0.09] dark:border-white/[0.14] shadow-[0_6px_24px_-10px_rgba(16,18,17,0.10),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]"
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(VG_COMPONENTS.buttons.ghost, 'text-[13.5px] whitespace-nowrap')}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/install"
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] transition-colors whitespace-nowrap',
                router.pathname === '/install'
                  ? 'bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] font-semibold'
                  : 'text-[var(--vg-ink)] hover:bg-[#FFFFFF]/80 dark:hover:bg-[#202522]'
              )}
            >
              <Smartphone
                className={cn(
                  'w-3.5 h-3.5',
                  router.pathname === '/install'
                    ? 'text-[#101211]'
                    : 'text-[#087F5B] dark:text-[#CFFF49]'
                )}
              />
              <span>Android App</span>
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2.5">
          <ThemeSwitch />

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
                  className="flex items-center justify-between py-2.5 text-sm font-medium text-[#087F5B] dark:text-[#CFFF49]"
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
