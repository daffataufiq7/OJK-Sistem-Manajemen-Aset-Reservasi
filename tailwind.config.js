/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './resources/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'ojk-red': '#C8102E',
        'ojk-red-hover': '#A00D25',
        'ojk-red-light': '#FDF2F4',
        'ojk-dark': '#0F172A',
        'slate-850': '#162032',
        'slate-750': '#253346',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
