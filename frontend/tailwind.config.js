/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // FutureOS Design System — exact palette
        "fo-base":     "#0F172A",
        "fo-surface":  "#1E293B",
        "fo-elevated": "#253347",
        "fo-input":    "#0F172A",
        "fo-border":   "#334155",
        "fo-border-em":"#475569",
        "fo-indigo":   "#6366F1",
        "fo-indigo-m": "#1e1e3a",
        "fo-ai":       "#22D3EE",
        "fo-success":  "#10B981",
        "fo-warning":  "#F59E0B",
        "fo-danger":   "#EF4444",
        "fo-text":     "#F1F5F9",
        "fo-muted":    "#94A3B8",
        "fo-faint":    "#64748B",
        // Tailwind semantic aliases (used by existing page code)
        border:      "#334155",
        background:  "#0F172A",
        foreground:  "#F1F5F9",
        muted:       "#253347",
        primary:     "#6366F1",
        accent:      "#F59E0B",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderWidth: { DEFAULT: "0.5px", "0.5": "0.5px" },
      borderRadius: {
        chip: "4px",
        badge: "6px",
        btn:  "8px",
        card: "12px",
        panel:"16px",
        pill: "99px",
      },
      animation: {
        "ai-pulse": "ai-pulse 1.4s ease-in-out infinite",
        shimmer:    "shimmer 1.4s ease-in-out infinite",
      },
      keyframes: {
        "ai-pulse": {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%":     { opacity: "0.5", transform: "scale(0.85)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      boxShadow: {
        card:    "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        modal:   "0 4px 24px rgba(0,0,0,0.6)",
        selected:"0 0 0 2px #6366F1, 0 0 16px rgba(99,102,241,0.2)",
      },
    },
  },
  plugins: [],
};