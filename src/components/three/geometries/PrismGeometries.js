/**
 * PrismGeometries.js
 * Contains functions for creating and manipulating prism geometries
 */

/**
 * Creates an n-sided 2D polygon shape
 * @param {Object} THREE - The Three.js library instance
 * @param {Number} n - Number of sides
 * @param {Number} radius - Radius of the polygon
 * @returns {THREE.Shape} The created shape
 */
export function createNgonShape(THREE, n, radius) {
  const shape = new THREE.Shape();
  // Calculate vertices for the n-sided polygon
  for (let i = 0; i <= n; i++) { // Loop to n+1 to close the shape
    const angle = (i / n) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      shape.moveTo(x, y); // Start point
    } else {
      shape.lineTo(x, y); // Draw line to next point
    }
  }
  return shape;
}

/**
 * Creates a 3D prism geometry with n-sided polygonal base
 * @param {Object} THREE - The Three.js library instance
 * @param {Number} n - Number of sides for the base
 * @param {Number} radius - Radius of the base
 * @param {Number} depth - Height/depth of the prism
 * @returns {THREE.ExtrudeGeometry} The created 3D prism geometry
 */
export function createPrismGeometry(THREE, n, radius, depth) {
  // Get the 2D base shape
  const shape = createNgonShape(THREE, n, radius);
  
  // Define extrusion settings (no bevel for clean edges)
  const extrudeSettings = {
    steps: 1, // Only one segment along the depth
    depth: depth,
    bevelEnabled: false
  };
  
  // Create the geometry by extruding the shape
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  
  // Center the geometry so it rotates around its middle
  geometry.center(); 
  
  // IMPORTANT: ExtrudeGeometry often needs computed normals for lighting/shading
  geometry.computeVertexNormals(); 
  
  return geometry;
}

/**
 * Gets all target geometries for morphing
 * @param {Object} THREE - The Three.js library instance
 * @param {Object} options - Options including radius and depth
 * @returns {Object} Object containing array of geometries and their names
 */
export function getPrismTargetGeometries(THREE, options = {}) {
  const prismRadius = options.radius || 1.3;
  const prismDepth = options.depth || 0.4;
  
  const targetGeometries = [
    createPrismGeometry(THREE, 6, prismRadius, prismDepth),  // Hexagonal Prism
    createPrismGeometry(THREE, 8, prismRadius, prismDepth),  // Octagonal Prism
    createPrismGeometry(THREE, 10, prismRadius, prismDepth), // Decagonal Prism
    createPrismGeometry(THREE, 12, prismRadius, prismDepth)  // Dodecagonal Prism
  ];
  
  const shapeNames = [
    "Hexagonal Prism (6)", 
    "Octagonal Prism (8)", 
    "Decagonal Prism (10)", 
    "Dodecagonal Prism (12)"
  ];
  
  return { targetGeometries, shapeNames };
}

/**
 * Adds barycentric coordinates to a geometry for wireframe effect
 * @param {THREE.BufferGeometry} geometry - The geometry to add coords to
 * @param {Object} THREE - The Three.js library instance
 */
export function addBarycentricCoordinates(geometry, THREE) {
  const count = geometry.attributes.position.count;
  const barycentric = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const indexInTriangle = i % 3; // 0, 1, or 2

    if (indexInTriangle === 0) { // First vertex of triangle
      barycentric[i3 + 0] = 1.0;
      barycentric[i3 + 1] = 0.0;
      barycentric[i3 + 2] = 0.0;
    } else if (indexInTriangle === 1) { // Second vertex
      barycentric[i3 + 0] = 0.0;
      barycentric[i3 + 1] = 1.0;
      barycentric[i3 + 2] = 0.0;
    } else { // Third vertex
      barycentric[i3 + 0] = 0.0;
      barycentric[i3 + 1] = 0.0;
      barycentric[i3 + 2] = 1.0;
    }
  }
  
  geometry.setAttribute('a_barycentric', new THREE.BufferAttribute(barycentric, 3));
  console.log("Barycentric coordinates added to geometry.");
}
