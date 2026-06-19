/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
        game: {
          red: '#EF4444',
          blue: '#3B82F6',
          green: '#10B981',
          yellow: '#F59E0B',
          purple: '#8B5CF6',
          pink: '#EC4899',
          orange: '#F97316',
          cyan: '#06B6D4',
        },
        dark: {
          100: '#1E293B',
          200: '#0F172A',
          300: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'game-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%)',
      },
      boxShadow: {
        'game': '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 30px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 30px rgba(16, 185, 129, 0.5)',
        'glow-red': '0 0 30px rgba(239, 68, 68, 0.5)',
      }
    },
  },
  plugins: [],
}
