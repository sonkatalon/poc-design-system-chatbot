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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // make sure to "npm install tailwindcss-animate"
    require("@assistant-ui/react/tailwindcss"),
    require("@assistant-ui/react-markdown/tailwindcss"),
  ],
};
export default config;
