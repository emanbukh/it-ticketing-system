import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        navy: "#173a63",
        steel: "#4f6b8a",
        mist: "#e8eef5",
        skyline: "#dbeafe",
        success: "#15803d",
        warning: "#d97706",
      },
      boxShadow: {
        soft: "0 20px 45px -24px rgba(15, 23, 42, 0.35)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 32%), radial-gradient(circle at left, rgba(14,165,233,0.16), transparent 25%), linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,247,251,0.96))",
      },
    },
  },
  plugins: [],
};

export default config;
