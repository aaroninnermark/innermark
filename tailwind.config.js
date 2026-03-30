/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f8f4',
          100: '#e6f0e6',
          200: '#cce1cc',
          300: '#a3c9a3',
          400: '#72ab73',
          500: '#4e8f50',
          600: '#3a7040',
          700: '#2e5934',
          800: '#274830',
          900: '#213c2a',
        },
        warm: {
          50: '#faf9f6',
          100: '#f4f1eb',
          200: '#e8e0d2',
          300: '#d6c9b4',
          400: '#bfaa8e',
          500: '#a8906e',
          600: '#8f755a',
          700: '#755d49',
          800: '#5e4c3f',
          900: '#4e4035',
        },
        clay: {
          50: '#fdf6f3',
          100: '#faeae3',
          200: '#f4d3c4',
          300: '#ebb39b',
          400: '#df8a6b',
          500: '#d16847',
          600: '#c1513a',
          700: '#a13f31',
          800: '#85362d',
          900: '#6e3029',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
