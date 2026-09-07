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
        ink: {
          950: "#0A0A12",
          900: "#0F0F1A",
          800: "#161624",
          700: "#1E1E30",
          600: "#2A2A40",
        },
        mist: {
          400: "#8B8BA3",
          300: "#A7A7C0",
          100: "#EEEEF5",
        },
        violet: {
          DEFAULT: "#6C4CF1",
          light: "#8C6BFF",
        },
        magenta: {
          DEFAULT: "#D946C7",
          light: "#EE7FDB",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      backgroundImage: {
        "tunify-gradient": "linear-gradient(135deg, #6C4CF1 0%, #B34CE0 55%, #D946C7 100%)",
        "tunify-radial": "radial-gradient(circle at 30% 20%, rgba(108,76,241,0.35), transparent 55%)",
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(139, 92, 246, 0.45)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
