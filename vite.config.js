import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/server': {
        target: 'https://attendance-app-t0x1.onrender.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/server/, ''),
      },
      '/sheet': {
        target: 'https://script.google.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sheet/, ''),
      },
    },
  },
});
