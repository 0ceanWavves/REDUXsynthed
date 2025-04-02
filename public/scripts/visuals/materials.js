// public/scripts/visuals/materials.js
// import * as THREE from 'three'; // Assuming THREE is globally available
import * as C from '../constants.js';

export function createMaterials() {
  if (!window.THREE) throw new Error("THREE not available for material creation.");
  const THREE = window.THREE;

  // Solid Material (using Phong for sharp look)
  const solidMaterial = new THREE.MeshPhongMaterial({
      color: C.SOLID_COLOR,
      specular: C.SOLID_SPECULAR,
      shininess: C.SOLID_SHININESS,
      transparent: true,
      opacity: C.SOLID_OPACITY,
      morphTargets: true // IMPORTANT: Enable morph targets on the material
   });

   // Wireframe Material
   const edgesMaterial = new THREE.LineBasicMaterial({
      color: C.WIREFRAME_COLOR,
      linewidth: C.WIREFRAME_LINEWIDTH, // Note: linewidth > 1 might not render consistently
      transparent: true,
      opacity: C.WIREFRAME_OPACITY
   });

   console.log("🎨 Materials created");
   return { solidMaterial, edgesMaterial };
} 