/**
 * VectorGallery — Centralized Design Tokens
 * Premium Native Apple iCloud / Linear / Raycast Aesthetic
 */

export const tokens = {
  colors: {
    dark: {
      background: '#090A0D',
      surface: '#111318',
      surfaceElevated: '#171A21',
      surfaceHover: '#1D212B',
      borderSubtle: 'rgba(255, 255, 255, 0.07)',
      borderMedium: 'rgba(255, 255, 255, 0.12)',
      textPrimary: '#F4F5F7',
      textSecondary: '#9AA0AC',
      textMuted: '#686E7B',
      accent: '#10B981',
      accentHover: '#059669',
      accentMuted: 'rgba(16, 185, 129, 0.15)',
      glassBg: 'rgba(17, 19, 24, 0.72)',
      glassBorder: 'rgba(255, 255, 255, 0.09)',
    },
    light: {
      background: '#F8F9FA',
      surface: '#FFFFFF',
      surfaceElevated: '#F1F3F5',
      surfaceHover: '#E9ECEF',
      borderSubtle: 'rgba(0, 0, 0, 0.06)',
      borderMedium: 'rgba(0, 0, 0, 0.12)',
      textPrimary: '#191C21',
      textSecondary: '#5A6270',
      textMuted: '#8A92A0',
      accent: '#059669',
      accentHover: '#047857',
      accentMuted: 'rgba(5, 150, 105, 0.1)',
      glassBg: 'rgba(255, 255, 255, 0.8)',
      glassBorder: 'rgba(0, 0, 0, 0.08)',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    categories: {
      photos: '#F43F5E',
      videos: '#8B5CF6',
      documents: '#3B82F6',
      audio: '#EC4899',
      screenshots: '#10B981',
      other: '#6B7280',
    }
  },
  typography: {
    fontSans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.625rem',  // 10px
    lg: '0.875rem',  // 14px
    xl: '1.25rem',   // 20px
    full: '9999px',
  },
  shadows: {
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    card: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
    modal: '0 20px 40px -8px rgba(0, 0, 0, 0.35)',
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
  },
  blur: {
    glass: 'blur(16px)',
    subtle: 'blur(8px)',
  },
  transitions: {
    standard: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }
} as const

export type ThemeMode = 'dark' | 'light' | 'system'

