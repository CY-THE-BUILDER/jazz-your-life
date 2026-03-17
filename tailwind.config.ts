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
        sand: {
          50: "#fffaf0",
          100: "#fef2d6",
          200: "#f9d8a0",
          300: "#efba6d",
          400: "#d99644",
          500: "#b56e2d"
        },
        ink: "#5a4028",
        accent: "#d4633a"
      },
      fontFamily: {
        sans: ["'PingFang TC'", "'Noto Sans TC'", "'Heiti TC'", "sans-serif"],
        display: ["'Iowan Old Style'", "'Baskerville'", "'Palatino Linotype'", "serif"]
      },
      boxShadow: {
        paper: "0 18px 50px rgba(132, 90, 46, 0.18)",
        cookie: "0 24px 60px rgba(152, 96, 39, 0.26)"
      },
      backgroundImage: {
        paper:
          "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,239,223,0.95)), radial-gradient(circle at top, rgba(212, 175, 121, 0.14), transparent 42%)"
      }
    }
  },
  plugins: []
};

export default config;
