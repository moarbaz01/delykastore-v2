import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-battambang)"],
      },
      animation: {
        gradient: "gradientBG 8s ease infinite",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#ff962d",
        secondary: "#252F45",
        "card-bg": "#1F2228",
        accent: "#8b6f47",
        navy: "#1a2332",
        darkBlue: "#2d3e50",
      },
      keyframes: {
        gradientBG: {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
