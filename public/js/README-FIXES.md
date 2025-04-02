# Three.js Integration Fixes

This document explains all the fixes implemented to resolve various Three.js issues in the project.

## Issues Fixed

1. **THREE is not defined & Multiple instances of Three.js**
   - Problem: Mixing old and new ways of importing Three.js, causing global THREE variable to be undefined or duplicate instances
   - Solution: Standardized on ES Module imports via npm package

2. **Shader Extension Directive Errors**
   - Problem: "#extension directive must occur before any non-preprocessor tokens" error
   - Solution: Created a patch to move extension directives to the top of shaders

3. **Missing colorspace_fragment shader chunk**
   - Problem: Some environments missing this essential shader chunk
   - Solution: Added the missing chunk via a fixes bundle

4. **"will-change memory consumption is too high"**
   - Problem: Too many elements with permanent will-change properties
   - Solution: Dynamic application of will-change only during interactions

5. **#cursor-glow element not found**
   - Problem: Missing DOM element referenced by scripts
   - Solution: Added the missing element to the DOM

## Fix Files

### 1. `three-fix-bundle.js`
The main fixes bundle that:
- Adds missing shader chunks
- Provides Firefox WebGL compatibility
- Sets up error handling for WebGL

### 2. `shader-extension-fix.js`
Specific fix for shader extension directives:
- Moves all #extension directives to the top of shaders
- Works for both ShaderMaterial and RawShaderMaterial
- Provides a global `fixShaderExtensions()` helper function

### 3. `optimize-will-change.js`
Performance optimization for will-change CSS property:
- Dynamically applies will-change only during interactions
- Reduces GPU memory consumption
- Implements best practices for the property

## Implementation Details

### Three.js Import Strategy
We now use ES Modules for Three.js imports:
```js
import * as THREE from 'three';
```

The `amorphous-prism-init.js` file now loads Three.js as a module and makes it available to components that need it.

### Shader Fix Implementation
The shader extension fix works by:
1. Intercepting the shader compilation process
2. Extracting all #extension directives
3. Moving them to the top of the shader code
4. Re-applying them in the correct order

### Will-change Optimization
Rather than permanently applying will-change, we:
1. Store the original will-change value
2. Set will-change to 'auto' by default
3. Apply the original value during interactions (mouse/touch)
4. Reset to 'auto' when interactions end

## Usage Guidelines

### For Custom Shaders
If you create custom shaders, ensure extension directives are at the top or use our helper function:
```js
// After creating a shader material
if (window.fixShaderExtensions) {
  window.fixShaderExtensions(myShaderMaterial);
}
```

### For Three.js Imports
Always use ES Module imports:
```js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
```

Never use script tags to load Three.js.

### For Will-change Properties
Don't add will-change directly to elements. Instead:
1. Use our optimizer script
2. Or apply will-change only during animations/interactions
3. Remove will-change when not needed

## Further Improvements

Potential future improvements include:
- Full Three.js codebase audit to ensure consistent import patterns
- Bundler configuration to automatically deduplicate Three.js imports
- Performance monitoring to verify will-change optimization 