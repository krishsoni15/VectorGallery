import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-tight transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[#F4F4F5] text-[#3F3F46] border border-[#E4E4E7] dark:bg-[#161920] dark:text-[#D4D4D8] dark:border-[#27272A]',
        accent:
          'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25',
        outline:
          'border border-[#E4E4E7] dark:border-[#27272A] text-[#52525B] dark:text-[#A1A1AA]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
