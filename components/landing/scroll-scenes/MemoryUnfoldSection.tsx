import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight, Check, CheckCircle2, FileText, Search } from 'lucide-react'
import { VG_COMPONENTS, VG_LAYOUT, VG_SPHERE_THEME_SPEC } from '@/components/landing/design-system'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import {
  computeStageKinematics,
  lerp,
  UNFOLD_SCENES,
} from '@/components/landing/scroll-scenes/SphereUnfoldTimeline'
import { cn } from '@/lib/utils'

interface StoryArtifact {
  id: string
  src: string
  alt: string
  filename: string
  category: string
  isCoastalMatch: boolean
  /** Normalized coordinates [-1..+1] across Discover, Connect, and Workspace Left Library */
  discoverPos: [number, number, number] // nx, ny, rotateDeg
  connectPos: [number, number, number]
  workspacePos: [number, number]
}

const STORY_ARTIFACTS: StoryArtifact[] = [
  {
    id: 'art-harbor',
    src: '/landing/photos/aura-personal-travel.webp',
    alt: 'Summer harbor walk beside moored coastal boats',
    filename: 'harbor_promenade_august.webp',
    category: 'Photos',
    isCoastalMatch: true,
    discoverPos: [-0.82, -0.58, -6],
    connectPos: [-0.74, -0.52, 0],
    workspacePos: [-0.66, -0.46],
  },
  {
    id: 'art-pass',
    src: '/landing/photos/aura-ticket-coastal.webp',
    alt: 'Coastal Line Seat 14A boarding pass to Nice Ville',
    filename: 'coastal_line_seat_14a.jpg',
    category: 'OCR Pass',
    isCoastalMatch: true,
    discoverPos: [-0.26, -0.68, 3],
    connectPos: [-0.25, -0.52, 0],
    workspacePos: [-0.24, -0.46],
  },
  {
    id: 'art-rail',
    src: '/landing/photos/aura-train-journey.webp',
    alt: 'Coastal train window view with rail ticket and journal',
    filename: 'coastal_rail_aug19.webp',
    category: 'Travel',
    isCoastalMatch: true,
    discoverPos: [0.30, -0.66, -4],
    connectPos: [0.25, -0.52, 0],
    workspacePos: [-0.66, 0.46],
  },
  {
    id: 'art-cliff',
    src: '/landing/photos/aura-coastal-path.webp',
    alt: 'Coastal footpath along sunlit white cliffs',
    filename: 'chalk_cliff_walk.webp',
    category: 'Photos',
    isCoastalMatch: true,
    discoverPos: [0.84, -0.52, 7],
    connectPos: [0.74, -0.52, 0],
    workspacePos: [-0.24, 0.46],
  },
  {
    id: 'art-celebration',
    src: '/landing/photos/aura-celebration-toast.webp',
    alt: 'Friends raising glasses in golden-hour terrace celebration',
    filename: 'terrace_toast_sep19.webp',
    category: 'Celebration',
    isCoastalMatch: false,
    discoverPos: [-0.84, 0.44, 5],
    connectPos: [-0.74, 0.54, 0],
    workspacePos: [-0.66, 0.88],
  },
  {
    id: 'art-receipt',
    src: '/landing/photos/aura-receipt-studio.webp',
    alt: 'Studio Equip Co headphones receipt totaling $153.36',
    filename: 'studio_receipt_10482.png',
    category: 'Receipt',
    isCoastalMatch: false,
    discoverPos: [-0.28, 0.64, -3],
    connectPos: [-0.25, 0.54, 0],
    workspacePos: [-0.24, 0.88],
  },
  {
    id: 'art-deadlines',
    src: '/landing/photos/aura-deadline-notes.webp',
    alt: 'Handwritten project deadline notes in grid notebook',
    filename: 'project_deadlines_oct.webp',
    category: 'Notes',
    isCoastalMatch: false,
    discoverPos: [0.28, 0.62, 4],
    connectPos: [0.25, 0.54, 0],
    workspacePos: [-0.66, 0.94],
  },
  {
    id: 'art-university',
    src: '/landing/photos/aura-university-letter.webp',
    alt: 'Northridge University Autumn project registration letter',
    filename: 'northridge_registration.pdf',
    category: 'Document',
    isCoastalMatch: false,
    discoverPos: [0.82, 0.46, -6],
    connectPos: [0.74, 0.54, 0],
    workspacePos: [-0.24, 0.94],
  },
]

const TYPED_QUERY_TEXT = 'Coastal train pass to Nice & summer harbor'

export function MemoryUnfoldSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const triggerWrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const stRef = useRef<{ start: number; end: number } | null>(null)

  const reduced = useReducedMotion()
  const [isDark, setIsDark] = useState(false)
  const [progress, setProgress] = useState(0)
  const [manualSceneIdx, setManualSceneIdx] = useState<number | null>(null)
  const [stageDims, setStageDims] = useState({ w: 1200, h: 520 })

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
        w: Math.max(300, el.clientWidth),
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
        const [gsapMod, stMod] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])
        if (cancelled) return

        const gsap = gsapMod.gsap || gsapMod.default
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default
        gsap.registerPlugin(ScrollTrigger)

        const mm = gsap.matchMedia()
        mm.add('(min-width: 768px)', () => {
          const st = ScrollTrigger.create({
            trigger: wrap,
            start: 'top 74px',
            end: '+=2400',
            pin: true,
            scrub: 0.65,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
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
        // Clickable scene tabs remain responsive fallback
      }
    }

    initGsap()

    return () => {
      cancelled = true
      cleanupCtx?.()
    }
  }, [reduced])

  const effectiveProgress = useMemo(() => {
    if (manualSceneIdx !== null) return UNFOLD_SCENES[manualSceneIdx]?.targetProgress ?? progress
    return progress
  }, [manualSceneIdx, progress])

  const activeSceneIdx = useMemo(() => {
    if (manualSceneIdx !== null) return manualSceneIdx
    const idx = UNFOLD_SCENES.findIndex(
      (s) => effectiveProgress >= s.range[0] && effectiveProgress < s.range[1]
    )
    return idx === -1 ? UNFOLD_SCENES.length - 1 : idx
  }, [effectiveProgress, manualSceneIdx])

  const activeScene = UNFOLD_SCENES[activeSceneIdx]
  const k = useMemo(() => computeStageKinematics(effectiveProgress), [effectiveProgress])

  const handleSelectScene = (idx: number) => {
    const targetP = UNFOLD_SCENES[idx]?.targetProgress ?? 0
    if (!reduced && stRef.current && typeof window !== 'undefined' && window.innerWidth >= 768) {
      const { start, end } = stRef.current
      const destY = start + (end - start) * targetP
      window.scrollTo({ top: destY, behavior: 'smooth' })
    } else {
      setManualSceneIdx(idx)
    }
  }

  const maxSpreadX = Math.min(stageDims.w * 0.42, 620)
  const isCompactH = stageDims.h < 430
  const maxSpreadY = Math.min(stageDims.h * (isCompactH ? 0.34 : 0.37), 225)
  const useCssGlide = manualSceneIdx !== null || stageDims.w < 768

  const typedChars = Math.round(TYPED_QUERY_TEXT.length * k.typedQueryRatio)
  const visibleQuery = TYPED_QUERY_TEXT.slice(0, typedChars)

  return (
    <section
      id="scroll-story"
      ref={sectionRef}
      aria-labelledby="scroll-story-heading"
      data-story-progress={effectiveProgress.toFixed(3)}
      data-story-scene={activeScene.numeral}
      className="relative bg-[#F4F5F2] dark:bg-[#090B0D] border-b border-[var(--vg-border)] scroll-mt-20"
    >
      <div
        ref={triggerWrapRef}
        className="relative w-full min-h-[580px] md:min-h-0 md:h-[calc(100vh-74px)] md:max-h-[920px] flex flex-col justify-between py-3 sm:py-4 lg:py-5 overflow-hidden"
      >
        {/* Studio Metallic Radial Field tracking expansion continuously */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? `radial-gradient(ellipse ${Math.round(52 + k.apertureScale * 22)}% ${Math.round(48 + k.apertureScale * 18)}% at 50% 52%, rgba(70,214,164,${(0.06 + k.unfoldW * 0.06).toFixed(3)}), rgba(25,29,32,0.55) 55%, #090B0D 100%)`
              : `radial-gradient(ellipse ${Math.round(52 + k.apertureScale * 22)}% ${Math.round(48 + k.apertureScale * 18)}% at 50% 52%, rgba(205,255,69,${(0.08 + k.unfoldW * 0.08).toFixed(3)}), rgba(227,232,234,0.65) 54%, #F4F5F2 100%)`,
          }}
        />

        <div
          className={`${VG_LAYOUT.containers.heroStage} relative z-10 w-full flex-1 min-h-0 flex flex-col justify-between gap-2.5 sm:gap-3`}
        >
          {/* TOP NARRATIVE HEADER WITH ACCESSIBLE SKIP STORY CONTROL */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 border-b border-[var(--vg-border)] pb-2.5 sm:pb-3 shrink-0">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-[#087F5B] dark:bg-[#CDFF45]" />
                <span className="text-[12px] font-medium text-[var(--vg-ink-2)]">
                  Chapter {activeScene.numeral} of 06 — {activeScene.label}
                </span>
              </div>
              <h2
                id="scroll-story-heading"
                className="font-display font-bold tracking-[-0.036em] leading-[1.06] text-[1.35rem] sm:text-[1.75rem] lg:text-[2.1rem] text-[#101211] dark:text-[#F4F6F2]"
              >
                {activeScene.title}
              </h2>
              <p className="mt-1 text-[13px] sm:text-[14px] text-[var(--vg-ink-2)] max-w-xl leading-[1.45] line-clamp-2">
                {activeScene.caption}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[var(--vg-ink-2)] px-3 py-1 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface)]">
                <span>Story</span>
                <span className="text-[#101211] dark:text-[#CDFF45] font-semibold">
                  {Math.round(effectiveProgress * 100)}%
                </span>
              </div>
              <a
                href="#search"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-medium bg-[var(--vg-surface)] hover:bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] border border-[var(--vg-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]"
              >
                <span>Skip story</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </a>
              <Link href="/app" className={cn(VG_COMPONENTS.buttons.primarySm, 'whitespace-nowrap')}>
                <span>Open Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* CHOREOGRAPHED CONTINUOUS VIEWPORT STAGE */}
          <div
            ref={stageRef}
            className="relative flex-1 min-h-[290px] sm:min-h-[340px] flex items-center justify-center"
          >
            {/* SCENE 06 EXPANDING WORKSPACE SHELL (Seamless continuity from aligned fragments!) */}
            <div
              aria-hidden={k.workspaceShellOpacity < 0.08}
              style={{
                opacity: k.workspaceShellOpacity,
                transform: `scale(${lerp(0.95, 1, k.workspaceShellOpacity)})`,
              }}
              className="pointer-events-none absolute inset-x-1 sm:inset-x-4 lg:inset-x-12 top-1 bottom-1 rounded-3xl border border-[var(--vg-border-strong)] bg-[#FFFFFF]/92 dark:bg-[#111416]/94 backdrop-blur-2xl shadow-[var(--vg-shadow-hero)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden z-10"
            >
              {/* Left Library Header */}
              <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[var(--vg-border)] p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DBE0DA] dark:bg-white/20" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DBE0DA] dark:bg-white/20" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DBE0DA] dark:bg-white/20" />
                    </span>
                    <span className="text-[12px] font-semibold text-[#101211] dark:text-[#F4F6F2] ml-2">
                      VectorGallery Vault — Coastal Trip Results
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#CDFF45] text-[#101211]">
                    <Check className="w-3 h-3" />
                    <span>4 matched</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--vg-ink-2)] pt-2">
                  <span>All 8 captures stored locally in original fidelity</span>
                  <span>OCR &amp; visual context ready</span>
                </div>
              </div>

              {/* Right Active Document Inspector Preview */}
              <div
                style={{ opacity: k.inspectorOpacity }}
                className="hidden lg:flex lg:col-span-5 flex-col justify-between p-5 bg-[#F4F5F2]/80 dark:bg-[#090B0D]/70"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#087F5B] dark:text-[#CDFF45]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Selected Memory Inspector</span>
                  </span>
                  <span className="font-mono text-[11px] text-[var(--vg-ink-2)]">OCR Match</span>
                </div>

                <div className="my-2 rounded-2xl overflow-hidden border border-[var(--vg-border)] aspect-[16/10] bg-[var(--vg-surface)]">
                  <img
                    src="/landing/photos/aura-ticket-coastal.webp"
                    alt="Coastal Line Seat 14A boarding pass preview inside workspace"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="rounded-xl p-3 bg-[var(--vg-surface)] border border-[var(--vg-border)] space-y-1">
                  <p className="font-mono text-[11.5px] font-semibold text-[#101211] dark:text-[#F4F6F2]">
                    coastal_line_seat_14a.jpg
                  </p>
                  <p className="font-mono text-[11px] text-[var(--vg-ink-2)] leading-relaxed">
                    SEAT 14A · 08:40 · MARSEILLE ST CHARLES -&gt; NICE VILLE
                  </p>
                </div>
              </div>
            </div>

            {/* SCENE 05 DYNAMIC TYPING NATURAL-LANGUAGE SEARCH COMMAND BAR */}
            <div
              style={{
                opacity: k.searchBarOpacity,
                transform: `translate(-50%, ${lerp(-14, 0, k.searchBarOpacity)}px)`,
              }}
              className="pointer-events-none absolute top-2 sm:top-3 left-1/2 z-30 w-[92%] max-w-[540px]"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#FFFFFF]/95 dark:bg-[#111416]/95 border border-[#087F5B]/45 dark:border-[#CDFF45]/55 shadow-[0_18px_40px_-14px_rgba(16,18,17,0.28)] backdrop-blur-xl">
                <Search className="w-4 h-4 text-[#087F5B] dark:text-[#CDFF45] shrink-0" />
                <span className="text-[13px] sm:text-[14px] font-medium text-[#101211] dark:text-[#F4F6F2] truncate">
                  {visibleQuery || 'Searching archive...'}
                  {k.typedQueryRatio > 0.02 && k.typedQueryRatio < 0.99 && (
                    <span className="inline-block w-0.5 h-4 bg-[#087F5B] dark:bg-[#CDFF45] align-middle ml-0.5 animate-pulse" />
                  )}
                </span>
                <span className="ml-auto font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#CDFF45] text-[#101211] font-semibold shrink-0">
                  4 matched
                </span>
              </div>
            </div>

            {/* PARTING SCULPTURAL METALLIC CALIPER ARCS & CONNECTION FILAMENTS */}
            <svg
              aria-hidden="true"
              viewBox="-560 -260 1120 520"
              className="pointer-events-none absolute inset-0 w-full h-full z-10"
            >
              {/* Left Parting Titanium Caliper Wing */}
              <g
                transform={`translate(${(-k.wingSplitPx * 130).toFixed(1)}, 0) scale(${k.apertureScale.toFixed(3)})`}
                style={{ opacity: Math.max(0.12, 0.88 - k.productW * 0.78) }}
              >
                <path
                  d="M -60 -150 C -210 -95, -210 95, -60 150"
                  fill="none"
                  stroke={isDark ? '#B8C5CC' : '#8D989C'}
                  strokeWidth="2.4"
                  strokeOpacity="0.65"
                />
                <path
                  d="M -30 -180 C -250 -115, -250 115, -30 180"
                  fill="none"
                  stroke={isDark ? '#46D6A4' : '#087F5B'}
                  strokeWidth="1.25"
                  strokeOpacity="0.42"
                />
              </g>

              {/* Right Parting Titanium Caliper Wing */}
              <g
                transform={`translate(${(k.wingSplitPx * 130).toFixed(1)}, 0) scale(${k.apertureScale.toFixed(3)})`}
                style={{ opacity: Math.max(0.12, 0.88 - k.productW * 0.78) }}
              >
                <path
                  d="M 60 -150 C 210 -95, 210 95, 60 150"
                  fill="none"
                  stroke={isDark ? '#B8C5CC' : '#8D989C'}
                  strokeWidth="2.4"
                  strokeOpacity="0.65"
                />
                <path
                  d="M 30 -180 C 250 -115, 250 115, 30 180"
                  fill="none"
                  stroke={isDark ? '#CDFF45' : '#087F5B'}
                  strokeWidth="1.25"
                  strokeOpacity="0.48"
                />
              </g>

              {/* Scene 04 Dynamic Memory Connection Filaments */}
              {k.connectLineProgress > 0.02 && (
                <g
                  style={{ opacity: k.connectLineProgress }}
                  stroke={isDark ? '#CDFF45' : '#087F5B'}
                  strokeWidth="1.4"
                  strokeOpacity="0.52"
                  fill="none"
                >
                  <path
                    d="M -340 -95 Q 0 -145 340 -95"
                    strokeDasharray="720"
                    strokeDashoffset={(1 - k.connectLineProgress) * 720}
                  />
                  <path
                    d="M -340 100 Q 0 148 340 100"
                    strokeDasharray="720"
                    strokeDashoffset={(1 - k.connectLineProgress) * 720}
                  />
                  <path
                    d="M -120 -95 L -120 100 M 120 -95 L 120 100"
                    strokeDasharray="240"
                    strokeDashoffset={(1 - k.connectLineProgress) * 240}
                    strokeOpacity="0.28"
                  />
                </g>
              )}
            </svg>

            {/* CENTRAL DILATING GLASS PRISM GLOW BEHIND SPHERE OPENING */}
            <div
              aria-hidden="true"
              style={{
                opacity: k.unfoldW * (1 - k.productW) * 0.72,
                transform: `scale(${lerp(0.65, 1.55, k.unfoldW)})`,
              }}
              className="pointer-events-none absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full blur-3xl z-10 bg-[radial-gradient(circle,rgba(205,255,69,0.28)_0%,rgba(70,214,164,0.14)_48%,transparent_72%)]"
            />

            {/* CENTRAL SIGNATURE MEMORY SPHERE (Maintains dominant presence before parting) */}
            <div
              style={{
                opacity: k.sphereOpacity,
                transform: `scale(${k.sphereScale.toFixed(3)}) rotate(${(effectiveProgress * 18).toFixed(2)}deg)`,
              }}
              className={cn(
                'pointer-events-none relative z-20 w-[260px] h-[260px] sm:w-[330px] sm:h-[330px] lg:w-[390px] lg:h-[390px] xl:w-[440px] xl:h-[440px] 2xl:w-[480px] 2xl:h-[480px] flex items-center justify-center will-change-[transform,opacity]',
                useCssGlide && 'transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
              )}
            >
              <img
                src={VG_SPHERE_THEME_SPEC.heroAnimWebp}
                alt="Unfolding Memory Sphere core"
                className="w-full h-full object-contain scale-[1.08]"
              />
            </div>

            {/* 8 CONTINUOUSLY CHOREOGRAPHED MEMORY & DOCUMENT ARTIFACTS */}
            <div className="pointer-events-none absolute inset-0 z-20">
              {STORY_ARTIFACTS.map((art) => {
                // Smoothly blend Discover -> Connect -> Left Workspace Column without jumps
                const nxCon = lerp(0, art.discoverPos[0], k.discoverW)
                const nyCon = lerp(0, art.discoverPos[1], k.discoverW)
                const rCon = lerp(0, art.discoverPos[2], k.discoverW)

                const nxGrid = lerp(nxCon, art.connectPos[0], k.connectW)
                const nyGrid = lerp(nyCon, art.connectPos[1], k.connectW)
                const rGrid = lerp(rCon, art.connectPos[2], k.connectW)

                const nxFinal = lerp(nxGrid, art.workspacePos[0], k.productW)
                const nyFinal = lerp(nyGrid, art.workspacePos[1], k.productW)
                const rFinal = lerp(rGrid, 0, k.productW)

                const xPx = nxFinal * maxSpreadX
                const yPx = nyFinal * maxSpreadY

                // Hide non-matching cards smoothly once they settle beyond the Workspace top 4 results
                const nonMatchRememberFade = !art.isCoastalMatch
                  ? lerp(1, 0.24, k.rememberW) * (1 - k.productW)
                  : 1

                // Gentle emergence straight out of the opening sphere starting at unfoldW > 0.35
                const revealScale = lerp(0.18, 0.98, Math.max(k.unfoldW * 0.25, k.discoverW))
                const matchBoost =
                  art.isCoastalMatch && k.rememberW > 0
                    ? lerp(1, 1.07, k.rememberW * (1 - k.productW * 0.85))
                    : !art.isCoastalMatch && k.rememberW > 0
                      ? lerp(1, 0.84, k.rememberW)
                      : 1

                const cardOpacity = Math.max(0, Math.min(1, k.discoverW * 1.15 * nonMatchRememberFade))
                const isHighlighted = art.isCoastalMatch && k.rememberW > 0.22

                return (
                  <div
                    key={art.id}
                    data-artifact-id={art.id}
                    style={{
                      left: '50%',
                      top: '50%',
                      opacity: cardOpacity,
                      transform: `translate3d(calc(-50% + ${xPx.toFixed(1)}px), calc(-50% + ${yPx.toFixed(1)}px), 0) rotate(${rFinal.toFixed(2)}deg) scale(${(revealScale * matchBoost).toFixed(3)})`,
                    }}
                    className={cn(
                      'absolute rounded-2xl overflow-hidden bg-[var(--vg-surface)] border will-change-[transform,opacity]',
                      useCssGlide
                        ? 'transition-[transform,opacity,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
                        : 'transition-shadow duration-200',
                      isCompactH
                        ? 'w-[96px] sm:w-[116px] lg:w-[130px]'
                        : 'w-[104px] sm:w-[138px] lg:w-[164px] xl:w-[184px] 2xl:w-[204px]',
                      isHighlighted
                        ? 'border-[#087F5B] dark:border-[#CDFF45] shadow-[0_24px_54px_-14px_rgba(205,255,69,0.42),0_12px_28px_-10px_rgba(16,18,17,0.22)] ring-2 ring-[#CDFF45]/75 z-30'
                        : 'border-[var(--vg-border-strong)] shadow-[var(--vg-shadow-card)] z-20'
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--vg-surface-2)]">
                      <img src={art.src} alt={art.alt} className="w-full h-full object-cover" />
                      {isHighlighted && (
                        <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[#CDFF45] text-[#101211]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Match</span>
                        </span>
                      )}
                    </div>
                    <div className="px-2.5 py-1.5 bg-[var(--vg-surface)] flex items-center justify-between gap-1.5">
                      <span className="font-mono text-[9px] sm:text-[10px] text-[#101211] dark:text-[#F4F6F2] truncate">
                        {art.filename}
                      </span>
                      <span className="hidden sm:inline text-[9px] text-[var(--vg-ink-2)] shrink-0">
                        {art.category}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* BOTTOM INTERACTIVE SCENE SCRUBBER BAR */}
          <div className="relative z-30 flex flex-col gap-2 pt-1 shrink-0">
            <div className="w-full h-1 rounded-full bg-[#DBE0DA] dark:bg-white/[0.10] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#087F5B] dark:bg-[#CDFF45] transition-[width] duration-75"
                style={{ width: `${Math.max(4, Math.round(effectiveProgress * 100))}%` }}
              />
            </div>

            <div
              role="tablist"
              aria-label="Memory transformation scenes"
              className="flex flex-wrap items-center justify-between gap-1.5"
            >
              {UNFOLD_SCENES.map((scene, idx) => {
                const active = idx === activeSceneIdx
                return (
                  <button
                    key={scene.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleSelectScene(idx)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11.5px] sm:text-[12px] font-medium border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]',
                      active
                        ? 'bg-[#101211] text-[#F4F6F2] border-[#101211] dark:bg-[#CDFF45] dark:text-[#090B0D] dark:border-[#CDFF45] shadow-sm'
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
