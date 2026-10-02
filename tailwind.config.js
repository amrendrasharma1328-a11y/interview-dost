/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#07070f",
        surface: "#0d0d1a",
        line: "#1d1d33",
        brand: { DEFAULT: "#8b5cf6", soft: "#a78bfa" },
        accent: "#22d3ee",
        coral: "#f4694f",
      },
    },
  },
  plugins: [],
};
