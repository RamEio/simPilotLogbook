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
          primary: "var(--accent-primary)",
          "primary-hover": "var(--accent-primary-hover)",
          "primary-text": "var(--accent-primary-text)",
          green: "var(--accent-primary)",
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
        display: ["var(--font-barlow-condensed)", "Barlow Condensed", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Courier New", "monospace"],
        body: ["var(--font-inter)", "DM Sans", "sans-serif"],
      },
      borderRadius: {
        sm: "1px",
        DEFAULT: "2px",
        md: "2px",
        lg: "3px",
      },
      boxShadow: {
        glow: "0 0 12px color-mix(in srgb, var(--accent-primary) 35%, transparent)",
        kneeboard: "2px 3px 8px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
