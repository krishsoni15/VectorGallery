import React, { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeSwitchProps {
  mode?: 'compact' | 'segmented'
  className?: string
}

export function ThemeSwitch({ mode = 'compact', className }: ThemeSwitchProps) {
  const [preference, setPreference] = useState<ThemePreference>('light')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const sync = () => {
      const saved = (localStorage.getItem('vm_theme') as ThemePreference | null) || 'system'
      setPreference(saved)
      setResolved(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    }
    sync()
    window.addEventListener('vm_theme_change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('vm_theme_change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const applyPref = (next: ThemePreference) => {
    setPreference(next)
    localStorage.setItem('vm_theme', next)
    const targetDark =
      next === 'dark' ||
      (next === 'system' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    const nextClass = targetDark ? 'dark' : 'light'
    setResolved(nextClass)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(nextClass)
    window.dispatchEvent(new Event('vm_theme_change'))
  }

  if (mode === 'segmented') {
    const items: { id: ThemePreference; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
      { id: 'light', label: 'Light', icon: Sun },
      { id: 'dark', label: 'Dark', icon: Moon },
      { id: 'system', label: 'System', icon: Monitor },
    ]
    return (
      <div
        role="group"
        aria-label="Theme preference"
        className={cn(
          'inline-flex items-center p-1 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface)]',
          className
        )}
      >
        {items.map((item) => {
          const Icon = item.icon
          const active = mounted ? preference === item.id : item.id === 'light'
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => applyPref(item.id)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
                active
                  ? 'bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] font-semibold shadow-sm'
                  : 'text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  const isDark = mounted && resolved === 'dark'

  return (
    <button
      type="button"
      onClick={() => applyPref(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-transparent hover:border-[#DDE2DC] dark:hover:border-white/[0.12] bg-transparent hover:bg-[#F2F3F0] dark:hover:bg-white/[0.08] text-[#555E58] hover:text-[#101211] dark:text-[#9AA69E] dark:hover:text-[#F3F5F1] transition-colors duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
        className
      )}
    >
      <span className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-[#58D6A8] transition-transform duration-300 rotate-0" />
        ) : (
          <Moon className="w-4 h-4 text-[#087F5B] transition-transform duration-300 rotate-0" />
        )}
      </span>
    </button>
  )
}
