/**
 * VectorGallery — "Digital Sanctuary" Design System
 * Single source of truth for palette tokens, fluid typography, spacing, motion,
 * component contracts, and WebGL aura configuration across the marketing site and auth shell.
 */

export const VG_PALETTE = {
  light: {
    bg: '#F7F8F3',
    surface: '#FFFFFF',
    secondary: '#EEF3EC',
    sage: '#E6EDE4',
    mint: '#B8E7D4',
    primary: '#087F5B',
    primaryHover: '#066649',
    primaryDeep: '#05543C',
    ink: '#0F241B',
    inkSecondary: '#465B51',
    inkMuted: '#5A6F65',
    badgeInkOnSage: '#06674B',
    border: '#DCE5DD',
    borderStrong: '#C4D4C6',
    forest: '#092219',
    forestSurface: '#0E2E22',
  },
  dark: {
    bg: '#080E0C',
    surface: '#101914',
    secondary: '#111C17',
    elevated: '#1C3329',
    primary: '#53D9A3',
    primaryInteractive: '#34C28B',
    primaryHover: '#6EE4B5',
    mint: '#B8E7D4',
    ink: '#EFF7F3',
    inkSecondary: '#9CB6AA',
    inkMuted: '#749184',
    ctaInkOnJade: '#061811',
    border: 'rgba(180, 220, 198, 0.12)',
    borderStrong: 'rgba(180, 220, 198, 0.24)',
    forest: '#071A13',
    forestSurface: '#0E291F',
  },
  app: {
    darkBg: '#080E0C',
    darkSurface: '#101914',
    darkSurface2: '#111C17',
    darkInput: '#14211B',
    accent: '#087F5B',
    accentLight: '#53D9A3',
    accentGlow: 'rgba(83, 217, 163, 0.16)',
  },
} as const

/**
 * CSS custom properties aligned identically with styles/globals.css (.vg-shell & html.dark .vg-shell).
 */
export const VG_CSS_VARS_LIGHT: Record<string, string> = {
  '--vg-bg': VG_PALETTE.light.bg,
  '--vg-surface': VG_PALETTE.light.surface,
  '--vg-surface-2': VG_PALETTE.light.secondary,
  '--vg-surface-soft': VG_PALETTE.light.sage,
  '--vg-sage': VG_PALETTE.light.sage,
  '--vg-mint': VG_PALETTE.light.mint,
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
    '0 18px 44px -18px rgba(15, 36, 27, 0.10), 0 4px 14px -4px rgba(8, 127, 91, 0.06)',
  '--vg-shadow-hero':
    '0 32px 84px -22px rgba(15, 36, 27, 0.14), 0 10px 28px -10px rgba(8, 127, 91, 0.12)',
}

export const VG_CSS_VARS_DARK: Record<string, string> = {
  '--vg-bg': VG_PALETTE.dark.bg,
  '--vg-surface': VG_PALETTE.dark.surface,
  '--vg-surface-2': VG_PALETTE.dark.secondary,
  '--vg-surface-soft': VG_PALETTE.dark.elevated,
  '--vg-sage': VG_PALETTE.dark.elevated,
  '--vg-mint': VG_PALETTE.dark.mint,
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
    '0 24px 60px -18px rgba(2, 7, 5, 0.72), 0 0 0 1px rgba(180, 220, 198, 0.08)',
  '--vg-shadow-hero':
    '0 40px 100px -22px rgba(2, 7, 5, 0.88), 0 0 80px -28px rgba(83, 217, 163, 0.18)',
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
  'vg-sage': VG_PALETTE.light.sage,
  'vg-mint': VG_PALETTE.light.mint,
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
 * Fluid typography scale & editorial font policy.
 * Rule: Instrument Serif (`font-serif italic`) is reserved ONLY for 1-2 emotionally meaningful
 * words per section headline — never for full headings or body copy.
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
      fontSize: 'clamp(2.65rem, 5.6vw, 4.75rem)',
      lineHeight: '1.0',
      letterSpacing: '-0.038em',
      fontWeight: 700,
    },
    h2: {
      fontSize: 'clamp(1.95rem, 3.8vw, 3.25rem)',
      lineHeight: '1.08',
      letterSpacing: '-0.03em',
      fontWeight: 700,
    },
    h3: {
      fontSize: 'clamp(1.25rem, 2.1vw, 1.65rem)',
      lineHeight: '1.22',
      letterSpacing: '-0.02em',
      fontWeight: 700,
    },
    h4: {
      fontSize: 'clamp(1.0625rem, 1.4vw, 1.25rem)',
      lineHeight: '1.3',
      letterSpacing: '-0.015em',
      fontWeight: 600,
    },
    lead: {
      fontSize: 'clamp(1.03125rem, 1.4vw, 1.1875rem)',
      lineHeight: '1.62',
      fontWeight: 400,
    },
    body: {
      fontSize: 'clamp(0.9375rem, 1.05vw, 1rem)',
      lineHeight: '1.65',
      fontWeight: 400,
    },
    small: {
      fontSize: '0.84375rem',
      lineHeight: '1.55',
      fontWeight: 400,
    },
    eyebrow: {
      fontSize: '0.75rem',
      lineHeight: '1.2',
      letterSpacing: '0.16em',
      fontWeight: 600,
    },
  },
  editorialWordClass:
    'font-serif italic font-normal text-[var(--vg-brand)] tracking-[-0.01em]',
  editorialWordOnForestClass:
    'font-serif italic font-normal text-[#B8E7D4] tracking-[-0.01em]',
} as const

/**
 * Spacing, container widths, radii & shadow contracts.
 */
export const VG_LAYOUT = {
  containers: {
    narrow: 'max-w-[820px] mx-auto px-4 sm:px-6',
    standard: 'max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8',
    wide: 'max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8',
  },
  sectionPadding: {
    hero: 'pt-12 sm:pt-20 pb-20 sm:pb-28 lg:pb-32',
    standard: 'py-20 sm:py-24 lg:py-28',
    compact: 'py-16 sm:py-20',
    finalInvitation: 'py-24 sm:py-32',
  },
  radii: {
    control: 'rounded-xl',
    card: 'rounded-2xl',
    stage: 'rounded-3xl',
    monument: 'rounded-[2rem]',
    device: 'rounded-[2.25rem]',
    pill: 'rounded-full',
  },
  shadows: {
    card: 'shadow-[var(--vg-shadow-card)]',
    hero: 'shadow-[var(--vg-shadow-hero)]',
    ctaLight: 'shadow-[0_12px_28px_-10px_rgba(8,127,91,0.42)]',
    ctaDark: 'shadow-[0_12px_30px_-10px_rgba(83,217,163,0.32)]',
  },
} as const

/**
 * Motion standards & reduced-motion policy.
 * Always pair Framer Motion components with `useReducedMotion()` and `<MotionConfig reducedMotion="user">`.
 */
export const VG_MOTION = {
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  springSnappy: { type: 'spring' as const, stiffness: 320, damping: 28 },
  springParallax: { stiffness: 90, damping: 24 },
  durations: {
    micro: 0.18,
    standard: 0.48,
    editorial: 0.62,
    stage: 0.78,
    ambientSeconds: 10,
  },
  stagger: {
    tight: 0.045,
    standard: 0.065,
    editorial: 0.09,
  },
  viewport: { once: true, amount: 'some' as const },
  reducedMotionPolicy:
    'When prefers-reduced-motion is active, omit y/x/scale/blur transitions, disable parallax & continuous loops, and render atmospheric shaders static or via soft radial CSS fallback.',
} as const

/**
 * Reusable component class contracts in the Green Digital Sanctuary identity.
 * No blue, purple, or neon colors anywhere.
 */
export const VG_COMPONENTS = {
  buttons: {
    primary:
      'vg-cta inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[14px] font-semibold bg-[#087F5B] hover:bg-[#066649] text-[#FFFFFF] dark:bg-[#53D9A3] dark:hover:bg-[#6EE4B5] dark:text-[#061811] shadow-[0_12px_28px_-10px_rgba(8,127,91,0.42)] dark:shadow-[0_12px_28px_-10px_rgba(83,217,163,0.28)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vg-bg)]',
    primarySm:
      'vg-cta inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold bg-[#087F5B] hover:bg-[#066649] text-[#FFFFFF] dark:bg-[#53D9A3] dark:hover:bg-[#6EE4B5] dark:text-[#061811] shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
    secondary:
      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[14px] font-semibold bg-[var(--vg-surface)] hover:bg-[var(--vg-surface-2)] text-[var(--vg-ink)] border border-[var(--vg-border)] hover:border-[var(--vg-border-strong)] shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
    secondarySm:
      'inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl text-[13px] font-medium bg-[var(--vg-surface)] hover:bg-[var(--vg-surface-2)] text-[var(--vg-ink)] border border-[var(--vg-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
    ghost:
      'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-medium text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[var(--vg-surface-soft)]/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]',
    forestPrimary:
      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[14px] font-semibold bg-[#53D9A3] hover:bg-[#6EE4B5] text-[#061811] shadow-[0_14px_32px_-10px_rgba(83,217,163,0.35)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E7D4]',
    forestSecondary:
      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[14px] font-semibold bg-[#13382A] hover:bg-[#194736] text-[#EFF7F3] border border-[#B8E7D4]/25 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E7D4]',
    tabActive:
      'vg-cta bg-[#087F5B] text-[#FFFFFF] border-[#087F5B] dark:bg-[#53D9A3] dark:text-[#061811] dark:border-[#53D9A3] shadow-sm',
    tabIdle:
      'bg-[var(--vg-surface)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[var(--vg-ink)] hover:border-[var(--vg-brand)]/40',
  },
  cards: {
    surface:
      'rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-card)]',
    secondary:
      'rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)]',
    elevated:
      'rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] dark:bg-[#1C3329]/65 shadow-sm',
    glass:
      'rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)]/92 backdrop-blur-2xl shadow-[var(--vg-shadow-hero)]',
    photoFrame:
      'rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-card)]',
    forest:
      'bg-[#092219] text-[#EFF7F3] border border-[#B8E7D4]/15',
  },
  badges: {
    sage:
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium bg-[#E6EDE4] text-[#06674B] border border-[#DCE5DD] dark:bg-[#1C3329] dark:text-[#53D9A3] dark:border-[#B8E7D4]/15',
    mint:
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#B8E7D4]/55 text-[#065F46] border border-[#087F5B]/20 dark:bg-[#1C3329] dark:text-[#B8E7D4] dark:border-[#53D9A3]/25',
    outline:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[var(--vg-surface)] text-[var(--vg-ink-2)] border border-[var(--vg-border)]',
    monoTag:
      'font-mono text-[11px] px-2.5 py-0.5 rounded-md bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border border-[var(--vg-border)]',
    photoScrim:
      'vg-photo-caption px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#080E0C]/72 text-[#EFF7F3] backdrop-blur-md border border-[#B8E7D4]/15',
  },
  inputs: {
    search:
      'w-full h-12 sm:h-13 pl-12 pr-4 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-[15px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--vg-brand)]/30 focus:border-[var(--vg-brand)] transition-all',
    field:
      'w-full h-11 px-3.5 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-[14px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--vg-brand)]/30 focus:border-[var(--vg-brand)] transition-all',
    codeBlock:
      'p-5 rounded-2xl bg-[#080E0C] text-[#DCEFE5] font-mono text-[12.5px] leading-relaxed overflow-x-auto border border-[#B8E7D4]/15',
  },
} as const

/**
 * WebGL DarkVeil Shader Guidance:
 * Existing components/DarkVeil.tsx outputs purple/violet (rgb 34,6,87) at hueShift=0.
 * Agent 2 MUST remap luminance onto botanical green stops (never default hueShift=0 purple).
 */
export const VG_AURA_SHADER_SPEC = {
  lightStops: {
    base: '#F7F8F3',
    mid: '#E6EDE4',
    highlight: '#B8E7D4',
    deepAccent: '#087F5B',
    opacityRange: [0.22, 0.34] as const,
  },
  darkStops: {
    base: '#080E0C',
    mid: '#101914',
    highlight: '#1C3329',
    glowAccent: '#53D9A3',
    opacityRange: [0.38, 0.54] as const,
  },
  cssFallbackLight:
    'radial-gradient(ellipse 72% 55% at 68% 18%, rgba(184, 231, 212, 0.45), rgba(230, 237, 228, 0.35) 45%, transparent 74%)',
  cssFallbackDark:
    'radial-gradient(ellipse 72% 55% at 68% 18%, rgba(28, 51, 41, 0.85), rgba(83, 217, 163, 0.14) 45%, transparent 74%)',
} as const

