/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,js,ejs}"],
  theme: {
    extend: {
      fontFamily: {
        inter: "Inter",
        playFair: "Playfair Display",
      },
      colors: {
        gold: "#bf9c41",
      },
    },
  },
  plugins: [require("kutty")],
};
