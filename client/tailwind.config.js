/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#ca2147",     // Main accent color (pink/red)
          secondary: "#343736",   // Dark gray background
          // Shades of ca2147 (pink/red)
          pink: {
            50: "#fef2f4",
            100: "#fde6ea",
            200: "#faccd4",
            300: "#f7a3b4",
            400: "#f26f8c",
            500: "#ca2147",       // Base
            600: "#b61d3f",
            700: "#991935",
            800: "#7c142b",
            900: "#5e1020",
          },
          // Shades of 343736 (dark gray)
          gray: {
            50: "#f7f7f7",
            100: "#e8e8e9",
            200: "#c7c8ca",
            300: "#a6a8ab",
            400: "#6d7073",
            500: "#343736",       // Base
            600: "#2d2f31",
            700: "#252729",
            800: "#1e1f21",
            900: "#161718",
          },
        },
      },
      fontFamily: {
        sans: ['"Rubik"', "system-ui", "sans-serif"],
        pixel: ['"Press Start 2P"', "cursive"],
      },
      boxShadow: {
        'glow-pink': "0 0 20px rgba(202, 33, 71, 0.5), 0 0 40px rgba(202, 33, 71, 0.3)",
        'glow-dark': "0 4px 20px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
