# 3D Rendering System

This document details the Three.js implementation and 3D rendering architecture in the Synthed website.

## Table of Contents

1. [Core Components](#core-components)
2. [Loading and Initialization](#loading-and-initialization)
3. [Geometry Management](#geometry-management)
4. [Materials and Shaders](#materials-and-shaders)
5. [Animation System](#animation-system)
6. [Particle Effects](#particle-effects)
7. [Performance Considerations](#performance-considerations)

## Core Components

The 3D rendering system is built using the following core modules:

### ThreeJSLoader.js

Manages loading the Three.js library with fallbacks:

```javascript
// src/components/three/utils/ThreeJSLoader.js
export async function loadThreeJS() {
  if (threeInstance) {
    return threeInstance;
  }
  
  try {
    // Try loading from node_modules
    const THREE = await import('three');
    // Configure THREE...
    return THREE;
  } catch (localError) {
    // Fallback to CDN
    try {
      const threeModule = await import('https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js');
      // Configure THREE...
      return threeModule;
    } catch (cdnError) {
      // Try unpkg fallback
      // ...
    }
  }
}
```

### RendererManager.js

Creates and configures the Three.js renderer:

```javascript
// src/components/three/renderer/RendererManager.js
export async function createRenderer(options) {
  const { THREE, canvas, isMobile } = options;
  
  // Create scene
  const scene = new THREE.Scene();
  scene.background = colors.background;
  
  // Create clock for smooth animation timing
  const clock = new THREE.Clock();

  // Create camera
  const fov = isMobile ? 60 : 55;
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = isMobile ? 4.8 : 4.2;
  
  // Create renderer with optimal settings for the device
  // ...
}
```

### PrismGeometries.js

Manages the creation and processing of 3D geometries:

```javascript
// src/components/three/geometries/PrismGeometries.js
export function getPrismTargetGeometries(THREE, options) {
  const { radius, depth } = options;
  
  const targetGeometries = [];
  const shapeNames = [];
  
  // Create various target shapes for morphing
  const sphereGeo = new THREE.SphereGeometry(radius, 64, 32);
  targetGeometries.push(processTargetGeometry(sphereGeo));
  shapeNames.push('sphere');
  
  // Additional shapes...
  
  return { targetGeometries, shapeNames };
}
```

### MorphingShaders.js

Provides custom GLSL shaders for the wireframe effect:

```javascript
// src/components/three/shaders/MorphingShaders.js
export function createMorphingShaderMaterial(THREE, options) {
  const { colors, isMobile, wireframeThickness, faceOpacity } = options;
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uColor1: { value: new THREE.Color(colors.shape1) },
      uColor2: { value: new THREE.Color(colors.shape2) },
      uWireframeColor: { value: new THREE.Color(colors.wireframe) },
      uWireframeThickness: { value: wireframeThickness || (isMobile ? 0.018 : 0.012) },
      uFaceOpacity: { value: faceOpacity || 0.65 },
      uMorphInfluence: { value: 0.0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    // Additional configuration...
  });
  
  return material;
}
```

## Loading and Initialization

The initialization flow follows these steps:

1. **Canvas Setup**: The `AmorphousPrism.astro` component creates the canvas element
2. **Script Execution**: The `amorphous-prism-init.js` script handles initialization
3. **Three.js Loading**: Uses `ThreeJSLoader.js` to load the Three.js library
4. **Module Imports**: Dynamically imports all required modules
5. **Renderer Creation**: Sets up the WebGL renderer with the canvas
6. **Scene Setup**: Creates the scene, camera, and adds the 3D objects
7. **Animation Start**: Begins the rendering loop

Key code from `amorphous-prism-init.js`:

```javascript
document.addEventListener('DOMContentLoaded', async function() {
  // First, load THREE.js
  const THREE = await getTHREE();
  if (!THREE) {
    console.error("Failed to load THREE.js, cannot continue");
    return;
  }
  
  // Get reference to the canvas
  const canvas = document.getElementById('morphing-poly-canvas');
  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }
  
  // Dynamically import modules
  const [rendererModule, geometriesModule, /* ... */] = 
    await Promise.all([
      safeImport('/components/three/renderer/RendererManager.js'),
      safeImport('/components/three/geometries/PrismGeometries.js'),
      // Additional modules...
    ]);
  
  // Extract function references and create the scene
  const { createRenderer } = rendererModule;
  // ...
  
  // Start the animation loop
  animate();
});
```

## Geometry Management

The geometry system handles:

1. **Base Geometry**: Creates a cylinder as the starting shape
2. **Morph Targets**: Processes additional geometries for morphing
3. **Barycentric Coordinates**: Adds special coordinates for the wireframe effect

```javascript
// Create base geometry for morphing
const baseGeometry = new THREE.CylinderGeometry(2.2, 2.2, 0.6, 64, 1);
baseGeometry.morphAttributes.position = [];

// Add barycentric coordinates for wireframe effect
addBarycentricCoordinates(baseGeometry, THREE);

// Process target geometries for morphing
targetGeometries.forEach((targetGeo, index) => {
  const morphPositions = new Float32Array(basePositionAttribute.count * 3);
  
  // For each vertex in the base geometry
  for (let i = 0; i < basePositionAttribute.count; i++) {
    // Get vertex position from base geometry
    baseVertex.fromBufferAttribute(basePositionAttribute, i);
    
    // Find closest point on target geometry
    findClosestPoint(baseVertex, targetGeo, targetVertex);
    
    // Store the position difference as morph target
    const offset = i * 3;
    morphPositions[offset] = targetVertex.x - baseVertex.x;
    morphPositions[offset + 1] = targetVertex.y - baseVertex.y;
    morphPositions[offset + 2] = targetVertex.z - baseVertex.z;
  }
  
  // Add as morph target
  baseGeometry.morphAttributes.position[index] = 
    new THREE.BufferAttribute(morphPositions, 3);
});
```

## Materials and Shaders

The material system uses custom GLSL shaders for:

1. **Wireframe Effect**: Using barycentric coordinates to detect edges
2. **Color Gradients**: Blending between primary colors
3. **Animation Effects**: Time-based color and position changes

Key shader code:

```glsl
// Vertex shader (simplified)
attribute vec3 a_barycentric;
uniform float uTime;
uniform float uMorphInfluence;

varying vec3 vBarycentric;
varying float vColorFactor;

void main() {
  vBarycentric = a_barycentric;
  vColorFactor = sin(position.x + uTime * 0.5) * 0.5 + 0.5;
  
  // Calculate position with morph influence
  vec3 transformed = position;
  
  // Apply morphing if available
  #ifdef USE_MORPHTARGETS
  transformed += (morphTarget0 - position) * morphTargetInfluences[0];
  transformed += (morphTarget1 - position) * morphTargetInfluences[1];
  // Additional morph targets...
  #endif
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}

// Fragment shader (simplified)
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uWireframeColor;
uniform float uWireframeThickness;
uniform float uFaceOpacity;

varying vec3 vBarycentric;
varying float vColorFactor;

void main() {
  // Calculate edge factor based on barycentric coordinates
  float minBary = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
  float edge = smoothstep(1.0 - uWireframeThickness, 1.0, minBary);
  
  // Mix face color based on the color factor
  vec3 faceColor = mix(uColor1, uColor2, vColorFactor);
  
  // Mix wireframe and face colors
  vec3 finalColor = mix(faceColor, uWireframeColor, edge);
  
  // Set opacity higher on edges for visible wireframe
  float opacity = uFaceOpacity + edge * (1.0 - uFaceOpacity);
  
  gl_FragColor = vec4(finalColor, opacity);
}
```

## Animation System

The animation system handles:

1. **Animation Loop**: Using requestAnimationFrame for smooth rendering
2. **Morph Transitions**: Animating between different geometric shapes
3. **Rotation**: Based on time or user interaction
4. **Shader Uniforms**: Updating time-based shader parameters

```javascript
// Animation controller
export function createMorphingController({ mesh, config, clock }) {
  let currentIndex = 0;
  let targetIndex = 1;
  let morphProgress = 0;
  let morphSpeed = config.morphSpeed || 0.5;
  
  function update() {
    const delta = clock.getDelta();
    
    // Update morphing progress
    morphProgress += delta * morphSpeed;
    
    if (morphProgress >= 1.0) {
      // Move to next shape
      currentIndex = targetIndex;
      targetIndex = (targetIndex + 1) % mesh.geometry.morphAttributes.position.length;
      morphProgress = 0;
    }
    
    // Set morph influence
    if (mesh.morphTargetInfluences) {
      // Reset all influences
      mesh.morphTargetInfluences.fill(0);
      
      // Set influence for current and target shapes
      mesh.morphTargetInfluences[currentIndex] = 1 - morphProgress;
      mesh.morphTargetInfluences[targetIndex] = morphProgress;
    }
  }
  
  return { update };
}
```

## Particle Effects

The particle system creates ambient particles surrounding the main geometry:

1. **Particle Distribution**: Using a Fibonacci sphere algorithm
2. **Custom Shaders**: For particle movement and appearance
3. **Texture**: Circular gradient texture for realistic particles

```javascript
export function createParticleSystem(THREE, options) {
  const { colors, isMobile, config } = options;
  
  // Create particle material with custom shaders
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(colors.particle1) },
      uColor2: { value: new THREE.Color(colors.particle2) },
      uTexture: { value: createCircleTexture(THREE) }
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  
  // Determine particle count based on device
  const particleCount = isMobile ? 
    config.mobileParticleCount : 
    config.desktopParticleCount;
  
  // Create geometry and positions using Fibonacci sphere distribution
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);
  const angles = new Float32Array(particleCount);
  
  // Generate particle positions using Fibonacci sphere algorithm
  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    const y = (i / (particleCount - 1)) * 2 - 1;
    const radius = Math.sqrt(1 - y * y);
    const theta = PHI * i;
    
    positions[idx] = Math.cos(theta) * radius * config.particleSpreadFactor;
    positions[idx + 1] = y * config.particleSpreadFactor;
    positions[idx + 2] = Math.sin(theta) * radius * config.particleSpreadFactor;
    
    // Random scale for each particle
    scales[i] = Math.random() * config.particleSizeVariation + config.particleSizeBase;
    
    // Random angle for animation
    angles[i] = Math.random() * Math.PI * 2;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
  particleGeometry.setAttribute('angle', new THREE.BufferAttribute(angles, 1));
  
  // Create the particle system
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  
  return particles;
}
```

## Performance Considerations

The system implements various performance optimizations:

1. **Mobile Detection**:
   ```javascript
   const isMobile = window.innerWidth < 768;
   ```

2. **Adaptive Settings**:
   ```javascript
   // Adjust based on device capabilities
   const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
   const antialias = !isMobile;
   renderer.setPixelRatio(pixelRatio);
   ```

3. **Geometry Simplification**:
   ```javascript
   // Use lower detail geometries on mobile
   const detail = isMobile ? 1 : 2;
   const sphereGeo = new THREE.SphereGeometry(radius, 32 * detail, 16 * detail);
   ```

4. **Particle Count Reduction**:
   ```javascript
   const particleCount = isMobile ? 300 : 500;
   ```

5. **Animation Frame Management**:
   ```javascript
   // Cancel animation when not visible
   if (document.hidden) {
     cancelAnimationFrame(animationId);
     animationActive = false;
   } else if (!animationActive) {
     animationId = requestAnimationFrame(animate);
     animationActive = true;
   }
   ```

6. **Error Handling and Fallbacks**:
   ```javascript
   try {
     renderer.render(scene, camera);
   } catch (e) {
     console.error("Render error:", e);
     
     // Switch to fallback material if shader fails
     if (mesh.material.type === "ShaderMaterial") {
       mesh.material = new THREE.MeshBasicMaterial({
         color: colors.shape1,
         wireframe: true,
         transparent: true,
         opacity: 0.8
       });
     }
   }
   ```

These optimizations ensure that the 3D visualization performs well across different devices and browsers while maintaining visual quality. 