import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://attendance-app-t0x1.onrender.com/',
        changeOrigin: true,
      },
      '/macros': {
        target: 'https://script.google.com/',
        changeOrigin: true,
      },
      '/geo': {
        target: 'http://api.openweathermap.org/',
        changeOrigin: true,
      },
    },
  },
});
