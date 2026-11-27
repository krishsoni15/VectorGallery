import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { VG_SPHERE_THEME_SPEC } from '@/components/landing/design-system'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { cn } from '@/lib/utils'

interface MemorySphereCanvasProps {
  mode?: 'hero' | 'story' | 'closing'
  progress?: number
  entranceProgress?: number
  themeMode?: 'light' | 'dark' | 'auto'
  className?: string
  priority?: boolean
  showPauseControl?: boolean
}

function isFinePointer(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(pointer: fine)').matches
}

/**
 * VectorGallery Signature Memory Sphere Host.
 * Renders the smooth studio-rendered liquid-titanium & acid-lime glass sphere loop (`memory-sphere-hero.webp`),
 * paired with pointer-driven 3D perspective parallax, optical specular glint sweep, accessible pause control,
 * and instant transparent static poster fallback under prefers-reduced-motion or slow networks.
 */
export function MemorySphereCanvas({
  mode = 'hero',
  progress = 0,
  entranceProgress = 1,
  themeMode = 'auto',
  className,
  priority = true,
  showPauseControl = false,
}: MemorySphereCanvasProps) {
  void mode
  void progress
  const reduced = useReducedMotion()
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    themeMode === 'dark' ? 'dark' : 'light'
  )
  const [animReady, setAnimReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [mounted, setMounted] = useState(false)

  const tiltXRaw = useMotionValue(0)
  const tiltYRaw = useMotionValue(0)
  const specXRaw = useMotionValue(50)
  const specYRaw = useMotionValue(35)

  const tiltX = useSpring(tiltXRaw, { stiffness: 110, damping: 20 })
  const tiltY = useSpring(tiltYRaw, { stiffness: 110, damping: 20 })
  const specX = useSpring(specXRaw, { stiffness: 90, damping: 22 })
  const specY = useSpring(specYRaw, { stiffness: 90, damping: 22 })

  useEffect(() => {
    setMounted(true)
    if (typeof window === 'undefined') return
    const syncTheme = () => {
      const next =
        themeMode !== 'auto'
          ? themeMode
          : document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light'
      setResolvedTheme(next)
    }
    syncTheme()

    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [themeMode])

  useEffect(() => {
    if (reduced || paused || typeof window === 'undefined') return
    const handleMove = (e: PointerEvent) => {
      if (!isFinePointer()) return
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
      tiltYRaw.set(Math.max(-1, Math.min(1, nx)) * 8.5)
      tiltXRaw.set(Math.max(-1, Math.min(1, ny)) * -6.5)
      specXRaw.set(50 + nx * 24)
      specYRaw.set(42 + ny * 18)
    }
    window.addEventListener('pointermove', handleMove, { passive: true })
    return () => window.removeEventListener('pointermove', handleMove)
  }, [reduced, paused, tiltXRaw, tiltYRaw, specXRaw, specYRaw])

  const useStaticPoster = !mounted || reduced || paused
  const entranceScale = 0.92 + 0.08 * Math.max(0, Math.min(1, entranceProgress))

  return (
    <div
      className={cn(
        'group relative flex items-center justify-center select-none pointer-events-none',
        className
      )}
    >
      {/* Grounded contact shadow & soft emerald-lime floor bounce beneath the floating sculpture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-2%] left-1/2 -translate-x-1/2 w-[60%] h-[18%] rounded-full blur-2xl opacity-70 dark:opacity-85 transition-opacity duration-500"
        style={{
          background:
            resolvedTheme === 'dark'
              ? 'radial-gradient(ellipse at center, rgba(205,255,69,0.16) 0%, rgba(70,214,164,0.08) 38%, rgba(0,0,0,0.92) 72%, transparent 100%)'
              : 'radial-gradient(ellipse at center, rgba(16,18,17,0.22) 0%, rgba(188,197,200,0.14) 55%, transparent 100%)',
        }}
      />

      {/* Interactive 3D perspective stage keeping aspect-[1.44/1] proportions clean without clipping */}
      <motion.div
        style={
          reduced || paused
            ? undefined
            : {
                transformPerspective: 1200,
                rotateX: tiltX,
                rotateY: tiltY,
                scale: entranceScale,
              }
        }
        className="relative z-10 w-full aspect-[1.44/1] overflow-visible transition-transform duration-300"
      >
        {/* Soft studio reflection highlight shifting smoothly across pointer input */}
        {mounted && !reduced && !paused && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[12%] rounded-full opacity-35 dark:opacity-25 blur-2xl mix-blend-screen"
            style={{
              left: specX as unknown as string,
              top: specY as unknown as string,
              transform: 'translate(-50%, -50%)',
              width: '54%',
              height: '54%',
              background:
                'radial-gradient(circle, rgba(205,255,69,0.38) 0%, rgba(184,197,204,0.18) 50%, transparent 75%)',
            }}
          />
        )}

        <img
          src={VG_SPHERE_THEME_SPEC.heroVideoPoster}
          alt="VectorGallery translucent acid-lime and liquid-titanium Memory Sphere sculpture"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'w-[126%] max-w-none aspect-square object-contain absolute left-1/2 top-1/2 -translate-x-[48.8%] -translate-y-1/2 transition-opacity duration-300',
            animReady && !useStaticPoster ? 'opacity-0' : 'opacity-100'
          )}
        />

        {!useStaticPoster && (
          <img
            src={VG_SPHERE_THEME_SPEC.heroAnimWebp}
            alt="Animated liquid-titanium and acid-lime glass Memory Sphere sculpture"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setAnimReady(true)}
            className={cn(
              'w-[126%] max-w-none aspect-square object-contain absolute left-1/2 top-1/2 -translate-x-[48.8%] -translate-y-1/2 transition-opacity duration-300',
              animReady ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
      </motion.div>

      {/* Accessible Motion Pause Control */}
      {showPauseControl && mounted && !reduced && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Resume Memory Sphere motion' : 'Pause Memory Sphere motion'}
          title={paused ? 'Resume animation' : 'Pause animation'}
          className="pointer-events-auto absolute bottom-2 right-2 sm:bottom-4 sm:right-6 z-30 w-8 h-8 rounded-full bg-[var(--vg-surface)]/85 opacity-0 hover:opacity-100 focus-visible:opacity-100 border border-[var(--vg-border)] backdrop-blur-md flex items-center justify-center text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]"
        >
          {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  )
}
