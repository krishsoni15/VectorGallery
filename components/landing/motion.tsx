import React from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export const VG_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface MotionRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  immediate?: boolean
}

export function MotionReveal({
  children,
  delay = 0,
  y = 12,
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
        transition={{ duration: 0.48, delay, ease: VG_EASE }}
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
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.48, delay, ease: VG_EASE }}
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
      viewport={{ once: true, amount: 'some' }}
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
          transition: { duration: 0.42, ease: VG_EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
