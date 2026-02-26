/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // ── Dark backgrounds (UI base — unchanged) ─────────────────────
          dark: '#F8FAFC',     // Light App Background (Slate 50)
          surface: '#FFFFFF',  // Pure White Card Surface
          border: '#E2E8F0',   // Light Borders (Slate 200)

          // ── Primary palette ─────────────────────────────────────────────
          blue: '#255E91',  // Lapis Blue  — Primary branding
          red: '#CD393B',  // Brand Red   — Alerts/CTAs (from logo)
          accent: '#CD393B',  // alias of red

          // ── Secondary blues (charts & interactive) ──────────────────────
          chartBlue: '#21A0FF',  // primary.light / primary.charts
          chartBlueMid: '#53B5FF',  // primary.charts light variant
          cyan: '#8ACAEC',  // Baby Blue    — Secondary accent
          blueMedium: '#0070C0',  // interactive links
          blueHover: '#005EA4',  // hover / active states
          blueLight: '#B9DFF4',  // very light blue fills
          bluePale: '#DCEFF9',  // secondary.light — bg / cards
          blueFaintest: '#eefaff',  // lightest blue tint

          // ── Tertiary neutrals + pinks ───────────────────────────────────
          pink: '#E79D9E',  // subtle accents / dividers
          pinkLight: '#EFBEBF',  // light pink fills
          pinkPale: '#F7DEDF',  // very light pink backgrounds
          grey: '#929292',  // Battleship Grey — Muted text / Borders
          greyMid: '#D3D3D3',  // light grey fills
          greyLight: '#E4E4E4',  // lightest grey backgrounds
          titleGrey: '#847e70',  // primary.dark — titles only

          // ── Accent & highlight ──────────────────────────────────────────
          yellow: '#FBC210',  // accent.light — highlight / key info
          glow: '#DE7C7E',  // Light Coral  — Supporting accent

          // ── Indicators ──────────────────────────────────────────────────
          safe: '#2e7d32',  // indicator.safe   — unchanged
          threat: '#CD393B',  // indicator.threat — Brand Red
          warning: '#f58327',  // indicator.warning — unchanged
        }
      },
      fontFamily: {
        // Full brand font stack: Pangram → Segoe UI Black → Open Sans → system
        sans: ['"Pangram Sans"', '"Segoe UI Black"', '"Open Sans"', 'ui-sans-serif', 'system-ui'],
        display: ['"Pangram Sans"', '"Segoe UI Black"', '"Open Sans"', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'subtle-float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'glass': '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 1px 0 rgba(0, 0, 0, 0.1)',
        'accent-glow': '0 10px 25px -5px rgba(37, 94, 145, 0.15)',
      }
    },
  },
  plugins: [],
}
