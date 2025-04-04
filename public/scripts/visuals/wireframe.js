import * as C from '../constants.js';

/**
 * Creates EdgesGeometry and LineSegments for a wireframe and adds it to the scene.
 * @param {THREE.Scene} scene - The scene to add the wireframe to.
 * @param {THREE.BufferGeometry} geometry - The base geometry to derive edges from.
 * @param {THREE.Material} material - The material to use for the wireframe lines.
 * @param {THREE} THREE - The THREE.js library instance.
 * @param {THREE.Mesh} [baseMesh] - Optional: The base mesh to copy morph target influences from.
 * @returns {THREE.LineSegments} The created wireframe mesh.
 */
export function createAndAddWireframe(scene, geometry, material, THREE, baseMesh = null) {
    if (!THREE) throw new Error("THREE instance is required for wireframe creation.");
    if (!scene || !geometry || !material) throw new Error("Scene, geometry, and material are required.");

    const edgesGeometry = new THREE.EdgesGeometry(geometry, C.EDGES_THRESHOLD);
    const wireframeMesh = new THREE.LineSegments(edgesGeometry, material);

    // Ensure wireframe morphs along with the base mesh if morph targets exist
    if (baseMesh && baseMesh.morphTargetInfluences && baseMesh.morphTargetDictionary) {
        wireframeMesh.morphTargetInfluences = baseMesh.morphTargetInfluences;
        wireframeMesh.morphTargetDictionary = baseMesh.morphTargetDictionary;
        console.log("🧬 Wireframe morph targets linked.");
    }

    scene.add(wireframeMesh);
    console.log("✨ Wireframe mesh created and added to scene.");

    return wireframeMesh;
} 