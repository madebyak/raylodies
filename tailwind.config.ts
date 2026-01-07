import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["var(--font-roboto)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        muted: "#888888",
        accent: "#6d15f9",
      },
    },
  },
  plugins: [],
};

export default config;
