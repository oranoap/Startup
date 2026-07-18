import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefaf4",
          100: "#d7f2e4",
          200: "#b0e4cc",
          300: "#7dd0ac",
          400: "#4cdd9f",
          500: "#1f9a66",
          600: "#178355",
          700: "#106f46",
          800: "#0e553a",
          900: "#0b3f2c",
          950: "#06281c",
        },
        ink: {
          DEFAULT: "#1c2523",
          soft: "#44514d",
          faint: "#6b7773",
        },
        paper: "#f6f7f7",
        line: "#e2e6e4",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["Source Serif 4", "Georgia", "Cambria", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(16 33 27 / 0.04), 0 1px 3px 0 rgb(16 33 27 / 0.06)",
        raised:
          "0 1px 2px 0 rgb(16 33 27 / 0.05), 0 4px 12px -2px rgb(16 33 27 / 0.08)",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
