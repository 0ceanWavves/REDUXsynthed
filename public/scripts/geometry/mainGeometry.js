// public/scripts/geometry/mainGeometry.js
// import * as THREE from 'three'; // Assuming THREE is globally available
import * as C from '../constants.js';
import * as Shapes from './shapes.js';
import { calculateMorphTarget } from './morphTargetCalculator.js';

export function createMorphGeometry() {
  if (!window.THREE) throw new Error("THREE not available for geometry creation.");
  const THREE = window.THREE;

  // --- Base Solid Geometry ---
  const solidGeometry = new THREE.IcosahedronGeometry(C.BASE_RADIUS, C.BASE_DETAIL);
  solidGeometry.morphAttributes.position = []; // Initialize morph targets array

  // --- Define Morph Targets ---
  // Use functions from shapes.js
  const morphTargetDefinitions = [
    { name: 'Cube', fn: (normPos) => Shapes.getPointOnCube(normPos, C.BASE_RADIUS * C.CUBE_SCALE) },
    { name: 'Octahedron', fn: (normPos) => Shapes.getPointOnOctahedron(normPos, C.BASE_RADIUS * C.OCTA_SCALE) },
    { name: 'Dodecahedron', fn: (normPos) => Shapes.getPointOnSphere(normPos, C.BASE_RADIUS * C.DODECA_SCALE) },
    { name: 'Tetrahedron', fn: (normPos) => Shapes.getPointOnTetrahedron(normPos, C.BASE_RADIUS * C.TETRA_SCALE) },
  ];

  const morphTargetNames = [];
  const basePositions = solidGeometry.attributes.position;

  // Calculate and add morph targets
  morphTargetDefinitions.forEach(targetDef => {
    console.log(`Calculating morph target: ${targetDef.name}`);
    morphTargetNames.push(targetDef.name);
    const targetData = calculateMorphTarget(basePositions, targetDef.fn);
    solidGeometry.morphAttributes.position.push(new THREE.BufferAttribute(targetData, 3));
  });

  // Compute vertex normals AFTER adding morph targets maybe? Or does THREE handle this?
  // Let's assume THREE handles normals correctly with morph targets. Recompute if lighting looks bad.
  // solidGeometry.computeVertexNormals();

  console.log(`Created geometry with ${solidGeometry.morphAttributes.position.length} morph targets.`);

  // Return both the geometry and the names array
  return { solidGeometry, morphTargetNames };
} 