/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff3eb',
          100: '#ffe0c7',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6a0a',
          900: '#7c2d12',
        },
        surface: {
          0:   '#0d1117',
          1:   '#161b22',
          2:   '#1c2128',
          3:   '#21262d',
          4:   '#30363d',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease',
        'slide-up':   'slideUp 0.25s ease',
        'scale-in':   'scaleIn 0.15s ease',
        'pulse-dot':  'pulseDot 2s infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
    },
  },
  plugins: [],
}
