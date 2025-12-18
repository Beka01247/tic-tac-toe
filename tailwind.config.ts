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
        // Warm neutrals
        ivory: "#F8F6F3",
        "warm-gray": "#E8E4DF",
        // Pastels
        blush: "#F4E0DD",
        lavender: "#E8DDEF",
        // Accent
        "deep-rose": "#C9A2A6",
        // Success & Error (soft)
        "soft-success": "#D4E5D4",
        "soft-error": "#F4D4D4",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["32px", { lineHeight: "1.3", fontWeight: "600" }],
        h2: ["20px", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      spacing: {
        "4": "4px",
        "8": "8px",
        "12": "12px",
        "16": "16px",
        "20": "20px",
        "24": "24px",
        "28": "28px",
        "32": "32px",
        "40": "40px",
        "48": "48px",
      },
      borderRadius: {
        soft: "20px",
        softer: "24px",
        softest: "28px",
      },
      backdropBlur: {
        soft: "20px",
      },
      borderWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [],
};
export default config;
