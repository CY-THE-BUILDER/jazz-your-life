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
        ink: "#101514",
        cream: "#f5efdf",
        mist: "#b2bab2",
        card: "#17201d",
        brass: "#b9975b",
        olive: {
          50: "#d7e1cf",
          100: "#c3d0b8",
          200: "#a8bb98"
        }
      },
      fontFamily: {
        sans: ["'Avenir Next'", "'PingFang TC'", "'Noto Sans TC'", "sans-serif"],
        display: ["'Iowan Old Style'", "'Baskerville'", "'Times New Roman'", "serif"]
      },
      boxShadow: {
        panel: "0 28px 70px rgba(4, 8, 8, 0.28)",
        glow: "0 8px 24px rgba(192, 170, 120, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
