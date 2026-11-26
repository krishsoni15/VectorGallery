import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'horizontal' | 'mark' | 'monochrome' | 'animated'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showWordmark?: boolean
}

const SIZE_MAP = {
  sm: { box: 28, text: 'text-[15px]', gap: 'gap-2' },
  md: { box: 34, text: 'text-[17px]', gap: 'gap-2.5' },
  lg: { box: 42, text: 'text-[21px]', gap: 'gap-3' },
}

/**
 * Custom Soft-Blue Vector Fold / Memory Stack SVG Logo.
 * Represents overlapping photo/document planes converging cleanly into a geometric V.
 */
export function VectorGalleryLogo({
  variant = 'horizontal',
  size = 'md',
  className,
  showWordmark = true,
}: LogoProps) {
  const prefersReduced = useReducedMotion()
  const dims = SIZE_MAP[size]
  const isMono = variant === 'monochrome'
  const isAnimated = variant === 'animated' && !prefersReduced

  return (
    <span className={cn('inline-flex items-center select-none', dims.gap, className)}>
      <svg
        width={dims.box}
        height={dims.box}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="vg-logo-tile" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#397BEE" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        <rect
          width="64"
          height="64"
          rx="16"
          fill={isMono ? 'currentColor' : 'url(#vg-logo-tile)'}
          fillOpacity={isMono ? 0.12 : 1}
        />
        {!isMono && (
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="15.25"
            stroke="#93C5FD"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
        )}

        {isAnimated ? (
          <>
            <motion.path
              d="M15.5 19.5C14.7 17.8 15.9 16 17.7 16H24.2C25.3 16 26.3 16.7 26.7 17.7L34.4 36.2L30.8 45.2C29.9 47.3 27.1 47.3 26.2 45.2L15.5 19.5Z"
              fill={isMono ? 'currentColor' : '#BFDBFE'}
              fillOpacity={isMono ? 0.55 : 1}
              initial={{ opacity: 0, x: -5, y: -4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d="M48.5 19.5C49.3 17.8 48.1 16 46.3 16H39.8C38.7 16 37.7 16.7 37.3 17.7L28.5 39.2L30.9 45.9C31.7 48.2 34.7 48.2 35.6 46L48.5 19.5Z"
              fill={isMono ? 'currentColor' : '#FFFFFF'}
              initial={{ opacity: 0, x: 5, y: -4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        ) : (
          <>
            <path
              d="M15.5 19.5C14.7 17.8 15.9 16 17.7 16H24.2C25.3 16 26.3 16.7 26.7 17.7L34.4 36.2L30.8 45.2C29.9 47.3 27.1 47.3 26.2 45.2L15.5 19.5Z"
              fill={isMono ? 'currentColor' : '#BFDBFE'}
              fillOpacity={isMono ? 0.55 : 1}
            />
            <path
              d="M48.5 19.5C49.3 17.8 48.1 16 46.3 16H39.8C38.7 16 37.7 16.7 37.3 17.7L28.5 39.2L30.9 45.9C31.7 48.2 34.7 48.2 35.6 46L48.5 19.5Z"
              fill={isMono ? 'currentColor' : '#FFFFFF'}
            />
          </>
        )}
      </svg>

      {showWordmark && variant !== 'mark' && (
        <span
          className={cn(
            'font-display font-bold tracking-[-0.03em]',
            dims.text,
            isMono ? 'text-current' : 'text-[#14233B] dark:text-[#F1F5FF]'
          )}
        >
          VectorGallery
        </span>
      )}
    </span>
  )
}

