/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#5D25E1',
          600: '#2632F2',
          700: '#5D25E1',
          800: '#A216CB',
          900: '#DC08B9',
        },
        tradearn: {
          blue: '#2632F2',
          purple: '#5D25E1',
          magenta: '#A216CB',
          pink: '#DC08B9',
          lime: '#3CD500',
          dark: '#080818',
          mid: '#0F0B2E',
          surface: '#15103D',
          text: '#FAF7FD',
          muted: 'rgba(250,247,253,0.7)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(139,92,246,0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 15px rgba(139,92,246,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(139,92,246,0)' },
        },
      },
    },
  },
  plugins: [],
};
