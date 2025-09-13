/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        glow: {
          "0%, 100%": { filter: "drop-shadow(0 0 10px rgba(255, 255, 0, 0.8))", opacity: "1" },
          "50%": { filter: "drop-shadow(0 0 20px rgba(255, 255, 0, 1))", opacity: "0.7" },
        },
      },
      animation: {
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
