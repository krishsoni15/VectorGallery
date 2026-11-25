import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Home,
  Search,
  Zap,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Download,
  FolderHeart,
  Clock,
  Star,
  Trash2,
  HardDrive,
  Smartphone,
  Settings,
  User,
  Plus,
  UploadCloud,
  ChevronRight,
  LogOut,
  Folder,
  X,
  Menu,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export type NavItemKey =
  | 'home'
  | 'search'
  | 'assistant'
  | 'photos'
  | 'videos'
  | 'documents'
  | 'audio'
  | 'downloads'
  | 'collections'
  | 'recent'
  | 'favorites'
  | 'trash'
  | 'settings'

interface AppLayoutProps {
  activeTab: NavItemKey
  onSelectTab: (tab: NavItemKey) => void
  onOpenSearch: () => void
  onOpenUpload: () => void
  storageStats?: {
    formatted_used: string
    formatted_quota: string
    percent_used: number
  }
  connectedDevicesCount?: number
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenUpload,
  storageStats = { formatted_used: '0 B', formatted_quota: '15 GB', percent_used: 0 },
  connectedDevicesCount = 0,
  children,
}) => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    const syncTheme = () => {
      if (typeof document !== 'undefined') {
        setIsLight(document.documentElement.classList.contains('light'))
      }
    }
    syncTheme()
    window.addEventListener('vm_theme_change', syncTheme)
    return () => window.removeEventListener('vm_theme_change', syncTheme)
  }, [])

  const toggleTheme = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem('vm_theme', isLight ? 'dark' : 'light')
    window.dispatchEvent(new Event('vm_theme_change'))
  }

  const navItems = [
    { key: 'photos' as NavItemKey, label: 'Photos', icon: ImageIcon },
    { key: 'home' as NavItemKey, label: 'Memories Dashboard', icon: Home },
    { key: 'assistant' as NavItemKey, label: 'Assistant', icon: Zap, badge: 'AI' },
    { key: 'search' as NavItemKey, label: 'AI Search', icon: Search, action: onOpenSearch },
    { key: 'collections' as NavItemKey, label: 'Albums & Collections', icon: FolderHeart },
    { key: 'documents' as NavItemKey, label: 'Documents', icon: FileText },
    { key: 'videos' as NavItemKey, label: 'Videos', icon: Video },
    { key: 'audio' as NavItemKey, label: 'Audio', icon: Music },
    { key: 'favorites' as NavItemKey, label: 'Favorites', icon: Star },
    { key: 'recent' as NavItemKey, label: 'Recent', icon: Clock },
    { key: 'downloads' as NavItemKey, label: 'Downloads', icon: Download },
    { key: 'trash' as NavItemKey, label: 'Trash', icon: Trash2 },
  ]

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (item.action) {
      item.action()
    } else {
      onSelectTab(item.key)
    }
    setMobileMenuOpen(false)
  }

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Personal Vault'

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090A0D] text-[#F4F5F7] font-sans antialiased">
      {/* ─── Mobile Slide-over Navigation Drawer ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-[#0E1015] border-r border-white/[0.08] flex flex-col h-full z-10 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <img
                  src="/vectorgallery-icon.svg"
                  alt="VectorGallery"
                  className="w-8 h-8 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.28)]"
                />
                <div>
                  <span className="font-semibold text-xs text-white block">VectorGallery</span>
                  <span className="text-[9px] text-zinc-400 font-mono">PERSONAL CLOUD</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation items */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.key
                const isCollectionsDivider = item.key === 'collections'

                return (
                  <React.Fragment key={item.key}>
                    {isCollectionsDivider && (
                      <div className="pt-2 pb-1 px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 border-t border-white/[0.04] mt-2">
                        <span>Collections</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                          : 'text-zinc-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                )
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-white/[0.08] space-y-2 bg-black/40">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>{storageStats.formatted_used} of {storageStats.formatted_quota}</span>
                <span className="text-emerald-400 font-mono">{storageStats.percent_used}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.max(2, Math.min(100, storageStats.percent_used))}%` }}
                />
              </div>
              <button
                onClick={() => {
                  onSelectTab('settings')
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-white/[0.05]"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Settings & Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Desktop Left Navigation Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-white/[0.07] bg-[#0E1015]/80 backdrop-blur-xl select-none">
        {/* Brand & Logo Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.07]">
          <Link href="/app" className="flex items-center gap-2.5 group">
            <img
              src="/vectorgallery-icon.svg"
              alt="VectorGallery"
              className="w-8 h-8 rounded-xl shadow-[0_0_16px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-semibold text-sm tracking-tight text-white block leading-none">
                VectorGallery
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider block mt-0.5">
                PERSONAL CLOUD
              </span>
            </div>
          </Link>
          <button
            onClick={onOpenUpload}
            title="Upload File (Cmd+U)"
            className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors border border-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 12-Item Desktop Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.key
            const isCollectionsDivider = item.key === 'collections'

            return (
              <React.Fragment key={item.key}>
                {isCollectionsDivider && (
                  <div className="pt-3 pb-1 px-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 border-t border-white/[0.04] mt-2">
                    <span>Collections</span>
                  </div>
                )}
                <button
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            )
          })}
        </div>

        {/* Bottom Section: Storage, Devices, Settings, User Profile */}
        <div className="p-3 border-t border-white/[0.07] space-y-2 bg-[#0A0C0F]/60">
          {/* Real Storage Usage Bar */}
          <div className="px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Storage
              </span>
              <span className="font-mono text-zinc-300">{storageStats.formatted_used} / {storageStats.formatted_quota}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(2, Math.min(100, storageStats.percent_used))}%` }}
              />
            </div>
          </div>

          {/* Device Sync Status */}
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
              {connectedDevicesCount > 0 ? `${connectedDevicesCount} Device${connectedDevicesCount > 1 ? 's' : ''}` : 'No devices'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cloud Sync
            </span>
          </div>

          {/* Settings & User Profile Controls */}
          <div className="pt-1 flex items-center justify-between gap-1 border-t border-white/[0.04]">
            <button
              onClick={() => onSelectTab('settings')}
              className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                activeTab === 'settings'
                  ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Profile Tile */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white/[0.02]">
            <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">{userDisplayName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'Local User'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Shell ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header (Google Photos Style) */}
        <header className="h-16 border-b border-white/[0.07] px-4 sm:px-6 flex items-center justify-between bg-[#0B0D12]/60 backdrop-blur-md shrink-0 gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-zinc-100 capitalize hidden sm:flex items-center gap-2">
              {activeTab === 'home' ? 'Digital Memory Dashboard' : activeTab.replace('-', ' ')}
            </h1>
          </div>

          {/* Centered Google Photos Style Search Pill */}
          <div className="flex-1 max-w-2xl mx-2 sm:mx-6">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-4 py-2 sm:py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs text-zinc-300 transition-all shadow-inner group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors shrink-0" />
                <span className="truncate text-zinc-400 group-hover:text-zinc-200">
                  Search your photos, screenshots, documents, Gujarati OCR...
                </span>
              </div>
              <kbd className="hidden md:inline-block text-[10px] bg-white/[0.06] border border-white/[0.1] px-2 py-0.5 rounded-full font-mono text-zinc-400 shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Tools: Upload, Settings, Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-[0_0_14px_rgba(16,185,129,0.25)] hover:scale-[1.02]"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </button>

            <button
              onClick={toggleTheme}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle color theme"
              className="p-2 rounded-full hover:bg-white/[0.06] text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              title="Settings & Storage"
              className="p-2 rounded-full hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-xs font-bold text-emerald-400 flex items-center justify-center shrink-0">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto bg-[#090A0D] custom-scrollbar">
          {children}
        </main>

        {/* ─── Mobile Bottom Navigation (Google Photos Native Style) ─── */}
        <nav className="md:hidden flex items-center justify-around h-16 border-t border-white/[0.08] bg-[#0A0C10]/95 backdrop-blur-xl shrink-0 px-1 z-20">
          <button
            onClick={() => onSelectTab('photos')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'photos'
                ? 'text-emerald-400 font-semibold scale-105'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px]">Photos</span>
          </button>
          <button
            onClick={() => onSelectTab('collections')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'collections'
                ? 'text-emerald-400 font-semibold scale-105'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderHeart className="w-5 h-5" />
            <span className="text-[10px]">Albums</span>
          </button>
          <button
            onClick={() => onSelectTab('assistant')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'assistant'
                ? 'text-emerald-400 font-semibold scale-105'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-[10px]">Assistant</span>
          </button>
          <button
            onClick={onOpenSearch}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-zinc-400 hover:text-emerald-300 transition-all"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px]">Search</span>
          </button>
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'text-emerald-400 font-semibold scale-105'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Vault</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
