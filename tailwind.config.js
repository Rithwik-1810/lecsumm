/** @type {import('tailwindcss').Config} */ 
export default { 
  darkMode: 'class',
  content: [ 
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}", 
  ], 
  theme: { 
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4', // Cyan main
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Purple main
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        surface: {
          50: '#0B0C10',
          100: '#12141A',
          200: '#1A1C23',
          300: '#222631',
          400: '#CBD5E1', // slate-300
          500: '#94A3B8', // slate-400
          600: '#E5E7EB', // Gray 200
          700: '#F3F4F6', // Gray 100
          800: '#F9FAFB', // Gray 50
          900: '#FFFFFF', // White
        }
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-accent': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glass-inset': 'inset 0 1px 1px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255,255,255,0.02)',
      },
      animation: {
        'blob': 'blob 10s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-flow': 'borderFlow 3s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)', opacity: 0.4 },
          '33%': { transform: 'translate(50px, -70px) scale(1.2)', opacity: 0.6 },
          '66%': { transform: 'translate(-40px, 40px) scale(0.8)', opacity: 0.3 },
          '100%': { transform: 'translate(0px, 0px) scale(1)', opacity: 0.4 },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        borderFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      }
    }, 
  }, 
  plugins: [], 
} 
