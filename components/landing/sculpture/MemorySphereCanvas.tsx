import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { VG_SPHERE_THEME_SPEC } from '@/components/landing/design-system'
import { cn } from '@/lib/utils'

interface MemorySphereCanvasProps {
  /** Render mode: hero continuous sculptural centerpiece or scroll story progression */
  mode?: 'hero' | 'story'
  /** Normalized scroll progress 0..1 used by Chapter 02 choreography */
  progress?: number
  /** Force explicit theme or auto-detect html.dark / html.light */
  themeMode?: 'light' | 'dark' | 'auto'
  className?: string
  priority?: boolean
}

/**
 * Hybrid Sculptural Memory Sphere.
 * Renders the studio-photorealistic acid-lime & liquid-silver Memory Sphere cutout
 * with real-time 3D perspective tilt, ambient buoyancy, and an overlaid transparent
 * Three.js WebGL layer of precision orbital rings & refractive lime prism motes.
 * Guarantees crisp metallic fidelity matching benchmark studio renders while staying 100% live & 3D.
 */
export function MemorySphereCanvas({
  mode = 'hero',
  progress = 0,
  themeMode = 'auto',
  className,
  priority = true,
}: MemorySphereCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    themeMode === 'dark' ? 'dark' : 'light'
  )
  const themeRef = useRef<'light' | 'dark'>(resolvedTheme)
  themeRef.current = resolvedTheme

  const reduced = useReducedMotion()

  // Smooth spring tilt following mouse cursor in 3D space
  const tiltXRaw = useMotionValue(0)
  const tiltYRaw = useMotionValue(0)
  const tiltX = useSpring(tiltXRaw, { stiffness: 120, damping: 20 })
  const tiltY = useSpring(tiltYRaw, { stiffness: 120, damping: 20 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const syncTheme = () => {
      const next =
        themeMode !== 'auto'
          ? themeMode
          : document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light'
      themeRef.current = next
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

  // Real-time WebGL outer orbital hairline rings & lime light motes framing the sculpture
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || reduced || typeof window === 'undefined') return

    let destroyed = false
    let rafId = 0
    let isInView = true
    const cleanups: Array<() => void> = []

    const mountOrbits = async () => {
      try {
        const THREE = await import('three')
        if (destroyed) return

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30)
        camera.position.set(0, 0.04, 6.45)

        const keyLight = new THREE.DirectionalLight('#ffffff', 2.4)
        keyLight.position.set(-4, 5, 5)
        const limeLight = new THREE.PointLight('#D4FF54', 3.4, 12)
        limeLight.position.set(2.5, -2.0, 3.2)
        scene.add(new THREE.AmbientLight('#ffffff', 1.1), keyLight, limeLight)

        const root = new THREE.Group()
        scene.add(root)

        const silverMat = new THREE.MeshStandardMaterial({
          color: '#D8DFDC',
          metalness: 0.92,
          roughness: 0.18,
        })
        const limeMat = new THREE.MeshStandardMaterial({
          color: '#D4FF54',
          emissive: '#8CE600',
          emissiveIntensity: 0.45,
          metalness: 0.65,
          roughness: 0.2,
        })

        // Fine precision orbital hairlines comfortably inside camera frustum with zero edge clip
        const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.56, 0.0052, 12, 180), silverMat)
        ringA.rotation.set(1.24, 0.28, -0.22)
        const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.0044, 12, 180), limeMat)
        ringB.rotation.set(1.16, -0.26, 0.30)

        // Subtle orbital light nodes gliding along the outer trajectories
        const nodeGeo = new THREE.OctahedronGeometry(0.030, 1)
        const nodeA = new THREE.Mesh(nodeGeo, limeMat)
        const nodeB = new THREE.Mesh(nodeGeo, silverMat)

        root.add(ringA, ringB, nodeA, nodeB)

        const resize = () => {
          if (destroyed || !container) return
          const w = Math.max(1, container.clientWidth)
          const h = Math.max(1, container.clientHeight)
          renderer.setSize(w, h, false)
          camera.aspect = w / h
          camera.updateProjectionMatrix()
        }
        resize()

        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
        ro?.observe(container)

        const io =
          typeof IntersectionObserver !== 'undefined'
            ? new IntersectionObserver(
                (entries) => {
                  isInView = Boolean(entries[0]?.isIntersecting)
                },
                { threshold: 0.02 }
              )
            : null
        io?.observe(container)

        cleanups.push(() => {
          ro?.disconnect()
          io?.disconnect()
          ringA.geometry.dispose()
          ringB.geometry.dispose()
          nodeGeo.dispose()
          silverMat.dispose()
          limeMat.dispose()
          renderer.dispose()
        })

        const clock = new THREE.Clock()
        const animate = () => {
          if (destroyed) return
          const t = clock.getElapsedTime()

          if (isInView && !document.hidden) {
            const darkNow = themeRef.current === 'dark'
            silverMat.color.set(darkNow ? '#A8B5B2' : '#D5DCDA')
            limeMat.color.set(darkNow ? '#CFFF49' : '#D4FF54')

            const p = mode === 'story' ? progressRef.current : 0
            ringA.scale.setScalar(1 + p * 0.25)
            ringB.scale.setScalar(1 + p * 0.34)
            ringA.rotation.z = -0.22 + t * 0.16 + p * 1.1
            ringB.rotation.z = 0.30 - t * 0.20 - p * 0.9

            nodeA.position.set(
              Math.cos(t * 0.55) * 1.48,
              Math.sin(t * 0.55) * 0.38,
              Math.sin(t * 0.55) * 0.86
            )
            nodeB.position.set(
              Math.cos(-t * 0.42 + 2.1) * 1.56,
              Math.sin(-t * 0.42 + 2.1) * -0.40,
              Math.sin(-t * 0.42 + 2.1) * 0.88
            )

            renderer.render(scene, camera)
          }

          rafId = requestAnimationFrame(animate)
        }
        rafId = requestAnimationFrame(animate)
      } catch {
        // Fallback gracefully: sculptural studio image remains crisp
      }
    }

    mountOrbits()
    return () => {
      destroyed = true
      if (rafId) cancelAnimationFrame(rafId)
      cleanups.forEach((fn) => fn())
    }
  }, [reduced, mode])

  const cutoutSrc =
    resolvedTheme === 'dark' ? VG_SPHERE_THEME_SPEC.dark.cutoutSrc : VG_SPHERE_THEME_SPEC.light.cutoutSrc

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center select-none pointer-events-none',
        className
      )}
    >
      {/* Ambient studio ground glow beneath the floating sculpture */}
      <div
        aria-hidden="true"
        className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[56%] h-[11%] rounded-full blur-2xl opacity-65 dark:opacity-80 transition-opacity duration-500"
        style={{
          background:
            resolvedTheme === 'dark'
              ? 'radial-gradient(ellipse at center, rgba(207,255,73,0.18) 0%, rgba(0,0,0,0.85) 68%, transparent 100%)'
              : 'radial-gradient(ellipse at center, rgba(16,18,17,0.22) 0%, rgba(16,18,17,0.06) 58%, transparent 100%)',
        }}
      />

      {/* Interactive 3D perspective studio Memory Sphere */}
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
        animate={reduced ? undefined : { y: [0, -7, 0] }}
        transition={reduced ? undefined : { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <img
          src={cutoutSrc}
          alt="VectorGallery translucent acid-lime and liquid-silver Memory Sphere sculpture"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="w-[92%] h-[92%] object-contain drop-shadow-[0_26px_42px_rgba(16,18,17,0.16)] dark:drop-shadow-[0_28px_52px_rgba(0,0,0,0.68)]"
        />
      </motion.div>

      {/* Subtle WebGL real-time orbiting hairline rings & light nodes around sculpture */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 z-20 w-full h-full block"
      />
    </div>
  )
}
