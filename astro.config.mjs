import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from "astro-icon"; // Import the icon integration
import preact from '@astrojs/preact'; // Import the Preact integration
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
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Check if the module ID includes the path for the 'three' package
            if (id.includes('node_modules/three')) {
              // If it does, put it into a chunk named 'three'
              return 'three';
            }
            // Otherwise, let Rollup handle it as usual (implicitly returns undefined)
          }
        }
      }
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
    icon(), // Add the icon integration
    preact() // Add the Preact integration
    // ... other integrations
  ]
});
