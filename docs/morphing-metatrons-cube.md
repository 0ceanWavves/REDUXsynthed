# Morphing Metatron's Cube Wireframe Visualization

This document explains the morphing sacred geometry visualization implemented in the AmorphousPrism component.

## Overview

The system creates a 3D visualization that morphs between different sacred geometry shapes (platonic solids) while maintaining a wireframe outline that precisely follows the morphing. The shapes include:

- Tetrahedron (4 faces)
- Cube (6 faces)
- Octahedron (8 faces)
- Icosahedron (20 faces)
- Dodecahedron (12 faces)

The visualization also applies shape-specific styling to the overlay content, creating a cohesive experience where the UI elements respond to the current shape.

## Key Components

### 1. Geometry Creation (`mainGeometry.js`)

- Creates a base geometry (IcosahedronGeometry) with morph targets for each platonic solid
- Defines the shapes and their scaling factors
- Calculates vertex positions for each shape

```javascript
// Example of morph target definitions
const morphTargetDefinitions = [
  { name: 'Tetrahedron', fn: (normPos) => Shapes.getPointOnTetrahedron(normPos, C.BASE_RADIUS * C.TETRA_SCALE, LocalTHREE) },
  { name: 'Cube', fn: (normPos) => Shapes.getPointOnCube(normPos, C.BASE_RADIUS * C.CUBE_SCALE, LocalTHREE) },
  // ...other shapes
];
```

### 2. Wireframe Creation (`wireframe.js`)

- Creates a wireframe mesh that precisely follows the main mesh
- Uses the same geometry but with a different material
- Shares morph target influences with the main mesh to ensure synchronized morphing

```javascript
// Wireframe creation
const wireframeMesh = new THREE.Mesh(geometry, material);
// Share morph target influences for synchronized morphing
wireframeMesh.morphTargetInfluences = baseMesh.morphTargetInfluences;
```

### 3. Animation Loop (`animationLoop.js`)

- Handles the morphing animation between different shapes
- Smoothly transitions between shapes by adjusting morph target influences
- Updates the overlay styling based on the current shape
- Manages rotation and interaction

```javascript
// Morphing logic
if (isMorphing) {
  morphProgress += delta;
  const influence = smoothstep(0, 1, morphProgress / C.MORPH_DURATION);
  
  // Update influences for main mesh and wireframe
  morphMesh.morphTargetInfluences[currentTargetIndex] = 1.0 - influence;
  morphMesh.morphTargetInfluences[nextTargetIndex] = influence;
  
  // Wireframe follows the same morphing
  wireMorphMesh.morphTargetInfluences[currentTargetIndex] = 1.0 - influence;
  wireMorphMesh.morphTargetInfluences[nextTargetIndex] = influence;
}
```

### 4. Shape-Specific Styling (`AmorphousPrismOverlay.css` and `shape-transition.css`)

- Applies different styles to the overlay content based on the current shape
- Creates subtle animations and transitions for text, buttons, and other UI elements
- Uses CSS classes like `.tetrahedron-shape`, `.cube-shape`, etc.

```css
/* Example of shape-specific styling */
#content-overlay.tetrahedron-shape .title-word {
  color: rgba(255, 100, 100, 0.95);
  text-shadow: 0 0 15px rgba(255, 100, 100, 0.5);
}
```

### 5. Main Initialization (`amorphous-prism-init.js`)

- Orchestrates the creation and setup of all components
- Initializes the scene, camera, and renderer
- Creates the geometry, materials, and meshes
- Sets up interaction and animation

## Debugging Tools

For development and debugging purposes, the following tools are available:

1. **Keyboard Controls**: Press keys 1-5 to manually switch between shapes:
   - 1: Tetrahedron
   - 2: Cube
   - 3: Octahedron
   - 4: Icosahedron
   - 5: Dodecahedron

2. **Scene Exposer**: The THREE.js scene is exposed globally as `window.threeScene` for console debugging.

3. **Shape Style Function**: The `applyShapeSpecificStyles` function is exposed globally for testing different styles.

## Integration with Astro

The AmorphousPrism.astro component integrates this visualization by:

1. Including the necessary script tags
2. Setting up the canvas element with the correct ID
3. Creating the overlay structure with the content elements
4. Adding the CSS for shape-specific styling

## How to Customize

### Adding a New Shape

1. Add a new shape function in `shapes.js`
2. Add the shape to the `morphTargetDefinitions` array in `mainGeometry.js`
3. Add shape-specific styling in `shape-transition.css`
4. Update the `ALL_SHAPE_CLASSES` array in `amorphous-prism-init.js`

### Modifying the Overlay Content

The overlay content can be modified in the AmorphousPrism.astro component. The structure includes:

- Title words
- Tagline
- Service items
- Digital solutions heading
- Call-to-action buttons

Each element will respond to the shape changes based on the CSS classes applied.

### Adjusting Animation Parameters

Animation parameters like morph duration, hold duration, and rotation speed can be adjusted in the `constants.js` file.