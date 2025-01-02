import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          950: 'hsl(var(--primary-950))',
          DEFAULT: 'hsl(var(--primary-700))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          50: 'hsl(var(--secondary-50))',
          100: 'hsl(var(--secondary-100))',
          200: 'hsl(var(--secondary-200))',
          300: 'hsl(var(--secondary-300))',
          400: 'hsl(var(--secondary-400))',
          500: 'hsl(var(--secondary-500))',
          600: 'hsl(var(--secondary-600))',
          700: 'hsl(var(--secondary-700))',
          800: 'hsl(var(--secondary-800))',
          900: 'hsl(var(--secondary-900))',
          950: 'hsl(var(--secondary-950))',
          DEFAULT: 'hsl(var(--secondary-50))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        third: {
          50: 'hsl(var(--third-50))',
          100: 'hsl(var(--third-100))',
          200: 'hsl(var(--third-200))',
          300: 'hsl(var(--third-300))',
          400: 'hsl(var(--third-400))',
          500: 'hsl(var(--third-500))',
          600: 'hsl(var(--third-600))',
          700: 'hsl(var(--third-700))',
          800: 'hsl(var(--third-800))',
          900: 'hsl(var(--third-900))',
          950: 'hsl(var(--third-950))',
          DEFAULT: 'hsl(var(--third-400))',
          foreground: 'hsl(var(--third-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'sound-wave': {
          '0%': {
            transform: 'scale(1)',
            opacity: '0.3',
          },
          '100%': {
            transform: 'scale(1.5)',
            opacity: '0',
          },
        },
        'sound-pulse': {
          '0%': {
            opacity: '0.3',
            transform: 'translateX(-100%)',
          },
          '50%': {
            opacity: '0.5',
          },
          '100%': {
            opacity: '0.3',
            transform: 'translateX(100%)',
          },
        },
        'star-twinkle': {
          '0%, 100%': {
            opacity: '0',
            transform: 'scale(0.5)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'cloud-float': {
          '0%, 100%': {
            transform: 'translateX(0)',
          },
          '50%': {
            transform: 'translateX(-3px)',
          },
        },
        shake: {
          '0%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(-15deg)',
          },
          '75%': {
            transform: 'rotate(15deg)',
          },
        },
        'logo-spin': {
          '0%': {
            transform: 'rotateY(0deg)',
          },
          '100%': {
            transform: 'rotateY(360deg)',
          },
        },
        'glow-line': {
          '0%': {
            opacity: '0',
            transform: 'scaleX(0)',
          },
          '100%': {
            opacity: '1',
            transform: 'scaleX(1)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'sound-wave-1': 'sound-wave 2s ease-out infinite',
        'sound-wave-2': 'sound-wave 2s ease-out infinite 0.5s',
        'sound-wave-3': 'sound-wave 2s ease-out infinite 1s',
        'sound-pulse': 'sound-pulse 2s ease-in-out infinite',
        'star-twinkle': 'star-twinkle 2s ease-in-out infinite',
        'cloud-float': 'cloud-float 3s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        'logo-spin': 'logo-spin 1s ease-in-out',
        'glow-line': 'glow-line 0.5s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
