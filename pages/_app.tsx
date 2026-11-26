import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { AuthProvider } from '@/lib/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const resolveTheme = () => {
      const pref = localStorage.getItem('vm_theme')
      if (pref === 'dark') return 'dark'
      if (pref === 'light') return 'light'
      return window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }

    const applyTheme = () => {
      const resolved = resolveTheme()
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }

    applyTheme()
    window.addEventListener('vm_theme_change', applyTheme)
    window.addEventListener('storage', applyTheme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onMediaChange = () => {
      const pref = localStorage.getItem('vm_theme')
      if (!pref || pref === 'system') applyTheme()
    }
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onMediaChange)
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {})
      })
    }

    return () => {
      window.removeEventListener('vm_theme_change', applyTheme)
      window.removeEventListener('storage', applyTheme)
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', onMediaChange)
      }
    }
  }, [])

  return (
    <AuthProvider>
      <Head>
        <title>VectorGallery — Your Personal AI Cloud &amp; Digital Memories</title>
        <meta name="application-name" content="VectorGallery" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VectorGallery" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#087F5B" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
