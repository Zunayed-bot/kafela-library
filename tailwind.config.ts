import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f7f5",
          100: "#d9ece8",
          200: "#b3dad2",
          300: "#81bfb3",
          400: "#4d9e90",
          500: "#2d7f72",
          600: "#1f665c",
          700: "#1a5249",
          800: "#17433c",
          900: "#153833",
          950: "#0a211e",
          DEFAULT: "#1a3c34",
        },
        gold: {
          50: "#fdf9ec",
          100: "#faf1ca",
          200: "#f5e090",
          300: "#efc957",
          400: "#e8b52d",
          500: "#c9a227",
          600: "#a87d1a",
          700: "#875c17",
          800: "#714918",
          900: "#603c18",
          950: "#371f09",
          DEFAULT: "#c9a227",
          light: "#e8c96d",
          dark: "#9a7a1a",
        },
        teal: {
          DEFAULT: "#1a3c34",
        },
        background: "#fafaf8",
        surface: "#ffffff",
        "surface-2": "#f4f7f6",
        "text-primary": "#1a1a1a",
        "text-secondary": "#4a5568",
        "text-muted": "#718096",
        border: "#e2e8f0",
        "border-gold": "#c9a227",
      },
      fontFamily: {
        bangla: ["Hind Siliguri", "Noto Sans Bengali", "sans-serif"],
        "bangla-serif": ["Noto Serif Bengali", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Amiri", "Scheherazade New", "serif"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #1a3c34 0%, #2d6a5f 50%, #1a3c34 100%)",
        "gradient-gold": "linear-gradient(135deg, #c9a227 0%, #e8c96d 50%, #c9a227 100%)",
        "gradient-hero": "linear-gradient(160deg, #0a211e 0%, #1a3c34 40%, #2d6a5f 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
        "pattern-islamic": "url('/images/pattern.svg')",
      },
      boxShadow: {
        gold: "0 4px 24px rgba(201, 162, 39, 0.25)",
        "gold-lg": "0 8px 40px rgba(201, 162, 39, 0.35)",
        teal: "0 4px 24px rgba(26, 60, 52, 0.25)",
        "teal-lg": "0 8px 40px rgba(26, 60, 52, 0.35)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.08)",
        premium: "0 20px 60px rgba(0, 0, 0, 0.12)",
        card: "0 2px 20px rgba(26, 60, 52, 0.08)",
        "card-hover": "0 8px 30px rgba(26, 60, 52, 0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 162, 39, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(201, 162, 39, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
    },
  },
  plugins: [],
};

export default config;
