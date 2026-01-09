/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out both',
        'fade-up': 'fade-up 240ms ease-out both',
        shimmer: 'shimmer 1.2s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
      },
      boxShadow: {
        soft: '0 18px 50px -28px rgba(0,0,0,0.9)',
        glow: '0 0 0 1px rgba(148,163,184,0.10), 0 12px 40px -26px rgba(56,189,248,0.30)',
      },
      colors: {
        surface: {
          950: '#05070d',
          900: '#0b1220',
          800: '#111a2d',
        },
      },
    },
  },
  plugins: [],
}
