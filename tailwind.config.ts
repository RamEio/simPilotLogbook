import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)",
          elevated: "var(--bg-elevated)",
        },
        accent: {
          green: "var(--accent-green)",
          amber: "var(--accent-amber)",
          red: "var(--accent-red)",
          blue: "var(--accent-blue)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        line: {
          subtle: "var(--border-subtle)",
          muted: "var(--border-muted)",
          accent: "var(--border-accent)",
        },
        outcome: {
          success: "var(--outcome-success)",
          partial: "var(--outcome-partial)",
          failure: "var(--outcome-failure)",
          "total-failure": "var(--outcome-total-failure)",
        },
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "Rajdhani", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Courier New", "monospace"],
        body: ["var(--font-inter)", "DM Sans", "sans-serif"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "4px",
      },
      boxShadow: {
        glow: "0 0 12px color-mix(in srgb, var(--accent-green) 35%, transparent)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
