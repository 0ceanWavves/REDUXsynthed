# Troubleshooting Guide for Synthed.xyz

This document provides solutions for common issues encountered with the Synthed.xyz website.

## Table of Contents
1. [Content Security Policy (CSP) Issues](#content-security-policy-csp-issues)
2. [Scrolling Problems](#scrolling-problems)
3. [Three.js Rendering Issues](#threejs-rendering-issues)
4. [Build Errors](#build-errors)
5. [Rendering Issues](#rendering-issues)
6. [3D Morphing Object Customization](#3d-morphing-object-customization)
7. [MIME Type and Font Sanitization Issues](#mime-type-and-font-sanitization-issues)

## Content Security Policy (CSP) Issues

### Symptoms
- Console errors about blocked resources
- Missing styles or scripts
- Broken images or fonts

### Solution
Update the CSP meta tag in `src/layouts/MainLayout.astro`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com; connect-src 'self' blob:; worker-src 'self' blob:; frame-src 'self';"
/>
```

This allows:
- External scripts from CDNs
- Inline styles and scripts (needed for component-specific styling)
- Font loading from Google Fonts
- Image loading from various sources

## Scrolling Problems

### Symptoms
- Scrolling behaves erratically on mobile devices
- Page jumps when scrolling past certain sections
- Scroll animations don't work properly

### Solution
Two fixes are required:

1. **Add a scroll event listener fix** in `src/components/CrossBrowserFix.astro`:
   ```javascript
   document.addEventListener('DOMContentLoaded', function() {
     // Passive event listeners for better scroll performance
     document.addEventListener('touchstart', function() {}, { passive: true });
     document.addEventListener('touchmove', function() {}, { passive: true });
   });
   ```

2. **Adjust the scroll behavior CSS** in `src/styles/global.css`:
   ```css
   html {
     scroll-behavior: smooth;
     height: 100%;
     overflow-x: hidden;
   }
   
   @media (prefers-reduced-motion: reduce) {
     html {
       scroll-behavior: auto;
     }
   }
   ```

## Three.js Rendering Issues

### Symptoms
- Console errors like "THREE is not defined"
- 3D objects not rendering
- Black screen where 3D objects should appear
- MIME type errors for module imports

### Solution
Several fixes have been implemented to ensure Three.js loads properly:

1. **Add a Three.js loader script** (`public/js/three-loader.js`):
   ```javascript
   // Ensures Three.js is loaded before component scripts
   (function() {
     if (window.THREE && window.THREE.REVISION) {
       console.log(`THREE.js already loaded, version ${window.THREE.REVISION}`);
       return;
     }
     
     console.log('Initializing THREE.js loader');
     window.__THREE_LOADING = true;
     
     // Load THREE.js from CDN if it's not already loaded
     const script = document.createElement('script');
     script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
     script.async = false;
     document.head.appendChild(script);
   })();
   ```

2. **Add a module path fixer** (`public/js/module-loader.js`):
   ```javascript
   // Fixes import paths to use absolute paths from root
   window.__fixImportPath = function(path) {
     if (path.startsWith('../components/')) {
       return '/components/' + path.substring('../components/'.length);
     }
     // Add more path mappings as needed
     return path;
   };
   
   window.__dynamicImport = function(path) {
     const fixedPath = window.__fixImportPath(path);
     return import(fixedPath);
   };
   ```

3. **Update AmorphousPrism component** to use global THREE variable:
   ```javascript
   // Use global THREE that should be loaded from CDN
   if (!window.THREE) {
     console.error("THREE.js not found in global scope!");
     return;
   }
   
   const THREE = window.THREE;
   console.log("Using global THREE.js, version:", THREE.REVISION);
   ```

4. **Add a fallback rendering mechanism** (`public/js/fallback-morph.js`) that displays a simple wireframe object if the main 3D script fails.

5. **Include all scripts properly** in `MainLayout.astro`:
   ```html
   <!-- Core Libraries -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" defer></script>
   
   <!-- Font Loader -->
   <script src="/font-loader.js" is:inline></script>
   
   <!-- Module Path Fixers -->
   <script src="/js/module-loader.js" defer></script>
   
   <!-- Fallback Scripts -->
   <script src="/js/fallback-morph.js" defer></script>
   ```

## Build Errors

### Symptoms
- Build fails with errors about duplicate variable declarations
- TypeScript errors in component files
- Missing dependencies
- Error: `Rollup failed to resolve import "virtual:astro-icon" from "node_modules/astro-icon/components/Icon.astro"`

### Solution

1. **Fix duplicate variables** in `src/components/three/particles/ParticleSystem.js`:
   ```javascript
   // Change duplicate 'colors' variable name to 'particleColors'
   const particleColors = {
     primary: new THREE.Color(colors.primary.r, colors.primary.g, colors.primary.b),
     secondary: new THREE.Color(colors.secondary.r, colors.secondary.g, colors.secondary.b)
   };
   ```

2. **Create a custom Icon component** to replace astro-icon:
   If you're encountering the `virtual:astro-icon` error during build, create a custom component:
   
   ```javascript
   // src/components/Icon.astro
   ---
   // Simple replacement for astro-icon that doesn't use virtual:astro-icon
   export interface Props {
     name: string;
     class?: string;
     // ... other props
   }
   
   const { name, class: className = '' /* ... other props */ } = Astro.props;
   
   // Extract icon type and name
   const [prefix, iconName] = name.includes(':') ? name.split(':') : ['', name];
   
   // Define your common icons or use a fallback
   const iconPath = /* icon path based on name */;
   ---
   
   <svg
     xmlns="http://www.w3.org/2000/svg"
     class={className}
     /* other attributes */
     set:html={iconPath}
   />
   ```
   
   Then replace imports in your components:
   ```javascript
   // Change from:
   import { Icon } from "astro-icon/components";
   
   // To:
   import Icon from "./Icon.astro";
   ```

3. **Add `is:inline` to scripts loaded from public directory**:
   ```html
   <!-- Before -->
   <script src="/js/script-name.js"></script>
   
   <!-- After -->
   <script is:inline src="/js/script-name.js"></script>
   ```

4. **Ensure all dependencies are installed**:
   ```bash
   npm install three@latest astro@latest
   ```

5. **Clear the cache and rebuild**:
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   npm run build
   ```

## Rendering Issues

### Symptoms
- Elements appearing in wrong positions
- Layout breaking on certain devices
- Z-index conflicts causing elements to appear behind others

### Solution

1. **Add CrossBrowserFix component** to handle browser compatibility issues:
   ```javascript
   // Force GPU acceleration and fix mobile rendering
   document.addEventListener('DOMContentLoaded', function() {
     const canvas = document.getElementById('morphing-poly-canvas');
     if (canvas) {
       canvas.style.transform = 'translateZ(0)';
       canvas.style.willChange = 'transform';
       canvas.style.backfaceVisibility = 'hidden';
     }
   });
   ```

2. **Update CSS for better hardware acceleration**:
   ```css
   canvas {
     transform: translateZ(0);
     will-change: transform;
     backface-visibility: hidden;
     touch-action: none !important;
   }
   ```

3. **Add proper CSS for mobile devices**:
   ```css
   @media (max-width: 768px) {
     canvas {
       touch-action: none !important;
       -webkit-overflow-scrolling: touch;
     }
   }
   ```

## 3D Morphing Object Customization

For detailed instructions on customizing the 3D morphing object, please refer to the [3D-MORPHING.md](./docs/3D-MORPHING.md) documentation file.

Key files for customization:
- `src/components/AmorphousPrism.astro` - Main component
- `src/components/three/config/PrismConfig.js` - Configuration variables
- `src/components/three/geometries/PrismGeometries.js` - Shape definitions
- `src/components/three/shaders/MorphingShaders.js` - Visual effects

## MIME Type and Font Sanitization Issues

### Symptoms
- Console errors about "downloadable font: rejected by sanitizer"
- MIME type mismatch errors for JavaScript files
- "THREE is not defined" errors
- Module loading errors with "disallowed MIME type" messages
- Missing favicon 404 errors

### Solution

1. **Add proper font preloading** in `src/layouts/MainLayout.astro`:
   ```html
   <link rel="preload" href="/fonts/Axiforma-Medium.woff2" as="font" type="font/woff2" crossorigin="anonymous">
   <link rel="preload" href="/fonts/Axiforma-Bold.woff2" as="font" type="font/woff2" crossorigin="anonymous">
   ```

2. **Update the font loader script** (`public/font-loader.js`) to use full URLs including origin:
   ```javascript
   const fontSources = {
     medium: [
       `url(${window.location.origin}/fonts/Axiforma-Medium.woff2) format("woff2")`,
       // ... fallbacks
     ],
     // ... other weights
   };
   ```

3. **Improve THREE.js loading** by adding an inline script to ensure it loads before other scripts:
   ```html
   <script is:inline>
     // Immediately load Three.js to ensure it's available before other scripts
     if (!window.THREE) {
       const script = document.createElement('script');
       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r154/three.min.js';
       script.crossOrigin = 'anonymous';
       script.async = false;
       document.head.appendChild(script);
     }
   </script>
   ```

4. **Fix MIME type issues for JavaScript modules** by creating a module loader script that overrides fetch:
   ```javascript
   // Patch fetch for JS modules on localhost
   const originalFetch = window.fetch;
   window.fetch = function(input, init) {
     // Only modify JS module requests
     if (typeof input === 'string' && input.endsWith('.js')) {
       const modifiedInit = init || {};
       modifiedInit.headers = new Headers(modifiedInit.headers || {});
       modifiedInit.headers.set('Accept', 'application/javascript');
       
       return originalFetch(input, modifiedInit)
         .then(response => {
           // Ensure correct MIME type
           if (response.ok) {
             return new Response(response.body, {
               status: response.status,
               headers: new Headers({
                 'Content-Type': 'application/javascript',
                 ...Object.fromEntries(response.headers.entries())
               })
             });
           }
           return response;
         });
     }
     
     // Pass through other requests
     return originalFetch(input, init);
   };
   ```

5. **Update Astro config** to properly set MIME types in development server:
   ```javascript
   // astro.config.mjs
   plugins: [
     {
       name: 'fix-mime-types',
       configureServer(server) {
         server.middlewares.use((req, res, next) => {
           if (req.url && req.url.endsWith('.js')) {
             res.setHeader('Content-Type', 'application/javascript');
           }
           if (req.url && req.url.endsWith('.woff2')) {
             res.setHeader('Content-Type', 'font/woff2');
           }
           res.setHeader('Access-Control-Allow-Origin', '*');
           next();
         });
       }
     }
   ]
   ```

6. **Add a favicon** to prevent 404 errors:
   ```html
   <!-- In head section -->
   <link rel="icon" type="image/svg+xml" href="/favicon.svg">
   <link rel="icon" type="image/png" href="/favicon.png">
   ```

## Contact for Support

If you continue to experience issues after trying these solutions, please contact the development team via:
- GitHub issues: [File an issue](https://github.com/yourusername/synthedxyz/issues)
- Email: support@synthed.xyz

When reporting issues, please include:
- Browser type and version
- Device type (desktop/mobile)
- Console errors (if any)
- Steps to reproduce the issue 