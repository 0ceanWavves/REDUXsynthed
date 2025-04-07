import * as C from '../constants.js';

/**
 * Creates a wireframe that follows the main mesh shape precisely during morphing.
 * Enhanced to work with sacred geometry shapes by maintaining a tight fit.
 * 
 * @param {THREE.Scene} scene - The scene to add the wireframe to.
 * @param {THREE.BufferGeometry} geometry - The base geometry to derive wireframe from.
 * @param {THREE.Material} material - The material to use for the wireframe.
 * @param {THREE} THREE - The THREE.js library instance.
 * @param {THREE.Mesh} [baseMesh] - Optional: The base mesh to copy morph target influences from.
 * @returns {THREE.Mesh} The created wireframe mesh.
 */
export function createAndAddWireframe(scene, geometry, material, THREE, baseMesh = null) {
    if (!THREE) throw new Error("THREE instance is required for wireframe creation.");
    if (!scene || !geometry || !material) throw new Error("Scene, geometry, and material are required.");

    // Create a new mesh using the same geometry as the base mesh
    const wireframeMesh = new THREE.Mesh(geometry, material);
    
    // Set the wireframe to be slightly larger than the base mesh
    // Using a tighter scale for sacred geometry to create the "tight fitting outfit" effect
    const scale = 1.002; // Just 0.2% larger for tighter fit
    wireframeMesh.scale.set(scale, scale, scale);
    
    // Ensure wireframe morphs along with the base mesh by sharing influences array
    if (baseMesh && baseMesh.morphTargetInfluences) {
        // Share the morph target influences array (by reference)
        wireframeMesh.morphTargetInfluences = baseMesh.morphTargetInfluences;
        
        // This ensures the wireframe will follow the main mesh exactly during morphing
        console.log("🧬 Sacred geometry wireframe morph targets linked with enhanced tracking (src).");
    }

    scene.add(wireframeMesh);
    console.log("✨ Enhanced sacred geometry wireframe mesh created and added to scene (src).");

    return wireframeMesh;
}