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
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      colors: {
        zinc: {
          950: "#09090B",
          900: "#18181B",
          800: "#27272A",
          700: "#3F3F46",
          600: "#52525B",
          500: "#71717A",
          400: "#A1A1AA",
          100: "#F4F4F5",
        },
        red: {
          600: "#DC2626",
          700: "#B91C1C",
          500: "#EF4444",
          900: "#7F1D1D",
        },
      },
      boxShadow: {
        soft: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
        "soft-lg": "0 20px 35px -10px rgba(0, 0, 0, 0.7)",
      },
    },
  },
  plugins: [],
};

export default config;
