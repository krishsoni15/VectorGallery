import React from 'react'
import {
  motion,
  MotionConfig,
  useReducedMotion,
  type HTMLMotionProps,
} from 'framer-motion'
import { VG_MOTION } from '@/components/landing/design-system'

export const VG_EASE: [number, number, number, number] = VG_MOTION.ease
export const VG_SPRING_SNAPPY = VG_MOTION.springSnappy
export const VG_SPRING_PARALLAX = VG_MOTION.springParallax

export function SanctuaryMotionConfig({
  children,
}: {
  children: React.ReactNode
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

interface MotionRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  delay?: number
  y?: number
  duration?: number
  className?: string
  immediate?: boolean
}

export function MotionReveal({
  children,
  delay = 0,
  y = 12,
  duration = VG_MOTION.durations.standard,
  className,
  immediate = false,
  ...props
}: MotionRevealProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  if (immediate) {
    return (
      <motion.div
        initial={{ opacity: 0.94, y: Math.min(y, 10) }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, delay, ease: VG_EASE }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0.9, y: Math.min(y, 12) }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VG_MOTION.viewport}
      transition={{ duration, delay, ease: VG_EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerGrid({
  children,
  className,
  stagger = 0.05,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VG_MOTION.viewport}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerTile({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0.9, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: VG_MOTION.durations.standard, ease: VG_EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MotionPathTrace({
  d,
  stroke,
  strokeWidth = 1.6,
  strokeDasharray,
  delay = 0.25,
  duration = 1.0,
}: {
  d: string
  stroke: string
  strokeWidth?: number
  strokeDasharray?: string
  delay?: number
  duration?: number
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <path
        d={d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        opacity={0.78}
      />
    )
  }

  return (
    <motion.path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.85 }}
      transition={{ duration, delay, ease: VG_EASE }}
    />
  )
}
