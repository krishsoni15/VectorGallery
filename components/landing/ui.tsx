import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Container({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        wide ? 'max-w-[1380px]' : 'max-w-[1280px]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function Section({
  children,
  id,
  className,
  surface = 'default',
  ariaLabel,
}: {
  children: React.ReactNode
  id?: string
  className?: string
  surface?: 'default' | 'secondary' | 'soft'
  ariaLabel?: string
}) {
  const bgMap = {
    default: 'bg-[var(--vg-bg)]',
    secondary: 'bg-[var(--vg-surface-2)]',
    soft: 'bg-[#EDF4FF]/70 dark:bg-[#0D1626]',
  }

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn('py-16 sm:py-20 lg:py-24 relative', bgMap[surface], className)}
    >
      {children}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div
      className={cn(
        'space-y-4',
        align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl',
        className
      )}
    >
      {eyebrow && (
        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)]">
          {eyebrow}
        </p>
      )}
      <h2
        className="font-display font-bold tracking-[-0.03em] leading-[1.08] text-[var(--vg-ink)]"
        style={{ fontSize: 'clamp(1.875rem, 4.1vw, 3.5rem)' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-[16px] sm:text-[18px] leading-[1.65] text-[var(--vg-ink-2)]">
          {subtitle}
        </p>
      )}
    </div>
  )
}

interface ActionLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
  download?: string
  showArrow?: boolean
}

export function PrimaryButton({
  href,
  children,
  className,
  external,
  download,
  showArrow = false,
}: ActionLinkProps) {
  const baseClass = cn(
    'vg-blue-cta group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[14px] font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] shadow-[0_10px_28px_-8px_rgba(37,99,235,0.45)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB8FF] focus-visible:ring-offset-2',
    className
  )

  if (external || download) {
    return (
      <a
        href={href}
        download={download}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className={baseClass}
      >
        {children}
        {showArrow && (
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        )}
      </a>
    )
  }

  return (
    <Link href={href} className={baseClass}>
      {children}
      {showArrow && (
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </Link>
  )
}

export function SecondaryButton({
  href,
  children,
  className,
  external,
}: ActionLinkProps) {
  const baseClass = cn(
    'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[14px] font-semibold bg-[var(--vg-surface)] hover:bg-[var(--vg-surface-2)] text-[var(--vg-ink)] border border-[var(--vg-border)] shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
    className
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={baseClass}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={baseClass}>
      {children}
    </Link>
  )
}

export function TextLink({ href, children, className, external }: ActionLinkProps) {
  const baseClass = cn(
    'inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--vg-brand-interactive)] dark:text-[var(--vg-sky)] hover:underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)] rounded',
    className
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={baseClass}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={baseClass}>
      {children}
    </Link>
  )
}

export function BrowserFrame({
  title,
  toolbarRight,
  children,
  className,
}: {
  title: string
  toolbarRight?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-hero)] overflow-hidden',
        className
      )}
    >
      <div className="px-4 sm:px-5 py-3 border-b border-[var(--vg-border)] bg-[var(--vg-surface-2)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] dark:bg-[#334155]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] dark:bg-[#334155]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] dark:bg-[#334155]" />
          </div>
          <span className="text-[12px] font-medium text-[var(--vg-ink-2)]">{title}</span>
        </div>
        {toolbarRight}
      </div>
      <div>{children}</div>
    </div>
  )
}

