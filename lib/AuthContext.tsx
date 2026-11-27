import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabaseClient'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ data: null, error: null }),
  signIn: async () => ({ data: null, error: null }),
  signOut: async () => { },
  refreshSession: async () => { },
})

function syncBrowserUserCache(currentUser: User | null, token?: string | null) {
  if (typeof window === 'undefined') return
  if (currentUser?.email) {
    localStorage.setItem('vm_user_email', currentUser.email)
    localStorage.setItem(
      'vm_user_name',
      currentUser.user_metadata?.full_name || currentUser.email.split('@')[0]
    )
    if (token) {
      document.cookie = `sb-access-token=${token}; path=/; max-age=604800; SameSite=Lax`
    }
  } else {
    localStorage.removeItem('vm_user_email')
    localStorage.removeItem('vm_user_name')
  }
  window.dispatchEvent(new Event('vectormind_auth_change'))
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabaseEnabled = isSupabaseConfigured()

  const hydrateSession = useCallback(async () => {
    try {
      if (!supabaseEnabled) {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const json = await res.json()
          const currentUser = json?.user ?? null
          const currentSession = json?.session ?? null
          setUser(currentUser)
          setSession(currentSession)
          syncBrowserUserCache(currentUser, currentSession?.access_token)
        } else {
          setUser(null)
          setSession(null)
        }
        return
      }

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (currentSession?.access_token) {
        syncBrowserUserCache(currentSession.user, currentSession.access_token)
      }
    } catch (err) {
      console.error('Error getting auth session:', err)
    } finally {
      setLoading(false)
    }
  }, [supabaseEnabled])

  useEffect(() => {
    hydrateSession()

    if (!supabaseEnabled) {
      const onAuthChanged = () => {
        // Re-sync cleanly when auth events fire across tabs or profile updates
      }
      window.addEventListener('vectormind_auth_change', onAuthChanged)
      return () => window.removeEventListener('vectormind_auth_change', onAuthChanged)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)

      if (currentSession?.access_token) {
        syncBrowserUserCache(currentSession.user, currentSession.access_token)
      } else {
        document.cookie = 'sb-access-token=; path=/; max-age=0'
        syncBrowserUserCache(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [hydrateSession, supabaseEnabled])

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const json = await res.json()
      if (!res.ok) {
        return { data: null, error: { message: json.error || 'Failed to create account' } }
      }
      if (supabaseEnabled && json?.session?.access_token && json?.session?.refresh_token) {
        await supabase.auth
          .setSession({
            access_token: json.session.access_token,
            refresh_token: json.session.refresh_token,
          })
          .catch(() => {})
      }
      setSession(json.session)
      setUser(json.user)
      syncBrowserUserCache(json.user, json.session?.access_token)
      return { data: json, error: null }
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Network error during signup' } }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabaseEnabled) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const json = await res.json()
        if (!res.ok) {
          return { data: null, error: { message: json.error || 'Invalid email or password.' } }
        }
        setSession(json.session)
        setUser(json.user)
        syncBrowserUserCache(json.user, json.session?.access_token)
        return { data: json, error: null }
      } catch (err: any) {
        return { data: null, error: { message: err.message || 'Network error during sign in' } }
      }
    }

    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (res.data?.session) {
      setSession(res.data.session)
      setUser(res.data.session.user)
      syncBrowserUserCache(res.data.session.user, res.data.session.access_token)
    }
    return res
  }

  const signOut = async () => {
    if (!supabaseEnabled) {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => { })
    } else {
      await supabase.auth.signOut().catch(() => { })
    }
    setSession(null)
    setUser(null)
    if (typeof document !== 'undefined') {
      document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax'
    }
    syncBrowserUserCache(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        refreshSession: hydrateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
