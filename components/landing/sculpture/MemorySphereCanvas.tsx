import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { VG_SPHERE_THEME_SPEC } from '@/components/landing/design-system'
import { useClientReducedMotion } from '@/components/landing/motion/LivingMotionPrimitives'
import { cn } from '@/lib/utils'

interface MemorySphereCanvasProps {
  /** Render mode: hero continuous sculpture video centerpiece or story */
  mode?: 'hero' | 'story'
  /** Normalized scroll progress 0..1 */
  progress?: number
  /** Force explicit theme or auto-detect html.dark / html.light */
  themeMode?: 'light' | 'dark' | 'auto'
  className?: string
  priority?: boolean
}

/**
 * Interactive Looping 3D Memory Sphere Sculpture.
 * Uses the transparent alpha-matted studio 3D sculpture loop (memory-sphere-hero.webm)
 * directly in Hero with cursor-linked 3D spring depth parallax, subtle orbital aura shadow,
 * and automatic crisp static transparent fallback under prefers-reduced-motion.
 */
export function MemorySphereCanvas({
  mode = 'hero',
  progress = 0,
  themeMode = 'auto',
  className,
  priority = true,
}: MemorySphereCanvasProps) {
  void mode
  void progress
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    themeMode === 'dark' ? 'dark' : 'light'
  )
  const [videoReady, setVideoReady] = useState(false)

  const reduced = useClientReducedMotion()

  const tiltXRaw = useMotionValue(0)
  const tiltYRaw = useMotionValue(0)
  const tiltX = useSpring(tiltXRaw, { stiffness: 115, damping: 20 })
  const tiltY = useSpring(tiltYRaw, { stiffness: 115, damping: 20 })

  useEffect(() => {
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
    if (reduced || typeof window === 'undefined') return
    const handleMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
      tiltYRaw.set(Math.max(-1, Math.min(1, nx)) * 8.5)
      tiltXRaw.set(Math.max(-1, Math.min(1, ny)) * -6.5)
    }
    window.addEventListener('pointermove', handleMove, { passive: true })
    return () => window.removeEventListener('pointermove', handleMove)
  }, [reduced, tiltXRaw, tiltYRaw])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid || reduced) return
    if (vid.readyState >= 2) {
      setVideoReady(true)
    }
    vid.play().catch(() => {})
  }, [reduced])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center select-none pointer-events-none',
        className
      )}
    >
      {/* Ambient ground shadow below the floating sphere */}
      <div
        aria-hidden="true"
        className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[56%] h-[11%] rounded-full blur-2xl opacity-65 dark:opacity-80 transition-opacity duration-500"
        style={{
          background:
            resolvedTheme === 'dark'
              ? 'radial-gradient(ellipse at center, rgba(207,255,73,0.18) 0%, rgba(0,0,0,0.88) 68%, transparent 100%)'
              : 'radial-gradient(ellipse at center, rgba(16,18,17,0.22) 0%, rgba(16,18,17,0.06) 58%, transparent 100%)',
        }}
      />

      {/* Interactive 3D perspective stage holding both crisp transparent poster & looping VP9 alpha video */}
      <motion.div
        style={
          reduced
            ? undefined
            : {
                transformPerspective: 1100,
                rotateX: tiltX,
                rotateY: tiltY,
              }
        }
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <img
          src={VG_SPHERE_THEME_SPEC.heroVideoPoster}
          alt="VectorGallery translucent acid-lime and liquid-silver Memory Sphere sculpture"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'w-full h-full object-contain scale-[1.10] transition-opacity duration-300',
            videoReady && !reduced ? 'opacity-0' : 'opacity-100'
          )}
        />

        {!reduced && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={VG_SPHERE_THEME_SPEC.heroVideoPoster}
            onCanPlay={() => setVideoReady(true)}
            onLoadedData={() => setVideoReady(true)}
            onPlaying={() => setVideoReady(true)}
            aria-label="Animated 3D acid-lime glass and liquid-silver Memory Sphere sculpture"
            className={cn(
              'absolute inset-0 w-full h-full object-contain scale-[1.10] transition-opacity duration-300',
              videoReady ? 'opacity-100' : 'opacity-0'
            )}
          >
            <source src={VG_SPHERE_THEME_SPEC.heroVideoWebm} type="video/webm" />
          </video>
        )}
      </motion.div>
    </div>
  )
}
