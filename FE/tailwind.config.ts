import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        game: {
          dark: "#0B0E14",
          card: "#151922",
          cardHover: "#1E2430",
          border: "#2A3241",
          gold: "#FFD700",
          goldDark: "#B8860B",
          ruby: "#FF4D4D",
          emerald: "#00E676",
          sapphire: "#00B0FF",
          topaz: "#FFD600",
          diamond: "#E040FB",
        },
        rarity: {
          common: "#9E9E9E",
          uncommon: "#4CAF50",
          rare: "#2196F3",
          epic: "#9C27B0",
          legendary: "#FF9800",
        }
      },
      fontFamily: {
        pixel: ["Courier New", "monospace"],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up': 'floatUp 0.8s ease-out forwards',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-30px) scale(1.2)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
