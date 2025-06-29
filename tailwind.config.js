/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maincolor: 'orange',
        secondary: 'skyblue',
        black: '#000',
        white: '#fff',
      },
    },
  },
  plugins: [],
}

