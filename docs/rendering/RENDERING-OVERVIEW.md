# Synthed Website Rendering System Overview

This document provides a high-level overview of how the rendering system works in the Synthed website.

## Architecture Overview

The Synthed website rendering system is built on a modular architecture with the following key components:

1. **Main 3D Visualization**
   - **AmorphousPrism**: The primary 3D component rendering a morphing geometric shape
   - **ThreeJS Infrastructure**: A collection of modules handling different aspects of 3D rendering
   - **Interaction System**: Handles user input to manipulate the 3D object

2. **Content Overlay**
   - **HeroContent**: Contains the "CREATE DESIGN BUILD" text and other UI elements
   - **Z-index Management**: Ensures proper stacking of 3D and text content
   - **Style Management**: Provides visual effects for better contrast and aesthetics

3. **Component Relationships**
```
MainLayout.astro
└── HeroSection.astro
    ├── AmorphousPrism.astro
    │   ├── LoadingScreen.astro
    │   ├── shader-extension-fix.js
    │   └── amorphous-prism-init.js
    │       ├── ThreeJSLoader.js
    │       ├── PrismConfig.js
    │       ├── RendererManager.js
    │       ├── PrismGeometries.js
    │       ├── MorphingShaders.js
    │       ├── ParticleSystem.js
    │       ├── MorphingController.js
    │       └── InteractionManager.js
    └── HeroContent.astro
        ├── CrystalBulletItem.astro
        └── ServiceItems.js
```

## Key Technologies

- **Three.js**: Powers all 3D visualization
- **WebGL**: Provides the underlying graphics rendering
- **GLSL Shaders**: Custom shaders for wireframe effects and animation
- **Astro**: Framework providing component structure
- **CSS Z-index Management**: Controls layering of elements

## Rendering Layers

The rendering system consists of several layers, stacked using z-index:

1. **Base Layer (z-index: 1)**: Background and general page content
2. **3D Visualization Layer (z-index: 5)**: The AmorphousPrism component
3. **Content Overlay Layer (z-index: 10+)**: Text content and UI elements

## Performance Optimization

Performance is optimized through:

1. **Adaptive Quality**: Device-specific rendering settings
2. **Efficient Animation**: Using requestAnimationFrame for smooth animations
3. **Mobile Detection**: Simplified rendering for mobile devices
4. **Lazy Loading**: Loading 3D resources only when needed

## Browser Compatibility

The system includes compatibility features for:

1. **Firefox**: Special handling for WebGL context
2. **Safari**: Fixes for shader compatibility
3. **Mobile Browsers**: Touch interaction and performance optimizations

## Documentation Guide

For more detailed information about specific aspects of the rendering system, refer to the following documents:

- [3D Rendering System](3D-RENDERING-SYSTEM.md): Details about the Three.js implementation
- [Content Overlay System](CONTENT-OVERLAY-SYSTEM.md): Documentation for the text and UI overlays
- [Interaction System](INTERACTION-SYSTEM.md): User input handling and object manipulation 