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
          void: "#06080e",
          dark: "#0a0e17",
          panel: "#101623",
          panelHover: "#161e30",
          card: "#121824",
          cardHover: "#182030",
          border: "#1e293b",
          borderStrong: "#2e3d56",
          gold: "#f59e0b",
          goldBright: "#fbbf24",
          goldDark: "#b45309",
          ruby: "#ef4444",
          emerald: "#10b981",
          sapphire: "#06b6d4",
          amethyst: "#a855f7",
          topaz: "#f59e0b",
          diamond: "#38bdf8",
        },
        rarity: {
          common: "#94a3b8",
          uncommon: "#10b981",
          rare: "#3b82f6",
          epic: "#a855f7",
          legendary: "#f59e0b",
          mythic: "#ef4444",
          ancient: "#ec4899",
        }
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up': 'floatUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-24px) scale(1.15)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
