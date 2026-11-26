import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]',
  {
    variants: {
      variant: {
        primary:
          'bg-[#111318] text-[#FAFAFA] hover:bg-[#1F242D] dark:bg-emerald-400 dark:text-[#090B0E] dark:hover:bg-emerald-300 shadow-sm',
        accent:
          'bg-emerald-500 text-[#090B0E] hover:bg-emerald-400 font-semibold shadow-sm shadow-emerald-500/15',
        secondary:
          'bg-[#F4F4F5] text-[#18181B] hover:bg-[#E4E4E7] dark:bg-[#161920] dark:text-[#F4F4F5] dark:hover:bg-[#1E222B] border border-[#E4E4E7] dark:border-[#27272A]',
        outline:
          'border border-[#E4E4E7] dark:border-[#27272A] bg-transparent text-[#27272A] dark:text-[#E4E4E7] hover:bg-[#F4F4F5] dark:hover:bg-[#161920]',
        ghost:
          'text-[#52525B] dark:text-[#A1A1AA] hover:text-[#111318] dark:hover:text-[#FAFAFA] hover:bg-[#F4F4F5] dark:hover:bg-[#161920]',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-sm font-medium',
        xl: 'h-12 px-6 text-[15px] font-medium rounded-2xl',
        icon: 'h-9 w-9 p-0 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
