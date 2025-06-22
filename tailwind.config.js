/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  darkMode: 'class', // toggle via adding/removing `class="dark"` on <html>
  theme: {
    fontFamily: {
      sans: ['var(--font-base)', 'sans-serif'],
      heading: ['var(--font-heading)', 'sans-serif'],
    },
    extend: {
      colors: {
        'bg': 'var(--color-bg)',
        'card': 'var(--color-card-bg)',
        'text': 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'primary': 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
      },
    },
  },
  plugins: [],

}