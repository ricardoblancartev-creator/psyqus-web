/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Asegúrate de que esto esté vacío o tenga tus colores neón
    },
  },
  plugins: [],
}