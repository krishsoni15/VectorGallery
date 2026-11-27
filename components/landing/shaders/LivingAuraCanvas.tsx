import React, { useEffect, useRef, useState } from 'react'
import { VG_AURA_SHADER_SPEC } from '@/components/landing/design-system'
import { cn } from '@/lib/utils'

interface LivingAuraCanvasProps {
  variant?: 'light' | 'dark' | 'auto'
  speed?: number
  className?: string
  intensity?: number
}

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uBaseColor;
uniform vec3 uMidColor;
uniform vec3 uRibbonColor;
uniform vec3 uCausticColor;
uniform float uIntensity;
uniform float uIsDark;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2 rot = mat2(0.84, 0.54, -0.54, 0.84);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 1.92;
    a *= 0.48;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(uResolution, vec2(1.0));
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  float t = uTime * 0.085;
  vec2 q = vec2(fbm(p * 1.15 + vec2(0.0, t * 0.7)), fbm(p * 1.2 + vec2(3.1, -t * 0.55)));
  vec2 r = vec2(fbm(p * 1.45 + q * 1.55 + vec2(t * 0.4, 2.3)), fbm(p * 1.5 - q * 1.35));
  float silk = fbm(p * 1.3 + r * 1.4);

  // Diagonal architectural ribbon flowing across lower half
  float ribbonWave = sin((uv.x * 2.2 + uv.y * 1.1) + silk * 3.1 - t * 0.8) * 0.5 + 0.5;
  float causticWave = pow(smoothstep(0.42, 0.96, sin((uv.x * 1.7 - uv.y * 1.3) + r.x * 2.6) * 0.5 + 0.5), 1.8);

  // Clean upper stage ground (top ~36%) transitioning into rich liquid silver / carbon waves below
  float lowerAtmosphereMask = smoothstep(0.68, 0.25, uv.y);

  vec3 col = mix(uBaseColor, uMidColor, smoothstep(0.15, 0.85, silk) * lowerAtmosphereMask);
  col = mix(col, uRibbonColor, pow(ribbonWave, 1.6) * (uIsDark > 0.5 ? 0.55 : 0.42) * lowerAtmosphereMask * uIntensity);

  // Subtle acid-lime specular bounce flanking the central sculpture
  float limeMask = smoothstep(0.82, 0.08, length(uv - vec2(0.24, 0.28))) * causticWave * lowerAtmosphereMask;
  float rightGlow = smoothstep(0.84, 0.12, length(uv - vec2(0.76, 0.30))) * ribbonWave * lowerAtmosphereMask;
  col += uCausticColor * (limeMask * (uIsDark > 0.5 ? 0.11 : 0.16) + rightGlow * (uIsDark > 0.5 ? 0.06 : 0.09)) * uIntensity;

  // Fine tactile grain prevents banding on displays
  float grain = (hash(uv * uResolution + fract(uTime)) - 0.5) * (uIsDark > 0.5 ? 0.015 : 0.011);
  col += grain;

  float alpha = (0.30 + 0.64 * lowerAtmosphereMask) * clamp(uIntensity, 0.35, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`

function hexToRgbVec(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const n = parseInt(clean, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/**
 * LivingAuraCanvas — OGL fluid shader rendering liquid-silver / liquid-carbon silky light waves.
 * Updates theme uniforms live without tearing down the WebGL context on light/dark toggles.
 */
export function LivingAuraCanvas({
  variant = 'auto',
  speed = 0.72,
  className,
  intensity = 0.94,
}: LivingAuraCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const themeRef = useRef<'light' | 'dark'>(variant === 'dark' ? 'dark' : 'light')
  const programRef = useRef<{
    uniforms: {
      uBaseColor: { value: [number, number, number] }
      uMidColor: { value: [number, number, number] }
      uRibbonColor: { value: [number, number, number] }
      uCausticColor: { value: [number, number, number] }
      uIntensity: { value: number }
      uIsDark: { value: number }
    }
  } | null>(null)

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    variant === 'dark' ? 'dark' : 'light'
  )
  const [webglReady, setWebglReady] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncRm = () => setReducedMotion(mq.matches)
    syncRm()
    mq.addEventListener?.('change', syncRm)

    const syncTheme = () => {
      const next =
        variant !== 'auto'
          ? variant
          : document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light'
      themeRef.current = next
      setResolvedTheme(next)

      const prog = programRef.current
      if (prog) {
        const stops = next === 'dark' ? VG_AURA_SHADER_SPEC.darkStops : VG_AURA_SHADER_SPEC.lightStops
        prog.uniforms.uBaseColor.value = hexToRgbVec(stops.base)
        prog.uniforms.uMidColor.value = hexToRgbVec(stops.mid)
        prog.uniforms.uRibbonColor.value = hexToRgbVec(stops.highlight)
        prog.uniforms.uCausticColor.value = hexToRgbVec(stops.limeCaustic)
        prog.uniforms.uIsDark.value = next === 'dark' ? 1.0 : 0.0
      }
    }
    syncTheme()

    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      mq.removeEventListener?.('change', syncRm)
      observer.disconnect()
    }
  }, [variant])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host || reducedMotion || typeof window === 'undefined') return

    let destroyed = false
    let rafId = 0
    let isVisible = true
    const cleanupFns: Array<() => void> = []

    const init = async () => {
      try {
        const { Renderer, Program, Mesh, Triangle, Vec2 } = await import('ogl')
        if (destroyed) return

        const renderer = new Renderer({
          canvas,
          alpha: true,
          premultipliedAlpha: false,
          antialias: false,
          dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        })

        const gl = renderer.gl
        gl.clearColor(0, 0, 0, 0)

        const initTheme = themeRef.current
        const stops = initTheme === 'dark' ? VG_AURA_SHADER_SPEC.darkStops : VG_AURA_SHADER_SPEC.lightStops
        const geometry = new Triangle(gl)
        const program = new Program(gl, {
          vertex: VERTEX_SHADER,
          fragment: FRAGMENT_SHADER,
          transparent: true,
          uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new Vec2(host.clientWidth || 1280, host.clientHeight || 720) },
            uBaseColor: { value: hexToRgbVec(stops.base) },
            uMidColor: { value: hexToRgbVec(stops.mid) },
            uRibbonColor: { value: hexToRgbVec(stops.highlight) },
            uCausticColor: { value: hexToRgbVec(stops.limeCaustic) },
            uIntensity: { value: intensity },
            uIsDark: { value: initTheme === 'dark' ? 1.0 : 0.0 },
          },
        })
        programRef.current = program as unknown as typeof programRef.current

        const mesh = new Mesh(gl, { geometry, program })

        const handleResize = () => {
          if (destroyed || !host) return
          const w = Math.max(1, host.clientWidth)
          const h = Math.max(1, host.clientHeight)
          renderer.setSize(w, h)
          program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height)
        }

        handleResize()
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null
        ro?.observe(host)

        const io =
          typeof IntersectionObserver !== 'undefined'
            ? new IntersectionObserver(
                (entries) => {
                  isVisible = Boolean(entries[0]?.isIntersecting)
                },
                { threshold: 0.02 }
              )
            : null
        io?.observe(host)

        const onVis = () => {
          isVisible = !document.hidden
        }
        document.addEventListener('visibilitychange', onVis)

        cleanupFns.push(() => {
          programRef.current = null
          ro?.disconnect()
          io?.disconnect()
          document.removeEventListener('visibilitychange', onVis)
          gl.getExtension('WEBGL_lose_context')?.loseContext()
        })

        const start = performance.now()
        const render = (now: number) => {
          if (destroyed) return
          if (isVisible && !document.hidden) {
            program.uniforms.uTime.value = ((now - start) / 1000) * speed
            renderer.render({ scene: mesh })
          }
          rafId = requestAnimationFrame(render)
        }
        rafId = requestAnimationFrame(render)
      } catch {
        if (!destroyed) setWebglReady(false)
      }
    }

    init()

    return () => {
      destroyed = true
      if (rafId) cancelAnimationFrame(rafId)
      cleanupFns.forEach((fn) => fn())
    }
  }, [speed, intensity, reducedMotion])

  const cssFallback =
    resolvedTheme === 'dark' ? VG_AURA_SHADER_SPEC.cssFallbackDark : VG_AURA_SHADER_SPEC.cssFallbackLight

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={cn('pointer-events-none select-none overflow-hidden', className)}
      style={{ backgroundImage: cssFallback }}
    >
      {webglReady && !reducedMotion && (
        <canvas ref={canvasRef} className="w-full h-full block opacity-95" />
      )}
    </div>
  )
}
