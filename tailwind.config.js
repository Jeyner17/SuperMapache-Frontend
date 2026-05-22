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
        primary: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#812dc6',
          900: '#7833ae',
        },
        dark: {
          bg: '#1a1d2e',
          card: '#252937',
          hover: '#2d3142',
          border: '#3d4152',
          text: '#e4e7eb',
        },
        light: {
          bg: '#f8f9fa',
          card: '#ffffff',
          hover: '#f1f3f5',
          border: '#e9ecef',
          text: '#212529',
        },
      },
    },
  },
  plugins: [],
}