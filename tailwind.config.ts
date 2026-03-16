import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "background-alt": "var(--background-alt)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        card: "var(--card)",
        surface: "var(--surface)",
        "surface-strong": "var(--surface-strong)",
        ring: "var(--ring)",
        "card-foreground": "var(--card-foreground)"
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2rem"
      },
      boxShadow: {
        soft: "0 22px 54px -32px rgba(19, 34, 52, 0.36)",
        panel: "0 36px 90px -46px rgba(19, 34, 52, 0.42)",
        float: "0 34px 84px -44px rgba(19, 34, 52, 0.46)"
      }
    }
  },
  plugins: []
};

export default config;
