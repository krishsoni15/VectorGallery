import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { Play } from 'lucide-react'
import { VG_COMPONENTS, VG_MOTION } from '@/components/landing/design-system'
import { cn } from '@/lib/utils'

/**
 * SSR-safe reduced motion hook that prevents React #418/#425 hydration mismatches
 * when Chromium or OS has prefers-reduced-motion: reduce enabled on first load.
 */
export function useClientReducedMotion(): boolean {
  const prefers = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted && Boolean(prefers)
}

interface MagneticCircleButtonProps {
  label: string
  sublabel?: string
  href?: string
  onClick?: () => void
  className?: string
  size?: 'md' | 'lg'
}

/**
 * Tactile Magnetic Circular Acid-Lime CTA matching the benchmark hero sculptural anchor.
 * Gently attracts toward pointer hover inside a subtle spring envelope, and remains rock-solid under reduced-motion.
 */
export function MagneticCircleButton({
  label,
  sublabel,
  href,
  onClick,
  className,
  size = 'lg',
}: MagneticCircleButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useClientReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, VG_MOTION.springMagnetic)
  const y = useSpring(rawY, VG_MOTION.springMagnetic)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.16
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.16
    rawX.set(Math.max(-12, Math.min(12, dx)))
    rawY.set(Math.max(-12, Math.min(12, dy)))
  }

  const resetPointer = () => {
    rawX.set(0)
    rawY.set(0)
  }

  const sizeClass =
    size === 'lg'
      ? 'w-[122px] h-[122px] sm:w-[144px] sm:h-[144px] xl:w-[154px] xl:h-[154px]'
      : 'w-[112px] h-[112px] sm:w-[128px] sm:h-[128px]'

  const innerContent = (
    <span className="flex flex-col items-center justify-center gap-1 px-4 leading-tight">
      <span className="inline-flex items-center gap-1.5 text-[12.5px] sm:text-[13.5px] font-bold tracking-[-0.015em] text-[#101211]">
        <Play className="w-3 h-3 fill-[#101211] text-[#101211] shrink-0" />
        <span>{label}</span>
      </span>
      {sublabel && (
        <span className="text-[11px] font-medium text-[#101211]/75 tracking-[-0.01em]">
          {sublabel}
        </span>
      )}
    </span>
  )

  return (
    <motion.div
      ref={ref}
      style={reduced ? undefined : { x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      whileHover={reduced ? undefined : { scale: 1.045 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      className={cn('inline-block group', className)}
    >
      {href ? (
        <a
          href={href}
          onClick={onClick}
          className={cn(VG_COMPONENTS.buttons.limeCircle, sizeClass, 'relative overflow-hidden')}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-1.5 rounded-full border border-[#101211]/12 group-hover:scale-105 transition-transform duration-300"
          />
          {innerContent}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={cn(VG_COMPONENTS.buttons.limeCircle, sizeClass, 'relative overflow-hidden')}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-1.5 rounded-full border border-[#101211]/12 group-hover:scale-105 transition-transform duration-300"
          />
          {innerContent}
        </button>
      )}
    </motion.div>
  )
}

interface SplitTextRevealProps {
  text: string
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export function SplitTextReveal({
  text,
  className,
  delay = 0,
  as = 'p',
}: SplitTextRevealProps) {
  const reduced = useClientReducedMotion()
  const Component = as

  if (reduced) {
    return <Component className={className}>{text}</Component>
  }

  return (
    <motion.div
      initial={{ opacity: 0.9, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VG_MOTION.viewport}
      transition={{ duration: 0.55, delay, ease: VG_MOTION.ease }}
    >
      <Component className={className}>{text}</Component>
    </motion.div>
  )
}

export interface TriadItem {
  numeral: string
  label: string
  href: string
  hint: string
}

/**
 * Interactive right-aligned triad index matching the benchmark layout:
 * Capture /01 · Connect /02 · Remember /03
 */
export function InteractiveTriadIndex({
  items,
  activeIndex = 0,
  onSelect,
}: {
  items: TriadItem[]
  activeIndex?: number
  onSelect?: (idx: number) => void
}) {
  return (
    <nav aria-label="Core memory flow" className="flex flex-col gap-2 sm:gap-2.5 lg:items-end">
      {items.map((item, idx) => {
        const isActive = idx === activeIndex
        return (
          <a
            key={item.numeral}
            href={item.href}
            onClick={() => onSelect?.(idx)}
            onMouseEnter={() => onSelect?.(idx)}
            className={cn(
              'group inline-flex items-baseline justify-between lg:justify-end gap-4 sm:gap-5 py-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CFFF49] rounded-md px-1',
              isActive
                ? 'text-[#101211] dark:text-[#F3F5F1]'
                : 'text-[#626B64] hover:text-[#101211] dark:text-[#9AA69E] dark:hover:text-[#F3F5F1]'
            )}
          >
            <span className="text-[13.5px] sm:text-[14.5px] font-medium tracking-[-0.015em] group-hover:translate-x-0.5 lg:group-hover:-translate-x-0.5 transition-transform">
              {item.label}
            </span>
            <span
              className={cn(
                'font-mono text-[12px] tracking-[0.04em] transition-colors',
                isActive
                  ? 'text-[#087F5B] dark:text-[#CFFF49] font-semibold'
                  : 'text-[#626B64]/80 dark:text-[#828E86]'
              )}
            >
              /{item.numeral}
            </span>
          </a>
        )
      })}
    </nav>
  )
}

