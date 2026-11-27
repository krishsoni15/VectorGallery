/**
 * VectorGallery — Project Aura Design System
 * Neutral-First Studio Palette (70% neutral canvas / 20% editorial media / 10% emerald-jade accent).
 * Single source of truth for CSS tokens, fluid architectural typography, motion, and component contracts.
 */

export const VG_PALETTE = {
  light: {
    bg: '#FAFAF7',
    surface: '#FFFFFF',
    secondary: '#F0F1EC',
    stone: '#E9EBE5',
    sage: '#CEDBCD',
    primary: '#087F5B',
    primaryHover: '#066649',
    primaryDeep: '#05543C',
    mint: '#C4EDE1',
    teal: '#A6D9D0',
    ink: '#181C19',
    inkSecondary: '#626B64',
    inkMuted: '#737D75',
    badgeInkOnSage: '#066649',
    border: '#E0E4DD',
    borderStrong: '#CBD2C7',
    forest: '#092219',
    forestSurface: '#0E2E22',
  },
  dark: {
    bg: '#0B0D0C',
    surface: '#131614',
    secondary: '#171A18',
    elevated: '#252A26',
    primary: '#58D6A8',
    primaryInteractive: '#40C495',
    primaryHover: '#70DFB7',
    mint: '#C4EDE1',
    teal: '#75BDB3',
    ink: '#F2F3EF',
    inkSecondary: '#A3ADA5',
    inkMuted: '#7F8A82',
    ctaInkOnJade: '#071912',
    border: 'rgba(255, 255, 255, 0.09)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    forest: '#081812',
    forestSurface: '#0D261D',
  },
  app: {
    darkBg: '#0B0D0C',
    darkSurface: '#131614',
    darkSurface2: '#171A18',
    darkInput: '#1B1F1C',
    accent: '#087F5B',
    accentLight: '#58D6A8',
    accentGlow: 'rgba(88, 214, 168, 0.15)',
  },
} as const

/**
 * CSS custom properties aligned identically with styles/globals.css (.vg-shell & html.dark .vg-shell).
 */
export const VG_CSS_VARS_LIGHT: Record<string, string> = {
  '--vg-bg': VG_PALETTE.light.bg,
  '--vg-surface': VG_PALETTE.light.surface,
  '--vg-surface-2': VG_PALETTE.light.secondary,
  '--vg-surface-soft': VG_PALETTE.light.stone,
  '--vg-stone': VG_PALETTE.light.stone,
  '--vg-sage': VG_PALETTE.light.sage,
  '--vg-mint': VG_PALETTE.light.mint,
  '--vg-teal': VG_PALETTE.light.teal,
  '--vg-brand': VG_PALETTE.light.primary,
  '--vg-brand-interactive': VG_PALETTE.light.primary,
  '--vg-brand-hover': VG_PALETTE.light.primaryHover,
  '--vg-accent-light': VG_PALETTE.light.mint,
  '--vg-forest': VG_PALETTE.light.forest,
  '--vg-ink': VG_PALETTE.light.ink,
  '--vg-ink-2': VG_PALETTE.light.inkSecondary,
  '--vg-ink-muted': VG_PALETTE.light.inkMuted,
  '--vg-ink-3': VG_PALETTE.light.inkMuted,
  '--vg-border': VG_PALETTE.light.border,
  '--vg-border-strong': VG_PALETTE.light.borderStrong,
  '--vg-shadow-card':
    '0 18px 46px -22px rgba(24, 28, 25, 0.10), 0 2px 10px -2px rgba(24, 28, 25, 0.04)',
  '--vg-shadow-hero':
    '0 36px 90px -28px rgba(24, 28, 25, 0.14), 0 8px 24px -10px rgba(8, 127, 91, 0.08)',
}

export const VG_CSS_VARS_DARK: Record<string, string> = {
  '--vg-bg': VG_PALETTE.dark.bg,
  '--vg-surface': VG_PALETTE.dark.surface,
  '--vg-surface-2': VG_PALETTE.dark.secondary,
  '--vg-surface-soft': VG_PALETTE.dark.elevated,
  '--vg-stone': VG_PALETTE.dark.elevated,
  '--vg-sage': VG_PALETTE.dark.elevated,
  '--vg-mint': VG_PALETTE.dark.mint,
  '--vg-teal': VG_PALETTE.dark.teal,
  '--vg-brand': VG_PALETTE.dark.primary,
  '--vg-brand-interactive': VG_PALETTE.dark.primaryInteractive,
  '--vg-brand-hover': VG_PALETTE.dark.primaryHover,
  '--vg-accent-light': VG_PALETTE.dark.mint,
  '--vg-forest': VG_PALETTE.dark.forest,
  '--vg-ink': VG_PALETTE.dark.ink,
  '--vg-ink-2': VG_PALETTE.dark.inkSecondary,
  '--vg-ink-muted': VG_PALETTE.dark.inkMuted,
  '--vg-ink-3': VG_PALETTE.dark.inkMuted,
  '--vg-border': VG_PALETTE.dark.border,
  '--vg-border-strong': VG_PALETTE.dark.borderStrong,
  '--vg-shadow-card':
    '0 24px 60px -20px rgba(0, 0, 0, 0.72), 0 0 0 1px rgba(255, 255, 255, 0.06)',
  '--vg-shadow-hero':
    '0 42px 100px -24px rgba(0, 0, 0, 0.88), 0 0 70px -30px rgba(88, 214, 168, 0.12)',
}

/**
 * Tailwind-compatible color tokens mirrored into tailwind.config.js.
 */
export const VG_TAILWIND_COLORS = {
  'vm-bg': VG_PALETTE.app.darkBg,
  'vm-card': VG_PALETTE.app.darkSurface,
  'vm-card-hover': VG_PALETTE.dark.elevated,
  'vm-accent': VG_PALETTE.light.primary,
  'vm-accent-light': VG_PALETTE.dark.primary,
  'vg-bg': VG_PALETTE.light.bg,
  'vg-surface': VG_PALETTE.light.surface,
  'vg-secondary': VG_PALETTE.light.secondary,
  'vg-stone': VG_PALETTE.light.stone,
  'vg-sage': VG_PALETTE.light.sage,
  'vg-mint': VG_PALETTE.light.mint,
  'vg-teal': VG_PALETTE.light.teal,
  'vg-border': VG_PALETTE.light.border,
  'vg-brand': VG_PALETTE.light.primary,
  'vg-brand-deep': VG_PALETTE.light.primaryHover,
  'vg-jade': VG_PALETTE.dark.primary,
  'vg-forest': VG_PALETTE.light.forest,
  'vg-dark-bg': VG_PALETTE.dark.bg,
  'vg-dark-surface': VG_PALETTE.dark.surface,
  'vg-dark-secondary': VG_PALETTE.dark.secondary,
  'vg-dark-elevated': VG_PALETTE.dark.elevated,
  'vg-ink': VG_PALETTE.light.ink,
  'vg-ink-muted': VG_PALETTE.light.inkSecondary,
} as const

/**
 * Project Aura Fluid Typography Scale.
 * Serif Restraint Rule:
 * - Instrument Serif italic is reserved ONLY for 1 subtle editorial word in Hero (`keep`)
 *   and 1 closing word in Final Invitation (`life`).
 * - All 5 Chapter headings (Chapters 01–05) stay crisp modern architectural grotesk (Manrope).
 * - Geist Mono is strictly for filenames, terminal code, and checksums (never section eyebrow badges).
 */
export const VG_TYPOGRAPHY = {
  fonts: {
    display: '"Manrope", "Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    editorialSerif: '"Instrument Serif", Georgia, serif',
    mono: '"Geist Mono", ui-monospace, SFMono-Regular, monospace',
  },
  scale: {
    h1: {
      fontSize: 'clamp(2.65rem, 6.4vw, 6.75rem)',
      lineHeight: '0.96',
      letterSpacing: '-0.045em',
      fontWeight: 700,
    },
    h2: {
      fontSize: 'clamp(2rem, 4.4vw, 4.5rem)',
      lineHeight: '1.03',
      letterSpacing: '-0.036em',
      fontWeight: 700,
    },
    h3: {
      fontSize: 'clamp(1.25rem, 2.1vw, 1.75rem)',
      lineHeight: '1.2',
      letterSpacing: '-0.022em',
      fontWeight: 600,
    },
    h4: {
      fontSize: 'clamp(1.0625rem, 1.4vw, 1.25rem)',
      lineHeight: '1.3',
      letterSpacing: '-0.015em',
      fontWeight: 600,
    },
    lead: {
      fontSize: 'clamp(1rem, 1.2vw, 1.1875rem)',
      lineHeight: '1.62',
      fontWeight: 400,
    },
    body: {
      fontSize: 'clamp(1rem, 1.15vw, 1.1875rem)',
      lineHeight: '1.65',
      fontWeight: 400,
    },
    small: {
      fontSize: '0.875rem',
      lineHeight: '1.55',
      fontWeight: 400,
    },
    kicker: {
      fontSize: '0.8125rem',
      lineHeight: '1.25',
      letterSpacing: '-0.01em',
      fontWeight: 500,
    },
  },
  editorialWordClass:
    'font-serif italic font-normal text-[var(--vg-brand)] tracking-[-0.015em]',
  editorialWordOnForestClass:
    'font-serif italic font-normal text-[#C4EDE1] tracking-[-0.015em]',
} as const

/**
 * Spacious studio container widths (`85-92%` of 1440px canvas), section padding, radii & shadows.
 */
export const VG_LAYOUT = {
  containers: {
    narrow: 'max-w-[840px] mx-auto px-5 sm:px-6',
    standard: 'max-w-[1260px] mx-auto px-5 sm:px-8',
    wide: 'max-w-[1340px] mx-auto px-5 sm:px-8',
  },
  sectionPadding: {
    hero: 'pt-8 sm:pt-12 pb-16 sm:pb-24',
    standard: 'py-24 sm:py-28 lg:py-32',
    compact: 'py-16 sm:py-20',
    finalInvitation: 'py-28 sm:py-36',
  },
  radii: {
    control: 'rounded-full',
    panel: 'rounded-2xl',
    stage: 'rounded-3xl',
    monument: 'rounded-[2rem]',
    device: 'rounded-[2.4rem]',
    pill: 'rounded-full',
  },
  shadows: {
    card: 'shadow-[var(--vg-shadow-card)]',
    hero: 'shadow-[var(--vg-shadow-hero)]',
    ctaLight: 'shadow-[0_14px_32px_-12px_rgba(8,127,91,0.36)]',
    ctaDark: 'shadow-[0_14px_32px_-12px_rgba(88,214,168,0.24)]',
  },
} as const

/**
 * Motion standards & reduced-motion policy.
 */
export const VG_MOTION = {
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  springSnappy: { type: 'spring' as const, stiffness: 320, damping: 28 },
  springParallax: { stiffness: 90, damping: 24 },
  durations: {
    micro: 0.18,
    standard: 0.5,
    editorial: 0.65,
    stage: 0.8,
    ambientSeconds: 11,
  },
  stagger: {
    tight: 0.045,
    standard: 0.065,
    editorial: 0.09,
  },
  viewport: { once: true, amount: 'some' as const },
  reducedMotionPolicy:
    'When prefers-reduced-motion is active, omit transform/blur animations, disable parallax & ambient loops, and render DarkVeil via static neutral-silk CSS fallback.',
} as const

/**
 * Component style contracts in Project Aura Neutral-First system.
 */
export const VG_COMPONENTS = {
  buttons: {
    primary:
      'vg-cta inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[14.5px] font-semibold bg-[#087F5B] hover:bg-[#066649] text-[#FFFFFF] dark:bg-[#58D6A8] dark:hover:bg-[#70DFB7] dark:text-[#071912] shadow-[0_14px_32px_-12px_rgba(8,127,91,0.36)] dark:shadow-[0_14px_32px_-12px_rgba(88,214,168,0.24)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vg-bg)]',
    primarySm:
      'vg-cta inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold bg-[#087F5B] hover:bg-[#066649] text-[#FFFFFF] dark:bg-[#58D6A8] dark:hover:bg-[#70DFB7] dark:text-[#071912] shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
    secondary:
      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[14.5px] font-medium bg-[var(--vg-surface)] hover:bg-[var(--vg-surface-2)] text-[var(--vg-ink)] border border-[var(--vg-border)] hover:border-[var(--vg-border-strong)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
    secondarySm:
      'inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-medium bg-[var(--vg-surface)] hover:bg-[var(--vg-surface-2)] text-[var(--vg-ink)] border border-[var(--vg-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
    ghost:
      'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[14px] font-medium text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[#F0F1EC]/90 dark:hover:bg-[#171A18] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
    forestPrimary:
      'inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full text-[14.5px] font-semibold bg-[#58D6A8] hover:bg-[#70DFB7] text-[#071912] shadow-[0_14px_34px_-10px_rgba(88,214,168,0.34)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4EDE1]',
    forestSecondary:
      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[14.5px] font-medium bg-white/[0.08] hover:bg-white/[0.14] text-[#F2F3EF] border border-white/[0.18] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4EDE1]',
    tabActive:
      'vg-cta bg-[#087F5B] text-[#FFFFFF] border-[#087F5B] dark:bg-[#58D6A8] dark:text-[#071912] dark:border-[#58D6A8] shadow-sm',
    tabIdle:
      'bg-[var(--vg-surface)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[var(--vg-ink)] hover:border-[#087F5B]/35 dark:hover:border-[#58D6A8]/35',
  },
  cards: {
    surface:
      'rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-card)]',
    secondary:
      'rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)]',
    elevated:
      'rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] dark:bg-[#171A18] shadow-sm',
    glass:
      'rounded-2xl border border-[#E0E4DD] dark:border-white/[0.09] bg-[#FFFFFF]/86 dark:bg-[#131614]/84 backdrop-blur-2xl shadow-[var(--vg-shadow-hero)]',
    photoFrame:
      'rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-card)]',
    forest:
      'bg-[#092219] text-[#F2F3EF] border border-[#C4EDE1]/15',
  },
  badges: {
    sage:
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium bg-[#F0F1EC] text-[#181C19] border border-[#E0E4DD] dark:bg-[#171A18] dark:text-[#F2F3EF] dark:border-white/[0.09]',
    mint:
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C4EDE1]/65 text-[#066649] border border-[#087F5B]/15 dark:bg-[#252A26] dark:text-[#58D6A8] dark:border-[#58D6A8]/25',
    outline:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[var(--vg-surface)] text-[var(--vg-ink-2)] border border-[var(--vg-border)]',
    monoTag:
      'font-mono text-[11px] px-2.5 py-0.5 rounded-md bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border border-[var(--vg-border)]',
    photoScrim:
      'vg-photo-caption px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#0B0D0C]/75 text-[#F2F3EF] backdrop-blur-md border border-white/[0.12]',
  },
  inputs: {
    search:
      'w-full h-12 sm:h-13 pl-12 pr-4 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-[15px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[#087F5B]/20 dark:focus:ring-[#58D6A8]/25 focus:border-[var(--vg-brand)] transition-all',
    field:
      'w-full h-11 px-3.5 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-[14px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[#087F5B]/20 dark:focus:ring-[#58D6A8]/25 focus:border-[var(--vg-brand)] transition-all',
    codeBlock:
      'p-5 rounded-2xl bg-[#0B0D0C] text-[#E6ECE7] font-mono text-[12.5px] leading-relaxed overflow-x-auto border border-white/[0.09]',
  },
  media: {
    sculptureMask:
      'radial-gradient(ellipse 58% 58% at 56% 49%, #000 32%, rgba(0,0,0,0.62) 54%, transparent 75%)',
  },
} as const

/**
 * Neutral-First Silk Atmospheric Shader Specification (DarkVeil.tsx).
 * Keeps 70%+ canvas strictly neutral (#FAFAF7 / #0B0D0C) with a quiet silk botanical shimmer.
 */
export const VG_AURA_SHADER_SPEC = {
  lightStops: {
    base: '#FAFAF7',
    mid: '#F0F1EC',
    highlight: '#C4EDE1',
    tealAccent: '#A6D9D0',
    opacityRange: [0.18, 0.28] as const,
  },
  darkStops: {
    base: '#0B0D0C',
    mid: '#131614',
    highlight: '#1D2923',
    glowAccent: '#58D6A8',
    tealAccent: '#75BDB3',
    opacityRange: [0.22, 0.34] as const,
  },
  cssFallbackLight:
    'radial-gradient(ellipse 58% 60% at 70% 44%, rgba(166, 217, 208, 0.24), rgba(196, 237, 225, 0.16) 44%, transparent 74%)',
  cssFallbackDark:
    'radial-gradient(ellipse 58% 60% at 70% 44%, rgba(88, 214, 168, 0.11), rgba(117, 189, 179, 0.06) 44%, transparent 74%)',
} as const
