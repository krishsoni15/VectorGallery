import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, CheckCircle2, Search } from 'lucide-react'
import { VG_COMPONENTS, VG_LAYOUT, VG_SPHERE_THEME_SPEC } from '@/components/landing/design-system'
import { useClientReducedMotion } from '@/components/landing/motion/LivingMotionPrimitives'
import { cn } from '@/lib/utils'

interface SceneMeta {
  id: string
  numeral: string
  label: string
  range: [number, number]
  targetProgress: number
  title: string
  caption: string
}

const SCENES: SceneMeta[] = [
  {
    id: 'scene-sphere',
    numeral: '01',
    label: 'Sphere',
    range: [0, 0.15],
    targetProgress: 0.04,
    title: 'One calm core for everything you keep.',
    caption:
      'Photos, scanned receipts, handwritten journals, and mobile backups begin unified in one sovereign center.',
  },
  {
    id: 'scene-unfold',
    numeral: '02',
    label: 'Unfold',
    range: [0.15, 0.35],
    targetProgress: 0.25,
    title: 'Orbital bounds widen as the archive opens.',
    caption:
      'As you look closer, sealed storage unlocks without nested folder trees—opening every surface clearly.',
  },
  {
    id: 'scene-capture',
    numeral: '03',
    label: 'Capture',
    range: [0.35, 0.50],
    targetProgress: 0.43,
    title: 'Original photos and readable artifacts side by side.',
    caption:
      'Camera rolls, coastal rail tickets, expense receipts, and notebook diagrams preserve exact fidelity without format lock-in.',
  },
  {
    id: 'scene-connect',
    numeral: '04',
    label: 'Connect',
    range: [0.50, 0.65],
    targetProgress: 0.57,
    title: 'Moments align around visual context and OCR.',
    caption:
      'Text extracted from receipts and passes links quietly with shooting dates and scene context across your library.',
  },
  {
    id: 'scene-remember',
    numeral: '05',
    label: 'Remember',
    range: [0.65, 0.82],
    targetProgress: 0.74,
    title: 'Type what you recall. Watch clutter step back.',
    caption:
      'Ask for "photos from our summer trip"—matched harbors and coastal rail passages illuminate while distraction fades.',
  },
  {
    id: 'scene-reveal',
    numeral: '06',
    label: 'Vault',
    range: [0.82, 1.01],
    targetProgress: 0.94,
    title: 'Organized straight inside one quiet workspace.',
    caption:
      'Review matched items, grounded file citations, and full-size previews ready for instant lookup anytime.',
  },
]

interface StoryFragment {
  id: string
  src: string
  alt: string
  filename: string
  clusterLabel: string
  isSummerMatch: boolean
  // Normalized stage coordinates [-1..+1] from center of choreographed stage
  capturePos: [number, number, number] // nx, ny, rotate deg
  connectPos: [number, number, number]
  revealPos: [number, number]
}

const FRAGMENTS: StoryFragment[] = [
  {
    id: 'frag-harbor',
    src: '/landing/photos/aura-personal-travel.webp',
    alt: 'Summer harbor promenade beside moored fishing boats',
    filename: 'harbor_promenade_august.webp',
    clusterLabel: 'Summer · Photos',
    isSummerMatch: true,
    capturePos: [-0.88, -0.58, -7],
    connectPos: [-0.82, -0.58, -2],
    revealPos: [-0.68, -0.46],
  },
  {
    id: 'frag-train',
    src: '/landing/photos/aura-train-journey.webp',
    alt: 'Travel journal and paper ticket by coastal train window',
    filename: 'coastal_rail_ticket_aug19.webp',
    clusterLabel: 'Summer · Rail',
    isSummerMatch: true,
    capturePos: [0.86, -0.56, 6],
    connectPos: [0.0, -0.66, 1],
    revealPos: [0.0, -0.46],
  },
  {
    id: 'frag-coast',
    src: '/landing/photos/aura-coastal-path.webp',
    alt: 'Sandy coastal path above chalk cliffs and sea',
    filename: 'chalk_cliff_footpath.webp',
    clusterLabel: 'Summer · Coast',
    isSummerMatch: true,
    capturePos: [-0.94, 0.36, 5],
    connectPos: [0.82, -0.58, 2],
    revealPos: [0.68, -0.46],
  },
  {
    id: 'frag-ticket',
    src: '/landing/photos/aura-ticket-coastal.webp',
    alt: 'Coastal Line Seat 14A boarding pass OCR scan',
    filename: 'coastal_line_seat_14a.jpg',
    clusterLabel: 'OCR · Pass',
    isSummerMatch: false,
    capturePos: [0.94, 0.34, -5],
    connectPos: [-0.82, 0.62, -2],
    revealPos: [-0.68, 0.62],
  },
  {
    id: 'frag-receipt',
    src: '/landing/photos/aura-receipt-studio.webp',
    alt: 'Studio Equip Co receipt #10482 for headphones and desk lamp',
    filename: 'studio_equip_receipt_10482.png',
    clusterLabel: 'OCR · Receipt',
    isSummerMatch: false,
    capturePos: [-0.44, 0.72, -3],
    connectPos: [0.0, 0.68, 0],
    revealPos: [0.0, 0.62],
  },
  {
    id: 'frag-arch',
    src: '/landing/photos/aura-arch-notes.webp',
    alt: 'Handwritten architectural spatial flow notebook spread',
    filename: 'architectural_spatial_flow.pdf',
    clusterLabel: 'Notes · Sketch',
    isSummerMatch: false,
    capturePos: [0.46, 0.70, 6],
    connectPos: [0.82, 0.62, 2],
    revealPos: [0.68, 0.62],
  },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function computeStageState(p: number) {
  const unfoldW = clamp01((p - 0.08) / 0.20)
  const captureW = clamp01((p - 0.28) / 0.16)
  const connectW = clamp01((p - 0.46) / 0.14)
  const rememberW = clamp01((p - 0.62) / 0.14)
  const revealW = clamp01((p - 0.79) / 0.16)

  const sphereScale = 1 + unfoldW * 0.24 - captureW * 0.52 - revealW * 0.36
  const sphereOpacity = 1 - clamp01((p - 0.48) / 0.24) * 0.90
  const orbitExpand = 1 + unfoldW * 0.42 + connectW * 0.18
  const orbitOpacity = 0.85 - revealW * 0.75

  const connectLineProgress = clamp01((p - 0.46) / 0.14) * (1 - clamp01((p - 0.78) / 0.10))
  const searchPillOpacity = clamp01((p - 0.61) / 0.07) * (1 - clamp01((p - 0.86) / 0.07))
  const vaultFrameOpacity = clamp01((p - 0.79) / 0.12)

  return {
    unfoldW,
    captureW,
    connectW,
    rememberW,
    revealW,
    sphereScale,
    sphereOpacity,
    orbitExpand,
    orbitOpacity,
    connectLineProgress,
    searchPillOpacity,
    vaultFrameOpacity,
  }
}

export function MemoryUnfoldSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const triggerWrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const stRef = useRef<{ start: number; end: number } | null>(null)

  const reduced = useClientReducedMotion()
  const [isDark, setIsDark] = useState(false)
  const [progress, setProgress] = useState(0)
  const [manualSceneIdx, setManualSceneIdx] = useState<number | null>(null)
  const [stageDims, setStageDims] = useState({ w: 1120, h: 450 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const syncTheme = () => setIsDark(document.documentElement.classList.contains('dark'))
    syncTheme()
    const mo = new MutationObserver(syncTheme)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const updateDims = () => {
      setStageDims({
        w: Math.max(320, el.clientWidth),
        h: Math.max(320, el.clientHeight),
      })
    }
    updateDims()
    const ro = new ResizeObserver(updateDims)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || reduced) return
    const wrap = triggerWrapRef.current
    if (!wrap) return

    let cleanupCtx: (() => void) | null = null
    let cancelled = false

    const initGsap = async () => {
      try {
        const gsapMod = await import('gsap')
        const stMod = await import('gsap/ScrollTrigger')
        if (cancelled) return

        const gsap = gsapMod.gsap || gsapMod.default
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default
        gsap.registerPlugin(ScrollTrigger)

        const mm = gsap.matchMedia()
        mm.add('(min-width: 768px)', () => {
          const st = ScrollTrigger.create({
            trigger: wrap,
            start: 'top 64px',
            end: '+=2000',
            pin: true,
            scrub: 0.4,
            anticipatePin: 1,
            onUpdate: (self) => {
              stRef.current = { start: self.start, end: self.end }
              setManualSceneIdx(null)
              setProgress(self.progress)
            },
          })
          stRef.current = { start: st.start, end: st.end }
          return () => {
            stRef.current = null
            st.kill()
          }
        })

        cleanupCtx = () => mm.revert()
      } catch {
        // Clickable scene tabs still drive full state cleanly
      }
    }

    initGsap()

    return () => {
      cancelled = true
      cleanupCtx?.()
    }
  }, [reduced])

  const effectiveProgress = useMemo(() => {
    if (manualSceneIdx !== null) return SCENES[manualSceneIdx]?.targetProgress ?? progress
    return progress
  }, [manualSceneIdx, progress])

  const activeSceneIdx = useMemo(() => {
    if (manualSceneIdx !== null) return manualSceneIdx
    const idx = SCENES.findIndex(
      (s) => effectiveProgress >= s.range[0] && effectiveProgress < s.range[1]
    )
    return idx === -1 ? SCENES.length - 1 : idx
  }, [effectiveProgress, manualSceneIdx])

  const activeScene = SCENES[activeSceneIdx]
  const stage = useMemo(() => computeStageState(effectiveProgress), [effectiveProgress])

  const handleSelectScene = (idx: number) => {
    const targetP = SCENES[idx]?.targetProgress ?? 0
    if (!reduced && stRef.current && typeof window !== 'undefined' && window.innerWidth >= 768) {
      const { start, end } = stRef.current
      const destY = start + (end - start) * targetP
      window.scrollTo({ top: destY, behavior: 'smooth' })
    } else {
      setManualSceneIdx(idx)
    }
  }

  const cutoutSrc = VG_SPHERE_THEME_SPEC.heroVideoPoster

  const maxSpreadX = Math.min(stageDims.w * 0.35, 420)
  const maxSpreadY = Math.min(stageDims.h * 0.36, 168)

  return (
    <section
      id="scroll-story"
      ref={sectionRef}
      aria-labelledby="scroll-story-heading"
      data-story-progress={effectiveProgress.toFixed(3)}
      data-story-scene={activeScene.numeral}
      className="relative bg-[#F2F3F0] dark:bg-[#090B0A] border-b border-[var(--vg-border)]"
    >
      <div
        ref={triggerWrapRef}
        className="relative w-full min-h-[700px] md:h-[calc(100vh-64px)] md:max-h-[860px] flex flex-col justify-between py-6 sm:py-8 overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-85"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 68% 60% at 50% 48%, rgba(207,255,73,0.06), rgba(19,23,21,0.9) 62%, #090B0A 100%)'
              : 'radial-gradient(ellipse 68% 60% at 50% 48%, rgba(212,255,84,0.13), rgba(231,233,229,0.72) 60%, #F2F3F0 100%)',
          }}
        />

        <div className={`${VG_LAYOUT.containers.heroStage} relative z-10 w-full flex-1 flex flex-col justify-between gap-4`}>
          {/* TOP NARRATIVE HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--vg-border)] pb-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#087F5B] dark:bg-[#CFFF49]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--vg-ink-2)]">
                  Scene {activeScene.numeral} / 06 · {activeScene.label}
                </span>
              </div>
              <h2
                id="scroll-story-heading"
                className="font-display font-bold tracking-[-0.038em] leading-[1.06] text-[1.6rem] sm:text-[2.15rem] lg:text-[2.5rem] text-[#101211] dark:text-[#F3F5F1]"
              >
                {activeScene.title}
              </h2>
              <p className="mt-1.5 text-[14px] sm:text-[15px] text-[var(--vg-ink-2)] max-w-xl leading-[1.5]">
                {activeScene.caption}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 font-mono text-[12px] text-[var(--vg-ink-2)] px-3 py-1.5 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface)]">
                <span>Scroll</span>
                <span className="text-[#101211] dark:text-[#CFFF49] font-semibold">
                  {Math.round(effectiveProgress * 100)}%
                </span>
              </div>
              <Link
                href="/app"
                className={cn(VG_COMPONENTS.buttons.primarySm, 'whitespace-nowrap')}
              >
                <span>Open Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* CHOREOGRAPHED CENTER TRANSFORM STAGE */}
          <div
            ref={stageRef}
            className="relative flex-1 min-h-[390px] sm:min-h-[440px] flex items-center justify-center"
          >
            {/* Scene F Workspace Reveal Shell */}
            <div
              aria-hidden={stage.vaultFrameOpacity < 0.1}
              style={{
                opacity: stage.vaultFrameOpacity,
                transform: `scale(${lerp(0.95, 1, stage.vaultFrameOpacity)})`,
              }}
              className="pointer-events-none absolute inset-x-2 sm:inset-x-8 lg:inset-x-20 top-2 bottom-2 rounded-3xl border border-[var(--vg-border-strong)] bg-[#FFFFFF]/90 dark:bg-[#131715]/90 backdrop-blur-xl shadow-[var(--vg-shadow-hero)] flex flex-col justify-between p-4 sm:p-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--vg-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DDE2DC] dark:bg-white/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DDE2DC] dark:bg-white/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DDE2DC] dark:bg-white/20" />
                  </span>
                  <span className="font-mono text-[11px] text-[var(--vg-ink-2)] ml-2">
                    VectorGallery Vault · 6 captured artifacts · 3 matched Summer Trip
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4FF54] text-[#101211]">
                  <Check className="w-3 h-3" />
                  <span>Indexed</span>
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-[var(--vg-ink-2)]">
                <span>Local / Cloud Storage · Instant OCR + Visual Recall</span>
                <span>Zero vendor lock-in</span>
              </div>
            </div>

            {/* Scene E Illuminated Search Pill */}
            <div
              style={{
                opacity: stage.searchPillOpacity,
                transform: `translate(-50%, ${lerp(-10, 0, stage.searchPillOpacity)}px)`,
              }}
              className="pointer-events-none absolute top-3 sm:top-4 left-1/2 z-30 w-[92%] max-w-[520px]"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#FFFFFF]/95 dark:bg-[#131715]/95 border border-[#087F5B]/45 dark:border-[#CFFF49]/55 shadow-[0_18px_40px_-14px_rgba(16,18,17,0.28)] backdrop-blur-xl">
                <Search className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49] shrink-0" />
                <span className="text-[13.5px] sm:text-[14.5px] font-medium text-[#101211] dark:text-[#F3F5F1] truncate">
                  Find my photos from our summer trip
                </span>
                <span className="ml-auto font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#D4FF54] text-[#101211] font-semibold shrink-0">
                  3 hits
                </span>
              </div>
            </div>

            {/* Expanding Concentric Orbital Hairlines & Cluster Vectors */}
            <svg
              aria-hidden="true"
              viewBox="-480 -220 960 440"
              className="pointer-events-none absolute inset-0 w-full h-full z-10"
            >
              <g
                transform={`scale(${stage.orbitExpand.toFixed(3)})`}
                style={{ opacity: stage.orbitOpacity }}
              >
                <ellipse
                  rx="210"
                  ry="92"
                  transform="rotate(-14)"
                  fill="none"
                  stroke={isDark ? '#CFFF49' : '#087F5B'}
                  strokeOpacity="0.34"
                  strokeWidth="1.2"
                />
                <ellipse
                  rx="275"
                  ry="118"
                  transform="rotate(16)"
                  fill="none"
                  stroke={isDark ? '#B9C5C5' : '#A8B3B2'}
                  strokeOpacity="0.48"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
              </g>

              {stage.connectLineProgress > 0.02 && (
                <g
                  style={{ opacity: stage.connectLineProgress }}
                  stroke={isDark ? '#CFFF49' : '#087F5B'}
                  strokeWidth="1.35"
                  strokeOpacity="0.5"
                  fill="none"
                >
                  <path
                    d="M -290 -96 Q 0 -132 290 -96"
                    strokeDasharray="620"
                    strokeDashoffset={(1 - stage.connectLineProgress) * 620}
                  />
                  <path
                    d="M -290 96 Q 0 132 290 96"
                    strokeDasharray="620"
                    strokeDashoffset={(1 - stage.connectLineProgress) * 620}
                  />
                </g>
              )}
            </svg>

            {/* Unfolding Central Memory Sphere */}
            <div
              style={{
                opacity: stage.sphereOpacity,
                transform: `scale(${stage.sphereScale.toFixed(3)}) rotate(${(effectiveProgress * 22).toFixed(2)}deg)`,
              }}
              className="pointer-events-none relative z-20 w-[230px] h-[230px] sm:w-[290px] sm:h-[290px] lg:w-[320px] lg:h-[320px] flex items-center justify-center"
            >
              <img
                src={cutoutSrc}
                alt="Unfolding Memory Sphere core"
                className="w-full h-full object-contain drop-shadow-[0_24px_40px_rgba(16,18,17,0.18)]"
              />
            </div>

            {/* 6 Choreographed Photographic & Synthetic Document Fragments */}
            <div className="pointer-events-none absolute inset-0 z-20">
              {FRAGMENTS.map((frag) => {
                const nxCap = lerp(0, frag.capturePos[0], stage.captureW)
                const nyCap = lerp(0, frag.capturePos[1], stage.captureW)
                const rCap = lerp(0, frag.capturePos[2], stage.captureW)

                const nxConn = lerp(nxCap, frag.connectPos[0], stage.connectW)
                const nyConn = lerp(nyCap, frag.connectPos[1], stage.connectW)
                const rConn = lerp(rCap, frag.connectPos[2], stage.connectW)

                const nxFinal = lerp(nxConn, frag.revealPos[0], stage.revealW)
                const nyFinal = lerp(nyConn, frag.revealPos[1], stage.revealW)
                const rFinal = lerp(rConn, 0, stage.revealW)

                const xPx = nxFinal * maxSpreadX
                const yPx = nyFinal * maxSpreadY

                const nonMatchDim =
                  !frag.isSummerMatch && stage.rememberW > 0
                    ? lerp(1, 0.24, stage.rememberW * (1 - stage.revealW * 0.72))
                    : 1

                const fragOpacity = stage.captureW * nonMatchDim
                const fragScale =
                  lerp(0.28, 0.96, stage.captureW) *
                  (frag.isSummerMatch && stage.rememberW > 0
                    ? lerp(1, 1.07, stage.rememberW * (1 - stage.revealW))
                    : 1)

                const isHighlighted = frag.isSummerMatch && stage.rememberW > 0.2

                return (
                  <div
                    key={frag.id}
                    data-fragment-id={frag.id}
                    style={{
                      left: '50%',
                      top: '50%',
                      opacity: fragOpacity,
                      transform: `translate3d(calc(-50% + ${xPx.toFixed(1)}px), calc(-50% + ${yPx.toFixed(1)}px), 0) rotate(${rFinal.toFixed(2)}deg) scale(${fragScale.toFixed(3)})`,
                    }}
                    className={cn(
                      'absolute w-[104px] sm:w-[146px] lg:w-[166px] rounded-2xl overflow-hidden bg-[var(--vg-surface)] border transition-shadow duration-200',
                      isHighlighted
                        ? 'border-[#087F5B] dark:border-[#CFFF49] shadow-[0_24px_54px_-14px_rgba(212,255,84,0.45),0_12px_28px_-10px_rgba(16,18,17,0.24)] ring-2 ring-[#D4FF54]/75 dark:ring-[#CFFF49]/75 z-30'
                        : 'border-[var(--vg-border-strong)] shadow-[var(--vg-shadow-card)] z-20'
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--vg-surface-2)]">
                      <img
                        src={frag.src}
                        alt={frag.alt}
                        className="w-full h-full object-cover"
                      />
                      {isHighlighted && (
                        <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-mono font-semibold bg-[#D4FF54] text-[#101211]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Match</span>
                        </span>
                      )}
                    </div>
                    <div className="px-2.5 py-1.5 bg-[var(--vg-surface)] flex items-center justify-between gap-1.5">
                      <span className="font-mono text-[9.5px] sm:text-[10px] text-[#101211] dark:text-[#F3F5F1] truncate">
                        {frag.filename}
                      </span>
                      <span className="hidden sm:inline text-[9px] text-[var(--vg-ink-2)] shrink-0">
                        {frag.clusterLabel.split(' · ')[0]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* BOTTOM INTERACTIVE SCENE SCRUBBER BAR */}
          <div className="relative z-30 flex flex-col gap-2.5 pt-2">
            <div className="w-full h-1 rounded-full bg-[#DDE2DC] dark:bg-white/[0.10] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#087F5B] dark:bg-[#CFFF49] transition-[width] duration-75"
                style={{ width: `${Math.max(4, Math.round(effectiveProgress * 100))}%` }}
              />
            </div>

            <div
              role="tablist"
              aria-label="Memory transformation scenes"
              className="flex flex-wrap items-center justify-between gap-1.5"
            >
              {SCENES.map((scene, idx) => {
                const active = idx === activeSceneIdx
                return (
                  <button
                    key={scene.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleSelectScene(idx)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CFFF49]',
                      active
                        ? 'bg-[#101211] text-[#F3F5F1] border-[#101211] dark:bg-[#CFFF49] dark:text-[#090B0A] dark:border-[#CFFF49] shadow-sm'
                        : 'bg-[var(--vg-surface)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[var(--vg-ink)] hover:border-[var(--vg-border-strong)]'
                    )}
                  >
                    <span className="font-mono text-[10.5px] opacity-75">{scene.numeral}</span>
                    <span>{scene.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
