import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        prospect: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
          cyan: "#22D3EE",
          emerald: "#10B981",
          rose: "#F43F5E",
          slate: "#0F172A",
          muted: "#64748B"
        },
        primary: "#22D3EE",
        accent: "#10B981",
        otto: {
          blue: "var(--otto-blue)",
          yellow: "var(--otto-yellow)",
          white: "var(--otto-white)",
          gray: "var(--otto-gray)",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.7', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
