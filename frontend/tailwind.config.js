/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Deep black/gray
        glass: "rgba(255, 255, 255, 0.05)",
        glassBorder: "rgba(255, 255, 255, 0.1)",
        neon: "#ccff00", // The electric yellow/green from your image
        neonGlow: "rgba(204, 255, 0, 0.5)",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}