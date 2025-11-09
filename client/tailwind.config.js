/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          base: "#ca2147",        // crisp white background
          primary: "#0078ff",     // vivid blue (tech-bright)
          secondary: "#ff3d9a",   // hot pink-magenta
          accent: "#00e0ff",      // bright cyan
          highlight: "#ffd000",   // electric yellow
          mellow: "#ff9800",      // playful orange
          purple: "#9c27ff",      // bright purple
          cyan: "#00d9ff",        // strong neon cyan
          magenta: "#ff00a8",     // hot magenta
        },
        nerd: {
          dark: "#111827",        // readable dark gray text
          darker: "#000000",      // strong text black
          blue: "#0066ff",        // saturated blue
          purple: "#a200ff",      // pure neon purple
          pink: "#ff1f70",        // bright candy pink
          cyan: "#00c6ff",        // bright sky cyan
          yellow: "#ffcc00",      // bright warm yellow
          green: "#00e676",       // vivid green
        },
      },
      fontFamily: {
        sans: ['"Rubik"', "system-ui", "sans-serif"],
        pixel: ['"Press Start 2P"', "cursive"],
      },
      boxShadow: {
        pixel: "0 4px 0 0 rgba(0, 120, 255, 0.5), 0 8px 20px rgba(0, 0, 0, 0.1)",
        glow: "0 0 30px rgba(0, 224, 255, 0.6), 0 0 50px rgba(255, 61, 154, 0.5)",
        neon: "0 0 25px rgba(0, 224, 255, 0.9), 0 0 50px rgba(255, 61, 154, 0.8)",
        'neon-pink': "0 0 25px rgba(255, 61, 154, 0.9), 0 0 50px rgba(255, 61, 154, 0.6)",
        'neon-cyan': "0 0 25px rgba(0, 224, 255, 0.9), 0 0 50px rgba(0, 224, 255, 0.6)",
        'neon-purple': "0 0 25px rgba(156, 39, 255, 0.9), 0 0 50px rgba(156, 39, 255, 0.6)",
      },
      dropShadow: {
        highlight: "0 0 16px rgba(0, 224, 255, 0.9)",
        accent: "0 0 16px rgba(255, 61, 154, 0.9)",
        neon: [
          "0 0 16px rgba(0, 224, 255, 0.9)",
          "0 0 32px rgba(255, 61, 154, 0.8)",
        ],
      },
      backgroundImage: {
        starfield:
          "radial-gradient(ellipse at top, rgba(0, 224, 255, 0.15), transparent 50%), radial-gradient(ellipse at bottom, rgba(255, 61, 154, 0.12), transparent 50%), linear-gradient(180deg, #ffffff 0%, #f0f3ff 100%)",
        'grid-pattern': 
          "repeating-linear-gradient(0deg, rgba(0, 224, 255, 0.08) 0px, transparent 1px, transparent 40px, rgba(0, 224, 255, 0.08) 41px), repeating-linear-gradient(90deg, rgba(255, 61, 154, 0.08) 0px, transparent 1px, transparent 40px, rgba(255, 61, 154, 0.08) 41px)",
      },
      animation: {
        'pulse-neon': 'pulse-neon 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 12px rgba(0, 224, 255, 0.9))',
          },
          '50%': {
            opacity: '0.85',
            filter: 'drop-shadow(0 0 25px rgba(255, 61, 154, 0.9))',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
