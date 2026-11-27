export interface HeroTimelineRefs {
  wordmarkEl: HTMLElement | null
  copyEl: HTMLElement | null
  triadEl: HTMLElement | null
  ctaEl: HTMLElement | null
  onEntranceProgress?: (p: number) => void
}

/**
 * Launches the choreographed Hero opening sequence (~1.35s) using GSAP timelines:
 * 0–200ms nav/content ready -> 100–650ms vertical masked wordmark reveal ->
 * 200–1000ms 3D sculpture entrance glide -> 750–1350ms editorial copy & CTAs settle.
 * Never hides above-the-fold text if reducedMotion is enabled or JS executes late.
 */
export function createHeroTimeline({
  wordmarkEl,
  copyEl,
  triadEl,
  ctaEl,
  onEntranceProgress,
}: HeroTimelineRefs): () => void {
  let cancelled = false
  let revertCtx: (() => void) | null = null

  const run = async () => {
    try {
      const gsapMod = await import('gsap')
      if (cancelled) return
      const gsap = gsapMod.gsap || gsapMod.default
      const proxy = { entrance: 0 }

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        if (wordmarkEl) {
          tl.fromTo(
            wordmarkEl,
            { clipPath: 'inset(18% 0% 0% 0%)', y: 12 },
            { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.62 },
            0.06
          )
        }

        if (onEntranceProgress) {
          tl.to(
            proxy,
            {
              entrance: 1,
              duration: 0.95,
              ease: 'power2.out',
              onUpdate: () => onEntranceProgress(proxy.entrance),
            },
            0.12
          )
        }

        if (copyEl) {
          tl.fromTo(
            copyEl,
            { y: 12, opacity: 0.92 },
            { y: 0, opacity: 1, duration: 0.55 },
            0.42
          )
        }

        if (triadEl) {
          tl.fromTo(
            triadEl,
            { y: 10, opacity: 0.92 },
            { y: 0, opacity: 1, duration: 0.5 },
            0.5
          )
        }

        if (ctaEl) {
          tl.fromTo(
            ctaEl,
            { scale: 0.94, opacity: 0.92 },
            { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.25)' },
            0.58
          )
        }
      })

      revertCtx = () => ctx.revert()
    } catch {
      onEntranceProgress?.(1)
    }
  }

  run()

  return () => {
    cancelled = true
    revertCtx?.()
  }
}

