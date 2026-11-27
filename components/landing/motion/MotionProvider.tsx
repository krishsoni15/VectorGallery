import React, { createContext, useContext, useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'

interface MotionContextValue {
  reducedMotion: boolean
}

const MotionContext = createContext<MotionContextValue>({ reducedMotion: false })

export function useLandingMotion() {
  return useContext(MotionContext)
}

/**
 * Centralized GSAP + ScrollTrigger & Framer Motion coordinator for VectorGallery.
 * Registers ScrollTrigger cleanly once, refreshes geometry after font/image readiness,
 * and cleans up cleanly on unmount without overriding native scrolling.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (typeof window === 'undefined') return
    let active = true
    let refreshTimer = 0
    let stPlugin: { refresh: () => void } | null = null

    const init = async () => {
      try {
        const [gsapMod, stMod] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])
        if (!active) return
        const gsap = gsapMod.gsap || gsapMod.default
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default
        gsap.registerPlugin(ScrollTrigger)
        stPlugin = ScrollTrigger

        if (document.fonts?.ready) {
          document.fonts.ready.then(() => {
            if (active) stPlugin?.refresh()
          })
        }
        refreshTimer = window.setTimeout(() => {
          if (active) stPlugin?.refresh()
        }, 350)
      } catch {
        // Fallback smoothly if GSAP failed to load
      }
    }

    const onLoad = () => stPlugin?.refresh()
    window.addEventListener('load', onLoad, { passive: true })
    init()

    return () => {
      active = false
      window.clearTimeout(refreshTimer)
      window.removeEventListener('load', onLoad)
    }
  }, [])

  return (
    <MotionContext.Provider value={{ reducedMotion }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </MotionContext.Provider>
  )
}

