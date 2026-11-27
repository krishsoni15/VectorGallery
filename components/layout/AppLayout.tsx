import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Home,
  Search,
  Zap,
  Image as ImageIcon,
  FileText,
  FolderHeart,
  Clock,
  Star,
  Trash2,
  HardDrive,
  Smartphone,
  Settings,
  UploadCloud,
  LogOut,
  X,
  Menu,
  Sun,
  Moon,
  HelpCircle,
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
  | 'guide'
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

  // Minimal non-repeating sidebar items (Search lives once in header/bottom bar; Upload once in header)
  const navItems: Array<{
    key: NavItemKey
    label: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
    sectionLabel?: string
  }> = [
    { key: 'home', label: 'Overview', icon: Home },
    { key: 'photos', label: 'Photos', icon: ImageIcon },
    { key: 'recent', label: 'All Files', icon: Clock },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'collections', label: 'Collections', icon: FolderHeart },
    { key: 'assistant', label: 'Assistant', icon: Zap, badge: 'AI', sectionLabel: 'Intelligence' },
    { key: 'favorites', label: 'Favorites', icon: Star, sectionLabel: 'Library' },
    { key: 'trash', label: 'Trash', icon: Trash2 },
  ]

  const TAB_TITLES: Record<NavItemKey, string> = {
    home: 'Overview',
    photos: 'Photos',
    recent: 'All Files',
    documents: 'Documents',
    collections: 'Collections',
    assistant: 'AI Assistant',
    search: 'Search',
    favorites: 'Favorites',
    trash: 'Trash',
    downloads: 'All Files',
    videos: 'Videos',
    audio: 'Audio',
    guide: 'User Guide',
    settings: 'Settings',
  }

  const handleNavClick = (key: NavItemKey) => {
    onSelectTab(key)
    setMobileMenuOpen(false)
  }

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Personal Vault'

  return (
    <div className="vm-app-shell flex h-screen w-screen overflow-hidden bg-[#F4F5F2] dark:bg-[#090B0D] text-[#101211] dark:text-[#F4F6F2] font-sans antialiased">
      {/* ─── Mobile Slide-over Navigation Drawer ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#101211]/45 dark:bg-black/75 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-72 max-w-[85vw] bg-[#FFFFFF] dark:bg-[#111416] border-r border-[#DBE0DA] dark:border-white/[0.10] flex flex-col h-full z-10 shadow-2xl">
            <div className="flex items-center justify-between px-4 h-14 border-b border-[#DDE2DC] dark:border-white/[0.08]">
              <Link href="/" className="flex items-center gap-2.5">
                <img
                  src="/vectorgallery-icon.svg"
                  alt="VectorGallery"
                  className="w-7 h-7 rounded-xl"
                />
                <div>
                  <span className="font-display font-bold text-[13px] tracking-[-0.02em] text-[#101211] dark:text-[#F3F5F1] block leading-none">
                    VectorGallery
                  </span>
                  <span className="text-[9.5px] text-[#626B64] dark:text-[#9AA69E] font-mono tracking-wider block mt-0.5">
                    PERSONAL CLOUD
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="p-1.5 rounded-full text-[#626B64] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 custom-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.key

                return (
                  <React.Fragment key={item.key}>
                    {item.sectionLabel && (
                      <div className="pt-3 pb-1 px-3 text-[10px] font-mono uppercase tracking-[0.12em] text-[#626B64] dark:text-[#7B867F] border-t border-[#DDE2DC] dark:border-white/[0.06] mt-2">
                        <span>{item.sectionLabel}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleNavClick(item.key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                        isActive
                          ? 'bg-[#101211] text-[#F3F5F1] dark:bg-white/[0.10] dark:text-[#F3F5F1] font-semibold'
                          : 'text-[#555E58] dark:text-[#9AA69E] hover:bg-[#E7E9E5]/70 dark:hover:bg-white/[0.05] hover:text-[#101211] dark:hover:text-[#F3F5F1]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-[#D4FF54] dark:text-[#CFFF49]' : 'text-[#626B64] dark:text-[#7B867F]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                            isActive
                              ? 'bg-white/15 text-[#D4FF54] dark:bg-[#CFFF49]/20 dark:text-[#CFFF49]'
                              : 'bg-[#E7E9E5] dark:bg-white/[0.08] text-[#101211] dark:text-[#F3F5F1]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                )
              })}

              <div className="pt-3 pb-1 px-3 text-[10px] font-mono uppercase tracking-[0.12em] text-[#626B64] dark:text-[#7B867F] border-t border-[#DDE2DC] dark:border-white/[0.06] mt-2">
                <span>Help</span>
              </div>
              <button
                onClick={() => handleNavClick('guide')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                  activeTab === 'guide'
                    ? 'bg-[#101211] text-[#F3F5F1] dark:bg-white/[0.10] dark:text-[#F3F5F1] font-semibold'
                    : 'text-[#555E58] dark:text-[#9AA69E] hover:bg-[#E7E9E5]/70 dark:hover:bg-white/[0.05] hover:text-[#101211] dark:hover:text-[#F3F5F1]'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49]" />
                <span>User Guide</span>
              </button>
            </div>

            <div className="p-3 border-t border-[#DDE2DC] dark:border-white/[0.08] space-y-2.5 bg-[#F2F3F0]/80 dark:bg-[#090B0A]/60">
              <div className="flex items-center justify-between text-[11px] text-[#555E58] dark:text-[#9AA69E] px-1">
                <span>
                  {storageStats.formatted_used} / {storageStats.formatted_quota}
                </span>
                <span className="font-mono text-[#087F5B] dark:text-[#CFFF49]">{storageStats.percent_used}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#DDE2DC] dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full bg-[#101211] dark:bg-[#CFFF49] rounded-full transition-all"
                  style={{ width: `${Math.max(2, Math.min(100, storageStats.percent_used))}%` }}
                />
              </div>
              <button
                onClick={() => handleNavClick('settings')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#101211] dark:text-[#F3F5F1] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.06]"
              >
                <Settings className="w-4 h-4 text-[#626B64] dark:text-[#9AA69E]" />
                <span>Settings &amp; Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Desktop Left Navigation Sidebar (Minimal, Zero Repetition) ─── */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 border-r border-[#DDE2DC] dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#111416] select-none">
        {/* Clean Brand Header */}
        <div className="flex items-center px-5 h-16 border-b border-[#DDE2DC] dark:border-white/[0.08]">
          <Link href="/" className="flex items-center gap-2.5 group" title="Return to VectorGallery Website">
            <img
              src="/vectorgallery-icon.svg"
              alt="VectorGallery"
              className="w-8 h-8 rounded-xl transition-transform group-hover:scale-105"
            />
            <div>
              <span className="font-display font-bold text-sm tracking-[-0.02em] text-[#101211] dark:text-[#F3F5F1] block leading-none">
                VectorGallery
              </span>
              <span className="text-[10px] text-[#626B64] dark:text-[#9AA69E] font-mono tracking-wider block mt-0.5">
                PERSONAL CLOUD
              </span>
            </div>
          </Link>
        </div>

        {/* Clean Single-Purpose Navigation Links */}
        <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto px-3 py-3.5 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.key

            return (
              <React.Fragment key={item.key}>
                {item.sectionLabel && (
                  <div className="pt-3.5 pb-1.5 px-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.12em] text-[#626B64] dark:text-[#7B867F] border-t border-[#DDE2DC] dark:border-white/[0.06] mt-2.5">
                    <span>{item.sectionLabel}</span>
                  </div>
                )}
                <button
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-full text-[13px] font-medium transition-colors group ${
                    isActive
                      ? 'bg-[#101211] text-[#F4F6F2] dark:bg-white/[0.11] dark:text-[#F4F6F2] font-semibold'
                      : 'text-[#555E58] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F4F6F2] hover:bg-[#F2F3F0] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#D4FF54] dark:text-[#CDFF45]'
                          : 'text-[#626B64] dark:text-[#7B867F] group-hover:text-[#101211] dark:group-hover:text-[#F4F6F2]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                        isActive
                          ? 'bg-white/15 text-[#D4FF54] dark:bg-[#CDFF49]/20 dark:text-[#CDFF45]'
                          : 'bg-[#E7E9E5] dark:bg-white/[0.08] text-[#101211] dark:text-[#F3F5F1]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            )
          })}
        </nav>

        {/* Bottom Storage, Settings & Account Tile */}
        <div className="p-3 border-t border-[#DDE2DC] dark:border-white/[0.08] space-y-2.5 bg-[#F2F3F0]/65 dark:bg-[#090B0A]/45">
          <div className="px-2.5 py-2 rounded-xl bg-[#FFFFFF] dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="flex items-center gap-1.5 text-[#555E58] dark:text-[#9AA69E] font-medium">
                <HardDrive className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CDFF45]" /> Storage
              </span>
              <span className="font-mono text-[#101211] dark:text-[#F3F5F1] text-[10.5px]">
                {storageStats.formatted_used} / {storageStats.formatted_quota}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#E7E9E5] dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full bg-[#101211] dark:bg-[#CDFF45] transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(2, Math.min(100, storageStats.percent_used))}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-2 py-0.5 text-[11px] text-[#555E58] dark:text-[#9AA69E]">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              {connectedDevicesCount > 0 ? `${connectedDevicesCount} Device${connectedDevicesCount > 1 ? 's' : ''}` : 'No devices'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#087F5B] dark:text-[#46D6A4]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-[#46D6A4]" /> Sync Ready
            </span>
          </div>

          <div className="pt-1.5 flex items-center justify-between gap-1 border-t border-[#DDE2DC] dark:border-white/[0.06]">
            <button
              onClick={() => handleNavClick('settings')}
              className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CDFF45]/15 dark:text-[#CDFF45] font-semibold'
                  : 'text-[#555E58] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] hover:bg-[#E7E9E5]/70 dark:hover:bg-white/[0.05]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            <button
              onClick={async () => {
                await signOut()
                router.push('/login')
              }}
              title="Sign Out"
              aria-label="Sign out"
              className="p-1.5 rounded-lg text-[#626B64] dark:text-[#9AA69E] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            href={user ? '/account' : '/login'}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06] hover:border-[#101211]/30 dark:hover:border-white/[0.15] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#101211] text-[#F3F5F1] dark:bg-[#CDFF45]/20 dark:text-[#CDFF45] flex items-center justify-center text-xs font-bold shrink-0">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#101211] dark:text-[#F3F5F1] truncate">{userDisplayName}</p>
              <p className="text-[10px] text-[#626B64] dark:text-[#9AA69E] truncate">{user?.email || 'Local Session'}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ─── Main Content Shell ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Clean Minimal Google Photos Style Header */}
        <header className="h-14 sm:h-16 border-b border-[#DDE2DC] dark:border-white/[0.08] px-2.5 sm:px-6 flex items-center justify-between bg-[#FFFFFF]/92 dark:bg-[#090B0D]/92 backdrop-blur-xl shrink-0 gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open navigation menu"
              className="md:hidden p-1.5 sm:p-2 rounded-full text-[#555E58] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.06]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display text-sm font-bold tracking-[-0.02em] text-[#101211] dark:text-[#F3F5F1] hidden sm:flex items-center gap-2">
              {TAB_TITLES[activeTab] || activeTab}
            </h1>
          </div>

          {/* Centered Clean Search Pill */}
          <div className="flex-1 min-w-0 max-w-xl mx-0.5 sm:mx-4">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-2 rounded-full bg-[#F2F3F0] dark:bg-[#131715] hover:bg-[#E7E9E5]/80 dark:hover:bg-[#1A1F1D] border border-[#DDE2DC] dark:border-white/[0.10] text-xs transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-[#626B64] dark:text-[#9AA69E] group-hover:text-[#101211] dark:group-hover:text-[#CDFF45] transition-colors shrink-0" />
                <span className="truncate text-[#626B64] dark:text-[#9AA69E] group-hover:text-[#101211] dark:group-hover:text-[#F3F5F1]">
                  Search photos, receipts &amp; notes...
                </span>
              </div>
              <kbd className="hidden md:inline-block text-[10px] bg-[#FFFFFF] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.10] px-2 py-0.5 rounded-full font-mono text-[#626B64] dark:text-[#9AA69E] shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Utility Actions (No duplicate Settings/Avatar on desktop) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenUpload}
              className="vg-cta-lime flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-full bg-[#D4FF54] hover:bg-[#C6F43E] dark:bg-[#CDFF45] dark:hover:bg-[#DCFF73] text-[#101211] text-xs font-semibold transition-all shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </button>

            <button
              onClick={() => handleNavClick('guide')}
              title="How to use VectorGallery (User Guide)"
              aria-label="User Guide"
              className={`hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-medium transition-colors ${
                activeTab === 'guide'
                  ? 'border-[#101211] bg-[#101211] text-[#F4F6F2] dark:border-[#CDFF45] dark:bg-[#CDFF45]/15 dark:text-[#CDFF45]'
                  : 'border-[#DDE2DC] dark:border-white/[0.10] bg-[#FFFFFF] dark:bg-[#131715] text-[#555E58] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#CDFF45]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Guide</span>
            </button>

            <button
              onClick={toggleTheme}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle color theme"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#DDE2DC] dark:border-white/[0.10] bg-[#FFFFFF] dark:bg-[#131715] flex items-center justify-center text-[#555E58] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#CDFF45] transition-colors"
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Mobile-only compact account badge (since left sidebar is hidden on <md) */}
            <Link
              href={user ? '/account' : '/login'}
              title={user ? 'Account Settings' : 'Sign in to Sync'}
              className="md:hidden w-8 h-8 rounded-full bg-[#101211] text-[#F3F5F1] dark:bg-[#CDFF45]/20 dark:border dark:border-[#CDFF45]/35 dark:text-[#CDFF45] text-xs font-bold flex items-center justify-center shrink-0"
            >
              {userDisplayName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto bg-[#F4F5F2] dark:bg-[#090B0D] custom-scrollbar">
          {children}
        </main>

        {/* ─── Mobile Bottom Navigation ─── */}
        <nav className="md:hidden flex items-center justify-around min-h-[64px] pb-[env(safe-area-inset-bottom)] border-t border-[#DDE2DC] dark:border-white/[0.08] bg-[#FFFFFF]/95 dark:bg-[#090B0D]/95 backdrop-blur-xl shrink-0 px-1 z-20">
          {[
            { key: 'home' as NavItemKey, label: 'Overview', icon: Home },
            { key: 'photos' as NavItemKey, label: 'Photos', icon: ImageIcon },
            { key: 'collections' as NavItemKey, label: 'Collections', icon: FolderHeart },
            { key: 'assistant' as NavItemKey, label: 'Assistant', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => onSelectTab(tab.key)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-colors min-w-0 ${
                  isActive ? 'text-[#101211] dark:text-[#CDFF45] font-semibold' : 'text-[#626B64] dark:text-[#9AA69E]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] truncate">{tab.label}</span>
              </button>
            )
          })}
          <button
            onClick={onOpenSearch}
            className="flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl min-w-0 text-[#626B64] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#CDFF45]"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px]">Search</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
