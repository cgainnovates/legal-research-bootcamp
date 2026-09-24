/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#06101F",
          900: "#0B1C36",
          800: "#122748",
          700: "#1A3560",
          600: "#25467A",
        },
        gold: {
          200: "#F0E2BC",
          300: "#E4CC8A",
          400: "#D4B25B",
          500: "#C9A45B",
          600: "#B08A3D",
        },
        ivory: "#F7F3EA",
        parchment: "#EFE8D8",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 10px 40px -18px rgba(201, 164, 91, 0.45)",
        card: "0 18px 50px -24px rgba(6, 16, 31, 0.45)",
      },
      backgroundImage: {
        "hero-sheen":
          "radial-gradient(ellipse at 20% 0%, rgba(201,164,91,0.18), transparent 50%), radial-gradient(ellipse at 90% 20%, rgba(18,39,72,0.9), transparent 55%)",
      },
    },
  },
  plugins: [],
};
