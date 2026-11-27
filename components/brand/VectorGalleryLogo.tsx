import React, { useId } from 'react'
import { motion } from 'framer-motion'
import { useClientReducedMotion } from '@/components/landing/motion/LivingMotionPrimitives'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'horizontal' | 'mark' | 'monochrome' | 'animated' | 'on-dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showWordmark?: boolean
}

const SIZE_MAP = {
  sm: { box: 28, text: 'text-[15px]', gap: 'gap-2' },
  md: { box: 34, text: 'text-[16.5px]', gap: 'gap-2.5' },
  lg: { box: 42, text: 'text-[20px]', gap: 'gap-3' },
}

/* Precision geometric planes echoing Liquid Silver folds & Acid-Lime Memory Core */
const LEFT_SILVER_FOLD =
  'M16.2 17.6 L23.4 15.0 Q26.4 14.0 27.6 17.2 L35.8 39.8 Q37.0 43.2 33.8 44.6 L28.0 46.8 Q24.6 48.0 23.4 44.8 L14.4 22.4 Q13.0 18.8 16.2 17.6 Z'

const RIGHT_LIME_FOLD =
  'M40.6 15.0 L47.8 17.6 Q51.0 18.8 49.6 22.4 L40.6 44.8 Q39.4 48.0 36.0 46.8 L30.2 44.6 Q27.0 43.2 28.2 39.8 L36.4 17.2 Q37.6 14.0 40.6 15.0 Z'

const APEX_CORE_PRISM = 'M32.0 33.8 L35.4 39.8 L32.0 45.4 L28.6 39.8 Z'

/**
 * VectorGallery "Living Matter" Fold & Orbit Brand Mark.
 * Combines sculpted liquid titanium geometry with translucent acid-lime/emerald refraction.
 */
export function VectorGalleryLogo({
  variant = 'horizontal',
  size = 'md',
  className,
  showWordmark = true,
}: LogoProps) {
  const prefersReduced = useClientReducedMotion()
  const rawId = useId().replace(/:/g, '')
  const dims = SIZE_MAP[size]
  const isMono = variant === 'monochrome'
  const isOnDark = variant === 'on-dark'
  const isAnimated = variant === 'animated' && !prefersReduced

  const darkGradId = `vg-lm-dark-${rawId}`
  const limeGradId = `vg-lm-lime-${rawId}`
  const silverGradId = `vg-lm-silver-${rawId}`

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
          <linearGradient id={darkGradId} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#171C21" />
            <stop offset="100%" stopColor="#090B0D" />
          </linearGradient>
          <linearGradient id={silverGradId} x1="12" y1="14" x2="36" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F7F9FA" />
            <stop offset="55%" stopColor="#DCE3E6" />
            <stop offset="100%" stopColor="#8C99A0" />
          </linearGradient>
          <linearGradient id={limeGradId} x1="28" y1="14" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D9FF66" />
            <stop offset="48%" stopColor="#CDFF45" />
            <stop offset="100%" stopColor="#087F5B" />
          </linearGradient>
        </defs>

        {/* Precision Obsidian-Titanium Squircle Emblem */}
        {isMono ? (
          <rect
            x="1.5"
            y="1.5"
            width="61"
            height="61"
            rx="16"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeOpacity="0.24"
            strokeWidth="1.5"
          />
        ) : (
          <rect
            x="1.5"
            y="1.5"
            width="61"
            height="61"
            rx="16"
            fill={`url(#${darkGradId})`}
            stroke={isOnDark ? '#CDFF45' : '#BCC5C8'}
            strokeOpacity={isOnDark ? '0.32' : '0.42'}
            strokeWidth="1.5"
          />
        )}

        {/* Delicate Tilted Orbital Hairline */}
        <ellipse
          cx="32"
          cy="33"
          rx="22.5"
          ry="8.4"
          transform="rotate(-24 32 33)"
          className={cn(isMono ? 'stroke-current opacity-35' : 'stroke-[#E3E8EA]/35')}
          strokeWidth="1.25"
        />

        {/* Folded Silver & Translucent Acid-Lime Planes */}
        {isAnimated ? (
          <>
            <motion.path
              d={LEFT_SILVER_FOLD}
              fill={isMono ? 'currentColor' : `url(#${silverGradId})`}
              fillOpacity={isMono ? 0.55 : 0.94}
              stroke={isMono ? 'none' : '#101211'}
              strokeOpacity="0.14"
              strokeWidth="1"
              initial={{ opacity: 0, x: -3, y: -2 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d={RIGHT_LIME_FOLD}
              fill={isMono ? 'currentColor' : `url(#${limeGradId})`}
              fillOpacity={isMono ? 0.92 : 0.96}
              stroke={isMono ? 'none' : '#087F5B'}
              strokeOpacity="0.35"
              strokeWidth="1"
              initial={{ opacity: 0, x: 3, y: -2 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d={APEX_CORE_PRISM}
              fill={isMono ? 'currentColor' : '#D4FF54'}
              fillOpacity={isMono ? 0.45 : 0.95}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        ) : (
          <>
            <path
              d={LEFT_SILVER_FOLD}
              fill={isMono ? 'currentColor' : `url(#${silverGradId})`}
              fillOpacity={isMono ? 0.55 : 0.94}
              stroke={isMono ? 'none' : '#101211'}
              strokeOpacity="0.14"
              strokeWidth="1"
            />
            <path
              d={RIGHT_LIME_FOLD}
              fill={isMono ? 'currentColor' : `url(#${limeGradId})`}
              fillOpacity={isMono ? 0.92 : 0.96}
              stroke={isMono ? 'none' : '#087F5B'}
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            <path
              d={APEX_CORE_PRISM}
              fill={isMono ? 'currentColor' : '#D4FF54'}
              fillOpacity={isMono ? 0.45 : 0.95}
            />
          </>
        )}
      </svg>

      {showWordmark && variant !== 'mark' && (
        <span
          className={cn(
            'font-display font-bold tracking-[-0.035em]',
            dims.text,
            isMono
              ? 'text-current'
              : isOnDark
                ? 'text-[#F3F5F1]'
                : 'text-[#101211] dark:text-[#F3F5F1]'
          )}
        >
          VectorGallery
        </span>
      )}
    </span>
  )
}
