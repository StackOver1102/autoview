/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',  // This includes all EJS files in the 'views' folder and subfolders
    './public/**/*.html', // You can include any HTML files you may use
    './src/**/*.js',      // Any JavaScript files where you may also use Tailwind classes
  ],
  theme: {
  },
  plugins: [
    // Add any Tailwind plugins here if needed
  ],
}
