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
    optimizeDeps: {
      exclude: ['astro-icon']
    },
    // Add alias for Three.js to make imports work correctly
    resolve: {
      alias: {
        'virtual:astro-icon': path.resolve(__dirname, 'src/virtual-astro-icon.js'),
        // Keeping this alias might still be useful if other modules import three,
        // but the primary user (ThreeJsSceneWrapper) shouldn't import it anymore.
        'three': path.resolve(__dirname, 'node_modules/three')
      }
    },
    // Ensure ES modules are properly handled
    ssr: {
      // This might become unnecessary if nothing imports 'three' for SSR anymore,
      // but keeping it is usually safe.
      noExternal: ['three']
    },
    // Merged build configuration
    build: {
      // Improve compatibility
      target: 'es2020',
      // Add correct MIME types for JavaScript modules
      assetsInlineLimit: 0, // Consider if you really need this at 0
      // Set chunk size warning limit
      chunkSizeWarningLimit: 1000, // Set to a higher value in kB
      // Configure Rollup options
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Create a separate chunk for the 'three' package if it's imported elsewhere
            if (id.includes('node_modules/three/')) {
              return 'vendor-three';
            }
            // You could add more rules here for other large libraries if needed
          }
        }
      }
    }
  },
  integrations: [
    tailwind(),
    icon(), // Add the icon integration
    preact() // Add the Preact integration
    // ... other integrations
  ]
});
