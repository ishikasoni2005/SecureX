/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      },
      colors: {
        ink: "#07111d",
        mist: "#edf7ff",
        neon: "#54f0c6",
        signal: "#ff6b7d",
        ember: "#ffb95e",
        panel: "#0d1728",
        skygrid: "#87d6ff"
      },
      boxShadow: {
        aura: "0 30px 80px rgba(84, 240, 198, 0.15)",
        alert: "0 30px 80px rgba(255, 107, 125, 0.18)"
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(rgba(135, 214, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(135, 214, 255, 0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};
