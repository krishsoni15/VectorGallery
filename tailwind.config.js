const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Manrope"', '"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        'vm-bg': '#0B0D0C',
        'vm-card': '#131614',
        'vm-card-hover': '#252A26',
        'vm-accent': '#087F5B',
        'vm-accent-light': '#58D6A8',
        'vg-bg': '#FAFAF7',
        'vg-surface': '#FFFFFF',
        'vg-secondary': '#F0F1EC',
        'vg-stone': '#E9EBE5',
        'vg-sage': '#CEDBCD',
        'vg-mint': '#C4EDE1',
        'vg-teal': '#A6D9D0',
        'vg-border': '#E0E4DD',
        'vg-brand': '#087F5B',
        'vg-brand-deep': '#066649',
        'vg-jade': '#58D6A8',
        'vg-forest': '#092219',
        'vg-dark-bg': '#0B0D0C',
        'vg-dark-surface': '#131614',
        'vg-dark-secondary': '#171A18',
        'vg-dark-elevated': '#252A26',
        'vg-ink': '#181C19',
        'vg-ink-muted': '#626B64',
        zinc: {
          ...colors.zinc,
          150: '#eeeff2',
          250: '#d8d8de',
          255: '#f0f0f3',
          350: '#b8b8c0',
          405: '#a0a0ac',
          450: '#9898a4',
          455: '#90909c',
          550: '#787884',
          650: '#585864',
          750: '#3a3a44',
          850: '#2a2a30',
          855: '#26262c',
          955: '#111114',
        },
        emerald: {
          ...colors.emerald,
          450: '#34d399',
          555: '#10b981',
        },
        red: {
          ...colors.red,
          405: '#f87171',
          650: '#dc2626',
          955: '#1c0a0a',
        },
        blue: {
          ...colors.blue,
          450: '#60a5fa',
        },
        orange: {
          ...colors.orange,
          450: '#fb923c',
        },
        green: {
          ...colors.green,
          450: '#4ade80',
        },
      },
      spacing: {
        42: '10.5rem',
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'vg-ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
