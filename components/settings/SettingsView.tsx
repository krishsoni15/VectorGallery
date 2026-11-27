import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  User,
  Shield,
  Cpu,
  HardDrive,
  Sun,
  Smartphone,
  Save,
  Trash2,
  Download,
  CheckCircle,
  ExternalLink,
  Monitor,
  AlertCircle,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

type SettingsSection = 'account' | 'backup' | 'ai' | 'storage' | 'appearance' | 'privacy'

export const SettingsView: React.FC = () => {
  const { user, signOut, refreshSession } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<SettingsSection>('account')

  // Account & Profile state
  const [displayName, setDisplayName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // State for AI keys
  const [geminiKey, setGeminiKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [cohereKey, setCohereKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [existingKeys, setExistingKeys] = useState<Record<string, { last4: string; source: 'personal' | 'env' }>>({})
  const [envProviders, setEnvProviders] = useState<Record<string, boolean>>({})
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [backupSaved, setBackupSaved] = useState(false)

  // Delete / purge account state
  const [confirmPurge, setConfirmPurge] = useState(false)
  const [purging, setPurging] = useState(false)
  const [purgeNotice, setPurgeNotice] = useState<string | null>(null)

  // Backup settings state
  const [wifiOnly, setWifiOnly] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [storageStats, setStorageStats] = useState<any>(null)
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark')
  const [backupCategories, setBackupCategories] = useState({
    photos: true,
    screenshots: true,
    documents: true,
    videos: false,
    audio: false,
  })

  const refreshProviderKeys = useCallback(async () => {
    if (!user) {
      setExistingKeys({})
      try {
        const hRes = await fetch('/api/health')
        if (hRes.ok) {
          const hData = await hRes.json()
          setEnvProviders(hData?.aiProviders || {})
        }
      } catch {}
      return
    }

    try {
      const res = await fetch('/api/auth/provider-keys')
      if (res.ok) {
        const data = await res.json()
        const map: Record<string, { last4: string; source: 'personal' | 'env' }> = {}
        ;(data?.keys || []).forEach((k: any) => {
          map[k.provider] = {
            last4: k.key_last4 || 'Configured',
            source: k.source === 'env' ? 'env' : 'personal',
          }
        })
        setExistingKeys(map)
      }
    } catch {}
  }, [user])

  useEffect(() => {
    refreshProviderKeys()

    fetch('/api/v2/auth/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile?.full_name) {
          setDisplayName(data.profile.full_name)
        }
        const settings = data?.profile?.backup_settings
        if (settings) {
          if (typeof settings.wifi_only === 'boolean') setWifiOnly(settings.wifi_only)
          if (typeof settings.auto_backup === 'boolean') setAutoBackup(settings.auto_backup)
          if (Array.isArray(settings.categories)) {
            setBackupCategories({
              photos: settings.categories.includes('photos'),
              screenshots: settings.categories.includes('screenshots'),
              documents: settings.categories.includes('documents'),
              videos: settings.categories.includes('videos'),
              audio: settings.categories.includes('audio'),
            })
          }
        }
      })
      .catch(() => {})

    fetch('/api/v2/dashboard/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStorageStats(data)
      })
      .catch(() => {})

    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('vm_theme') as 'dark' | 'light') || 'dark'
      setCurrentTheme(savedTheme)
    }
  }, [refreshProviderKeys, user?.id])

  const handleSetTheme = (theme: 'dark' | 'light') => {
    setCurrentTheme(theme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('vm_theme', theme)
      window.dispatchEvent(new Event('vm_theme_change'))
    }
    fetch('/api/v2/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    }).catch(() => {})
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !displayName.trim()) return
    setProfileSaving(true)
    setProfileError(null)
    setProfileSaved(false)
    try {
      const res = await fetch('/api/v2/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: displayName.trim() }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setProfileError(json.error || 'Failed to update profile')
      } else {
        setProfileSaved(true)
        await refreshSession()
        setTimeout(() => setProfileSaved(false), 3000)
      }
    } catch (err: any) {
      setProfileError(err.message || 'Network error while updating profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleSaveKeys = async () => {
    setSaveError(null)
    setSaveSuccess(null)
    if (!user) {
      setSaveError('Please sign in or create an account to save personal API keys.')
      return
    }

    const keysToSave = [
      { provider: 'gemini', key: geminiKey },
      { provider: 'groq', key: groqKey },
      { provider: 'cohere', key: cohereKey },
      { provider: 'openai', key: openaiKey },
    ].filter((k) => k.key.trim().length > 0)

    if (keysToSave.length === 0) {
      setSaveError('Enter at least one API key before saving.')
      return
    }

    try {
      for (const item of keysToSave) {
        const res = await fetch('/api/auth/provider-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: item.provider, apiKey: item.key }),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(json.error || `Failed to save ${item.provider} key`)
        }
      }

      setSaveSuccess('API key(s) encrypted and saved!')
      setGeminiKey('')
      setGroqKey('')
      setCohereKey('')
      setOpenaiKey('')
      await refreshProviderKeys()
      setTimeout(() => setSaveSuccess(null), 3500)
    } catch (e: any) {
      setSaveError(e.message || 'Error saving keys')
    }
  }

  const handleRemovePersonalKey = async (providerId: string) => {
    setSaveError(null)
    try {
      const res = await fetch('/api/auth/provider-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId }),
      })
      if (res.ok) {
        setSaveSuccess(`Removed personal ${providerId.toUpperCase()} key.`)
        await refreshProviderKeys()
        setTimeout(() => setSaveSuccess(null), 3000)
      }
    } catch (e: any) {
      setSaveError(e.message || 'Failed to delete key')
    }
  }

  const handleSaveBackupPreferences = async () => {
    try {
      const selectedCats = Object.entries(backupCategories)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)

      const res = await fetch('/api/v2/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backup_settings: {
            auto_backup: autoBackup,
            wifi_only: wifiOnly,
            categories: selectedCats,
          },
        }),
      })
      if (res.ok) {
        setBackupSaved(true)
        setTimeout(() => setBackupSaved(false), 3000)
      }
    } catch (e) {
      console.error('Error saving backup preferences:', e)
    }
  }

  const handleExportVault = async () => {
    try {
      const res = await fetch('/api/v2/files?limit=100')
      if (res.ok) {
        const data = await res.json()
        const manifest = {
          export_timestamp: new Date().toISOString(),
          user: user?.email || 'sandbox',
          total_files: data.total || (data.files || []).length,
          files: data.files || [],
        }
        const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vectorgallery_vault_export_${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      console.error('Export error:', e)
    }
  }

  const handlePurgeAccount = async () => {
    if (!user) return
    setPurging(true)
    setPurgeNotice(null)
    try {
      const res = await fetch('/api/v2/auth/profile', { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setPurgeNotice(err.error || 'Failed to delete account.')
        setPurging(false)
        return
      }
      await signOut()
      router.push('/signup')
    } catch (e: any) {
      setPurgeNotice(e.message || 'Deletion failed')
      setPurging(false)
    }
  }

  const sections = [
    { key: 'account' as SettingsSection, label: 'Account', icon: User },
    { key: 'backup' as SettingsSection, label: 'Mobile Backup', icon: Smartphone },
    { key: 'ai' as SettingsSection, label: 'AI Intelligence', icon: Cpu },
    { key: 'storage' as SettingsSection, label: 'Storage', icon: HardDrive },
    { key: 'appearance' as SettingsSection, label: 'Appearance', icon: Sun },
    { key: 'privacy' as SettingsSection, label: 'Privacy & Security', icon: Shield },
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="pb-4 border-b border-[#DDE2DC] dark:border-white/[0.08]">
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.03em] text-[#101211] dark:text-[#F3F5F1]">
          Platform Settings
        </h2>
        <p className="text-xs sm:text-sm text-[#555E58] dark:text-[#9AA69E] mt-1">
          Manage your account security, AI providers, cloud backup preferences, and privacy controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
        <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] p-2 space-y-1 shadow-sm">
          {sections.map((sec) => {
            const Icon = sec.icon
            const isActive = activeSection === sec.key

            return (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CFFF49]/15 dark:text-[#CFFF49] font-semibold'
                    : 'text-[#555E58] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] hover:bg-[#F2F3F0] dark:hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>

        <div className="md:col-span-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] p-5 sm:p-6 space-y-6 shadow-sm">
          {/* 1. Account Settings */}
          {activeSection === 'account' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#DDE2DC] dark:border-white/[0.06]">
                <h3 className="text-sm font-bold text-[#101211] dark:text-[#F3F5F1]">
                  Account &amp; Identity
                </h3>
                <span
                  className={`text-[10.5px] px-2.5 py-0.5 rounded-full font-mono font-semibold border ${
                    user
                      ? 'bg-[#087F5B]/10 dark:bg-[#CFFF49]/15 text-[#087F5B] dark:text-[#CFFF49] border-[#087F5B]/25 dark:border-[#CFFF49]/30'
                      : 'bg-[#F2F3F0] dark:bg-white/[0.06] text-[#555E58] dark:text-[#9AA69E] border-[#DDE2DC] dark:border-white/[0.10]'
                  }`}
                >
                  {user ? 'Authenticated Account' : 'Local Sandbox Session'}
                </span>
              </div>

              {user ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label htmlFor="settings-display-name" className="text-xs font-medium text-[#555E58] dark:text-[#9AA69E] block mb-1">
                      Display Name
                    </label>
                    <input
                      id="settings-display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="w-full bg-[#FFFFFF] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.12] rounded-xl px-3 py-2 text-xs text-[#101211] dark:text-[#F3F5F1] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#CFFF49]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#555E58] dark:text-[#9AA69E] block mb-1">Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={user.email || ''}
                      className="w-full bg-[#F2F3F0] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.10] rounded-xl px-3 py-2 text-xs text-[#555E58] dark:text-[#9AA69E] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#555E58] dark:text-[#9AA69E] block mb-1">User ID</label>
                    <input
                      type="text"
                      disabled
                      value={user.id}
                      className="w-full bg-[#F2F3F0] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.10] rounded-xl px-3 py-2 text-xs text-[#626B64] dark:text-[#9AA69E] font-mono"
                    />
                  </div>

                  {profileError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> {profileError}
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href="/account"
                        className="px-3.5 py-2 rounded-full border border-[#DDE2DC] dark:border-white/[0.10] text-xs font-medium text-[#101211] dark:text-[#F3F5F1] hover:bg-[#F2F3F0] dark:hover:bg-white/[0.06] transition-colors"
                      >
                        Manage API Key Portal
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          await signOut()
                          router.push('/login')
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#DDE2DC] dark:border-white/[0.10] text-xs font-medium text-[#555E58] dark:text-[#9AA69E] hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign out
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {profileSaved && (
                        <span className="text-xs text-[#087F5B] dark:text-[#CFFF49] flex items-center gap-1 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Profile updated!
                        </span>
                      )}
                      <button
                        type="submit"
                        disabled={profileSaving || !displayName.trim()}
                        className="vg-cta-lime flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-[#F2F3F0]/75 dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.08] space-y-3">
                  <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">
                    You are currently browsing in Local Sandbox mode.
                  </p>
                  <p className="text-xs text-[#555E58] dark:text-[#9AA69E] leading-relaxed">
                    Create a dedicated account to get an isolated vault, persistent collections, search history, chat conversations, and encrypted personal AI keys.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <Link
                      href="/signup?redirect=/app"
                      className="vg-cta-lime inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] text-xs font-semibold shadow-sm"
                    >
                      <span>Create Account</span>
                    </Link>
                    <Link
                      href="/login?redirect=/app"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFFFFF] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.10] text-xs font-medium text-[#101211] dark:text-[#F3F5F1]"
                    >
                      <span>Sign in</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Mobile Backup Settings */}
          {activeSection === 'backup' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#101211] dark:text-[#F3F5F1] pb-2 border-b border-[#DDE2DC] dark:border-white/[0.06]">
                Mobile Backup Preferences
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F2F3F0]/65 dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06]">
                  <div>
                    <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">Automatic Background Backup</p>
                    <p className="text-[11px] text-[#626B64] dark:text-[#9AA69E]">
                      Sync new photos and screenshots automatically when connected.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="accent-[#087F5B] dark:accent-[#CFFF49] w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F2F3F0]/65 dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06]">
                  <div>
                    <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">Wi-Fi Only Mode</p>
                    <p className="text-[11px] text-[#626B64] dark:text-[#9AA69E]">
                      Prevent high cellular data usage by backing up only on Wi-Fi networks.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={wifiOnly}
                    onChange={(e) => setWifiOnly(e.target.checked)}
                    className="accent-[#087F5B] dark:accent-[#CFFF49] w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#F2F3F0]/65 dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06] space-y-2">
                  <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">Backup Categories</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#555E58] dark:text-[#9AA69E]">
                    {Object.entries(backupCategories).map(([key, val]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer capitalize">
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={(e) =>
                            setBackupCategories((prev) => ({ ...prev, [key]: e.target.checked }))
                          }
                          className="accent-[#087F5B] dark:accent-[#CFFF49]"
                        />
                        <span>{key}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {backupSaved && (
                    <span className="text-xs text-[#087F5B] dark:text-[#CFFF49] flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Preferences saved!
                    </span>
                  )}
                  <button
                    onClick={handleSaveBackupPreferences}
                    className="vg-cta-lime ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] text-xs font-semibold transition-all shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Backup Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. AI Providers Settings */}
          {activeSection === 'ai' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#101211] dark:text-[#F3F5F1] pb-2 border-b border-[#DDE2DC] dark:border-white/[0.06]">
                AI Provider API Configuration
              </h3>
              <p className="text-xs text-[#555E58] dark:text-[#9AA69E] leading-relaxed">
                Add your personal API keys to power semantic embeddings, OCR, and streaming chat. Keys are encrypted per user with AES-256-GCM.
              </p>

              {!user && (
                <div className="p-3.5 rounded-xl bg-[#F2F3F0] dark:bg-white/[0.04] border border-[#DDE2DC] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#555E58] dark:text-[#9AA69E]">
                    Sign in to store personal encrypted keys. Sandbox uses configured system defaults.
                  </span>
                  <Link
                    href="/signup?redirect=/app"
                    className="font-semibold text-[#087F5B] dark:text-[#CFFF49] hover:underline"
                  >
                    Create Account →
                  </Link>
                </div>
              )}

              <div className="space-y-3">
                {[
                  {
                    id: 'gemini',
                    label: 'Google Gemini API Key',
                    value: geminiKey,
                    setter: setGeminiKey,
                    placeholder: 'AIzaSy...',
                    url: 'https://ai.google.dev',
                    linkLabel: 'Get Key',
                  },
                  {
                    id: 'groq',
                    label: 'Groq API Key',
                    value: groqKey,
                    setter: setGroqKey,
                    placeholder: 'gsk_...',
                    url: 'https://console.groq.com',
                    linkLabel: 'Get Free Key',
                  },
                  {
                    id: 'openai',
                    label: 'OpenAI API Key',
                    value: openaiKey,
                    setter: setOpenaiKey,
                    placeholder: 'sk-...',
                    url: 'https://platform.openai.com/api-keys',
                    linkLabel: 'Get Key',
                  },
                  {
                    id: 'cohere',
                    label: 'Cohere API Key',
                    value: cohereKey,
                    setter: setCohereKey,
                    placeholder: 'co_...',
                    url: 'https://dashboard.cohere.com',
                    linkLabel: 'Get Key',
                  },
                ].map((provider) => {
                  const keyInfo = existingKeys[provider.id]
                  const envAvailable = envProviders[provider.id]
                  return (
                    <div key={provider.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">
                            {provider.label}
                          </label>
                          {keyInfo?.source === 'personal' ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-[#087F5B]/10 dark:bg-[#CFFF49]/15 text-[#087F5B] dark:text-[#CFFF49] border border-[#087F5B]/25 dark:border-[#CFFF49]/30 font-mono">
                              Personal (••••{keyInfo.last4})
                              <button
                                type="button"
                                onClick={() => handleRemovePersonalKey(provider.id)}
                                title="Remove personal key"
                                className="hover:text-rose-500"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ) : keyInfo?.source === 'env' || envAvailable ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2F3F0] dark:bg-white/[0.06] text-[#555E58] dark:text-[#9AA69E] border border-[#DDE2DC] dark:border-white/[0.10] font-mono">
                              System Default Active
                            </span>
                          ) : null}
                        </div>
                        <a
                          href={provider.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-[#087F5B] dark:text-[#CFFF49] hover:underline flex items-center gap-1 font-medium"
                        >
                          {provider.linkLabel} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <input
                        type="password"
                        disabled={!user}
                        value={provider.value}
                        onChange={(e) => provider.setter(e.target.value)}
                        placeholder={
                          keyInfo?.source === 'personal'
                            ? '•••••••••••••••• (replace personal key)'
                            : provider.placeholder
                        }
                        className="w-full bg-[#FFFFFF] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.10] rounded-xl px-3 py-2 text-xs text-[#101211] dark:text-[#F3F5F1] font-mono focus:outline-none focus:border-[#087F5B] dark:focus:border-[#CFFF49] disabled:opacity-50"
                      />
                    </div>
                  )
                })}

                {saveError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between">
                  {saveSuccess && (
                    <span className="text-xs text-[#087F5B] dark:text-[#CFFF49] flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> {saveSuccess}
                    </span>
                  )}
                  <button
                    onClick={handleSaveKeys}
                    disabled={!user}
                    className="vg-cta-lime ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] text-xs font-semibold transition-all shadow-sm disabled:opacity-45"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save API Keys</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Storage Distribution */}
          {activeSection === 'storage' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#DDE2DC] dark:border-white/[0.06]">
                <div>
                  <h3 className="text-sm font-bold text-[#101211] dark:text-[#F3F5F1]">
                    Storage &amp; Cloud Distribution
                  </h3>
                  <p className="text-xs text-[#626B64] dark:text-[#9AA69E]">
                    VectorGallery Personal Tier · Isolated Per-User Vault
                  </p>
                </div>
                <span className="text-xs font-mono text-[#101211] dark:text-[#CFFF49] bg-[#F2F3F0] dark:bg-white/[0.06] px-3 py-1 rounded-full border border-[#DDE2DC] dark:border-white/[0.10]">
                  {storageStats?.storage?.formatted_used || '0 B'} / {storageStats?.storage?.formatted_quota || '15.00 GB'} used
                </span>
              </div>

              <div className="space-y-3">
                <div className="w-full h-3 rounded-full bg-[#E7E9E5] dark:bg-white/[0.08] overflow-hidden flex items-center p-0.5 gap-0.5">
                  {(storageStats?.storage?.category_bytes?.photos || 0) > 0 && (
                    <div
                      title={`Photos: ${storageStats?.storage?.formatted_category_bytes?.photos || '0 B'}`}
                      style={{ width: `${Math.max(2.5, ((storageStats?.storage?.category_bytes?.photos || 0) / (storageStats?.storage?.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                      className="h-full bg-[#101211] dark:bg-[#F3F5F1] rounded-full transition-all duration-700"
                    />
                  )}
                  {(storageStats?.storage?.category_bytes?.screenshots || 0) > 0 && (
                    <div
                      title={`Screenshots: ${storageStats?.storage?.formatted_category_bytes?.screenshots || '0 B'}`}
                      style={{ width: `${Math.max(1.5, ((storageStats?.storage?.category_bytes?.screenshots || 0) / (storageStats?.storage?.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                      className="h-full bg-[#C8F73E] dark:bg-[#CFFF49] rounded-full transition-all duration-700"
                    />
                  )}
                  {(storageStats?.storage?.category_bytes?.documents || 0) > 0 && (
                    <div
                      title={`Documents: ${storageStats?.storage?.formatted_category_bytes?.documents || '0 B'}`}
                      style={{ width: `${Math.max(1.5, ((storageStats?.storage?.category_bytes?.documents || 0) / (storageStats?.storage?.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                      className="h-full bg-[#087F5B] dark:bg-[#39D9A0] rounded-full transition-all duration-700"
                    />
                  )}
                  <div className="flex-1 h-full bg-transparent rounded-full" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#F2F3F0]/65 dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06] flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#101211] dark:bg-[#F3F5F1] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">Photos &amp; Media</p>
                      <p className="text-[11px] text-[#626B64] dark:text-[#9AA69E] font-mono">
                        {storageStats?.storage?.formatted_category_bytes?.photos || '0 B'} ({storageStats?.counts?.photos || 0})
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F2F3F0]/65 dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06] flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C8F73E] dark:bg-[#CFFF49] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">Screenshots</p>
                      <p className="text-[11px] text-[#626B64] dark:text-[#9AA69E] font-mono">
                        {storageStats?.storage?.formatted_category_bytes?.screenshots || '0 B'} ({storageStats?.counts?.screenshots || 0})
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F2F3F0]/65 dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06] flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#087F5B] dark:bg-[#39D9A0] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">Documents &amp; Notes</p>
                      <p className="text-[11px] text-[#626B64] dark:text-[#9AA69E] font-mono">
                        {storageStats?.storage?.formatted_category_bytes?.documents || '0 B'} ({storageStats?.counts?.documents || 0})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#626B64] dark:text-[#9AA69E] flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" /> Connected Devices &amp; Backups
                </h4>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-[#F2F3F0]/65 dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.08] text-[#087F5B] dark:text-[#CFFF49] flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">Android Mobile Companion</p>
                        <p className="text-[11px] text-[#626B64] dark:text-[#9AA69E]">
                          Auto-Backup: {autoBackup ? 'Enabled' : 'Paused'} · Wi-Fi Only: {wifiOnly ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#087F5B]/10 dark:bg-[#CFFF49]/15 text-[#087F5B] dark:text-[#CFFF49] border border-[#087F5B]/25 dark:border-[#CFFF49]/30 font-mono">
                      {storageStats?.backup_health?.connected_devices ? 'PAIRED' : 'READY'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F2F3F0]/65 dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.08] text-[#101211] dark:text-[#F3F5F1] flex items-center justify-center">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">Web Browser Client</p>
                        <p className="text-[11px] text-[#626B64] dark:text-[#9AA69E]">Desktop Web Session · Real-time Vault</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F2F3F0] dark:bg-white/[0.08] text-[#101211] dark:text-[#F3F5F1] border border-[#DDE2DC] dark:border-white/[0.12] font-mono">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={handleExportVault}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F2F3F0] dark:bg-white/[0.06] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.12] border border-[#DDE2DC] dark:border-white/[0.10] text-xs font-semibold text-[#101211] dark:text-[#F3F5F1] transition-colors"
                >
                  <Download className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49]" />
                  <span>Export Vault Manifest (JSON)</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. Appearance */}
          {activeSection === 'appearance' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#101211] dark:text-[#F3F5F1] pb-2 border-b border-[#DDE2DC] dark:border-white/[0.06]">
                Appearance &amp; Theme
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSetTheme('light')}
                  className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                    currentTheme === 'light'
                      ? 'border-[#101211] bg-[#F2F3F0] text-[#101211] shadow-sm'
                      : 'border-[#DDE2DC] dark:border-white/[0.08] bg-transparent text-[#555E58] dark:text-[#9AA69E] hover:border-[#101211]/35 dark:hover:border-white/[0.2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#F2F3F0] border border-[#C7CEC6]" />
                    <span>Liquid Titanium (Light)</span>
                  </div>
                  {currentTheme === 'light' && <CheckCircle className="w-4 h-4 text-[#087F5B]" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSetTheme('dark')}
                  className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                    currentTheme === 'dark'
                      ? 'border-[#CFFF49] bg-[#CFFF49]/10 text-[#CFFF49] shadow-sm'
                      : 'border-[#DDE2DC] dark:border-white/[0.08] bg-transparent text-[#555E58] dark:text-[#9AA69E] hover:border-[#101211]/35 dark:hover:border-white/[0.2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#090B0A] border border-white/25" />
                    <span>Obsidian Volt (Dark)</span>
                  </div>
                  {currentTheme === 'dark' && <CheckCircle className="w-4 h-4 text-[#CFFF49]" />}
                </button>
              </div>
            </div>
          )}

          {/* 6. Privacy */}
          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#101211] dark:text-[#F3F5F1] pb-2 border-b border-[#DDE2DC] dark:border-white/[0.06]">
                Privacy &amp; Data Ownership
              </h3>
              <p className="text-xs text-[#555E58] dark:text-[#9AA69E] leading-relaxed">
                VectorGallery enforces strict per-user vault isolation. Your uploaded files, photos, document chunks, search history, and AI conversations belong solely to your account and can be permanently purged at any time.
              </p>

              <div className="pt-4 border-t border-red-500/20 space-y-3">
                {purgeNotice && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{purgeNotice}</p>
                )}

                {!user ? (
                  <p className="text-xs text-[#626B64] dark:text-[#9AA69E]">
                    Sign in with a personal account to manage account deletion and full vault purge.
                  </p>
                ) : !confirmPurge ? (
                  <button
                    onClick={() => setConfirmPurge(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account &amp; Purge Vault</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                      Permanently delete your account, uploaded files, collections, and AI history?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePurgeAccount}
                        disabled={purging}
                        className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50"
                      >
                        {purging ? 'Purging...' : 'Confirm Permanent Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmPurge(false)}
                        className="px-4 py-1.5 rounded-full border border-[#DDE2DC] dark:border-white/[0.15] text-xs font-medium text-[#101211] dark:text-[#F3F5F1]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
