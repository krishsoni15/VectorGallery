/**
 * VectorGallery — Project Living Matter Design System
 * Liquid Silver (#F2F3F0 / #D1D5D2) & Liquid Carbon (#090B0A / #202522)
 * Accent Architecture: Acid-Lime Glass (#D4FF54 / #CFFF49) paired with Titanium Silver & Accessible Emerald (#087F5B / #39D9A0).
 * Single source of truth for CSS variables, typography, motion, WebGL sphere lighting, and UI contracts.
 */

export const VG_PALETTE = {
  light: {
    bg: '#F4F5F2',
    surface: '#FFFFFF',
    secondary: '#E9EDE8',
    stone: '#E9EDE8',
    silver: '#E3E8EA',
    titanium: '#BCC5C8',
    chrome: '#E3E8EA',
    sage: '#E9EDE8',
    lime: '#CDFF45',
    limeHover: '#C2F736',
    limeInk: '#101211',
    primary: '#087F5B',
    primaryHover: '#066649',
    primaryDeep: '#05543C',
    mint: '#C4EDE1',
    teal: '#46D6A4',
    ink: '#101211',
    inkSecondary: '#606961',
    inkMuted: '#606961',
    badgeInkOnSage: '#066649',
    border: '#DBE0DA',
    borderStrong: '#C3CAC4',
    forest: '#092219',
    forestSurface: '#0E2E22',
  },
  dark: {
    bg: '#090B0D',
    surface: '#111416',
    secondary: '#191D20',
    elevated: '#191D20',
    graphite: '#272D30',
    chrome: '#B8C5CC',
    titanium: '#B8C5CC',
    lime: '#CDFF45',
    limeHover: '#D8FF69',
    limeInk: '#090B0D',
    primary: '#46D6A4',
    primaryInteractive: '#46D6A4',
    primaryHover: '#63E0B4',
    mint: '#C4EDE1',
    teal: '#46D6A4',
    ink: '#F4F6F2',
    inkSecondary: '#A4AEA9',
    inkMuted: '#7C8782',
    ctaInkOnJade: '#071912',
    border: 'rgba(255, 255, 255, 0.10)',
    borderStrong: 'rgba(255, 255, 255, 0.18)',
    forest: '#071711',
    forestSurface: '#0D261D',
  },
  app: {
    darkBg: '#090B0D',
    darkSurface: '#111416',
    darkSurface2: '#191D20',
    darkInput: '#14181B',
    accent: '#087F5B',
    accentLight: '#46D6A4',
    accentGlow: 'rgba(70, 214, 164, 0.16)',
  },
} as const

export const VG_CSS_VARS_LIGHT: Record<string, string> = {
  '--vg-bg': VG_PALETTE.light.bg,
  '--vg-surface': VG_PALETTE.light.surface,
  '--vg-surface-2': VG_PALETTE.light.secondary,
  '--vg-surface-soft': VG_PALETTE.light.secondary,
  '--vg-silver': VG_PALETTE.light.silver,
  '--vg-titanium': VG_PALETTE.light.titanium,
  '--vg-chrome': VG_PALETTE.light.chrome,
  '--vg-stone': VG_PALETTE.light.stone,
  '--vg-sage': VG_PALETTE.light.silver,
  '--vg-mint': VG_PALETTE.light.mint,
  '--vg-teal': VG_PALETTE.light.teal,
  '--vg-lime': VG_PALETTE.light.lime,
  '--vg-lime-hover': VG_PALETTE.light.limeHover,
  '--vg-lime-ink': VG_PALETTE.light.limeInk,
  '--vg-brand': VG_PALETTE.light.primary,
  '--vg-brand-interactive': VG_PALETTE.light.primary,
  '--vg-brand-hover': VG_PALETTE.light.primaryHover,
  '--vg-accent-light': VG_PALETTE.light.lime,
  '--vg-forest': VG_PALETTE.light.forest,
  '--vg-ink': VG_PALETTE.light.ink,
  '--vg-ink-2': VG_PALETTE.light.inkSecondary,
  '--vg-ink-muted': VG_PALETTE.light.inkMuted,
  '--vg-ink-3': VG_PALETTE.light.inkMuted,
  '--vg-border': VG_PALETTE.light.border,
  '--vg-border-strong': VG_PALETTE.light.borderStrong,
  '--vg-shadow-card':
    '0 22px 52px -24px rgba(16, 18, 17, 0.10), 0 2px 10px -2px rgba(16, 18, 17, 0.04)',
  '--vg-shadow-hero':
    '0 40px 96px -28px rgba(16, 18, 17, 0.14), 0 10px 28px -12px rgba(8, 127, 91, 0.08)',
}

export const VG_CSS_VARS_DARK: Record<string, string> = {
  '--vg-bg': VG_PALETTE.dark.bg,
  '--vg-surface': VG_PALETTE.dark.surface,
  '--vg-surface-2': VG_PALETTE.dark.secondary,
  '--vg-surface-soft': VG_PALETTE.dark.elevated,
  '--vg-silver': VG_PALETTE.dark.graphite,
  '--vg-titanium': VG_PALETTE.dark.titanium,
  '--vg-chrome': VG_PALETTE.dark.chrome,
  '--vg-stone': VG_PALETTE.dark.elevated,
  '--vg-sage': VG_PALETTE.dark.elevated,
  '--vg-mint': VG_PALETTE.dark.mint,
  '--vg-teal': VG_PALETTE.dark.teal,
  '--vg-lime': VG_PALETTE.dark.lime,
  '--vg-lime-hover': VG_PALETTE.dark.limeHover,
  '--vg-lime-ink': VG_PALETTE.dark.limeInk,
  '--vg-brand': VG_PALETTE.dark.primary,
  '--vg-brand-interactive': VG_PALETTE.dark.primaryInteractive,
  '--vg-brand-hover': VG_PALETTE.dark.primaryHover,
  '--vg-accent-light': VG_PALETTE.dark.lime,
  '--vg-forest': VG_PALETTE.dark.forest,
  '--vg-ink': VG_PALETTE.dark.ink,
  '--vg-ink-2': VG_PALETTE.dark.inkSecondary,
  '--vg-ink-muted': VG_PALETTE.dark.inkMuted,
  '--vg-ink-3': VG_PALETTE.dark.inkMuted,
  '--vg-border': VG_PALETTE.dark.border,
  '--vg-border-strong': VG_PALETTE.dark.borderStrong,
  '--vg-shadow-card':
    '0 28px 64px -22px rgba(0, 0, 0, 0.78), 0 0 0 1px rgba(255, 255, 255, 0.06)',
  '--vg-shadow-hero':
    '0 46px 104px -26px rgba(0, 0, 0, 0.90), 0 0 76px -30px rgba(70, 214, 164, 0.12)',
}

export const VG_TAILWIND_COLORS = {
  'vm-bg': VG_PALETTE.app.darkBg,
  'vm-card': VG_PALETTE.app.darkSurface,
  'vm-card-hover': VG_PALETTE.dark.elevated,
  'vm-accent': VG_PALETTE.light.primary,
  'vm-accent-light': VG_PALETTE.dark.primary,
  'vg-bg': VG_PALETTE.light.bg,
  'vg-surface': VG_PALETTE.light.surface,
  'vg-secondary': VG_PALETTE.light.secondary,
  'vg-silver': VG_PALETTE.light.silver,
  'vg-titanium': VG_PALETTE.light.titanium,
  'vg-lime': VG_PALETTE.light.lime,
  'vg-lime-dark': VG_PALETTE.dark.lime,
  'vg-lime-ink': VG_PALETTE.light.limeInk,
  'vg-border': VG_PALETTE.light.border,
  'vg-brand': VG_PALETTE.light.primary,
  'vg-brand-deep': VG_PALETTE.light.primaryHover,
  'vg-jade': VG_PALETTE.dark.primary,
  'vg-forest': VG_PALETTE.light.forest,
  'vg-dark-bg': VG_PALETTE.dark.bg,
  'vg-dark-surface': VG_PALETTE.dark.surface,
  'vg-dark-secondary': VG_PALETTE.dark.secondary,
  'vg-dark-elevated': VG_PALETTE.dark.elevated,
  'vg-graphite': VG_PALETTE.dark.graphite,
  'vg-ink': VG_PALETTE.light.ink,
  'vg-ink-muted': VG_PALETTE.light.inkSecondary,
} as const

/**
 * Project Living Matter Fluid Typography System.
 * Monumental geometric grotesk (`Space Grotesk` + `Manrope`) for sculptural depth,
 * crisp neutral sans (`Inter`), and `Geist Mono` exclusively for metadata/filenames/triads/checksums.
 */
export const VG_TYPOGRAPHY = {
  fonts: {
    display: '"Space Grotesk", "Manrope", "Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    editorialSerif: '"Instrument Serif", Georgia, serif',
    mono: '"Geist Mono", ui-monospace, SFMono-Regular, monospace',
  },
  scale: {
    monumentalWordmark: {
      fontSize: 'clamp(2.2rem, 11.15vw, 13.8rem)',
      lineHeight: '0.86',
      letterSpacing: '-0.052em',
      fontWeight: 700,
    },
    closingMonument: {
      fontSize: 'clamp(2.45rem, 8.2vw, 8rem)',
      lineHeight: '0.91',
      letterSpacing: '-0.05em',
      fontWeight: 700,
    },
    h1: {
      fontSize: 'clamp(2.5rem, 6.4vw, 6.75rem)',
      lineHeight: '0.94',
      letterSpacing: '-0.045em',
      fontWeight: 700,
    },
    h2: {
      fontSize: 'clamp(2.15rem, 4.4vw, 4.75rem)',
      lineHeight: '1.02',
      letterSpacing: '-0.038em',
      fontWeight: 700,
    },
    h3: {
      fontSize: 'clamp(1.25rem, 2.0vw, 1.75rem)',
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
      fontSize: 'clamp(1rem, 1.22vw, 1.25rem)',
      lineHeight: '1.58',
      fontWeight: 400,
    },
    body: {
      fontSize: 'clamp(0.975rem, 1.12vw, 1.125rem)',
      lineHeight: '1.62',
      fontWeight: 400,
    },
    small: {
      fontSize: '0.875rem',
      lineHeight: '1.55',
      fontWeight: 400,
    },
    kicker: {
      fontSize: '0.75rem',
      lineHeight: '1.25',
      letterSpacing: '0.14em',
      fontWeight: 600,
    },
  },
  editorialWordClass:
    'font-semibold text-[#087F5B] dark:text-[#CFFF49] tracking-[-0.02em]',
  editorialWordOnForestClass:
    'font-semibold text-[#CFFF49] tracking-[-0.02em]',
} as const

export const VG_LAYOUT = {
  containers: {
    narrow: 'w-full max-w-[920px] mx-auto px-5 sm:px-8',
    standard: 'w-full max-w-[1440px] 2xl:max-w-[1620px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16',
    wide: 'w-full max-w-[1580px] 2xl:max-w-[1780px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16',
    heroStage: 'w-full max-w-[1920px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20',
    navbar: 'w-full max-w-[1920px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20',
  },
  sectionPadding: {
    hero: 'pt-2 sm:pt-4 pb-12 sm:pb-16',
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
    limeGlowLight: 'shadow-[0_20px_50px_-14px_rgba(212,255,84,0.65),0_6px_18px_-6px_rgba(16,18,17,0.14)]',
    limeGlowDark: 'shadow-[0_20px_54px_-12px_rgba(207,255,73,0.34),0_6px_22px_-6px_rgba(0,0,0,0.6)]',
  },
} as const

export const VG_MOTION = {
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  springSnappy: { type: 'spring' as const, stiffness: 320, damping: 28 },
  springMagnetic: { stiffness: 220, damping: 18, mass: 0.5 },
  springParallax: { stiffness: 90, damping: 24 },
  durations: {
    micro: 0.18,
    standard: 0.5,
    editorial: 0.65,
    stage: 0.85,
    ambientSeconds: 12,
  },
  stagger: {
    tight: 0.045,
    standard: 0.065,
    editorial: 0.09,
  },
  viewport: { once: true, amount: 'some' as const },
  reducedMotionPolicy:
    'When prefers-reduced-motion is active, omit transform/blur loops, pause Three.js continuous orbit rotation, disable GSAP scrub timelines in favor of clean static scene state toggles, and render static CSS fallback for LivingAuraCanvas.',
} as const

export const VG_COMPONENTS = {
  buttons: {
    limeCircle:
      'vg-cta-lime inline-flex flex-col items-center justify-center text-center rounded-full bg-[#CDFF45] hover:bg-[#D8FF69] text-[#101211] font-semibold tracking-[-0.015em] shadow-[0_22px_54px_-14px_rgba(205,255,69,0.52),0_6px_18px_-6px_rgba(16,18,17,0.16)] dark:shadow-[0_22px_58px_-12px_rgba(205,255,69,0.28),0_6px_22px_-6px_rgba(0,0,0,0.65)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101211] dark:focus-visible:ring-[#F4F6F2] focus-visible:ring-offset-4',
    limePill:
      'vg-cta-lime inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[14.5px] font-semibold bg-[#CDFF45] hover:bg-[#D8FF69] text-[#101211] shadow-[0_14px_34px_-12px_rgba(205,255,69,0.45)] dark:shadow-[0_14px_34px_-12px_rgba(205,255,69,0.24)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101211] dark:focus-visible:ring-[#F4F6F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vg-bg)]',
    primary:
      'vg-cta inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[14.5px] font-semibold bg-[#101211] hover:bg-[#242826] text-[#F4F6F2] dark:bg-[#F4F6F2] dark:hover:bg-[#FFFFFF] dark:text-[#090B0D] shadow-[0_16px_36px_-14px_rgba(16,18,17,0.32)] dark:shadow-[0_16px_36px_-14px_rgba(255,255,255,0.16)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vg-bg)]',
    primarySm:
      'inline-flex items-center justify-center gap-1.5 h-9 lg:h-10 px-4 lg:px-5 rounded-full text-[13px] lg:text-[13.5px] font-semibold bg-[#101211] hover:bg-[#242826] text-[#F4F6F2] dark:bg-[#CDFF45] dark:hover:bg-[#D8FF69] dark:text-[#090B0D] shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]',
    secondary:
      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[14.5px] font-medium bg-[var(--vg-surface)] hover:bg-[var(--vg-surface-2)] text-[var(--vg-ink)] border border-[var(--vg-border)] hover:border-[var(--vg-border-strong)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]',
    secondarySm:
      'inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-medium bg-[var(--vg-surface)] hover:bg-[var(--vg-surface-2)] text-[var(--vg-ink)] border border-[var(--vg-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]',
    ghost:
      'inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13.5px] font-medium text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] hover:bg-[#FFFFFF]/85 dark:hover:bg-[#191D20] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F5B] dark:focus-visible:ring-[#CDFF45]',
    forestPrimary:
      'vg-cta-lime inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full text-[14.5px] font-semibold bg-[#CDFF45] hover:bg-[#D8FF69] text-[#090B0D] shadow-[0_14px_34px_-10px_rgba(205,255,69,0.30)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CDFF45]',
    forestSecondary:
      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[14.5px] font-medium bg-white/[0.08] hover:bg-white/[0.14] text-[#F4F6F2] border border-white/[0.18] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#46D6A4]',
    tabActive:
      'bg-[#101211] text-[#F4F6F2] border-[#101211] dark:bg-[#CDFF45] dark:text-[#090B0D] dark:border-[#CDFF45] shadow-sm',
    tabIdle:
      'bg-[var(--vg-surface)] text-[var(--vg-ink-2)] border-[var(--vg-border)] hover:text-[var(--vg-ink)] hover:border-[#101211]/25 dark:hover:border-[#CDFF45]/35',
  },
  cards: {
    surface:
      'rounded-3xl border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-card)]',
    secondary:
      'rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface-2)]',
    elevated:
      'rounded-2xl border border-[var(--vg-border)] bg-[var(--vg-surface)] dark:bg-[#202522] shadow-sm',
    glass:
      'rounded-2xl border border-[#DDE2DC] dark:border-white/[0.10] bg-[#FFFFFF]/90 dark:bg-[#131715]/85 backdrop-blur-2xl shadow-[var(--vg-shadow-hero)]',
    photoFrame:
      'rounded-2xl overflow-hidden border border-[var(--vg-border)] bg-[var(--vg-surface)] shadow-[var(--vg-shadow-card)]',
    forest:
      'bg-[#0D1411] text-[#F3F5F1] border border-white/[0.10]',
  },
  badges: {
    sage:
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium bg-[#E7E9E5] text-[#101211] border border-[#DDE2DC] dark:bg-[#202522] dark:text-[#F3F5F1] dark:border-white/[0.10]',
    mint:
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C4EDE1]/70 text-[#066649] border border-[#087F5B]/15 dark:bg-[#202522] dark:text-[#39D9A0] dark:border-[#39D9A0]/25',
    outline:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[var(--vg-surface)] text-[var(--vg-ink-2)] border border-[var(--vg-border)]',
    monoTag:
      'font-mono text-[11px] px-2.5 py-0.5 rounded-md bg-[var(--vg-surface-2)] text-[var(--vg-ink-2)] border border-[var(--vg-border)]',
    photoScrim:
      'vg-photo-caption px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#090B0A]/80 text-[#F3F5F1] backdrop-blur-md border border-white/[0.14]',
  },
  inputs: {
    search:
      'w-full h-12 sm:h-13 pl-12 pr-4 rounded-2xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-[15px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[#087F5B]/20 dark:focus:ring-[#CFFF49]/25 focus:border-[var(--vg-brand)] transition-all',
    field:
      'w-full h-11 px-3.5 rounded-xl bg-[var(--vg-surface-2)] border border-[var(--vg-border)] text-[14px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[#087F5B]/20 dark:focus:ring-[#CFFF49]/25 focus:border-[var(--vg-brand)] transition-all',
    codeBlock:
      'p-5 rounded-2xl bg-[#090B0A] text-[#E6ECE7] font-mono text-[12.5px] leading-relaxed overflow-x-auto border border-white/[0.10]',
  },
  media: {
    sculptureMask:
      'radial-gradient(ellipse 68% 68% at 50% 50%, #000 60%, transparent 98%)',
  },
} as const

/**
 * Liquid Silver / Liquid Carbon Atmospheric Shader Specification.
 * Matches the organic silver waves & subtle acid-lime light caustics behind the Hero sculpture.
 */
export const VG_AURA_SHADER_SPEC = {
  lightStops: {
    base: '#F4F5F2',
    mid: '#E3E8EA',
    highlight: '#BCC5C8',
    limeCaustic: '#CDFF45',
    emeraldCaustic: '#087F5B',
    opacityRange: [0.42, 0.68] as const,
  },
  darkStops: {
    base: '#090B0D',
    mid: '#111416',
    highlight: '#272D30',
    chrome: '#B8C5CC',
    limeCaustic: '#CDFF45',
    jadeCaustic: '#46D6A4',
    opacityRange: [0.45, 0.72] as const,
  },
  cssFallbackLight:
    'radial-gradient(ellipse 46% 42% at 50% 56%, rgba(188, 197, 200, 0.34), transparent 64%), radial-gradient(ellipse 34% 28% at 62% 48%, rgba(205, 255, 69, 0.12), transparent 62%), linear-gradient(180deg, #F4F5F2 0%, #FFFFFF 38%, #E9EDE8 78%, #E3E8EA 100%)',
  cssFallbackDark:
    'radial-gradient(ellipse 52% 44% at 50% 54%, rgba(70, 214, 164, 0.11), transparent 62%), radial-gradient(ellipse 32% 28% at 64% 48%, rgba(205, 255, 69, 0.07), transparent 62%), linear-gradient(180deg, #090B0D 0%, #0D1013 44%, #111416 78%, #090B0D 100%)',
} as const

export const VG_SPHERE_THEME_SPEC = {
  heroPosterLight: '/landing/artwork/memory-sphere-video-poster.webp',
  heroPosterDark: '/landing/artwork/memory-sphere-video-poster.webp',
  heroAnimWebp: '/landing/artwork/memory-sphere-hero.webp',
  heroVideoPoster: '/landing/artwork/memory-sphere-video-poster.webp',
  heroSourceMp4: '/Generated Video November 27, 2026 - 2_43PM.mp4',
  light: {
    cutoutSrc: '/landing/artwork/memory-sphere-light-cutout.webp',
    studioSrc: '/landing/artwork/memory-sphere-light.webp',
    coreColor: '#CDFF45',
    coreAttenuation: '#087F5B',
    chromeColor: '#E3E8EA',
    titaniumColor: '#BCC5C8',
    ringColor: '#AEB9BD',
    ambientIntensity: 0.95,
  },
  dark: {
    cutoutSrc: '/landing/artwork/memory-sphere-dark-cutout.webp',
    studioSrc: '/landing/artwork/memory-sphere-dark.webp',
    coreColor: '#CDFF45',
    coreAttenuation: '#46D6A4',
    chromeColor: '#B8C5CC',
    titaniumColor: '#7B8B94',
    ringColor: '#98A8B0',
    ambientIntensity: 0.85,
  },
} as const
