import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['virtual:astro-icon']
    }
  },
  optimizeDeps: {
    exclude: ['astro-icon']
  }
});
