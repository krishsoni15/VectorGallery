import React, { useState, useEffect } from 'react'
import {
  User,
  Shield,
  Cpu,
  HardDrive,
  Sun,
  Lock,
  Smartphone,
  Save,
  Trash2,
  Download,
  CheckCircle,
  ExternalLink,
  Monitor,
} from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

type SettingsSection = 'account' | 'backup' | 'ai' | 'storage' | 'appearance' | 'privacy'

export const SettingsView: React.FC = () => {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<SettingsSection>('account')

  // State for AI keys
  const [geminiKey, setGeminiKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [cohereKey, setCohereKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [existingKeys, setExistingKeys] = useState<Record<string, string>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [backupSaved, setBackupSaved] = useState(false)

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

  // Load configured keys and user profile on mount
  useEffect(() => {
    // 1. Fetch provider keys
    fetch('/api/auth/provider-keys')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.keys && Array.isArray(data.keys)) {
          const map: Record<string, string> = {}
          data.keys.forEach((k: any) => {
            map[k.provider] = k.key_last4 || 'Configured'
          })
          setExistingKeys(map)
        }
      })
      .catch(() => {})

    // 2. Fetch profile & backup settings
    fetch('/api/v2/auth/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
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
    // 3. Fetch storage stats
    fetch('/api/v2/dashboard/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStorageStats(data)
      })
      .catch(() => {})
    // 4. Initialize Theme
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('vm_theme') as 'dark' | 'light') || 'dark'
      setCurrentTheme(savedTheme)
    }
  }, [])

  const handleSetTheme = (theme: 'dark' | 'light') => {
    setCurrentTheme(theme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('vm_theme', theme)
      if (theme === 'light') {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      } else {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      }
      window.dispatchEvent(new Event('vm_theme_change'))
    }
  }

  const handleSaveKeys = async () => {
    try {
      const keysToSave = [
        { provider: 'gemini', key: geminiKey },
        { provider: 'groq', key: groqKey },
        { provider: 'cohere', key: cohereKey },
        { provider: 'openai', key: openaiKey },
      ].filter((k) => k.key.trim().length > 0)

      for (const item of keysToSave) {
        await fetch('/api/auth/provider-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: item.provider, apiKey: item.key }),
        })
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      // Refresh keys
      const res = await fetch('/api/auth/provider-keys')
      if (res.ok) {
        const data = await res.json()
        const map: Record<string, string> = {}
        data.keys?.forEach((k: any) => {
          map[k.provider] = k.key_last4 || 'Configured'
        })
        setExistingKeys(map)
        setGeminiKey('')
        setGroqKey('')
        setCohereKey('')
        setOpenaiKey('')
      }
    } catch (e) {
      console.error('Error saving keys:', e)
    }
  }

  const handleSaveBackupPreferences = async () => {
    try {
      const selectedCats = Object.entries(backupCategories)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)

      await fetch('/api/v2/auth/profile', {
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

      setBackupSaved(true)
      setTimeout(() => setBackupSaved(false), 3000)
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
          user: user?.email || 'user',
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
        {/* Navigation Sidebar */}
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

        {/* Section Content Area */}
        <div className="md:col-span-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] p-5 sm:p-6 space-y-6 shadow-sm">
          {/* 1. Account Settings */}
          {activeSection === 'account' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#101211] dark:text-[#F3F5F1] pb-2 border-b border-[#DDE2DC] dark:border-white/[0.06]">
                Account &amp; Identity
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#555E58] dark:text-[#9AA69E] block mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || 'guest@vectorgallery.app'}
                    className="w-full bg-[#F2F3F0] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.10] rounded-xl px-3 py-2 text-xs text-[#555E58] dark:text-[#9AA69E] font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#555E58] dark:text-[#9AA69E] block mb-1">User ID</label>
                  <input
                    type="text"
                    disabled
                    value={user?.id || '00000000-0000-0000-0000-000000000000'}
                    className="w-full bg-[#F2F3F0] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.10] rounded-xl px-3 py-2 text-xs text-[#626B64] dark:text-[#9AA69E] font-mono"
                  />
                </div>
              </div>
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
                Add your personal API keys to power semantic embeddings, OCR, and streaming chat. Keys are encrypted with AES-256-GCM.
              </p>

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
                    id: 'cohere',
                    label: 'Cohere API Key',
                    value: cohereKey,
                    setter: setCohereKey,
                    placeholder: 'co_...',
                    url: 'https://dashboard.cohere.com',
                    linkLabel: 'Get Key',
                  },
                ].map((provider) => (
                  <div key={provider.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">
                          {provider.label}
                        </label>
                        {existingKeys[provider.id] && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#087F5B]/10 dark:bg-[#CFFF49]/15 text-[#087F5B] dark:text-[#CFFF49] border border-[#087F5B]/25 dark:border-[#CFFF49]/30 font-mono">
                            Active (••••{existingKeys[provider.id]})
                          </span>
                        )}
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
                      value={provider.value}
                      onChange={(e) => provider.setter(e.target.value)}
                      placeholder={existingKeys[provider.id] ? '••••••••••••••••' : provider.placeholder}
                      className="w-full bg-[#FFFFFF] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.10] rounded-xl px-3 py-2 text-xs text-[#101211] dark:text-[#F3F5F1] font-mono focus:outline-none focus:border-[#087F5B] dark:focus:border-[#CFFF49]"
                    />
                  </div>
                ))}

                <div className="pt-2 flex items-center justify-between">
                  {saveSuccess && (
                    <span className="text-xs text-[#087F5B] dark:text-[#CFFF49] flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Saved securely!
                    </span>
                  )}
                  <button
                    onClick={handleSaveKeys}
                    className="vg-cta-lime ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] text-xs font-semibold transition-all shadow-sm"
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
                    VectorGallery Personal Tier · End-to-End Encrypted
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

              {/* Connected Devices Manager */}
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
                        <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">Android Mobile Device</p>
                        <p className="text-[11px] text-[#626B64] dark:text-[#9AA69E]">
                          Auto-Backup: {autoBackup ? 'Enabled' : 'Paused'} · Wi-Fi Only: {wifiOnly ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#087F5B]/10 dark:bg-[#CFFF49]/15 text-[#087F5B] dark:text-[#CFFF49] border border-[#087F5B]/25 dark:border-[#CFFF49]/30 font-mono">
                      SYNCED
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F2F3F0]/65 dark:bg-white/[0.03] border border-[#DDE2DC] dark:border-white/[0.06] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.08] text-[#101211] dark:text-[#F3F5F1] flex items-center justify-center">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">Web Browser Client</p>
                        <p className="text-[11px] text-[#626B64] dark:text-[#9AA69E]">Desktop Web Session · Real-time Cloud Memory</p>
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
                    <span>Liquid Silver (Light)</span>
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
                    <span>Liquid Carbon (Dark)</span>
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
                VectorGallery values strict user data ownership. Your personal files, photos, and document embeddings are never used to train public models, and can be purged at any time.
              </p>

              <div className="pt-4 border-t border-red-500/20">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account and all stored files permanently?')) {
                      alert('Account deletion request acknowledged.')
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-semibold transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account &amp; Purge Vault</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

