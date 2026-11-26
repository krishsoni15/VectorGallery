import React from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface RevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  immediate?: boolean
}

/**
 * Smooth entrance reveal tuned so SSR initial render never hides above-the-fold copy
 * while scrolling content settles with subtle spring-like deceleration.
 */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
  immediate = false,
  ...props
}: RevealProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  if (immediate) {
    return (
      <motion.div
        initial={{ opacity: 0.92, y: Math.min(y, 10) }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay, ease: EASE_OUT_EXPO }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.55, delay, ease: EASE_OUT_EXPO }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.07,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.48, ease: EASE_OUT_EXPO },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

