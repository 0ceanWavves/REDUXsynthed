import * as THREE from 'three'; // Import directly

/**
 * Calculates target vertex positions by projecting base vertices onto a conceptual shape.
 * @param {THREE.BufferAttribute} basePositions - The position attribute of the base geometry.
 * @param {Function} getTargetPointFn - A function(normalizedPositionVec3, THREE) that returns the target point Vec3.
 * @param {THREE} THREEInstance - The THREE.js library instance.
 * @returns {Float32Array} - The vertex data for the morph target.
 */
export function calculateMorphTarget(basePositions, getTargetPointFn, THREEInstance) {
  const LocalTHREE = THREEInstance || THREE;
  if (!LocalTHREE) throw new Error("THREE not available for morph target calculation (src).");

  const targetPositions = new Float32Array(basePositions.count * 3);
  const baseVertex = new LocalTHREE.Vector3();
  const normalizedPosition = new LocalTHREE.Vector3();

  for (let i = 0; i < basePositions.count; i++) {
    baseVertex.fromBufferAttribute(basePositions, i);
    normalizedPosition.copy(baseVertex).normalize();
    
    // Pass THREE instance to the shape function
    const targetPoint = getTargetPointFn(normalizedPosition, LocalTHREE); 
    
    targetPositions[i * 3] = targetPoint.x;
    targetPositions[i * 3 + 1] = targetPoint.y;
    targetPositions[i * 3 + 2] = targetPoint.z;
  }
  return targetPositions;
} 