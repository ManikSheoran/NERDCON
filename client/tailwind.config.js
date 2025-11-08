/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          void: "#050816",
          obsidian: "#0B1120",
          emerald: "#2EFB4E",
          cyan: "#38F9FF",
          magenta: "#FF66C4",
          gold: "#FFE347",
          lilac: "#A855F7",
        },
      },
      fontFamily: {
        sans: ['"Rubik"', "system-ui", "sans-serif"],
        pixel: ['"Press Start 2P"', "cursive"],
      },
      boxShadow: {
        pixel: "0 14px 0 0 #1E293B",
        glow: "0 0 35px rgba(46, 251, 78, 0.45)",
      },
      dropShadow: {
        neon: "0 0 10px rgba(255, 227, 71, 0.75)",
        emerald: "0 0 18px rgba(46, 251, 78, 0.75)",
      },
      backgroundImage: {
        starfield:
          "radial-gradient(circle at 20% 20%, rgba(168,85,247,0.28) 0, transparent 45%), radial-gradient(circle at 80% 10%, rgba(56,249,255,0.3) 0, transparent 45%), radial-gradient(circle at 50% 80%, rgba(255,102,196,0.28) 0, transparent 40%)",
      },
    },
  },
  plugins: [],
};
