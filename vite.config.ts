import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite automatically loads VITE_ prefixed variables from .env.local
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'chem-acknowledge-distribution-zip.trycloudflare.com',
      '.ngrok-free.app',
      'hwy-drew-column-teenage.trycloudflare.com'
    ]
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
