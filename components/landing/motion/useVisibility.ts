import { useEffect, useState, type RefObject } from 'react'

/**
 * Tracks whether a referenced DOM host is intersecting the viewport AND the document is active.
 * Pauses expensive WebGL shaders & Three.js renderers when offscreen or backgrounded.
 */
export function useVisibility(ref: RefObject<Element | null>, rootMargin = '140px'): boolean {
  const [inView, setInView] = useState(true)
  const [docVisible, setDocVisible] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onVis = () => setDocVisible(!document.hidden)
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        setInView(Boolean(entries[0]?.isIntersecting))
      },
      { rootMargin, threshold: 0.01 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])

  return inView && docVisible
}

