/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#070a13',
        darkCard: '#0f172a',
        neonBlue: '#3b82f6',
        neonCyan: '#06b6d4',
        neonPurple: '#a855f7',
        neonPink: '#ec4899',
        neonGreen: '#10b981',
      }
    },
  },
  plugins: [],
}
