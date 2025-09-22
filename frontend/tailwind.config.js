/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        stem: {
          physics: '#ef4444',
          math: '#3b82f6', 
          chemistry: '#10b981',
          biology: '#8b5cf6',
          coding: '#f59e0b'
        }
      },
      fontFamily: {
        'odia': ['Arial', 'sans-serif'], // Odia font would be added here
        'hindi': ['Arial', 'sans-serif'], // Hindi font
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s linear infinite',
        'bounce-gentle': 'bounce 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'gesture-pulse': 'gesturePulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gesturePulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'science-pattern': "url('/images/science-bg.svg')",
      }
    },
  },
  plugins: [],
}