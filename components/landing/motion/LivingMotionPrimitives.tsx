import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Play } from 'lucide-react'
import { VG_COMPONENTS, VG_MOTION } from '@/components/landing/design-system'
import { useReducedMotion } from '@/components/landing/motion/useReducedMotion'
import { cn } from '@/lib/utils'

/**
 * SSR-safe reduced motion helper matching centralized MotionProvider policy.
 */
export function useClientReducedMotion(): boolean {
  return useReducedMotion()
}

function isFinePointer(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(pointer: fine)').matches
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
 * Tactile Magnetic Circular Volt-Lime CTA (custom-tuned React Bits Magnet interaction).
 * Automatically disables magnetic offset on touch / coarse pointers and prefers-reduced-motion.
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
  const reduced = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, VG_MOTION.springMagnetic)
  const y = useSpring(rawY, VG_MOTION.springMagnetic)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !ref.current || !isFinePointer()) return
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
      ? 'w-[122px] h-[122px] sm:w-[134px] sm:h-[134px] xl:w-[148px] xl:h-[148px]'
      : 'w-[104px] h-[104px] sm:w-[116px] sm:h-[116px]'

  const circleClasses =
    'inline-flex flex-col items-center justify-center text-center rounded-full bg-[#101211] hover:bg-[#191D20] dark:bg-[#161B20] dark:hover:bg-[#1E242B] text-[#F4F6F2] border border-[#101211]/15 dark:border-white/[0.16] shadow-[0_24px_56px_-14px_rgba(16,18,17,0.42),0_0_32px_-12px_rgba(205,255,69,0.22)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45] focus-visible:ring-offset-4'

  const innerContent = (
    <span className="flex flex-col items-center justify-center gap-1.5 px-3 leading-tight">
      <span className="w-8 h-8 rounded-full bg-[#CDFF45] text-[#101211] flex items-center justify-center shadow-[0_6px_18px_rgba(205,255,69,0.38)] group-hover:scale-105 transition-transform duration-200">
        <Play className="w-3.5 h-3.5 fill-[#101211] text-[#101211] translate-x-[0.5px]" />
      </span>
      <span className="text-[13px] xl:text-[13.5px] font-semibold tracking-[-0.015em] text-[#F4F6F2]">
        {label}
      </span>
      {sublabel && (
        <span className="text-[10.5px] font-medium text-[#A4AEA9] tracking-[-0.01em]">
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
      whileHover={reduced ? undefined : { scale: 1.04 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      className={cn('inline-block group', className)}
    >
      {href ? (
        <a
          href={href}
          onClick={onClick}
          className={cn(circleClasses, sizeClass, 'relative overflow-hidden')}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-1.5 rounded-full border border-[#CDFF45]/[0.20] group-hover:border-[#CDFF45]/[0.45] group-hover:scale-[1.03] transition-all duration-300"
          />
          {innerContent}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={cn(circleClasses, sizeClass, 'relative overflow-hidden')}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-1.5 rounded-full border border-[#CDFF45]/[0.20] group-hover:border-[#CDFF45]/[0.45] group-hover:scale-[1.03] transition-all duration-300"
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
  style?: React.CSSProperties
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

/**
 * Editorial SplitText Reveal (custom-tuned React Bits SplitText typography rhythm).
 * Animates words cleanly upward out of a mask without hiding SSR text before hydration.
 */
export function SplitTextReveal({
  text,
  className,
  style,
  delay = 0,
  as = 'h2',
}: SplitTextRevealProps) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const Component = as
  const words = text.split(' ')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (reduced || !mounted) {
    return (
      <Component className={className} style={style}>
        {text}
      </Component>
    )
  }

  return (
    <Component className={className} style={style}>
      {words.map((word, idx) => (
        <span key={`${word}-${idx}`} className="inline-block overflow-hidden align-top pt-[0.06em] -mt-[0.06em] pb-[0.24em] -mb-[0.24em] mr-[0.26em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: '22%', opacity: 0.92 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={VG_MOTION.viewport}
            transition={{
              duration: 0.52,
              delay: delay + idx * 0.035,
              ease: VG_MOTION.ease,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Component>
  )
}

/**
 * Refined Metallic Glare Frame (custom-tuned React Bits GlareHover effect).
 * Adds a delicate soft specular sheen tracing mouse coordinates across hardware/software stages.
 */
export function StudioGlareFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [glare, setGlare] = useState({ x: 50, y: 20, active: false })

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !hostRef.current || !isFinePointer()) return
    const rect = hostRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100
    setGlare({ x, y, active: true })
  }

  return (
    <div
      ref={hostRef}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setGlare((g) => ({ ...g, active: false }))}
      className={cn('relative overflow-hidden', className)}
    >
      {children}
      {!reduced && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-20"
          style={{
            opacity: glare.active ? 0.55 : 0,
            background: `radial-gradient(520px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.09), rgba(205,255,69,0.04) 34%, transparent 70%)`,
          }}
        />
      )}
    </div>
  )
}

export interface TriadItem {
  numeral: string
  label: string
  href: string
  hint: string
}

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
              'group inline-flex items-baseline justify-between lg:justify-end gap-4 sm:gap-5 py-0.5 transition-[transform,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45] rounded-md px-1',
              isActive
                ? 'text-[#101211] dark:text-[#F4F6F2]'
                : 'text-[#606961] hover:text-[#101211] dark:text-[#A4AEA9] dark:hover:text-[#F4F6F2]'
            )}
          >
            <span className="text-[14px] sm:text-[15px] xl:text-[16.5px] font-medium tracking-[-0.015em] group-hover:translate-x-0.5 lg:group-hover:-translate-x-0.5 transition-transform">
              {item.label}
            </span>
            <span
              className={cn(
                'font-mono text-[12px] xl:text-[13px] tracking-[0.04em] transition-colors',
                isActive
                  ? 'text-[#087F5B] dark:text-[#CDFF45] font-semibold'
                  : 'text-[#606961]/80 dark:text-[#7C8782]'
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
