/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0a0a0a",
        panel: "#111111",
        border: "#1f1f1f",
        muted: "#737373",
        teal: {
          DEFAULT: "#00ffa3",
          dim: "rgba(0, 255, 163, 0.15)",
        },
        danger: "#ff4d4d",
        fear: "#8b1a1a",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
