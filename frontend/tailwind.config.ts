import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyan électrique (ancien "brand" — conservé pour rétrocompat interne)
        brand: {
          50: "#e6faff",
          100: "#b3f0ff",
          200: "#80e5ff",
          300: "#4ddbff",
          400: "#1ad1ff",
          500: "#00C3FF",
          600: "#009fd1",
          700: "#007ba4",
          800: "#005876",
          900: "#003549",
        },
        accent: {
          50: "#ffe6f2",
          100: "#ffb3d9",
          200: "#ff80c0",
          300: "#ff4da7",
          400: "#ff1a8e",
          500: "#FF007A",
          600: "#d10065",
          700: "#a40050",
          800: "#76003b",
          900: "#490025",
        },
        citron: {
          50: "#fffce0",
          100: "#fff7b3",
          200: "#fff380",
          300: "#ffee4d",
          400: "#ffea1a",
          500: "#FFEA00",
          600: "#d1c100",
          700: "#a49700",
          800: "#766d00",
          900: "#494300",
          DEFAULT: "#FFEA00",
        },
        ink: "#111111",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "pop-gradient":
          "linear-gradient(90deg, #00C3FF 0%, #8A53D8 50%, #FF007A 100%)",
      },
      boxShadow: {
        pop: "6px 6px 0 0 #111111",
        "pop-sm": "4px 4px 0 0 #111111",
        "pop-magenta": "6px 6px 0 0 #FF007A",
        "pop-cyan": "6px 6px 0 0 #00C3FF",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.9) rotate(-1deg)", opacity: "0.4" },
          "60%": { transform: "scale(1.08) rotate(1deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0)", opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
      },
      animation: {
        pop: "pop 320ms ease-out",
        wiggle: "wiggle 300ms ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
