import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/server': 'https://attendance-app-production-ec33.up.railway.app',
      '/sheet': 'https://script.google.com',
    },
  },
});
