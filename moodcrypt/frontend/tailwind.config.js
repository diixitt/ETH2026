/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          500: '#6474ff',
          600: '#4b58e6',
          700: '#3b47bf'
        }
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: []
}
