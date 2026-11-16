/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#10172A', // Primary background
          800: '#17243A', // Secondary background
          700: '#202B42', // Card background
          600: '#283652',
          500: '#3A4C70',
        },
        royal: {
          pink: '#E83E82',
          'pink-light': '#F17BA9',
          gold: '#D6AD62',
          'gold-light': '#E5C788',
        },
        text: {
          primary: '#F2F5FA',
          secondary: '#AAB6CC',
          muted: '#718096',
        },
        status: {
          success: '#18B887',
          warning: '#F59E0B',
          danger: '#EF5350',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
