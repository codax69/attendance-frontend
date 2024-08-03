import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/att': {
        target: 'https://attendance-app-production-ec33.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/att/, ''),
      },
      '/sheet': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sheet/, ''),
      },
    },
  },
});
