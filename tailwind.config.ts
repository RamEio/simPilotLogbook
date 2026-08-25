import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "var(--bg-deep)",
          elevated: "var(--bg-elevated)",
          card: "var(--bg-card)",
          hover: "var(--bg-hover)",
          input: "var(--bg-input)",
          canvas: "var(--bg-canvas)",
        },
        crimson: {
          900: "var(--red-900)",
          700: "var(--red-700)",
          600: "var(--red-600)",
          500: "var(--red-500)",
          400: "var(--red-400)",
          lightest: "var(--red-lightest)",
          lighter: "var(--red-lighter)",
        },
        amber: {
          600: "var(--amber-600)",
          500: "var(--amber-500)",
          400: "var(--amber-400)",
        },
        status: {
          success: "var(--status-success)",
          info: "var(--status-info)",
          warning: "var(--status-warning)",
          error: "var(--status-error)",
          neutral: "var(--status-neutral)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },
        line: {
          subtle: "var(--border-subtle)",
          default: "var(--border-default)",
          strong: "var(--border-strong)",
        },
        outcome: {
          success: "var(--outcome-success)",
          partial: "var(--outcome-partial)",
          failure: "var(--outcome-failure)",
          "total-failure": "var(--outcome-total-failure)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      fontSize: {
        display: ["36px", { lineHeight: "44px", fontWeight: "700" }],
        h1: ["28px", { lineHeight: "36px", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        body: ["14px", { lineHeight: "22px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "18px", fontWeight: "400" }],
        overline: ["11px", { lineHeight: "16px", fontWeight: "500" }],
      },
      spacing: {
        "sp-xxs": "4px",
        "sp-xs": "8px",
        "sp-sm": "12px",
        "sp-md": "16px",
        "sp-lg": "20px",
        "sp-xl": "24px",
        "sp-2xl": "32px",
        "sp-3xl": "48px",
        "sp-4xl": "64px",
      },
      maxWidth: {
        content: "1280px",
      },
      borderRadius: {
        none: "0px",
        subtle: "4px",
        DEFAULT: "8px",
        md: "8px",
        rounded: "12px",
        large: "16px",
        pill: "9999px",
      },
      boxShadow: {
        "level-1": "var(--shadow-1)",
        "level-2": "var(--shadow-2)",
        "level-3": "var(--shadow-3)",
      },
      letterSpacing: {
        overline: "0.5px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
