import React, { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const sync = () => {
      const saved = localStorage.getItem('vm_theme')
      const resolved =
        saved === 'dark' ||
        (saved === 'system' &&
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches) ||
        document.documentElement.classList.contains('dark')
          ? 'dark'
          : 'light'
      setTheme(resolved)
    }
    sync()
    window.addEventListener('vm_theme_change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('vm_theme_change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('vm_theme', next)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(next)
    window.dispatchEvent(new Event('vm_theme_change'))
  }

  const isLight = mounted && theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE6F3] dark:border-white/15 bg-[#FFFFFF] dark:bg-[#111B2D] hover:bg-[#EDF4FF] dark:hover:bg-[#17243A] text-[#14233B] dark:text-[#F1F5FF] transition-all active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397BEE]',
        showLabel ? 'h-9 px-3 text-xs font-medium' : 'h-9 w-9',
        className
      )}
    >
      {isLight ? (
        <Moon className="w-4 h-4 text-[#2563EB]" />
      ) : (
        <Sun className="w-4 h-4 text-[#93C5FD]" />
      )}
      {showLabel && <span>{isLight ? 'Dark' : 'Light'}</span>}
    </button>
  )
}
