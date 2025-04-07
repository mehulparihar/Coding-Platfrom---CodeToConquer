/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'leaderboard-gradient': 'linear-gradient(to right, #f59e0b, #ea580c)',
      }
    },
  },
  plugins: [],
}