import { type Config } from "prettier";
import defaultTheme from "tailwindcss/defaultTheme"

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "accent-600": "#9d7611",
        "accent-500": "#B48714",
        "accent-400": "#D6B665",
        "accent-300": "#E0C98C",
        primary: "#171717",
        secondary: "#fafafa",
      },
      borderWidth: {
        3: "3px",
      },
      animation: {
        "fade-in-down": "fade-in-down 300ms ease-in forwards",
      },
      keyframes: {
        "fade-in-down": {
          "0%": {
            opacity: 0,
            transform: "translate(0, -10px)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(0, 0px)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
