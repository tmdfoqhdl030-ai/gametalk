import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#3d7eff",
        "accent-hover": "#2d6ef0",
        "accent-light": "#eef3ff",
      },
      fontFamily: {
        sans: ["Noto Sans KR", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
