import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { VG_COMPONENTS, VG_TYPOGRAPHY } from '@/components/landing/design-system'
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
        wide ? 'max-w-[1360px]' : 'max-w-[1240px]',
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
  surface?: 'default' | 'secondary' | 'soft' | 'forest'
  ariaLabel?: string
}) {
  const bgMap = {
    default: 'bg-[var(--vg-bg)]',
    secondary: 'bg-[var(--vg-surface-2)]',
    soft: 'bg-[var(--vg-sage)]/75 dark:bg-[#111C17]',
    forest: 'bg-[#092219] text-[#EFF7F3]',
  }

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn('py-20 sm:py-24 lg:py-28 relative', bgMap[surface], className)}
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
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--vg-brand)]">
          {eyebrow}
        </p>
      )}
      <h2
        className="font-display font-bold tracking-[-0.03em] leading-[1.08] text-[var(--vg-ink)]"
        style={{ fontSize: VG_TYPOGRAPHY.scale.h2.fontSize }}
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
  size?: 'sm' | 'md'
}

export function PrimaryButton({
  href,
  children,
  className,
  external,
  download,
  showArrow = false,
  size = 'md',
}: ActionLinkProps) {
  const baseClass = cn(
    'group',
    size === 'sm' ? VG_COMPONENTS.buttons.primarySm : VG_COMPONENTS.buttons.primary,
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
  size = 'md',
}: ActionLinkProps) {
  const baseClass = cn(
    size === 'sm' ? VG_COMPONENTS.buttons.secondarySm : VG_COMPONENTS.buttons.secondary,
    'hover:border-[var(--vg-brand)]/40',
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
    'inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--vg-brand)] hover:underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)] rounded',
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
        'rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-hero)] overflow-hidden',
        className
      )}
    >
      <div className="px-4 sm:px-5 py-3 border-b border-[var(--vg-border)] bg-[var(--vg-surface-2)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#087F5B]/45 dark:bg-[#53D9A3]/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#087F5B]/28 dark:bg-[#53D9A3]/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#087F5B]/16 dark:bg-[#53D9A3]/18" />
          </div>
          <span className="text-[12px] font-medium text-[var(--vg-ink-2)]">{title}</span>
        </div>
        {toolbarRight}
      </div>
      <div>{children}</div>
    </div>
  )
}
