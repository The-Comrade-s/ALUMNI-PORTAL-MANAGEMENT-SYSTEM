import type { Config } from 'tailwindcss';

/**
 * Design tokens — "The Gateway Mark" system
 * -------------------------------------------------
 * Palette (fixed by brief, extended with supporting neutrals):
 *   navy-900  #081F4D  deepest ink / dark-mode surface
 *   navy-800  #0B2D6B  primary brand (institution navy)
 *   navy-600  #1B4D95  interactive hover state
 *   gold-500  #D4AF37  accent (convocation gold)
 *   gold-300  #E6CB74  gold hover / soft accent
 *   ink       #101B33  body text on light surfaces
 *   slate-500 #5B6B85  muted / secondary text
 *   mist-50   #F7F8FB  page background (light)
 *   line-200  #E4E8F0  hairline borders
 *   success   #1F8A5C  positive status (employed, active, open)
 *
 * Type roles:
 *   display -> Poppins (brief-specified) — headlines, nav, stat numbers
 *   body    -> Inter — paragraphs, tables, forms (dense-data legibility)
 *   mono    -> JetBrains Mono — matric numbers, IDs, timestamps
 */
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#081F4D',
          800: '#0B2D6B',
          700: '#123C86',
          600: '#1B4D95',
          100: '#E7ECF7',
        },
        gold: {
          500: '#D4AF37',
          300: '#E6CB74',
          100: '#FBF3DA',
        },
        ink: '#101B33',
        slate: {
          500: '#5B6B85',
          300: '#9AA6BE',
        },
        mist: {
          50: '#F7F8FB',
          100: '#EFF2F8',
        },
        line: {
          200: '#E4E8F0',
        },
        success: '#1F8A5C',
        warning: '#C77A1E',
        danger: '#C23B4D',
      },
      fontFamily: {
        display: ['var(--font-poppins)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(8, 31, 77, 0.04), 0 8px 24px -12px rgba(8, 31, 77, 0.12)',
        'card-hover': '0 4px 8px rgba(8, 31, 77, 0.06), 0 16px 32px -12px rgba(8, 31, 77, 0.18)',
      },
      keyframes: {
        'mark-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'mark-rotate-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        'mark-slow': 'mark-rotate 40s linear infinite',
        'mark-slow-reverse': 'mark-rotate-reverse 34s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
