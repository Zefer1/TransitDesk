// Status color tokens are defined in src/index.css via @theme { --color-status-* }.
// This config is kept only for content scanning (Tailwind v4).
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
}
