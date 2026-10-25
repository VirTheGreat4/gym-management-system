import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        comic: ['"Comic Sans MS"', 'var(--font-comic-neue)', '"Comic Neue"', 'cursive', 'sans-serif'],
        sans: ['"Comic Sans MS"', '"Comic Sans"', "cursive", "sans-serif"],
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "28px",
      },
      colors: {
        pastel: {
          blue: "#BAE6FD",
          green: "#BBF7D0",
          mint: "#A7F3D0",
          purple: "#E9D5FF",
          pink: "#FBCFE8",
          yellow: "#FEF08A",
          sky: "#BAE6FD",
        },
        brand: {
          primary: "#0284C7",
          secondary: "#059669",
          accent: "#7C3AED",
        },
      },
      boxShadow: {
        soft: "0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
        "soft-lg": "0 20px 35px -10px rgba(15, 23, 42, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
