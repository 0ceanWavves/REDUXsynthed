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
      include: ['three', 'simplex-noise']
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true
      }
    }
  }
});
