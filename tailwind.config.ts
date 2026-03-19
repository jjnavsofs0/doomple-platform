import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Doomple Brand Named Colors */
        navy: {
          DEFAULT: "#042042",
          50: "#e8edf5",
          100: "#c5d0e4",
          200: "#9eb0cf",
          300: "#7290ba",
          400: "#4e75a9",
          500: "#2a5a98",
          600: "#1e4a82",
          700: "#0f3266",
          800: "#042042",
          900: "#010f21",
        },
        teal: {
          DEFAULT: "#1ABFAD",
          50: "#e6faf8",
          100: "#b3f0ea",
          200: "#80e5db",
          300: "#4ddacb",
          400: "#26cfbc",
          500: "#1ABFAD",
          600: "#15a89a",
          700: "#0e8f83",
          800: "#07756c",
          900: "#005c55",
        },
        "blue-accent": {
          DEFAULT: "#3BB2F6",
          50: "#e8f5fe",
          100: "#bfe2fb",
          200: "#93cef8",
          300: "#66baf5",
          400: "#3BB2F6",
          500: "#1a9fe8",
          600: "#0d88d0",
          700: "#0070b8",
          800: "#00599f",
          900: "#004280",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
