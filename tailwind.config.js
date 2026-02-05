/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nexus-primary': '#14F195',
        'nexus-secondary': '#9945FF',
        'nexus-dark': '#0F0F0F',
        'nexus-card': '#1A1A1A',
      },
    },
  },
  plugins: [],
};
