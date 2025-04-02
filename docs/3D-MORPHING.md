# 3D Morphing Objects Guide

This document provides information on how to customize the 3D morphing objects in the Synthed.xyz website.

## Overview

The website features a captivating 3D morphing object that transitions between different geometric shapes. This is implemented using Three.js and custom WebGL shaders.

## Key Files

- `src/components/AmorphousPrism.astro`: Main component for the 3D morphing object
- `src/components/three/geometries/PrismGeometries.js`: Contains shape definitions and utility functions
- `src/components/three/shaders/MorphingShaders.js`: Contains WebGL shaders for the morphing effect

## Customizing Shapes

The shapes that the 3D object morphs between are defined in `AmorphousPrism.astro` in the `targetGeometries` array:

```javascript
const targetGeometries = [
    new THREE.SphereGeometry(1.2, 6, 4),         // HexSphere
    new THREE.OctahedronGeometry(1.3, 0),        // Octahedron
    new THREE.DodecahedronGeometry(1.4, 0),      // Dodecahedron
    new THREE.SphereGeometry(1.35, 10, 8),       // DecaSphere
    new THREE.IcosahedronGeometry(1.3, 1)        // Icosahedron
];
const shapeNames = ["HexSphere", "Octahedron", "Dodecahedron", "DecaSphere", "Icosahedron"];
```

### Adding New Shapes

To add a new shape:

1. Add a new geometry to the `targetGeometries` array
2. Add a corresponding name to the `shapeNames` array
3. Make sure to maintain the same array length for both

Example of adding a Torus:

```javascript
const targetGeometries = [
    new THREE.SphereGeometry(1.2, 6, 4),         // HexSphere
    new THREE.OctahedronGeometry(1.3, 0),        // Octahedron
    new THREE.DodecahedronGeometry(1.4, 0),      // Dodecahedron
    new THREE.SphereGeometry(1.35, 10, 8),       // DecaSphere
    new THREE.IcosahedronGeometry(1.3, 1),       // Icosahedron
    new THREE.TorusGeometry(1.0, 0.4, 16, 32)    // Torus
];
const shapeNames = ["HexSphere", "Octahedron", "Dodecahedron", "DecaSphere", "Icosahedron", "Torus"];
```

### Available Three.js Geometries

Three.js provides many built-in geometries you can use:

- `BoxGeometry` - A cube
- `CircleGeometry` - A flat circle
- `ConeGeometry` - A cone
- `CylinderGeometry` - A cylinder
- `DodecahedronGeometry` - A 12-faced polyhedron
- `IcosahedronGeometry` - A 20-faced polyhedron
- `OctahedronGeometry` - An 8-faced polyhedron
- `PlaneGeometry` - A flat plane
- `RingGeometry` - A flat ring
- `SphereGeometry` - A sphere
- `TetrahedronGeometry` - A 4-faced polyhedron
- `TorusGeometry` - A torus (donut shape)
- `TorusKnotGeometry` - A torus knot

## Customizing Colors

The colors used in the morphing effect are defined in the `colors` object:

```javascript
const colors = {
    background: new THREE.Color("#05030d"), // Dark background
    shape1: new THREE.Color("#ff00ff"),     // Magenta / Fuchsia
    shape2: new THREE.Color("#00ffff"),     // Cyan / Aqua
    wireframe: new THREE.Color("#ffffff"),  // White wireframe
    particle1: new THREE.Color("#cc00ff"),  // Purple particle
    particle2: new THREE.Color("#00ccff")   // Blue particle
};
```

To change the colors, modify the hex values in this object.

## Timing and Animation

The morphing animation is controlled by these parameters:

```javascript
const morphInterval = 3000; // 3 seconds per morph
const holdDuration = 1000;  // Hold shape for 1 second before morphing
```

- `morphInterval`: Time in milliseconds for the transition between shapes
- `holdDuration`: Time in milliseconds to hold each shape before starting the next transition

## Interaction Settings

User interaction with the 3D object is controlled by these parameters:

```javascript
const autoRotateSpeed = 0.0015;  // Auto-rotation speed when not interacting
const userRotationSpeed = isMobile ? 0.007 : 0.005;  // Rotation speed from user input
const dampingFactor = 0.94;  // How quickly rotation slows down after interaction
```

Adjust these values to change how the object responds to user interaction.

## Performance Considerations

When adding more complex shapes or increasing geometric detail, consider the impact on performance:

1. Use lower-detail geometries on mobile devices
2. Keep the number of shapes reasonable (5-7 is optimal)
3. For complex custom shapes, consider using lower polygon counts

## Troubleshooting

If shapes don't morph correctly:
- Ensure all geometries have similar vertex counts
- Make sure all geometries are properly centered
- Check console for Three.js errors

For more detailed information about fixing issues, see the main [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) file. 