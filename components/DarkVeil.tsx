import React, { useEffect, useRef, useState } from 'react'
import { VG_AURA_SHADER_SPEC } from '@/components/landing/design-system'

const vertex = `
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`

/**
 * Project Aura — Domain-Warped Silk Ribbon & Optical Diffusion Shader.
 * Neutral-First atmospheric veil (75%+ neutral ivory #FAFAF7 or obsidian #0B0D0C)
 * with subtle drifting botanical sage/mint/teal silk shimmer and fine optical grain.
 */
const fragment = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;
uniform float uLightMode;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise2d(vec2 p) {
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
    mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 4; i++) {
        v += a * noise2d(p);
        p = rot * p * 2.02 + vec2(1.7, 9.2);
        a *= 0.5;
    }
    return v;
}

mat3 rgb2yiq = mat3(0.299, 0.587, 0.114, 0.596, -0.274, -0.322, 0.211, -0.523, 0.312);
mat3 yiq2rgb = mat3(1.0, 0.956, 0.621, 1.0, -0.272, -0.647, 1.0, -1.106, 1.703);

vec3 hueShiftRGB(vec3 col, float deg) {
    vec3 yiq = rgb2yiq * col;
    float rad = radians(deg);
    float cosh = cos(rad);
    float sinh = sin(rad);
    vec3 yiqShift = vec3(yiq.x, yiq.y * cosh - yiq.z * sinh, yiq.y * sinh + yiq.z * cosh);
    return clamp(yiq2rgb * yiqShift, 0.0, 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / max(uResolution.xy, vec2(1.0));
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - vec2(0.58, 0.46)) * vec2(aspect, 1.0);

    float t = uTime * 0.16;
    float warpAmt = 0.65 + uWarp * 1.4;

    /* Domain-warped silk flow */
    vec2 q = vec2(
        fbm(p * 1.35 + vec2(t * 0.7, -t * 0.4)),
        fbm(p * 1.35 + vec2(-t * 0.5 + 3.4, t * 0.6 + 1.8))
    );
    vec2 r = vec2(
        fbm(p * 1.75 + warpAmt * q + vec2(1.9, 5.1) + t * 0.35),
        fbm(p * 1.75 + warpAmt * q + vec2(6.3, 2.4) - t * 0.28)
    );
    float field = fbm(p * 1.45 + warpAmt * r);

    /* Silk ribbon caustic & soft optical falloff biased toward right studio stage */
    float ribbon = smoothstep(0.28, 0.76, sin((p.x * 2.1 + p.y * 1.4 + r.x * 2.4) * 1.65) * 0.5 + 0.5);
    float studioFocus = exp(-dot(p * vec2(0.78, 1.05), p * vec2(0.78, 1.05)) * 1.15);
    float sheen = clamp((field * 0.62 + ribbon * 0.38) * (0.35 + 0.65 * studioFocus), 0.0, 1.0);

    vec3 result;
    if (uLightMode > 0.5) {
        /* Light Mode: Neutral Ivory #FAFAF7 -> Stone #F0F1EC -> Mint #C4EDE1 -> Teal #A6D9D0 */
        vec3 baseIvory = vec3(0.980, 0.980, 0.969);
        vec3 softStone = vec3(0.941, 0.945, 0.925);
        vec3 softMint  = vec3(0.769, 0.929, 0.882);
        vec3 softTeal  = vec3(0.651, 0.851, 0.816);

        result = mix(baseIvory, softStone, smoothstep(0.14, 0.72, field) * 0.65);
        result = mix(result, softMint, smoothstep(0.32, 0.85, sheen) * 0.28 * studioFocus);
        result = mix(result, softTeal, smoothstep(0.55, 0.96, ribbon * field) * 0.16 * studioFocus);
    } else {
        /* Dark Mode: Matte Obsidian #0B0D0C -> Surface #131614 -> Forest #1D2923 -> Jade #58D6A8 */
        vec3 baseObsidian = vec3(0.043, 0.051, 0.047);
        vec3 midCarbon    = vec3(0.075, 0.086, 0.078);
        vec3 deepMoss     = vec3(0.114, 0.161, 0.137);
        vec3 silkJade     = vec3(0.345, 0.839, 0.659);
        vec3 silkTeal     = vec3(0.459, 0.741, 0.702);

        result = mix(baseObsidian, midCarbon, smoothstep(0.15, 0.68, field) * 0.72);
        result = mix(result, deepMoss, smoothstep(0.28, 0.82, sheen) * 0.58 * studioFocus);
        result = mix(result, silkTeal, smoothstep(0.48, 0.90, ribbon * studioFocus) * 0.14);
        result = mix(result, silkJade, smoothstep(0.62, 0.98, sheen * ribbon) * 0.12 * studioFocus);
    }

    if (abs(uHueShift) > 0.01) {
        result = hueShiftRGB(result, uHueShift);
    }

    if (uScan > 0.001) {
        float scanVal = sin(gl_FragCoord.y * uScanFreq) * 0.5 + 0.5;
        result *= 1.0 - (scanVal * scanVal) * uScan;
    }

    /* Fine optical film grain */
    float grain = (hash(gl_FragCoord.xy + fract(uTime * 17.3)) - 0.5) * uNoise;
    gl_FragColor = vec4(clamp(result + grain, 0.0, 1.0), 1.0);
}
`

type Props = {
  hueShift?: number
  noiseIntensity?: number
  scanlineIntensity?: number
  speed?: number
  scanlineFrequency?: number
  warpAmount?: number
  resolutionScale?: number
  lightMode?: boolean
  className?: string
}

/**
 * Project Aura Silk Atmospheric Light-Field Background:
 * - Domain-warped silk ribbon & optical diffusion GLSL shader
 * - Neutral-First CSS radial gradient fallback for non-WebGL & prefers-reduced-motion
 * - Viewport intersection + tab visibility pausing + capped DPR
 */
export default function DarkVeil({
  hueShift = 0,
  noiseIntensity = 0.014,
  scanlineIntensity = 0,
  speed = 0.34,
  scanlineFrequency = 0,
  warpAmount = 0.18,
  resolutionScale = 0.6,
  lightMode = false,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglActive, setWebglActive] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const propsRef = useRef({
    hueShift,
    noiseIntensity,
    scanlineIntensity,
    speed,
    scanlineFrequency,
    warpAmount,
    lightMode,
  })

  useEffect(() => {
    propsRef.current = {
      hueShift,
      noiseIntensity,
      scanlineIntensity,
      speed,
      scanlineFrequency,
      warpAmount,
      lightMode,
    }
  }, [
    hueShift,
    noiseIntensity,
    scanlineIntensity,
    speed,
    scanlineFrequency,
    warpAmount,
    lightMode,
  ])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncReduced = () => setReducedMotion(mq.matches)
    syncReduced()
    mq.addEventListener?.('change', syncReduced)
    return () => mq.removeEventListener?.('change', syncReduced)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (reducedMotion) {
      setWebglActive(false)
      return
    }

    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let disposed = false
    let animFrame = 0
    let isIntersecting = true
    let elapsed = 0
    let lastTick = performance.now()
    let cleanupFns: Array<() => void> = []

    const init = async () => {
      try {
        const { Renderer, Program, Mesh, Triangle, Vec2 } = await import('ogl')
        if (disposed) return

        const renderer = new Renderer({
          dpr: Math.min(window.devicePixelRatio || 1, 1.5),
          canvas,
          webgl: 1,
          alpha: false,
          antialias: false,
          powerPreference: 'low-power',
        })

        const gl = renderer.gl
        if (!gl) {
          setWebglActive(false)
          return
        }

        const geometry = new Triangle(gl)
        const p = propsRef.current
        const program = new Program(gl, {
          vertex,
          fragment,
          uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new Vec2() },
            uHueShift: { value: p.hueShift },
            uNoise: { value: p.noiseIntensity },
            uScan: { value: p.scanlineIntensity },
            uScanFreq: { value: p.scanlineFrequency },
            uWarp: { value: p.warpAmount },
            uLightMode: { value: p.lightMode ? 1 : 0 },
          },
        })

        const mesh = new Mesh(gl, { geometry, program })

        const resize = () => {
          if (disposed || !container) return
          const w = container.clientWidth
          const h = container.clientHeight
          if (w <= 0 || h <= 0) return
          renderer.setSize(
            Math.max(1, Math.floor(w * resolutionScale)),
            Math.max(1, Math.floor(h * resolutionScale))
          )
          canvas.style.width = '100%'
          canvas.style.height = '100%'
          program.uniforms.uResolution.value.set(
            gl.drawingBufferWidth,
            gl.drawingBufferHeight
          )
        }

        const renderFrame = (now: number) => {
          const dt = Math.min((now - lastTick) / 1000, 0.1)
          lastTick = now
          const cur = propsRef.current
          elapsed += dt * cur.speed

          program.uniforms.uTime.value = elapsed
          program.uniforms.uHueShift.value = cur.hueShift
          program.uniforms.uNoise.value = cur.noiseIntensity
          program.uniforms.uScan.value = cur.scanlineIntensity
          program.uniforms.uScanFreq.value = cur.scanlineFrequency
          program.uniforms.uWarp.value = cur.warpAmount
          program.uniforms.uLightMode.value = cur.lightMode ? 1 : 0
          renderer.render({ scene: mesh })
        }

        const stopLoop = () => {
          if (animFrame) {
            cancelAnimationFrame(animFrame)
            animFrame = 0
          }
        }

        const startLoop = () => {
          if (disposed || animFrame || !isIntersecting || document.hidden) return
          lastTick = performance.now()
          const tick = (now: number) => {
            if (disposed || !isIntersecting || document.hidden) {
              animFrame = 0
              return
            }
            renderFrame(now)
            animFrame = requestAnimationFrame(tick)
          }
          animFrame = requestAnimationFrame(tick)
        }

        const observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0]
            isIntersecting = Boolean(entry?.isIntersecting)
            if (isIntersecting && !document.hidden) {
              startLoop()
            } else {
              stopLoop()
            }
          },
          { threshold: 0.01 }
        )
        observer.observe(container)

        const onVisibility = () => {
          if (document.hidden) {
            stopLoop()
          } else if (isIntersecting) {
            startLoop()
          }
        }
        document.addEventListener('visibilitychange', onVisibility)

        let resizeObserver: ResizeObserver | null = null
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(resize)
          resizeObserver.observe(container)
        }
        window.addEventListener('resize', resize)

        resize()
        renderFrame(performance.now())
        setWebglActive(true)
        startLoop()

        cleanupFns = [
          stopLoop,
          () => observer.disconnect(),
          () => document.removeEventListener('visibilitychange', onVisibility),
          () => resizeObserver?.disconnect(),
          () => window.removeEventListener('resize', resize),
          () => {
            try {
              gl.getExtension('WEBGL_lose_context')?.loseContext()
            } catch {
              // Ignore context cleanup errors
            }
          },
        ]
      } catch (e) {
        setWebglActive(false)
        console.warn('DarkVeil WebGL fallback active:', e)
      }
    }

    init()

    return () => {
      disposed = true
      cleanupFns.forEach((fn) => fn())
    }
  }, [reducedMotion, resolutionScale])

  const fallbackGradient = lightMode
    ? VG_AURA_SHADER_SPEC.cssFallbackLight
    : VG_AURA_SHADER_SPEC.cssFallbackDark

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`relative w-full h-full overflow-hidden pointer-events-none ${className}`}
    >
      {/* Static Neutral-First CSS fallback (instant first paint + reduced-motion + non-WebGL) */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ backgroundImage: fallbackGradient }}
      />

      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full block transition-opacity duration-700 ${
            webglActive ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}
