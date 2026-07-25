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
        sans: ["var(--font-outfit)", "var(--font-battambang)", "sans-serif"],
        khmer: ["var(--font-battambang)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      animation: {
        gradient: "gradientBG 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-down": "slideDown 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // New purple gaming palette
        primary: "#A855F7",
        "primary-dark": "#7B2FBE",
        "primary-light": "#C084FC",
        surface: "#12102A",
        "surface-2": "#1A1730",
        "surface-3": "#221F3A",
        "bg-base": "#0D0B1A",
        // Legacy colors for backwards compat (admin panel)
        secondary: "#252F45",
        "card-bg": "#1F2228",
        accent: "#8b6f47",
        navy: "#1a2332",
        darkBlue: "#2d3e50",
      },
      keyframes: {
        gradientBG: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "purple-gradient": "linear-gradient(135deg, #7B2FBE 0%, #A855F7 100%)",
        "purple-gradient-dark": "linear-gradient(135deg, #5B1A9E 0%, #7B2FBE 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(123,47,190,0.2) 0%, rgba(18,16,42,0) 100%)",
        "hero-gradient": "linear-gradient(to bottom, transparent 60%, #0D0B1A 100%)",
      },
      boxShadow: {
        "purple-sm": "0 0 15px rgba(168, 85, 247, 0.15)",
        "purple-md": "0 0 25px rgba(168, 85, 247, 0.25)",
        "purple-lg": "0 0 40px rgba(168, 85, 247, 0.35)",
        "purple-glow": "0 0 60px rgba(168, 85, 247, 0.5)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
