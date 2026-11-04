/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          100: '#F1F1F4',
          200: '#D6D6DE',
          300: '#B3B3BE',
          400: '#8B8B97',
          500: '#5F5F6B',
          600: '#3A3A45',
          700: '#262630',
          800: '#1A1A21',
          850: '#131318',
          900: '#0D0D11',
          950: '#07070A',
        },
        ruby: {
          300: '#F57D86',
          400: '#EE4B57',
          500: '#E0313F',
          600: '#C4202E',
          700: '#9E1822',
          900: '#3D0A0F',
        },
        steel: {
          300: '#C5CBD3',
          400: '#9AA3AE',
          500: '#7B8490',
          600: '#5B6370',
          700: '#3B414B',
        },
        ember: {
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
        },
        success: {
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          900: '#063B2C',
        },
        warning: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        danger: {
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          900: '#450A0A',
        },
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.06)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        orbit: 'orbit 28s linear infinite',
        'orbit-reverse': 'orbit 40s linear infinite reverse',
        float: 'float 7s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 6s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
};
