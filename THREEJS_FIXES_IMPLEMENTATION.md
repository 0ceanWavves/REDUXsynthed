# Three.js Fixes Implementation Guide

This guide explains how to implement the Three.js fixes to resolve the following issues:
- "Cannot resolve #include <colorspace_fragment>" error
- Multiple instances of Three.js being imported
- WebGL compatibility issues in Firefox
- Property deprecation warnings (outputEncoding vs outputColorSpace)

## Quick Start

The simplest implementation requires adding just one script to your HTML before any Three.js code loads:

```html
<!-- Add this to the HEAD section of your HTML BEFORE any Three.js scripts -->
<script src="/three-fix-loader.js"></script>
```

This script will automatically load all the necessary fixes in the correct order.

## Implementation in Astro.js Components

For Astro.js components like `AmorphousPrism.astro`, add the following at the top of your component:

```astro
---
// Add this import at the top of your Astro component
---

<!-- Load Three.js fixes before any Three.js code -->
<script src="/three-fix-loader.js"></script>

<!-- Then use Three.js as you normally would -->
<script>
  // Wait for fixes to load before initializing Three.js
  document.addEventListener('DOMContentLoaded', async () => {
    // Wait for fixes to be ready
    if (window.waitForThreeJsFixes) {
      await window.waitForThreeJsFixes();
    }
    
    // Your existing Three.js initialization code...
  });
</script>
```

## Fixing Existing Three.js Materials

If you have existing materials that are causing shader errors, you can fix them using the provided helper function:

```javascript
// Get an existing material
const material = someExistingShaderMaterial;

// Fix it
if (window.fixThreeShaderColorspace) {
  window.fixThreeShaderColorspace(material);
}
```

## Advanced Manual Implementation

If you need more control, you can manually include the fix scripts in the following order:

1. `/js/three-version-fix.js` - Ensures consistent Three.js version
2. `/js/three-shader-fix-improved.js` - Fixes shader chunk issues
3. `/js/colorspace-fragment-fix.js` - Specifically addresses the colorspace_fragment error
4. `/js/webgl-compatibility-fix.js` - Handles browser compatibility issues
5. `/js/three-instance-manager.js` - Prevents multiple Three.js instances

## Implementation in AmorphousPrism.astro

The component that needs the most attention is `AmorphousPrism.astro`. Here's how to modify it:

1. Update the script imports at the top:

```astro
---
// AmorphousPrism.astro
---

<!-- Force-enable WebGL and add proper content type -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

<!-- Load Three.js fixes before any Three.js code -->
<script src="/three-fix-loader.js"></script>

<!-- Rest of your component remains the same -->
```

2. Modify the Three.js loading section in the script to use the fix helpers:

```javascript
// Wait for fixes before loading Three.js
let THREE;
let createNoise4D;

// Load dependencies with fixes applied
const loadDependencies = async () => {
  try {
    // Wait for fixes to be ready
    if (window.waitForThreeJsFixes) {
      await window.waitForThreeJsFixes();
    }
    
    console.log("Loading dependencies - first attempt...");
    
    // Check if THREE is already properly loaded in window
    if (window.THREE && !window.THREE.__isPlaceholder) {
      console.log("Using existing THREE instance - avoiding duplicate import");
      THREE = window.THREE;
      
      // Just need to load simplex-noise
      try {
        const simplexNoiseModule = await import('https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/dist/esm/simplex-noise.js');
        createNoise4D = simplexNoiseModule.createNoise4D;
        console.log("Simplex noise loaded separately");
      } catch (noiseError) {
        console.warn("Failed to load simplex-noise, using fallback:", noiseError);
        createNoise4D = () => {
          return (x, y, z, w) => Math.sin(x + y + z + w) * 0.5 + 0.5;
        };
      }
      
      isLoading = false;
      return { THREE, createNoise4D };
    }
    
    // Otherwise load everything
    const threeModule = await import('https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js');
    const THREE = threeModule.default || threeModule;
    const simplexNoiseModule = await import('https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/dist/esm/simplex-noise.js');
    const createNoise4D = simplexNoiseModule.createNoise4D;
    
    // Make THREE globally available after loading
    window.THREE = THREE;
    delete window.THREE.__isPlaceholder;
    
    isLoading = false;
    return { THREE, createNoise4D };
  } catch (error) {
    console.error("Error loading dependencies:", error);
    throw error;
  }
};
```

3. Fix shader materials during creation:

```javascript
// In your shader material creation code
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    // Your uniforms
  },
  vertexShader: `
    // Your vertex shader
  `,
  fragmentShader: `
    // Your fragment shader
  `,
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  extensions: {
    derivatives: true
  }
});

// Apply colorspace fix if available
if (window.fixThreeShaderColorspace) {
  window.fixThreeShaderColorspace(shaderMaterial);
}
```

## Testing the Fixes

After implementing the fixes, test your website in different browsers:

1. Chrome - Should work without errors
2. Firefox - Known to have WebGL compatibility issues, should now work properly
3. Safari - Should work without errors

Check the browser console for any remaining errors related to Three.js.

## File Structure Reference

```
public/
  ├── js/
  │   ├── three-version-fix.js        # Ensures consistent Three.js version
  │   ├── three-shader-fix-improved.js # Fixes shader chunk issues
  │   ├── colorspace-fragment-fix.js  # Addresses colorspace_fragment error
  │   ├── webgl-compatibility-fix.js  # Handles browser compatibility 
  │   └── three-instance-manager.js   # Prevents multiple instances
  ├── three-fix-loader.js             # Main loader script
  └── three-fixes-demo.html           # Demo implementation
```

## Troubleshooting

If you still encounter issues after implementing these fixes:

1. Check the browser console for specific error messages
2. Ensure the fix scripts are loaded before any Three.js code
3. Try using `window.fixThreeShaderColorspace()` on any custom shader materials
4. For Firefox-specific issues, ensure the WebGL context is properly initialized

## Credits

These fixes were developed to address specific compatibility issues with Three.js across different versions and browsers. They're designed to be non-invasive and compatible with existing Three.js code.
