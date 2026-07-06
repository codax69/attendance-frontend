import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    proxy: {
      "/api": {
        target: "https://att-web.vegbazar.store/",
      },
      "/macros": {
        target: "https://script.google.com/",
        changeOrigin: true,
      },
      "/geo": {
        target: "https://api.openweathermap.org/",
        changeOrigin: true,
      },
    },
  },
});