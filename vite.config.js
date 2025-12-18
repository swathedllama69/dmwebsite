// vite.config.js - CORRECTED
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Target should be the BASE of the remote domain (no /api)
        target: 'https://devoltmould.com.ng',
        changeOrigin: true,
        // CRITICAL: We need to tell the proxy that when it sees /api, 
        // it should preserve the path /api/orders.php to match the server structure.
        // If your files are directly inside the /api/ folder on the host, 
        // this rewrite is usually cleaner:
        rewrite: (path) => path, // Keep path as is: /api/orders.php -> https://devoltmould.com.ng/api/orders.php

        // This is necessary because your remote API is using HTTPS but your local dev environment
        // doesn't have the certificate, causing 'Failed to fetch' errors in the console.
        secure: false,
      },
    },
    host: 'localhost',
    port: 5173,
  },
});