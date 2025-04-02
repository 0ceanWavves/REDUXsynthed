// public/scripts/geometry/shapes.js
// import * as THREE from 'three'; // Assuming THREE is globally available

// --- Functions defining the target shapes ---
// These functions take a normalized direction vector and return a point on the shape's surface

export function getPointOnCube(normalizedPosition, size) {
  if (!window.THREE) return {x:0, y:0, z:0}; // Safety check
  const THREE = window.THREE;
  // Find the dominant axis
  const absX = Math.abs(normalizedPosition.x);
  const absY = Math.abs(normalizedPosition.y);
  const absZ = Math.abs(normalizedPosition.z);
  const maxAbs = Math.max(absX, absY, absZ);
  // Avoid division by zero if vector is (0,0,0) - should not happen with normalized
  if (maxAbs === 0) return new THREE.Vector3(0,0,0);
  // Scale the normalized vector so its largest component equals half the cube size
  const scale = (size * 0.5) / maxAbs;
  return normalizedPosition.clone().multiplyScalar(scale);
}

export function getPointOnSphere(normalizedPosition, radius) {
  // For sphere (like Icosahedron/Dodecahedron), just scale normalized vector
  return normalizedPosition.clone().multiplyScalar(radius);
}

export function getPointOnOctahedron(normalizedPosition, radius) {
  // Project onto octahedron surface (L1 norm is constant)
  const l1Norm = Math.abs(normalizedPosition.x) + Math.abs(normalizedPosition.y) + Math.abs(normalizedPosition.z);
   // Avoid division by zero
  if (l1Norm === 0) return new THREE.Vector3(0,0,0);
  const scale = radius / l1Norm;
  return normalizedPosition.clone().multiplyScalar(scale);
}

export function getPointOnTetrahedron(normalizedPosition, radius) {
  // Using sphere projection approximation as defined before
  // console.warn("Tetrahedron morph target is using sphere projection approximation.");
  return getPointOnSphere(normalizedPosition, radius * 0.8); // Scale down slightly
}

// TODO: Add getPointOnStarTetrahedron if needed 