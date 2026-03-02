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