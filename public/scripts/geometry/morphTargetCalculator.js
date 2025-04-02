// public/scripts/geometry/morphTargetCalculator.js
// import * as THREE from 'three'; // Assuming THREE is globally available

/**
 * Calculates target vertex positions by projecting base vertices onto a conceptual shape.
 * @param {THREE.BufferAttribute} basePositions - The position attribute of the base geometry.
 * @param {Function} getTargetPointFn - A function(normalizedPositionVec3) that returns the target point Vec3 on the conceptual shape.
 * @returns {Float32Array} - The vertex data for the morph target.
 */
export function calculateMorphTarget(basePositions, getTargetPointFn) {
  if (!window.THREE) throw new Error("THREE not available for morph target calculation.");
  const THREE = window.THREE;

  const targetPositions = new Float32Array(basePositions.count * 3);
  const baseVertex = new THREE.Vector3();
  const normalizedPosition = new THREE.Vector3();

  for (let i = 0; i < basePositions.count; i++) {
    baseVertex.fromBufferAttribute(basePositions, i);
    // Normalize the vertex position to get the direction from the center
    normalizedPosition.copy(baseVertex).normalize();
    // Get the target point on the conceptual shape's surface using the provided function
    const targetPoint = getTargetPointFn(normalizedPosition); // Call the specific shape function
    targetPositions[i * 3] = targetPoint.x;
    targetPositions[i * 3 + 1] = targetPoint.y;
    targetPositions[i * 3 + 2] = targetPoint.z;
  }
  return targetPositions;
} 