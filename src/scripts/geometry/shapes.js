import * as THREE from 'three'; // Import directly

/**
 * Sacred Geometry Shape Functions
 * Provides functions to create the platonic solids used in sacred geometry:
 * - Tetrahedron (Fire)
 * - Cube/Hexahedron (Earth)
 * - Octahedron (Air)
 * - Icosahedron (Water)
 * - Dodecahedron (Spirit)
 */

/**
 * Projects a normalized position onto a tetrahedron
 * Component of the shape-shifting module.
 * @param {THREE.Vector3} normalizedPosition - The normalized direction vector
 * @param {number} radius - The radius/size of the tetrahedron
 * @param {THREE} THREEInstance - The THREE.js library instance
 * @returns {THREE.Vector3} The point on the tetrahedron
 */
export function getPointOnTetrahedron(normalizedPosition, radius, THREEInstance) {
  const LocalTHREE = THREEInstance || THREE;
  if (!LocalTHREE) return {x:0, y:0, z:0};
  
  // Tetrahedron vertices (normalized)
  const vertices = [
    new LocalTHREE.Vector3(1, 1, 1),
    new LocalTHREE.Vector3(1, -1, -1),
    new LocalTHREE.Vector3(-1, 1, -1),
    new LocalTHREE.Vector3(-1, -1, 1)
  ];
  
  // Normalize and scale vertices
  vertices.forEach(v => v.normalize().multiplyScalar(radius));
  
  // Define tetrahedron faces as triangles
  const triangles = [
    new LocalTHREE.Triangle(vertices[0], vertices[1], vertices[2]),
    new LocalTHREE.Triangle(vertices[0], vertices[1], vertices[3]),
    new LocalTHREE.Triangle(vertices[0], vertices[2], vertices[3]),
    new LocalTHREE.Triangle(vertices[1], vertices[2], vertices[3])
  ];
  
  return projectToPolyhedron(normalizedPosition, vertices, triangles, radius, LocalTHREE);
}

/**
 * Projects a normalized position onto a cube (hexahedron)
 * Component of the shape-shifting module.
 * @param {THREE.Vector3} normalizedPosition - The normalized direction vector
 * @param {number} size - The size of the cube
 * @param {THREE} THREEInstance - The THREE.js library instance
 * @returns {THREE.Vector3} The point on the cube
 */
export function getPointOnCube(normalizedPosition, size, THREEInstance) {
  const LocalTHREE = THREEInstance || THREE;
  if (!LocalTHREE) return {x:0, y:0, z:0}; 

  // Simple and efficient cube projection
  const absX = Math.abs(normalizedPosition.x);
  const absY = Math.abs(normalizedPosition.y);
  const absZ = Math.abs(normalizedPosition.z);
  const maxAbs = Math.max(absX, absY, absZ);
  
  if (maxAbs === 0) return new LocalTHREE.Vector3(0,0,0);
  
  const scale = (size * 0.5) / maxAbs;
  const posClone = normalizedPosition.clone ? normalizedPosition.clone() : 
                  new LocalTHREE.Vector3(normalizedPosition.x, normalizedPosition.y, normalizedPosition.z);
  
  return posClone.multiplyScalar(scale);
}

/**
 * Projects a normalized position onto an octahedron
 * Component of the shape-shifting module.
 * @param {THREE.Vector3} normalizedPosition - The normalized direction vector
 * @param {number} radius - The radius/size of the octahedron
 * @param {THREE} THREEInstance - The THREE.js library instance
 * @returns {THREE.Vector3} The point on the octahedron
 */
export function getPointOnOctahedron(normalizedPosition, radius, THREEInstance) {
  const LocalTHREE = THREEInstance || THREE;
  if (!LocalTHREE) return {x:0, y:0, z:0};

  // Efficient octahedron projection using L1 norm
  const l1Norm = Math.abs(normalizedPosition.x) + Math.abs(normalizedPosition.y) + Math.abs(normalizedPosition.z);
  
  if (l1Norm === 0) return new LocalTHREE.Vector3(0,0,0);
  
  const scale = radius / l1Norm;
  const posClone = normalizedPosition.clone ? normalizedPosition.clone() : 
                  new LocalTHREE.Vector3(normalizedPosition.x, normalizedPosition.y, normalizedPosition.z);
  
  return posClone.multiplyScalar(scale);
}

/**
 * Projects a normalized position onto an icosahedron
 * Component of the shape-shifting module.
 * @param {THREE.Vector3} normalizedPosition - The normalized direction vector
 * @param {number} radius - The radius/size of the icosahedron
 * @param {THREE} THREEInstance - The THREE.js library instance
 * @returns {THREE.Vector3} The point on the icosahedron
 */
export function getPointOnIcosahedron(normalizedPosition, radius, THREEInstance) {
  const LocalTHREE = THREEInstance || THREE;
  if (!LocalTHREE) return {x:0, y:0, z:0};
  
  // Create a temporary icosahedron to get vertices
  const tempGeo = new LocalTHREE.IcosahedronGeometry(1, 0);
  const vertices = [];
  const triangles = [];
  
  // Extract vertices from geometry
  const positionAttr = tempGeo.getAttribute('position');
  const indices = tempGeo.index;
  
  // Get unique vertices
  for (let i = 0; i < positionAttr.count; i++) {
    const vertex = new LocalTHREE.Vector3();
    vertex.fromBufferAttribute(positionAttr, i);
    // Only add unique vertices (icosahedron has 12 unique vertices)
    if (!vertices.some(v => v.distanceTo(vertex) < 0.0001)) {
      vertices.push(vertex.clone().normalize().multiplyScalar(radius));
    }
    if (vertices.length >= 12) break; // Icosahedron has 12 vertices
  }
  
  // Create triangles from indices
  if (indices) {
    for (let i = 0; i < indices.count; i += 3) {
      const a = vertices[indices.getX(i) % vertices.length];
      const b = vertices[indices.getX(i + 1) % vertices.length];
      const c = vertices[indices.getX(i + 2) % vertices.length];
      
      triangles.push(new LocalTHREE.Triangle(a, b, c));
    }
  }
  
  return projectToPolyhedron(normalizedPosition, vertices, triangles, radius, LocalTHREE);
}

/**
 * Projects a normalized position onto a dodecahedron
 * Component of the shape-shifting module.
 * @param {THREE.Vector3} normalizedPosition - The normalized direction vector
 * @param {number} radius - The radius/size of the dodecahedron
 * @param {THREE} THREEInstance - The THREE.js library instance
 * @returns {THREE.Vector3} The point on the dodecahedron
 */
export function getPointOnDodecahedron(normalizedPosition, radius, THREEInstance) {
  const LocalTHREE = THREEInstance || THREE;
  if (!LocalTHREE) return {x:0, y:0, z:0};
  
  // Create a temporary dodecahedron to get vertices
  const tempGeo = new LocalTHREE.DodecahedronGeometry(1, 0);
  const vertices = [];
  const triangles = [];
  
  // Extract vertices from geometry
  const positionAttr = tempGeo.getAttribute('position');
  const indices = tempGeo.index;
  
  // Get unique vertices (dodecahedron has 20 vertices)
  for (let i = 0; i < positionAttr.count; i++) {
    const vertex = new LocalTHREE.Vector3();
    vertex.fromBufferAttribute(positionAttr, i);
    // Only add unique vertices
    if (!vertices.some(v => v.distanceTo(vertex) < 0.0001)) {
      vertices.push(vertex.clone().normalize().multiplyScalar(radius));
    }
    if (vertices.length >= 20) break;
  }
  
  // Create triangles from indices
  if (indices) {
    for (let i = 0; i < indices.count; i += 3) {
      const a = vertices[indices.getX(i) % vertices.length];
      const b = vertices[indices.getX(i + 1) % vertices.length];
      const c = vertices[indices.getX(i + 2) % vertices.length];
      
      triangles.push(new LocalTHREE.Triangle(a, b, c));
    }
  }
  
  return projectToPolyhedron(normalizedPosition, vertices, triangles, radius, LocalTHREE);
}

/**
 * Helper function to project a point onto a polyhedron defined by vertices and triangles
 * @param {THREE.Vector3} normalizedPosition - The normalized direction vector
 * @param {Array<THREE.Vector3>} vertices - Array of polyhedron vertices
 * @param {Array<THREE.Triangle>} triangles - Array of polyhedron face triangles
 * @param {number} radius - Fallback radius for spherical projection
 * @param {THREE} THREEInstance - The THREE.js library instance
 * @returns {THREE.Vector3} The projected point on the polyhedron
 */
function projectToPolyhedron(normalizedPosition, vertices, triangles, radius, THREEInstance) {
  const LocalTHREE = THREEInstance || THREE;
  
  // Clone the normalized position
  const direction = normalizedPosition.clone ? normalizedPosition.clone() : 
                   new LocalTHREE.Vector3(normalizedPosition.x, normalizedPosition.y, normalizedPosition.z);
  
  direction.normalize();
  
  // Create a ray from the origin in the direction of the normalized position
  const ray = new LocalTHREE.Ray(new LocalTHREE.Vector3(0, 0, 0), direction);
  
  // If no triangles were provided, create them from vertices
  if (!triangles || triangles.length === 0) {
    // If triangles weren't passed, try to find the closest vertices and create triangles
    if (vertices && vertices.length > 0) {
      // Find the closest vertices to the ray direction
      vertices.sort((a, b) => {
        return b.clone().normalize().dot(direction) - a.clone().normalize().dot(direction);
      });
      
      // Use the first vertex (most aligned with direction) and its closest neighbors
      const mainVertex = vertices[0];
      const closestNeighbors = [...vertices];
      closestNeighbors.sort((a, b) => {
        if (a === mainVertex) return -1;
        if (b === mainVertex) return 1;
        return a.distanceTo(mainVertex) - b.distanceTo(mainVertex);
      });
      
      triangles = [];
      
      // Create triangles with the main vertex and pairs of closest neighbors
      for (let i = 1; i < Math.min(closestNeighbors.length - 1, 6); i++) {
        triangles.push(new LocalTHREE.Triangle(
          mainVertex,
          closestNeighbors[i],
          closestNeighbors[i + 1]
        ));
      }
    }
  }
  
  // Check for intersection with any triangle
  const intersectionPoint = new LocalTHREE.Vector3();
  let minDistance = Infinity;
  let closestPoint = null;
  
  if (triangles && triangles.length > 0) {
    for (const triangle of triangles) {
      if (ray.intersectTriangle(triangle.a, triangle.b, triangle.c, false, intersectionPoint)) {
        const distance = intersectionPoint.length();
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = intersectionPoint.clone();
        }
      }
    }
  }
  
  // If no intersection found, fall back to spherical projection
  if (!closestPoint) {
    return direction.multiplyScalar(radius);
  }
  
  return closestPoint;
}

/**
 * Projects a normalized position onto a sphere (fallback)
 * @param {THREE.Vector3} normalizedPosition - The normalized direction vector
 * @param {number} radius - The sphere radius
 * @param {THREE} THREEInstance - The THREE.js library instance
 * @returns {THREE.Vector3} The point on the sphere
 */
export function getPointOnSphere(normalizedPosition, radius, THREEInstance) {
   const LocalTHREE = THREEInstance || THREE;
   if (!LocalTHREE) return {x:0, y:0, z:0};
   
   const posClone = normalizedPosition.clone ? normalizedPosition.clone() : 
                    new LocalTHREE.Vector3(normalizedPosition.x, normalizedPosition.y, normalizedPosition.z);
   
   return posClone.normalize().multiplyScalar(radius);
}