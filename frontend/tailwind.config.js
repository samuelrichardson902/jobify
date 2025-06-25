// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],

  plugins: [], // daisyUI is loaded via @plugin in globals.css

  daisyui: {
    themes: ["dark"],
    logs: true,
  },
};
