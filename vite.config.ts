// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: true, // Permet l'accès depuis d'autres machines
    port: 5173
  },
  build: {
    target: 'esnext'
  },
  ssr: {
    noExternal: ['viem']
  }
});