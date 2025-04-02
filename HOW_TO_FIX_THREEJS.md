# How to Fix Three.js "Cannot resolve #include <colorspace_fragment>" Error

This guide explains how to fix the Three.js "Cannot resolve #include <colorspace_fragment>" error that's occurring in AmorphousPrism.astro.

## Quick Solution

1. Add one script tag to your HTML **before** any Three.js scripts:

```html
<script src="/js/three-fix-bundle.js"></script>
```

2. For Astro components, add it near the top of the component:

```astro
---
// Your Astro component front matter
---

<!-- Load the Three.js fixes before any Three.js code -->
<script src="/js/three-fix-bundle.js"></script>

<!-- Rest of your component... -->
```

## Implementation in AmorphousPrism.astro

The error is occurring in AmorphousPrism.astro. Here's how to modify it:

1. Add the fix loader at the top of the component:

```astro
---
// src/components/AmorphousPrism.astro
---

<!-- Force-enable WebGL and add proper content type -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

<!-- Add this line to load Three.js fixes -->
<script src="/js/three-fix-bundle.js"></script>

<!-- Rest of your component remains the same -->
```

## What's Included

The fix bundle loads three scripts that work together to solve the issue:

1. **three-error-handler.js**: Catches and fixes Three.js errors at runtime
2. **colorspace-fix.js**: Adds the missing colorspace_fragment shader chunk
3. **shader-material-patch.js**: Patches ShaderMaterial to prevent the error

## Manual Fix for ShaderMaterial

If you have an existing ShaderMaterial in your code that's still causing errors, you can fix it manually:

```javascript
// After creating the material
if (window.fixThreeMaterial) {
  window.fixThreeMaterial(shaderMaterial);
}
```

## Troubleshooting

If you still see the error after implementing these fixes:

1. Make sure `three-fix-bundle.js` is being loaded before Three.js
2. Check the browser console for any other errors
3. If you're creating ShaderMaterials dynamically, use `window.fixThreeMaterial()` on them

## How It Works

The fix works by:

1. Adding the missing shader chunks to THREE.ShaderChunk
2. Patching the ShaderMaterial constructor to automatically fix fragment shaders
3. Intercepting console errors to catch and fix errors at runtime

This approach is compatible with your site's Content Security Policy (CSP) since it doesn't use inline styles or eval().
