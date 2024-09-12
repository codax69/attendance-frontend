import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://attendance-app-1.onrender.com/",
        changeOrigin: true,
        rewrite:(path)=>path.replace(/^\/api/,"/")
      },
      "/macros": {
        target: "https://script.google.com/",
        changeOrigin: true,
        rewrite:(path)=>path.replace(/^\/macros/,"/")

      },
      "/geo": {
        target: "http://api.openweathermap.org/",
        changeOrigin: true,
        rewrite:(path)=>path.replace(/^\/geo/,"")
      },
    },
  },
});