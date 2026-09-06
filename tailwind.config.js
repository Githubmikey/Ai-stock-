/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        warehouse: {
          950: '#090C10',
          900: '#0D1117',
          850: '#131822',
          800: '#161B26',
          750: '#1C2333',
          700: '#232C3E',
          600: '#323E56',
          500: '#4A5B7D',
          accent: '#00E5FF', // Electric Cyan
          success: '#00E676', // High-vis Neon Green (Stock-in)
          warning: '#FFB300', // Amber Warning (Low stock)
          danger: '#FF5252',  // Coral Red (Stock-out/Alert)
          purple: '#A855F7',  // AI Forecast Accent
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Roboto Mono', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
