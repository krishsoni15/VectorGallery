import React, { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'horizontal' | 'mark' | 'monochrome' | 'animated' | 'on-dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showWordmark?: boolean
}

const SIZE_MAP = {
  sm: { box: 28, text: 'text-[15px]', gap: 'gap-2' },
  md: { box: 34, text: 'text-[17px]', gap: 'gap-2.5' },
  lg: { box: 42, text: 'text-[21px]', gap: 'gap-3' },
}

/* Precision geometric planes echoing the physical ceramic & frosted-emerald Memory Fold V */
const LEFT_FOLD_PLANE =
  'M15.4 16.8 L23.0 14.2 Q26.4 13.0 27.8 16.4 L36.6 40.4 Q38.0 44.2 34.4 45.6 L28.2 48.0 Q24.4 49.4 23.0 45.8 L13.4 22.0 Q12.0 18.2 15.4 16.8 Z'

const RIGHT_FOLD_PLANE =
  'M41.0 14.2 L48.6 16.8 Q52.0 18.2 50.6 22.0 L41.0 45.8 Q39.6 49.4 35.8 48.0 L29.6 45.6 Q26.0 44.2 27.4 40.4 L36.2 16.4 Q37.6 13.0 41.0 14.2 Z'

const BACK_CERAMIC_WEDGE = 'M25.4 15.5 L38.6 15.5 L32.0 34.5 Z'

const APEX_PRISM_FACET = 'M32.0 34.2 L35.2 40.0 L32.0 45.4 L28.8 40.0 Z'

/**
 * VectorGallery "Memory Fold" Connected Frames Logo.
 * Ceramic neutral wedge + frosted glass left plane + satin emerald/jade right acrylic fold.
 */
export function VectorGalleryLogo({
  variant = 'horizontal',
  size = 'md',
  className,
  showWordmark = true,
}: LogoProps) {
  const prefersReduced = useReducedMotion()
  const rawId = useId().replace(/:/g, '')
  const dims = SIZE_MAP[size]
  const isMono = variant === 'monochrome'
  const isOnDark = variant === 'on-dark'
  const isAnimated = variant === 'animated' && !prefersReduced

  const darkGradId = `vg-fold-dark-${rawId}`

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
            <stop offset="0%" stopColor="#131614" />
            <stop offset="100%" stopColor="#252A26" />
          </linearGradient>
        </defs>

        {/* Studio Beveled Tile */}
        {isMono ? (
          <rect
            x="1"
            y="1"
            width="62"
            height="62"
            rx="15"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeOpacity="0.24"
            strokeWidth="1.5"
          />
        ) : isOnDark ? (
          <rect
            x="1"
            y="1"
            width="62"
            height="62"
            rx="15"
            fill={`url(#${darkGradId})`}
            stroke="#58D6A8"
            strokeOpacity="0.26"
            strokeWidth="1.5"
          />
        ) : (
          <>
            <rect
              x="1"
              y="1"
              width="62"
              height="62"
              rx="15"
              className="fill-[#FFFFFF] dark:fill-[#131614] stroke-[#E0E4DD] dark:stroke-white/[0.12]"
              strokeWidth="1.5"
            />
            <rect
              x="3.5"
              y="3.5"
              width="57"
              height="57"
              rx="12.5"
              className="fill-[#FAFAF7] dark:fill-[#171A18]"
            />
          </>
        )}

        {/* Back Ceramic Wedge */}
        <path
          d={BACK_CERAMIC_WEDGE}
          className={cn(
            isMono
              ? 'fill-current opacity-20'
              : isOnDark
                ? 'fill-[#252A26]'
                : 'fill-[#E9EBE5] dark:fill-[#252A26]'
          )}
        />

        {/* Folded Planes */}
        {isAnimated ? (
          <>
            <motion.path
              d={LEFT_FOLD_PLANE}
              className={cn(
                isMono
                  ? 'fill-current opacity-55'
                  : isOnDark
                    ? 'fill-[#75BDB3]/60 stroke-[#C4EDE1]/40'
                    : 'fill-[#A6D9D0]/80 stroke-[#087F5B]/35 dark:fill-[#75BDB3]/58 dark:stroke-[#C4EDE1]/35'
              )}
              strokeWidth="1"
              initial={{ opacity: 0, x: -4, y: -3 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d={RIGHT_FOLD_PLANE}
              className={cn(
                isMono
                  ? 'fill-current opacity-95'
                  : isOnDark
                    ? 'fill-[#58D6A8]/92 stroke-[#C4EDE1]/55'
                    : 'fill-[#087F5B]/94 stroke-[#C4EDE1]/55 dark:fill-[#58D6A8]/90 dark:stroke-[#C4EDE1]/50'
              )}
              strokeWidth="1.15"
              initial={{ opacity: 0, x: 4, y: -3 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d={APEX_PRISM_FACET}
              className={cn(
                isMono
                  ? 'fill-current opacity-40'
                  : isOnDark
                    ? 'fill-[#F2F3EF]/90'
                    : 'fill-[#C4EDE1]/95 dark:fill-[#F2F3EF]/90'
              )}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        ) : (
          <>
            <path
              d={LEFT_FOLD_PLANE}
              className={cn(
                isMono
                  ? 'fill-current opacity-55'
                  : isOnDark
                    ? 'fill-[#75BDB3]/60 stroke-[#C4EDE1]/40'
                    : 'fill-[#A6D9D0]/80 stroke-[#087F5B]/35 dark:fill-[#75BDB3]/58 dark:stroke-[#C4EDE1]/35'
              )}
              strokeWidth="1"
            />
            <path
              d={RIGHT_FOLD_PLANE}
              className={cn(
                isMono
                  ? 'fill-current opacity-95'
                  : isOnDark
                    ? 'fill-[#58D6A8]/92 stroke-[#C4EDE1]/55'
                    : 'fill-[#087F5B]/94 stroke-[#C4EDE1]/55 dark:fill-[#58D6A8]/90 dark:stroke-[#C4EDE1]/50'
              )}
              strokeWidth="1.15"
            />
            <path
              d={APEX_PRISM_FACET}
              className={cn(
                isMono
                  ? 'fill-current opacity-40'
                  : isOnDark
                    ? 'fill-[#F2F3EF]/90'
                    : 'fill-[#C4EDE1]/95 dark:fill-[#F2F3EF]/90'
              )}
            />
          </>
        )}
      </svg>

      {showWordmark && variant !== 'mark' && (
        <span
          className={cn(
            'font-display font-bold tracking-[-0.03em]',
            dims.text,
            isMono
              ? 'text-current'
              : isOnDark
                ? 'text-[#F2F3EF]'
                : 'text-[#181C19] dark:text-[#F2F3EF]'
          )}
        >
          VectorGallery
        </span>
      )}
    </span>
  )
}
