import React, { useEffect, useRef, useState } from 'react'
import { VG_AURA_SHADER_SPEC } from '@/components/landing/design-system'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { useVisibility } from '@/components/landing/motion/useVisibility'
import { cn } from '@/lib/utils'

interface LivingAuraCanvasProps {
  variant?: 'light' | 'dark' | 'auto'
  speed?: number
  className?: string
  intensity?: number
  pointerReactive?: boolean
}

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

/**
 * Custom Liquid Intelligence GLSL Studio Shader:
 * Combines domain-warped porcelain/titanium silk waves, anisotropic cool metallic reflection bands,
 * pointer-coupled softbox falloff, iridescent specular edge interference, and zero muddy olive cast.
 */
const FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec3 uBaseColor;
uniform vec3 uMidColor;
uniform vec3 uHighlightColor;
uniform vec3 uJadeColor;
uniform vec3 uLimeColor;
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
  float a = 0.5;
  mat2 rot = mat2(0.84, 0.54, -0.54, 0.84);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 1.94;
    a *= 0.48;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(uResolution, vec2(1.0));
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  vec2 ptr = vec2((uPointer.x - 0.5) * aspect, uPointer.y - 0.5);

  float t = uTime * 0.075;
  vec2 q = vec2(fbm(p * 1.1 + vec2(0.0, t * 0.6)), fbm(p * 1.15 + vec2(2.7, -t * 0.45)));
  vec2 r = vec2(fbm(p * 1.35 + q * 1.45 + vec2(t * 0.35, 1.9)), fbm(p * 1.4 - q * 1.25));
  float silk = fbm(p * 1.15 + r * 1.25);

  // Anisotropic brushed titanium light band sweeping gently beneath horizon
  float anisoBand = smoothstep(-0.42, 0.48, (p.x * 0.65 - p.y * 0.85) + silk * 0.65);
  float specularFold = pow(smoothstep(0.35, 0.96, sin((p.x * 2.1 - p.y * 1.6) + r.x * 2.4 - t * 0.65) * 0.5 + 0.5), 2.2);

  // Subtle top studio air transitioning smoothly into sculpted lower atmosphere
  float stageMask = smoothstep(0.92, 0.14, uv.y);

  vec3 col = mix(uBaseColor, uMidColor, smoothstep(0.18, 0.82, silk) * stageMask);
  col = mix(col, uHighlightColor, specularFold * (uIsDark > 0.5 ? 0.34 : 0.46) * anisoBand * uIntensity);

  // Cool emerald/jade metallic depth sheen around central sculpture core
  float distCenter = length(vec2((uv.x - 0.5) * aspect, (uv.y - 0.48) * 1.05));
  float coreField = smoothstep(0.88, 0.06, distCenter);
  float ptrDist = length(p - ptr * 0.35);
  float ptrAura = smoothstep(0.82, 0.08, ptrDist);

  // Clean blue-silver & jade refraction rather than muddy yellow-olive overlay
  col += uJadeColor * (coreField * (uIsDark > 0.5 ? 0.075 : 0.045) + ptrAura * (uIsDark > 0.5 ? 0.03 : 0.02)) * uIntensity;

  // Tightly surgical volt-lime edge caustic near sculpture tangent
  float rimArc = smoothstep(0.55, 0.22, abs(distCenter - 0.24)) * specularFold * ptrAura;
  col += uLimeColor * (rimArc * (uIsDark > 0.5 ? 0.065 : 0.085)) * uIntensity;

  // Micro film grain preventing gradient banding on wide displays
  float grain = (hash(uv * uResolution + fract(uTime)) - 0.5) * (uIsDark > 0.5 ? 0.012 : 0.008);
  col += grain;

  float alpha = (0.36 + 0.64 * stageMask) * clamp(uIntensity, 0.35, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`

function hexToRgbVec(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const n = parseInt(clean, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function LivingAuraCanvas({
  variant = 'auto',
  speed = 0.72,
  className,
  intensity = 0.95,
  pointerReactive = true,
}: LivingAuraCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const themeRef = useRef<'light' | 'dark'>(variant === 'dark' ? 'dark' : 'light')
  const pointerTargetRef = useRef<[number, number]>([0.55, 0.52])
  const pointerSmoothRef = useRef<[number, number]>([0.55, 0.52])

  const programRef = useRef<{
    uniforms: {
      uBaseColor: { value: [number, number, number] }
      uMidColor: { value: [number, number, number] }
      uHighlightColor: { value: [number, number, number] }
      uJadeColor: { value: [number, number, number] }
      uLimeColor: { value: [number, number, number] }
      uIsDark: { value: number }
    }
  } | null>(null)

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    variant === 'dark' ? 'dark' : 'light'
  )
  const [webglReady, setWebglReady] = useState(true)
  const reducedMotion = useReducedMotion()
  const isVisible = useVisibility(hostRef)
  const isVisibleRef = useRef(isVisible)
  isVisibleRef.current = isVisible

  useEffect(() => {
    if (typeof window === 'undefined') return
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
        const isDark = next === 'dark'
        prog.uniforms.uBaseColor.value = hexToRgbVec(
          isDark ? VG_AURA_SHADER_SPEC.darkStops.base : VG_AURA_SHADER_SPEC.lightStops.base
        )
        prog.uniforms.uMidColor.value = hexToRgbVec(
          isDark ? VG_AURA_SHADER_SPEC.darkStops.mid : VG_AURA_SHADER_SPEC.lightStops.mid
        )
        prog.uniforms.uHighlightColor.value = hexToRgbVec(
          isDark ? VG_AURA_SHADER_SPEC.darkStops.chrome : VG_AURA_SHADER_SPEC.lightStops.highlight
        )
        prog.uniforms.uJadeColor.value = hexToRgbVec(
          isDark ? VG_AURA_SHADER_SPEC.darkStops.jadeCaustic : VG_AURA_SHADER_SPEC.lightStops.emeraldCaustic
        )
        prog.uniforms.uLimeColor.value = hexToRgbVec(VG_AURA_SHADER_SPEC.lightStops.limeCaustic)
        prog.uniforms.uIsDark.value = isDark ? 1.0 : 0.0
      }
    }
    syncTheme()

    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [variant])

  useEffect(() => {
    if (!pointerReactive || reducedMotion || typeof window === 'undefined') return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      pointerTargetRef.current = [
        e.clientX / Math.max(1, window.innerWidth),
        1 - e.clientY / Math.max(1, window.innerHeight),
      ]
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [pointerReactive, reducedMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host || reducedMotion || typeof window === 'undefined') return

    let destroyed = false
    let rafId = 0
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

        const isDark = themeRef.current === 'dark'
        const geometry = new Triangle(gl)
        const program = new Program(gl, {
          vertex: VERTEX_SHADER,
          fragment: FRAGMENT_SHADER,
          transparent: true,
          uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new Vec2(host.clientWidth || 1280, host.clientHeight || 720) },
            uPointer: { value: new Vec2(0.55, 0.52) },
            uBaseColor: {
              value: hexToRgbVec(
                isDark ? VG_AURA_SHADER_SPEC.darkStops.base : VG_AURA_SHADER_SPEC.lightStops.base
              ),
            },
            uMidColor: {
              value: hexToRgbVec(
                isDark ? VG_AURA_SHADER_SPEC.darkStops.mid : VG_AURA_SHADER_SPEC.lightStops.mid
              ),
            },
            uHighlightColor: {
              value: hexToRgbVec(
                isDark ? VG_AURA_SHADER_SPEC.darkStops.chrome : VG_AURA_SHADER_SPEC.lightStops.highlight
              ),
            },
            uJadeColor: {
              value: hexToRgbVec(
                isDark ? VG_AURA_SHADER_SPEC.darkStops.jadeCaustic : VG_AURA_SHADER_SPEC.lightStops.emeraldCaustic
              ),
            },
            uLimeColor: { value: hexToRgbVec(VG_AURA_SHADER_SPEC.lightStops.limeCaustic) },
            uIntensity: { value: intensity },
            uIsDark: { value: isDark ? 1.0 : 0.0 },
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

        const onLost = (e: Event) => {
          e.preventDefault()
          if (!destroyed) setWebglReady(false)
        }
        canvas.addEventListener('webglcontextlost', onLost)

        cleanupFns.push(() => {
          programRef.current = null
          ro?.disconnect()
          canvas.removeEventListener('webglcontextlost', onLost)
          gl.getExtension('WEBGL_lose_context')?.loseContext()
        })

        const start = performance.now()
        const render = (now: number) => {
          if (destroyed) return
          if (isVisibleRef.current) {
            const [tx, ty] = pointerTargetRef.current
            const [sx, sy] = pointerSmoothRef.current
            const nx = sx + (tx - sx) * 0.06
            const ny = sy + (ty - sy) * 0.06
            pointerSmoothRef.current = [nx, ny]
            program.uniforms.uPointer.value.set(nx, ny)
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
