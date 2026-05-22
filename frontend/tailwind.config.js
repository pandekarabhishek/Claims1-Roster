/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand:   { 400: '#fb923c', 500: '#f97316' },
        surface: { 0: '#0d1117', 1: '#161b22', 2: '#1c2128', 3: '#21262d', 4: '#30363d' },
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease',
        'scale-in': 'scaleIn 0.15s ease',
        'slide-up': 'slideUp 0.2s ease',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1 } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.96)' },    to: { opacity: 1, transform: 'scale(1)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1 } },
      },
    },
  },
  plugins: [],
}
