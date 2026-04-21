import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.9)", opacity: "0.4" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        flash: {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "currentColor" },
        },
      },
      animation: {
        pop: "pop 280ms ease-out",
        flash: "flash 500ms ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
