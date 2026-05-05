import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50:  "#e8f5ee",
          100: "#c8e6d4",
          400: "#0f963c",
          600: "#0a7a30",
          900: "#003c1e",
        },
        amber: {
          50:  "#fff8ec",
          400: "#f0a500",
          900: "#7a4e00",
        },
        pink: {
          50:  "#fdf0f5",
          400: "#d6527a",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-cabinet)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
