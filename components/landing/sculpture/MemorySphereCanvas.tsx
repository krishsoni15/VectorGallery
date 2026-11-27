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
 * Interactive Endless-Loop 3D Memory Sphere Sculpture.
 * Uses the infinite-loop (-loop 0) transparent 32-bit RGBA Animated WebP sculpture
 * (memory-sphere-hero.webp) directly in Hero with cursor-linked 3D spring depth parallax,
 * subtle ambient ground shadow, and instant static poster fallback under prefers-reduced-motion.
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
  const animRef = useRef<HTMLImageElement>(null)

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    themeMode === 'dark' ? 'dark' : 'light'
  )
  const [animReady, setAnimReady] = useState(false)

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
    if (reduced) return
    const el = animRef.current
    if (el && el.complete && el.naturalWidth > 0) {
      setAnimReady(true)
    }
  }, [reduced])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center select-none pointer-events-none',
        className
      )}
    >
      {/* Ambient ground shadow directly underneath the tight-cropped floating sphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-4%] left-1/2 -translate-x-1/2 w-[54%] h-[18%] rounded-full blur-2xl opacity-65 dark:opacity-85 transition-opacity duration-500"
        style={{
          background:
            resolvedTheme === 'dark'
              ? 'radial-gradient(ellipse at center, rgba(207,255,73,0.18) 0%, rgba(0,0,0,0.88) 68%, transparent 100%)'
              : 'radial-gradient(ellipse at center, rgba(16,18,17,0.24) 0%, rgba(16,18,17,0.06) 58%, transparent 100%)',
        }}
      />

      {/* Interactive 3D perspective stage holding instant transparent poster & infinite-loop RGBA WebP.
          Both images are positioned absolutely so the stage keeps strict aspect-[1.44/1] visible bounds
          while alpha=0 top/bottom margins bleed invisibly with overflow-visible. */}
      <motion.div
        style={
          reduced
            ? undefined
            : {
                transformPerspective: 1150,
                rotateX: tiltX,
                rotateY: tiltY,
              }
        }
        className="relative z-10 w-full aspect-[1.44/1] overflow-visible"
      >
        <img
          src={VG_SPHERE_THEME_SPEC.heroVideoPoster}
          alt="VectorGallery translucent acid-lime and liquid-silver Memory Sphere sculpture"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'w-[126%] max-w-none aspect-square object-contain absolute left-1/2 top-1/2 -translate-x-[48.8%] -translate-y-1/2 transition-opacity duration-300',
            animReady && !reduced ? 'opacity-0' : 'opacity-100'
          )}
        />

        {!reduced && (
          <img
            ref={animRef}
            src={VG_SPHERE_THEME_SPEC.heroAnimWebp}
            alt="Animated 3D acid-lime glass and liquid-silver Memory Sphere sculpture"
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
    </div>
  )
}
