/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Enable purging in production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './*.html',
      './js/**/*.js',
    ],
  },
}