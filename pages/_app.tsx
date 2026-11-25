import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { AuthProvider } from '@/lib/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 1. Initialize Theme from localStorage
    if (typeof window !== 'undefined') {
      const applyTheme = () => {
        const savedTheme = localStorage.getItem('vm_theme')
        if (savedTheme === 'light') {
          document.documentElement.classList.add('light')
          document.documentElement.classList.remove('dark')
        } else {
          document.documentElement.classList.add('dark')
          document.documentElement.classList.remove('light')
        }
      }
      applyTheme()
      window.addEventListener('vm_theme_change', applyTheme)
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (reg) => console.log('VectorGallery ServiceWorker registered: ', reg.scope),
          (err) => console.log('VectorGallery ServiceWorker registration failed: ', err)
        )
      })
    }
  }, [])

  return (
    <AuthProvider>
      <Head>
        <title>VectorGallery — Hybrid RAG &amp; CAG Document Intelligence Platform</title>
        <meta name="application-name" content="VectorGallery" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VectorGallery" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#10b981" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/vectorgallery-icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

