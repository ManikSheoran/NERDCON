/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          base: "#00123dff",
          primary: "#404098",
          secondary: "#7c3279",
          accent: "#f0457f",
          highlight: "#88fcfe",
          mellow: "#fde7a1",
        },
        'nerd-purple': '#7c3279',
        'nerd-blue': '#404098',
        'nerd-red': '#f0457f',
        'nerd-yellow': '#fde7a1',
        'nerd-cyan': '#88fcfe',
      },
      fontFamily: {
        sans: ['"Rubik"', "system-ui", "sans-serif"],
        pixel: ['"Press Start 2P"', "cursive"],
      },
      boxShadow: {
        pixel: "0 14px 0 0 rgba(64, 64, 152, 0.45)",
        glow: "0 0 35px rgba(240, 69, 127, 0.35)",
      },
      dropShadow: {
        highlight: "0 0 12px rgba(136, 252, 254, 0.85)",
        accent: "0 0 18px rgba(240, 69, 127, 0.75)",
      },
      backgroundImage: {
        starfield:
          "linear-gradient(140deg, rgba(64,64,152,0.38), rgba(124,50,121,0.4)), radial-gradient(circle at 18% 22%, rgba(240,69,127,0.28) 0, transparent 42%), radial-gradient(circle at 75% 12%, rgba(136,252,254,0.26) 0, transparent 40%)",
      },
    },
  },
  plugins: [],
};
