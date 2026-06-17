import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NVIDIA NIM blocks direct browser calls (no CORS headers). Route requests
// through Vite's server-side proxy instead: the browser hits the same origin
// (/nim/...) and Vite forwards to NVIDIA, where CORS doesn't apply.
const nimProxy = {
  '/nim': {
    target: 'https://integrate.api.nvidia.com',
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => path.replace(/^\/nim/, ''),
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: nimProxy },
  preview: { proxy: nimProxy },
});
