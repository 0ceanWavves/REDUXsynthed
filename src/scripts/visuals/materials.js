import * as C from '../constants.js';

/**
 * Creates materials for the sacred geometry visualization.
 * @param {THREE} THREE - The THREE.js library instance.
 * @returns {Object} Object containing the created materials.
 */
export function createMaterials(THREE) {
  if (!THREE) throw new Error("THREE instance is required for material creation.");
  // --- DEBUG LOG: Check THREE instance and prototype ---
  console.log(`[materials] Creating materials. THREE version: ${THREE.REVISION}`);
  console.log(`[materials] MeshStandardMaterial prototype has morphTargets? ${Object.prototype.hasOwnProperty.call(THREE.MeshStandardMaterial.prototype, 'morphTargets')}`);
  console.log(`[materials] MeshBasicMaterial prototype has morphTargets? ${Object.prototype.hasOwnProperty.call(THREE.MeshBasicMaterial.prototype, 'morphTargets')}`);
  // --- END DEBUG LOG ---

  // Solid Material - Enhanced for sacred geometry visualization
  const solidMaterial = new THREE.MeshStandardMaterial({
      color: C.SOLID_COLOR,
      metalness: C.SOLID_METALNESS,
      roughness: C.SOLID_ROUGHNESS,
      transparent: true,
      opacity: C.SOLID_OPACITY,
      morphTargets: true,
      side: THREE.DoubleSide, // Show both sides for better visibility
      flatShading: false // Use smooth shading for more elegant look
   });
   solidMaterial.morphTargets = true; // Explicitly set after creation
   // --- DEBUG LOG: Check instance property ---
   console.log(`[materials] solidMaterial created. Instance has morphTargets? ${solidMaterial.morphTargets}`);
   // --- END DEBUG LOG ---

   // Wireframe Material - Enhanced for sacred geometry visualization
   const edgesMaterial = new THREE.MeshBasicMaterial({
      color: C.WIREFRAME_COLOR,
      wireframe: true,
      wireframeLinewidth: C.WIREFRAME_LINEWIDTH,
      transparent: true,
      opacity: C.WIREFRAME_OPACITY,
      morphTargets: true, // Enable morph targets for the wireframe
      depthTest: true,
      depthWrite: false, // Prevent z-fighting with main mesh
      side: THREE.FrontSide
   });
   edgesMaterial.morphTargets = true; // Explicitly set after creation
   // --- DEBUG LOG: Check instance property ---
   console.log(`[materials] edgesMaterial created. Instance has morphTargets? ${edgesMaterial.morphTargets}`);
   // --- END DEBUG LOG ---

   // Particle Material (for galaxy particles)
   const particleColor1 = typeof C.PARTICLE_COLOR_1 === 'string' ? new THREE.Color(C.PARTICLE_COLOR_1) : C.PARTICLE_COLOR_1;
   const particleColor2 = typeof C.PARTICLE_COLOR_2 === 'string' ? new THREE.Color(C.PARTICLE_COLOR_2) : C.PARTICLE_COLOR_2;

   const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uColor1: { value: particleColor1 },
            uColor2: { value: particleColor2 },
            uSizeMin: { value: C.PARTICLE_SIZE_MIN_DESKTOP },
            uSizeMax: { value: C.PARTICLE_SIZE_MAX_DESKTOP },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

   console.log("🎨 Sacred geometry materials created with enhanced wireframe (src)");
   
   return { solidMaterial, edgesMaterial, particleMaterial }; 
}