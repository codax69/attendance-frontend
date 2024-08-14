import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000/",
        changeOrigin: true,
      },
      "/macros": {
        target: "https://script.google.com/",
        changeOrigin: true,
      },
      "/geo": {
        target: "http://api.openweathermap.org/",
        changeOrigin: true,
      },
    },
  },
});
