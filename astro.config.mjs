import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://synthed.dev",
  integrations: [tailwind(), icon()],
  output: "static",
  build: {
    format: 'file'
  },
  vite: {
    server: {
      // Ensure proper MIME types are set for JS modules
      fs: {
        strict: true,
      },
      middlewareMode: false,
      hmr: {
        overlay: true
      }
    },
    optimizeDeps: {
      include: ['three', 'simplex-noise'],
      force: true // Force pre-bundling to resolve dependency issues
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true
      },
      // Reduce chunk size for better performance
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three'],
            simplex: ['simplex-noise']
          }
        }
      }
    },
    // Improve error reporting
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  }
});
