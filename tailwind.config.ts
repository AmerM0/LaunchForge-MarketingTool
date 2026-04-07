import type { Config } from "tailwindcss";

// Tailwind v4: theme is configured in globals.css via @theme block.
// This file only handles content scanning for the compiler.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
};

export default config;
