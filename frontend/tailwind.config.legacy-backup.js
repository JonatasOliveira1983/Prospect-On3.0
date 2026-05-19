/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./frontend/*.html", "./frontend/*.jsx"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#f3f4f6",
        secondary: "#a3a3a3",
        accent: "#d9f99d",
        "obsidian": "#050505",
        "gray-950": "#050505",
        danger: "#EF4444",
        success: "#d9f99d",
        card: "rgba(30, 30, 30, 0.6)",
        gold: "#ffffff"
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        'jarvis-idle': 'jarvis-idle 4s infinite ease-in-out',
        'jarvis-thinking': 'jarvis-thinking 2s infinite linear',
        'jarvis-speaking': 'jarvis-speaking 0.5s infinite ease-in-out',
      },
      keyframes: {
        'jarvis-idle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        'jarvis-thinking': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'jarvis-speaking': {
          '0%, 100%': { transform: 'scale(1.1)', borderOpacity: '1' },
          '50%': { transform: 'scale(1.15)', borderOpacity: '0.6' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
