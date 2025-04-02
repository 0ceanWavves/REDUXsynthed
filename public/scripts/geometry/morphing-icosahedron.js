/**
 * Morphing Icosahedron Module (using Morph Targets)
 *
 * Creates an Icosahedron mesh that morphs between its base shape
 * and pre-calculated "spiky" and "smoothed" target shapes using
 * THREE.MorphTargetInfluences.
 */

/**
 * Creates the morphing Icosahedron mesh.
 * @param {Object} THREE - The Three.js instance.
 * @param {Object} options - Configuration options.
 * @returns {Object} Contains the Three.js Mesh object and an update function.
 */
export function createMorphingIcosahedron(THREE, options = {}) {
  // --- Configuration ---
  const config = {
    size: options.size || 1.5,
    transitionDuration: options.transitionDuration !== undefined ? options.transitionDuration : 2.0, // Seconds to morph TO a target
    delayBetweenTargets: options.delayBetweenTargets !== undefined ? options.delayBetweenTargets : 1.5, // Seconds to pause at base/target shape
    spikeFactor: options.spikeFactor !== undefined ? options.spikeFactor : 0.4, // How much to push vertices out for 'spiky'
    smoothFactor: options.smoothFactor !== undefined ? options.smoothFactor : 0.7, // How much to scale down for 'smoothed'
    color: options.color || 0x06b6d4, // Cyan base
    metalness: options.metalness !== undefined ? options.metalness : 0.6,
    roughness: options.roughness !== undefined ? options.roughness : 0.5,
  };

  // --- State Variables for Animation ---
  const numTargets = 2; // Spiky, Smoothed
  let currentTargetIndex = 0; // 0 for spiky, 1 for smoothed
  let morphProgress = 0; // 0.0 (base shape) to 1.0 (full target influence)
  let morphDirection = 0; // 1 = morphing to target, -1 = morphing back to base, 0 = paused
  let timeSinceLastAction = 0; // Timer for delays

  // --- Base Geometry ---
  // Detail level 0 gives exactly 12 vertices, perfect for morph targets
  const baseGeometry = new THREE.IcosahedronGeometry(config.size, 0);
  baseGeometry.computeVertexNormals(); // Ensure normals are calculated

  // --- Create Morph Target Positions ---
  const basePositions = baseGeometry.attributes.position;
  const vertexCount = basePositions.count;

  // Arrays to hold the calculated positions for each target shape
  const spikyTargetPositions = new Float32Array(vertexCount * 3);
  const smoothedTargetPositions = new Float32Array(vertexCount * 3);

  const baseVertex = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < vertexCount; i++) {
    // Get base vertex position
    baseVertex.fromBufferAttribute(basePositions, i);

    // Get normal (for Icosahedron centered at origin, normal is approx. vertex position normalized)
    // Using pre-computed normals is more accurate if available, but this works well here.
    normal.copy(baseVertex).normalize();

    // Calculate Spiky Target position: Move vertex outwards along its normal
    const spikyVertex = baseVertex.clone().addScaledVector(normal, config.size * config.spikeFactor);
    spikyVertex.toArray(spikyTargetPositions, i * 3);

    // Calculate Smoothed Target position: Scale vertex position towards the origin
    const smoothedVertex = baseVertex.clone().multiplyScalar(config.smoothFactor);
    smoothedVertex.toArray(smoothedTargetPositions, i * 3);
  }

  // --- Create BufferAttributes for Morph Targets ---
  const spikyAttribute = new THREE.BufferAttribute(spikyTargetPositions, 3);
  const smoothedAttribute = new THREE.BufferAttribute(smoothedTargetPositions, 3);

  // --- Assign Morph Attributes to Geometry ---
  // The order in this array MUST match the order in mesh.morphTargetInfluences
  baseGeometry.morphAttributes.position = [spikyAttribute, smoothedAttribute];

  // --- Material ---
  const material = new THREE.MeshStandardMaterial({
    color: config.color,
    metalness: config.metalness,
    roughness: config.roughness,
    flatShading: false, // Smooth shading looks better with morphing
    // Side note: Morphing vertex positions often requires morphing normals too
    // for accurate lighting. Three.js tries to handle this automatically with
    // geometry.computeMorphNormals(), but for complex morphs, custom normal targets are better.
    // For this example, the automatic handling should be acceptable.
  });

   // --- Mesh ---
  const mesh = new THREE.Mesh(baseGeometry, material);
  mesh.name = "MorphingIcosahedron"; // Optional: Give it a name

  // --- Initialize Morph Influences ---
  // One influence value for each morph target attribute we added.
  // All start at 0 (meaning the base shape is initially shown).
  mesh.morphTargetInfluences = [0, 0]; // [influence of spiky, influence of smoothed]

  // IMPORTANT: Tell the mesh to update its morph targets based on the geometry
  mesh.updateMorphTargets();
  baseGeometry.computeMorphNormals(); // Compute normals based on morph targets for better lighting


  // --- Update Function (Animation Logic) ---
  const update = (deltaTime) => {
    timeSinceLastAction += deltaTime;

    if (morphDirection === 0) { // Currently paused (at base or target)
      // Check if delay has passed
      if (timeSinceLastAction >= config.delayBetweenTargets) {
        if (morphProgress <= 0) { // Was paused at base shape
           morphDirection = 1; // Start morphing TO currentTargetIndex
           //console.log(`Morphing to target ${currentTargetIndex}`);
        } else { // Was paused at target shape
           morphDirection = -1; // Start morphing BACK to base
           //console.log(`Morphing back from target ${currentTargetIndex}`);
        }
        timeSinceLastAction = 0; // Reset timer for the transition itself
      }
    } else if (morphDirection === 1) { // Morphing TO target
      morphProgress += deltaTime / config.transitionDuration;
      if (morphProgress >= 1.0) {
        morphProgress = 1.0; // Clamp
        morphDirection = 0; // Pause at target
        timeSinceLastAction = 0; // Reset timer for delay AT target
        //console.log(`Reached target ${currentTargetIndex}`);
      }
      // Set the influence for the CURRENT target, others remain 0
      mesh.morphTargetInfluences[currentTargetIndex] = morphProgress;

    } else if (morphDirection === -1) { // Morphing BACK to base
      morphProgress -= deltaTime / config.transitionDuration;
      if (morphProgress <= 0.0) {
        morphProgress = 0.0; // Clamp
        morphDirection = 0; // Pause at base
        timeSinceLastAction = 0; // Reset timer for delay AT base
        // Finished morphing back, switch to the NEXT target for the next cycle
        currentTargetIndex = (currentTargetIndex + 1) % numTargets;
        //console.log(`Reached base. Next target: ${currentTargetIndex}`);
      }
      // Set the influence for the CURRENT target
      mesh.morphTargetInfluences[currentTargetIndex] = morphProgress;
    }

    // Optional: Base rotation if not using OrbitControls auto-rotate
    // mesh.rotation.x += 0.001;
    // mesh.rotation.y += 0.002;
  };

  return {
    mesh: mesh, // Return the single mesh
    update: update
  };
}

export default createMorphingIcosahedron; 