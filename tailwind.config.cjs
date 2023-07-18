/** @type {import('tailwindcss').Config} */
const { addDynamicIconSelectors } = require('@iconify/tailwind');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {},
  },
  plugins: [addDynamicIconSelectors()],
}