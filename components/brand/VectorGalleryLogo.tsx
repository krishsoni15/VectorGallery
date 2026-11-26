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

const LEFT_FRAME_PATH =
  'M15.97 17.37 L22.6 14.82 Q26.52 13.32 28.03 17.24 L36.84 40.21 Q38.35 44.13 34.43 45.63 L27.8 48.18 Q23.88 49.68 22.37 45.76 L13.56 22.79 Q12.05 18.87 15.97 17.37 Z'

const RIGHT_FRAME_PATH =
  'M41.4 14.82 L48.03 17.37 Q51.95 18.87 50.44 22.79 L41.63 45.76 Q40.12 49.68 36.2 48.18 L29.57 45.63 Q25.65 44.13 27.16 40.21 L35.97 17.24 Q37.48 13.32 41.4 14.82 Z'

const APEX_HINGE_PATH = 'M32 34.8 L35.4 40.2 L32 45.6 L28.6 40.2 Z'

/**
 * VectorGallery "Connected Frames" Logo Mark.
 * Two overlapping translucent photo frames converging into a clean geometric V.
 * Light mode: emerald on crisp white. Dark mode & on-dark: jade/mint on deep forest.
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

  const darkGradId = `vg-dark-tile-${rawId}`

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
            <stop offset="0%" stopColor="#101914" />
            <stop offset="100%" stopColor="#1C3329" />
          </linearGradient>
        </defs>

        {/* Rounded Sanctuary Tile */}
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
            stroke="#53D9A3"
            strokeOpacity="0.28"
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
              className="fill-[#FFFFFF] dark:fill-[#101914] stroke-[#DCE5DD] dark:stroke-[#53D9A3]/30"
              strokeWidth="1.5"
            />
            <rect
              x="3.5"
              y="3.5"
              width="57"
              height="57"
              rx="12.5"
              className="fill-[#F7F8F3]/65 dark:fill-[#1C3329]/55"
            />
          </>
        )}

        {/* Connected Translucent Photo Frames */}
        {isAnimated ? (
          <>
            <motion.path
              d={LEFT_FRAME_PATH}
              className={cn(
                isMono
                  ? 'fill-current opacity-55'
                  : isOnDark
                    ? 'fill-[#53D9A3]/65'
                    : 'fill-[#087F5B]/65 dark:fill-[#53D9A3]/60'
              )}
              initial={{ opacity: 0, x: -4, y: -3 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d={RIGHT_FRAME_PATH}
              className={cn(
                isMono
                  ? 'fill-current opacity-95'
                  : isOnDark
                    ? 'fill-[#B8E7D4]/92 stroke-[#53D9A3]/45'
                    : 'fill-[#087F5B]/92 stroke-[#B8E7D4]/55 dark:fill-[#B8E7D4]/90 dark:stroke-[#53D9A3]/45'
              )}
              strokeWidth="1.2"
              initial={{ opacity: 0, x: 4, y: -3 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d={APEX_HINGE_PATH}
              className={cn(
                isMono
                  ? 'fill-current opacity-40'
                  : isOnDark
                    ? 'fill-[#EFF7F3]/85'
                    : 'fill-[#B8E7D4]/90 dark:fill-[#EFF7F3]/85'
              )}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        ) : (
          <>
            <path
              d={LEFT_FRAME_PATH}
              className={cn(
                isMono
                  ? 'fill-current opacity-55'
                  : isOnDark
                    ? 'fill-[#53D9A3]/65'
                    : 'fill-[#087F5B]/65 dark:fill-[#53D9A3]/60'
              )}
            />
            <path
              d={RIGHT_FRAME_PATH}
              className={cn(
                isMono
                  ? 'fill-current opacity-95'
                  : isOnDark
                    ? 'fill-[#B8E7D4]/92 stroke-[#53D9A3]/45'
                    : 'fill-[#087F5B]/92 stroke-[#B8E7D4]/55 dark:fill-[#B8E7D4]/90 dark:stroke-[#53D9A3]/45'
              )}
              strokeWidth="1.2"
            />
            <path
              d={APEX_HINGE_PATH}
              className={cn(
                isMono
                  ? 'fill-current opacity-40'
                  : isOnDark
                    ? 'fill-[#EFF7F3]/85'
                    : 'fill-[#B8E7D4]/90 dark:fill-[#EFF7F3]/85'
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
                ? 'text-[#EFF7F3]'
                : 'text-[#0F241B] dark:text-[#EFF7F3]'
          )}
        >
          VectorGallery
        </span>
      )}
    </span>
  )
}
