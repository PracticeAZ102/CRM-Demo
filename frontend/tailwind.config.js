/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        biosphere: {
          blue: "#2986cc",
          "blue-hover": "#1f6cb0",
          green: "#6aa84f",
          dark: "#142229",
          slate: "#2e4350",
          muted: "#7a8794",
          light: "#ede9e1",
        }
      }
    },
  },
  plugins: [],
}

