import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/AuthContext'

interface AccountMenuProps {
  onOpenSettings?: () => void
}

export const AccountMenu: React.FC<AccountMenuProps> = ({ onOpenSettings }) => {
  const { user, signOut, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [localEmail, setLocalEmail] = useState<string | null>(null)
  const [localName, setLocalName] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const syncUser = () => {
      if (typeof window !== 'undefined') {
        setLocalEmail(localStorage.getItem('vm_user_email'))
        setLocalName(localStorage.getItem('vm_user_name'))
      }
    }
    syncUser()

    window.addEventListener('storage', syncUser)
    window.addEventListener('vectormind_auth_change', syncUser)
    const interval = setInterval(syncUser, 1500)
    return () => {
      window.removeEventListener('storage', syncUser)
      window.removeEventListener('vectormind_auth_change', syncUser)
      clearInterval(interval)
    }
  }, [router.pathname, user])

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-zinc-200/80 dark:bg-white/10 animate-pulse border border-zinc-300/60 dark:border-white/10" />
    )
  }

  const activeEmail = user?.email || localEmail
  const activeName = user?.user_metadata?.full_name || localName || activeEmail

  if (!activeEmail) {
    if (router.pathname === '/app') {
      return (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 p-1 rounded-full bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-white/10 hover:border-emerald-500/50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            title="Guest Workspace Account"
            aria-label="Account Menu"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-zinc-950 font-bold flex items-center justify-center text-xs">
              G
            </div>
            <svg
              className={`w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 mr-1 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-[#101318]/95 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-xl z-50 overflow-hidden font-sans">
              <div className="p-4 border-b border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02]">
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Guest Workspace
                </p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                  Local Session Active
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Free Workspace Session
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors font-medium"
                >
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In Account
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Free Account
                </Link>
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="h-9 px-3.5 inline-flex items-center rounded-full text-[13px] font-medium text-[#181C19] dark:text-[#A3ADA5] hover:bg-[#F0F1EC] dark:hover:bg-[#171A18] hover:text-[#087F5B] dark:hover:text-[#F2F3EF] transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/app"
          className="vg-cta h-9 px-4 inline-flex items-center rounded-full text-[13px] font-semibold bg-[#087F5B] hover:bg-[#066649] text-[#FFFFFF] dark:bg-[#58D6A8] dark:hover:bg-[#70DFB7] dark:text-[#071912] shadow-sm transition-all active:scale-[0.98]"
        >
          Get started
        </Link>
      </div>
    )
  }

  const displayInitial = (activeName || activeEmail || 'U').charAt(0).toUpperCase()

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vm_user_email')
      localStorage.removeItem('vm_user_name')
      document.cookie = 'sb-access-token=; path=/; max-age=0'
      window.dispatchEvent(new Event('vectormind_auth_change'))
    }
    setLocalEmail(null)
    setLocalName(null)
    await signOut()
    setIsOpen(false)
    router.push('/login')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-white/10 hover:border-emerald-500/50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        title={activeEmail || 'Account'}
        aria-label="Account Menu"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-zinc-950 font-bold flex items-center justify-center text-xs">
          {displayInitial}
        </div>
        <svg
          className={`w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 mr-1 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-[#101318]/95 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-xl z-50 overflow-hidden font-sans">
          <div className="p-4 border-b border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02]">
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Signed in as
            </p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate mt-0.5" title={activeEmail}>
              {activeEmail}
            </p>
            {activeName && activeName !== activeEmail && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{activeName}</p>
            )}
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Session
            </div>
          </div>

          <div className="p-1.5 space-y-0.5">
            {router.pathname === '/app' ? (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors text-left font-medium"
              >
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Workspaces Dashboard
              </button>
            ) : (
              <Link
                href="/app"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors font-medium"
              >
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Workspaces Dashboard
              </Link>
            )}

            {onOpenSettings ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onOpenSettings()
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors text-left font-medium"
              >
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                API Keys & Settings
              </button>
            ) : (
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors font-medium"
              >
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                API Keys & Settings
              </Link>
            )}
          </div>

          <div className="p-1.5 border-t border-zinc-200/80 dark:border-white/[0.08]">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
