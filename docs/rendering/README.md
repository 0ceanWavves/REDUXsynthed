# Synthed Website Rendering Documentation

This documentation explains how the rendering system works in the Synthed website, including the 3D visualization, content overlay, and interaction systems.

## Documentation Sections

1. [Rendering System Overview](RENDERING-OVERVIEW.md) - High-level overview of the entire rendering system
2. [3D Rendering System](3D-RENDERING-SYSTEM.md) - Details of the Three.js implementation
3. [Content Overlay System](CONTENT-OVERLAY-SYSTEM.md) - How the "CREATE DESIGN BUILD" layer works
4. [Interaction System](INTERACTION-SYSTEM.md) - How user input is handled for 3D object interaction

## Quick Start Guide

### Rendering Architecture

The Synthed website rendering system consists of three main layers:

1. **Base Layer**: Background and page structure
2. **3D Visualization Layer**: Interactive Three.js visualization (AmorphousPrism)
3. **Content Overlay Layer**: Text, buttons, and UI elements

These layers are carefully stacked using z-index CSS properties to ensure proper visibility and interaction.

### Main Components

- **AmorphousPrism**: The main 3D visualization component
- **HeroSection**: Contains both the 3D visualization and content overlay
- **HeroContent**: Contains the "CREATE DESIGN BUILD" text and UI elements

### Key Technologies

- **Three.js**: Powers the 3D visualization
- **WebGL**: Provides hardware-accelerated graphics rendering
- **GLSL Shaders**: Custom shaders for wireframe effects and animation
- **Astro**: Framework providing component structure
- **CSS Z-index Management**: Controls layering of elements

## Code Examples

### 3D Rendering

```javascript
// Creating the renderer with Three.js
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: false
});

// Setting up the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#05030d");

// Creating the camera
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4.2;

// Starting the animation loop
function animate() {
  // Update time uniform for shaders
  material.uniforms.uTime.value = performance.now() * 0.001;
  
  // Render the scene
  renderer.render(scene, camera);
  
  // Continue animation
  requestAnimationFrame(animate);
}
```

### Content Overlay

```astro
<!-- Hero content with "CREATE DESIGN BUILD" -->
<div class="hero-rebuild-text-content">
  <h1 class="hero-rebuild-title">
    <div class="hero-rebuild-title-word-wrapper"><span class="hero-rebuild-title-word">Create</span></div>
    <div class="hero-rebuild-title-word-wrapper"><span class="hero-rebuild-title-word">Design</span></div>
    <div class="hero-rebuild-title-word-wrapper"><span class="hero-rebuild-title-word">Build</span></div>
  </h1>
  <!-- Additional content -->
</div>
```

### User Interaction

```javascript
// Mouse interaction for 3D object rotation
canvas.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', handleMouseUp);

function handleMouseMove(event) {
  if (!isDragging) return;
  
  const deltaX = event.clientX - previousMousePosition.x;
  const deltaY = event.clientY - previousMousePosition.y;
  
  // Apply rotation to the 3D object
  mesh.rotation.y += deltaX * 0.01;
  mesh.rotation.x += deltaY * 0.01;
  
  // Update previous position
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
}
```

## Diagrams

### Component Hierarchy

```
MainLayout.astro
└── HeroSection.astro
    ├── AmorphousPrism.astro (z-index: 5)
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
    └── HeroContent.astro (z-index: 10+)
        ├── CrystalBulletItem.astro
        └── ServiceItems.js
```

### Rendering Layers

```
+----------------------------------+
|           Viewport               |
|                                  |
|  +----------------------------+  |
|  |      Content Overlay      |  |
|  | +------------------------+ |  |
|  | |      CREATE           | |  |
|  | |      DESIGN           | |  |
|  | |      BUILD            | |  |
|  | +------------------------+ |  |
|  | +------------------------+ |  |
|  | |   Transforming ideas   | |  |
|  | |   into Digital Solutions| |  |
|  | +------------------------+ |  |
|  |           z-index: 10+     |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |   3D Visualization Layer   |  |
|  |   (AmorphousPrism)         |  |
|  |                            |  |
|  |                            |  |
|  |                            |  |
|  |           z-index: 5       |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |      Background Layer      |  |
|  |           z-index: 1       |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

## Further Reading

- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [GLSL Shader Reference](https://www.khronos.org/registry/OpenGL-Refpages/gl4/)
- [Astro Documentation](https://docs.astro.build/) 