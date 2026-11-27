import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/AuthContext'
import { SiteHeader } from '@/components/SiteHeader'
import { VG_COMPONENTS, VG_LAYOUT } from '@/components/landing/design-system'
import { cn } from '@/lib/utils'

interface ProviderKeyStatus {
  configured: boolean
  key_last4: string | null
  source: 'personal' | 'env' | 'none'
}

interface ProviderCardProps {
  id: string
  name: string
  description: string
  status: ProviderKeyStatus
  onOpenModal: (providerId: string, providerName: string) => void
  onRemoveKey: (providerId: string, providerName: string) => void
  loading: boolean
}

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Powers Gemini 2.5 Flash chat generation & 3072-dim embeddings',
    signupUrl: 'https://ai.google.dev',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Powers ultra-fast Llama 3.3 70B chat inference & HyDE expansion',
    signupUrl: 'https://console.groq.com',
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    description: 'Powers GPT-4o mini chat generation & text-embedding-3-small',
    signupUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Powers Cohere Command-A chat & embed-english-v3.0 embeddings',
    signupUrl: 'https://dashboard.cohere.com',
  },
]

export default function AccountPage() {
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [providerKeys, setProviderKeys] = useState<Record<string, ProviderKeyStatus>>({})
  const [fetching, setFetching] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [modalProvider, setModalProvider] = useState<{ id: string; name: string } | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account')
    }
  }, [user, authLoading, router])

  const getTokenHeaders = (): Record<string, string> => {
    let token = session?.access_token
    if (!token && typeof document !== 'undefined') {
      const match = document.cookie.match(/sb-access-token=([^;]+)/)
      if (match) token = match[1]
    }
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchUserStatus = async () => {
    try {
      setFetching(true)
      const res = await fetch('/api/auth/user', {
        headers: getTokenHeaders(),
      })

      if (res.ok) {
        const json = await res.json()
        setProviderKeys(json.providerKeys || {})
      }
    } catch (err) {
      console.error('Failed to fetch user status:', err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserStatus()
    } else if (!authLoading) {
      setFetching(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalProvider || !apiKeyInput.trim()) return

    setModalError(null)
    setActionLoading(modalProvider.id)

    try {
      const res = await fetch('/api/auth/provider-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getTokenHeaders(),
        },
        body: JSON.stringify({
          provider: modalProvider.id,
          apiKey: apiKeyInput.trim(),
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setModalError(json.error || 'Failed to save key')
      } else {
        setSaveSuccess(`Successfully saved ${modalProvider.name} API key!`)
        setTimeout(() => setSaveSuccess(null), 4000)
        setModalProvider(null)
        setApiKeyInput('')
        fetchUserStatus()
      }
    } catch (err: any) {
      setModalError(err.message || 'An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveKey = async (providerId: string, providerName: string) => {
    if (confirmRemoveId !== providerId) {
      setConfirmRemoveId(providerId)
      return
    }

    setActionLoading(providerId)
    try {
      const res = await fetch('/api/auth/provider-keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getTokenHeaders(),
        },
        body: JSON.stringify({ provider: providerId }),
      })

      if (res.ok) {
        setSaveSuccess(`Removed personal ${providerName} key.`)
        setTimeout(() => setSaveSuccess(null), 4000)
        setConfirmRemoveId(null)
        fetchUserStatus()
      }
    } catch (err) {
      console.error('Failed to remove key:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading || (!user && fetching)) {
    return (
      <div className="vg-shell min-h-screen bg-[var(--vg-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#087F5B]/20 dark:border-[#CFFF49]/20 border-t-[#087F5B] dark:border-t-[#CFFF49] rounded-full animate-spin" />
          <p className="text-sm font-medium text-[var(--vg-ink-2)]">Loading account portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="vg-shell min-h-screen bg-[var(--vg-bg)] text-[var(--vg-ink)] font-sans selection:bg-[#087F5B]/20 dark:selection:bg-[#CFFF49]/25">
      <Head>
        <title>Account &amp; API Keys — VectorGallery</title>
      </Head>

      <SiteHeader />

      {/* Main Container */}
      <main className={cn(VG_LAYOUT.containers.standard, 'py-10 sm:py-14')}>
        {/* Banner Alert */}
        {saveSuccess && (
          <div className="mb-8 p-4 rounded-2xl bg-[#C4EDE1]/60 dark:bg-[#131715] border border-[#087F5B]/30 dark:border-[#CFFF49]/35 text-[#066649] dark:text-[#CFFF49] text-sm flex items-center gap-3 shadow-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{saveSuccess}</span>
          </div>
        )}

        {/* User Profile Card */}
        <div className="bg-[var(--vg-surface)] border border-[var(--vg-border-strong)] rounded-3xl p-6 sm:p-8 shadow-[var(--vg-shadow-card)] mb-10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#D4FF54] dark:bg-[#CFFF49] flex items-center justify-center text-2xl font-display font-bold text-[#101211] shadow-sm shrink-0">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--vg-ink)] tracking-[-0.03em]">
                  Account &amp; Personal Keys
                </h1>
                <p className="text-sm text-[var(--vg-ink-2)] mt-1">{user?.email}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C4EDE1]/70 dark:bg-[#202522] border border-[#087F5B]/20 dark:border-[#CFFF49]/30 text-[#066649] dark:text-[#CFFF49] text-xs font-semibold">
                    Encrypted Key Storage Active
                  </span>
                </div>
              </div>
            </div>

            <Link href="/app" className={VG_COMPONENTS.buttons.limePill}>
              <span>Back to Workspaces</span>
            </Link>
          </div>
        </div>

        {/* Provider Keys Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--vg-ink)] tracking-[-0.025em]">
                AI Provider API Keys
              </h2>
              <p className="text-sm text-[var(--vg-ink-2)]">
                Configure your personal API keys for Gemini, Groq, OpenAI, and Cohere.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROVIDERS.map((provider) => {
              const status = providerKeys[provider.id] || { configured: false, key_last4: null, source: 'none' }
              return (
                <div
                  key={provider.id}
                  className="bg-[var(--vg-surface)] border border-[var(--vg-border)] hover:border-[var(--vg-border-strong)] rounded-2xl p-6 transition-all shadow-[var(--vg-shadow-card)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] flex items-center justify-center font-display font-bold text-[#087F5B] dark:text-[#CFFF49]">
                          {provider.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-[var(--vg-ink)] text-base">{provider.name}</h3>
                          <a
                            href={provider.signupUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#087F5B] dark:text-[#CFFF49] hover:underline flex items-center gap-1"
                          >
                            Get API Key
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>

                      {status.source === 'personal' ? (
                        <span className="px-3 py-1 rounded-full bg-[#C4EDE1]/70 dark:bg-[#202522] border border-[#087F5B]/25 dark:border-[#CFFF49]/30 text-[#066649] dark:text-[#CFFF49] text-xs font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-current" />
                          Personal Key
                        </span>
                      ) : status.source === 'env' ? (
                        <span className="px-3 py-1 rounded-full bg-[#E7E9E5] dark:bg-[#202522] border border-[var(--vg-border)] text-[var(--vg-ink)] text-xs font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#087F5B] dark:bg-[#39D9A0]" />
                          System Default
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-[var(--vg-ink-2)] text-xs font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--vg-ink-muted)]" />
                          Not Configured
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--vg-ink-2)] mb-4">{provider.description}</p>

                    {status.source === 'personal' && status.key_last4 && (
                      <div className="mb-4 p-2.5 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-xs text-[var(--vg-ink)] font-mono flex items-center justify-between">
                        <span className="text-[var(--vg-ink-2)]">Key ending:</span>
                        <span className="text-[#087F5B] dark:text-[#CFFF49] font-bold">•••• •••• •••• {status.key_last4}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-[var(--vg-border)]">
                    <button
                      onClick={() => {
                        setModalProvider({ id: provider.id, name: provider.name })
                        setApiKeyInput('')
                        setModalError(null)
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--vg-surface-2)] hover:bg-[#D4FF54] dark:hover:bg-[#CFFF49] hover:text-[#101211] border border-[var(--vg-border)] text-[var(--vg-ink)] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {status.source === 'personal' ? 'Update Key' : 'Add Personal Key'}
                    </button>

                    {status.source === 'personal' && (
                      <button
                        onClick={() => handleRemoveKey(provider.id, provider.name)}
                        disabled={actionLoading === provider.id}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {confirmRemoveId === provider.id ? 'Confirm Remove' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Security Box */}
        <div className="mt-10 p-6 rounded-3xl bg-[var(--vg-surface)] border border-[var(--vg-border)] text-xs text-[var(--vg-ink-2)] space-y-2 shadow-sm">
          <h4 className="font-display text-sm font-bold text-[var(--vg-ink)] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security &amp; Key Storage Guarantee
          </h4>
          <p>
            Your API keys are encrypted at rest using AES-256-GCM symmetric encryption using a server-side encryption key. Raw keys are never sent to the browser after saving, and are decrypted strictly on the backend when executing authorized requests.
          </p>
        </div>
      </main>

      {/* Modal for adding/updating key */}
      {modalProvider && (
        <div className="fixed inset-0 z-50 bg-[#090B0A]/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--vg-surface)] border border-[var(--vg-border-strong)] w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-[var(--vg-ink)]">
                Add {modalProvider.name} Key
              </h3>
              <button
                onClick={() => setModalProvider(null)}
                className="text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] p-1 rounded-lg hover:bg-[var(--vg-surface-2)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--vg-ink-2)] mb-1.5 uppercase tracking-wider">
                  API Key String
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    required
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Paste your key here..."
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-[var(--vg-ink)] text-xs font-mono placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[#087F5B]/30 dark:focus:ring-[#CFFF49]/30 focus:border-[var(--vg-brand)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vg-ink-3)] hover:text-[var(--vg-ink)] text-xs"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalProvider(null)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[var(--vg-surface-2)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === modalProvider.id || !apiKeyInput.trim()}
                  className={cn(VG_COMPONENTS.buttons.limePill, 'h-10 px-5 text-xs disabled:opacity-50')}
                >
                  {actionLoading === modalProvider.id ? 'Encrypting & Saving...' : 'Save Encrypted Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
