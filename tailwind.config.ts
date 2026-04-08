import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        background: '#0A0D0A',
        foreground: '#F0F5F0',
        card: { DEFAULT: '#111714', foreground: '#F0F5F0' },
        popover: { DEFAULT: '#1F2B1E', foreground: '#F0F5F0' },
        primary: { DEFAULT: '#22A829', foreground: '#0A0D0A' },
        secondary: { DEFAULT: '#1A2219', foreground: '#B8C8B8' },
        muted: { DEFAULT: '#1A2219', foreground: '#6B8A6B' },
        accent: { DEFAULT: '#D4A017', foreground: '#0A0D0A' },
        destructive: { DEFAULT: '#E53E3E', foreground: '#F0F5F0' },
        border: '#1F3D1F',
        input: '#1F3D1F',
        ring: '#22A829',
        green: {
          50: '#EDFAED',
          100: '#C8F0C8',
          200: '#96E296',
          300: '#5FD15F',
          400: '#38C424',
          500: '#22A829',
          600: '#198A1F',
          700: '#116616',
          800: '#0A420E',
          900: '#052208',
        },
        gold: {
          50: '#FFF9E6',
          100: '#FFEEB3',
          200: '#FFD966',
          300: '#FFC933',
          400: '#F5B800',
          500: '#D4A017',
          600: '#B8860B',
          700: '#8B6914',
          800: '#5C4510',
          900: '#2E220A',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'green-sm': '0 2px 8px rgba(34, 168, 41, 0.2)',
        'green-md': '0 4px 20px rgba(34, 168, 41, 0.3)',
        'green-lg': '0 8px 32px rgba(34, 168, 41, 0.4)',
        'green-glow': '0 0 30px rgba(34, 168, 41, 0.5)',
        'gold-glow': '0 0 24px rgba(212, 160, 23, 0.4)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
        modal: '0 25px 60px rgba(0, 0, 0, 0.8)',
        drawer: '-20px 0 60px rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 168, 41, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(34, 168, 41, 0)' },
        },
        'toast-progress': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'toast-progress': 'toast-progress 4s linear forwards',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A0D0A 0%, #0D1A0D 50%, #0A0D0A 100%)',
        'hero-spotlight':
          'radial-gradient(ellipse at 60% 50%, rgba(34,168,41,0.08) 0%, transparent 70%)',
        'gold-gradient': 'linear-gradient(135deg, #B8860B 0%, #D4A017 50%, #F5B800 100%)',
        'green-gradient': 'linear-gradient(135deg, #116616 0%, #22A829 50%, #38C424 100%)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}

export default config
