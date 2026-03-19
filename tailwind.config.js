/** @type {import("tailwindcss").Config} */
const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#d4b645",
        neutral: {
          100: "#f5f5f4",
          200: "#e6e7e4",
          900: "#1f1f1f",
        },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Segoe UI", "sans-serif"],
        inter: ["var(--font-inter)"],
      sora: ["var(--font-sora)"],
      sans: ["var(--font-open-sans)"],
      atkinson: ["var(--font-atkinson)"],
      },
      boxShadow: {
        "card-light": "0 20px 45px rgba(8, 60, 32, 0.08)",
      },
    },
  },
  plugins: [],
};

module.exports = config;
