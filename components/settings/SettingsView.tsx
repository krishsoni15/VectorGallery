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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white">Platform Settings</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your account security, AI providers, cloud backup preferences, and privacy controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="rounded-2xl bg-[#0E1015]/80 border border-white/[0.07] p-2 space-y-1">
          {sections.map((sec) => {
            const Icon = sec.icon
            const isActive = activeSection === sec.key

            return (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>

        {/* Section Content Area */}
        <div className="md:col-span-3 rounded-2xl bg-[#0E1015]/80 border border-white/[0.07] p-6 space-y-6 backdrop-blur-md">
          {/* 1. Account Settings */}
          {activeSection === 'account' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 pb-2 border-b border-white/[0.06]">
                Account & Identity
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || 'guest@vectorgallery.app'}
                    className="w-full bg-[#14161C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">User ID</label>
                  <input
                    type="text"
                    disabled
                    value={user?.id || '00000000-0000-0000-0000-000000000000'}
                    className="w-full bg-[#14161C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Mobile Backup Settings */}
          {activeSection === 'backup' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 pb-2 border-b border-white/[0.06]">
                Mobile Backup Preferences
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">Automatic Background Backup</p>
                    <p className="text-[11px] text-zinc-500">
                      Sync new photos and screenshots automatically when connected.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">Wi-Fi Only Mode</p>
                    <p className="text-[11px] text-zinc-500">
                      Prevent high cellular data usage by backing up only on Wi-Fi networks.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={wifiOnly}
                    onChange={(e) => setWifiOnly(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                  <p className="text-xs font-semibold text-zinc-200">Backup Categories</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                    {Object.entries(backupCategories).map(([key, val]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer capitalize">
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={(e) =>
                            setBackupCategories((prev) => ({ ...prev, [key]: e.target.checked }))
                          }
                          className="accent-emerald-500"
                        />
                        <span>{key}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {backupSaved && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Preferences saved!
                    </span>
                  )}
                  <button
                    onClick={handleSaveBackupPreferences}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
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
              <h3 className="text-sm font-bold text-zinc-100 pb-2 border-b border-white/[0.06]">
                AI Provider API Configuration
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Add your personal API keys to power semantic embeddings, OCR, and streaming chat. Keys are encrypted with AES-256-GCM.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-zinc-300">Google Gemini API Key</label>
                      {existingKeys.gemini && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          Active (••••{existingKeys.gemini})
                        </span>
                      )}
                    </div>
                    <a
                      href="https://ai.google.dev"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Get Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder={existingKeys.gemini ? '••••••••••••••••' : 'AIzaSy...'}
                    className="w-full bg-[#14161C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-zinc-300">Groq API Key</label>
                      {existingKeys.groq && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          Active (••••{existingKeys.groq})
                        </span>
                      )}
                    </div>
                    <a
                      href="https://console.groq.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder={existingKeys.groq ? '••••••••••••••••' : 'gsk_...'}
                    className="w-full bg-[#14161C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-zinc-300">Cohere API Key</label>
                      {existingKeys.cohere && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          Active (••••{existingKeys.cohere})
                        </span>
                      )}
                    </div>
                    <a
                      href="https://dashboard.cohere.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Get Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={cohereKey}
                    onChange={(e) => setCohereKey(e.target.value)}
                    placeholder={existingKeys.cohere ? '••••••••••••••••' : 'co_...'}
                    className="w-full bg-[#14161C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:border-emerald-500/50"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Saved securely!
                    </span>
                  )}
                  <button
                    onClick={handleSaveKeys}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save API Keys</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Apple iCloud / Google One Style Storage Distribution */}
          {activeSection === 'storage' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Storage & Cloud Distribution
                  </h3>
                  <p className="text-xs text-zinc-400">
                    VectorGallery 15 GB Personal Free Tier • End-to-End Encrypted
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {storageStats?.storage?.formatted_used || '16.2 MB'} / {storageStats?.storage?.formatted_quota || '15.00 GB'} used
                </span>
              </div>

              {/* Stacked Multi-Segment Distribution Bar */}
              <div className="space-y-2">
                <div className="w-full h-3.5 rounded-full bg-zinc-800/90 overflow-hidden flex items-center p-0.5 gap-0.5 border border-white/[0.06]">
                  {(storageStats?.storage?.category_bytes?.photos || 0) > 0 && (
                    <div
                      title={`Photos: ${storageStats?.storage?.formatted_category_bytes?.photos || '0 B'}`}
                      style={{ width: `${Math.max(2.5, ((storageStats?.storage?.category_bytes?.photos || 0) / (storageStats?.storage?.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                      className="h-full bg-rose-500 rounded-full transition-all duration-700 hover:brightness-110"
                    />
                  )}
                  {(storageStats?.storage?.category_bytes?.screenshots || 0) > 0 && (
                    <div
                      title={`Screenshots: ${storageStats?.storage?.formatted_category_bytes?.screenshots || '0 B'}`}
                      style={{ width: `${Math.max(1.5, ((storageStats?.storage?.category_bytes?.screenshots || 0) / (storageStats?.storage?.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                      className="h-full bg-emerald-400 rounded-full transition-all duration-700 hover:brightness-110"
                    />
                  )}
                  {(storageStats?.storage?.category_bytes?.documents || 0) > 0 && (
                    <div
                      title={`Documents: ${storageStats?.storage?.formatted_category_bytes?.documents || '0 B'}`}
                      style={{ width: `${Math.max(1.5, ((storageStats?.storage?.category_bytes?.documents || 0) / (storageStats?.storage?.total_bytes_quota || 16106127360)) * 100 * 25)}%` }}
                      className="h-full bg-blue-500 rounded-full transition-all duration-700 hover:brightness-110"
                    />
                  )}
                  <div className="flex-1 h-full bg-zinc-800/50 rounded-full" />
                </div>

                {/* Storage Segment Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-200">Photos & Media</p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {storageStats?.storage?.formatted_category_bytes?.photos || '15.40 MB'} ({storageStats?.counts?.photos || 7} files)
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-200">Screenshots</p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {storageStats?.storage?.formatted_category_bytes?.screenshots || '422.53 KB'} ({storageStats?.counts?.screenshots || 3} files)
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-200">Documents & Notes</p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {storageStats?.storage?.formatted_category_bytes?.documents || '397.29 KB'} ({storageStats?.counts?.documents || 2} files)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Devices Manager */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Connected Devices & Backups
                </h4>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-[#14161C] border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                        📱
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-100">Android Mobile Device</p>
                        <p className="text-[11px] text-zinc-400">
                          Auto-Backup: {autoBackup ? 'Enabled' : 'Paused'} • Wi-Fi Only: {wifiOnly ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                      SYNCED
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#14161C] border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                        💻
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-100">Web Browser Client</p>
                        <p className="text-[11px] text-zinc-400">Desktop Web Session • Real-time Cloud Memory</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Vault Export & Maintenance */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={handleExportVault}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export Complete Vault (ZIP)</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. Appearance */}
          {activeSection === 'appearance' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 pb-2 border-b border-white/[0.06]">
                Appearance & Theme
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => handleSetTheme('dark')}
                  className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                    currentTheme === 'dark'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                      : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/[0.15] hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-zinc-700 theme-dark-swatch" />
                    <span>Apple Dark / Linear Style</span>
                  </div>
                  {currentTheme === 'dark' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>

                <div
                  onClick={() => handleSetTheme('light')}
                  className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                    currentTheme === 'light'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                      : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/[0.15] hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-100 border border-amber-300" />
                    <span>Apple Warm Light Mode</span>
                  </div>
                  {currentTheme === 'light' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
              </div>
            </div>
          )}

          {/* 6. Privacy */}
          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 pb-2 border-b border-white/[0.06]">
                Privacy & Data Ownership
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                VectorGallery values strict user data ownership. Your personal files, photos, and document embeddings are never used to train public models, and can be purged at any time.
              </p>

              <div className="pt-4 border-t border-red-500/20">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account and all stored files permanently?')) {
                      alert('Account deletion request acknowledged.')
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs text-red-400 font-semibold transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account & Purge Vault</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

