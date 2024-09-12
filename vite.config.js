import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000/",
        changeOrigin: true,
        rewrite:(path)=>path.replace(/^\/api/,"/api")
      },
      "/macros": {
        target: "https://script.google.com/",
        changeOrigin: true,
        rewrite:(path)=>path.replace(/^\/macros/,"/macros")

      },
      "/geo": {
        target: "http://api.openweathermap.org/",
        changeOrigin: true,
        rewrite:(path)=>path.replace(/^\/geo/,"")
      },
    },
  },
});