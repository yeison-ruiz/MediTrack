/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#7bba47',
          blue: '#1f95d5',
          yellow: '#fca827',
          dark: '#0e3c60',
        }
      }
    },
  },
  plugins: [],
}
