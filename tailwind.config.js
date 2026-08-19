/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#100e0c',
        panel: '#1a1613',
        raised: '#231e19',
        line: '#3a322b',
        paper: '#f3ead8',
        mute: '#a89882',
        ember: {
          DEFAULT: '#ff4d1c',
          dim: '#c93612',
          glow: '#ff7a4d',
        },
        acid: '#d8f04a',
        teal: '#3aa8a0',
      },
      fontFamily: {
        display: [
          '"Bricolage Grotesque"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        stamp: '3px 3px 0 0 #100e0c',
        'stamp-ember': '3px 3px 0 0 #ff4d1c',
        'stamp-acid': '3px 3px 0 0 #d8f04a',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%, 45%': { opacity: '1' },
          '50%, 100%': { opacity: '0.25' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.45s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        marquee: 'marquee 28s linear infinite',
        blink: 'blink 1.6s steps(1) infinite',
      },
    },
  },
  plugins: [],
}
