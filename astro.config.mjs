import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://synthed.dev",
  integrations: [tailwind(), icon()],
  output: "static",
  build: {
    format: 'file',
    inlineStylesheets: 'auto'
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
      // Enable Vite's built-in Terser minification
      minify: 'terser',
      // Configure Terser options directly
      terserOptions: {
        compress: {
          drop_console: true, // Remove console logs in production
          passes: 2, // Run compression passes twice for potentially smaller output
        },
        mangle: true, // Mangle variable names
        format: {
          comments: false, // Remove comments
        },
      },
      // Enable text compression
      cssCodeSplit: true,
      assetsInlineLimit: 4096
    },
    // Improve error reporting
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  }
});
