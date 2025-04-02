import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from "astro-icon"; // Import the integration
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  // Add MIME type configuration for JavaScript modules
  vite: {
    server: {
      fs: {
        // Allow serving files from the project root
        allow: ['..']
      }
    },
    build: {
      // Improve compatibility
      target: 'es2020',
      // Add correct MIME types for JavaScript modules
      assetsInlineLimit: 0
    },
    optimizeDeps: {
      exclude: ['astro-icon']
    },
    // Add alias for Three.js to make imports work correctly
    resolve: {
      alias: {
        'virtual:astro-icon': path.resolve(__dirname, 'src/virtual-astro-icon.js'),
        'three': path.resolve(__dirname, 'node_modules/three')
      }
    },
    // Ensure ES modules are properly handled
    ssr: {
      noExternal: ['three']
    }
  },
  integrations: [
    tailwind(),
    icon() // Add the integration here
    // ... other integrations
  ]
});
