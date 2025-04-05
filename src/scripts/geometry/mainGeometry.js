import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js'; // Import directly
import * as C from '../constants.js';
import * as Shapes from './shapes.js';
import { calculateMorphTarget } from './morphTargetCalculator.js';

export function createMorphGeometry(THREEInstance) { // Pass THREE
  const LocalTHREE = THREEInstance || THREE;
  if (!LocalTHREE) throw new Error("THREE not available for geometry creation (src).");

  // --- Base Solid Geometry ---
  const solidGeometry = new LocalTHREE.IcosahedronGeometry(C.BASE_RADIUS, C.BASE_DETAIL);
  solidGeometry.morphAttributes.position = [];

  // --- Define Morph Targets based on Sacred Geometry ---
  // This array configures the available shapes for the morphing effect.
  // Each object defines a target name (used for labels and CSS classes)
  // and a function (from shapes.js) that calculates the vertex positions for that shape.
  const morphTargetDefinitions = [
    // Target 0
    { name: 'Tetrahedron', fn: (normPos) => Shapes.getPointOnTetrahedron(normPos, C.BASE_RADIUS * C.TETRA_SCALE, LocalTHREE) },
    // Target 1
    { name: 'Cube', fn: (normPos) => Shapes.getPointOnCube(normPos, C.BASE_RADIUS * C.CUBE_SCALE, LocalTHREE) },
    // Target 2
    { name: 'Octahedron', fn: (normPos) => Shapes.getPointOnOctahedron(normPos, C.BASE_RADIUS * C.OCTA_SCALE, LocalTHREE) },
    // Target 3
    { name: 'Icosahedron', fn: (normPos) => Shapes.getPointOnIcosahedron(normPos, C.BASE_RADIUS * C.ICOSA_SCALE, LocalTHREE) },
    // Target 4
    { name: 'Dodecahedron', fn: (normPos) => Shapes.getPointOnDodecahedron(normPos, C.BASE_RADIUS * C.DODECA_SCALE, LocalTHREE) },
  ];

  const morphTargetNames = [];
  const basePositions = solidGeometry.attributes.position;

  morphTargetDefinitions.forEach(targetDef => {
    console.log(`Calculating morph target: ${targetDef.name} (src)`);
    morphTargetNames.push(targetDef.name);
    // Pass THREE to calculator
    const targetData = calculateMorphTarget(basePositions, targetDef.fn, LocalTHREE);
    solidGeometry.morphAttributes.position.push(new LocalTHREE.Float32BufferAttribute(targetData, 3));
  });

  // solidGeometry.computeVertexNormals(); // Recompute if lighting looks bad

  console.log(`Created geometry with ${solidGeometry.morphAttributes.position.length} morph targets (src).`);

  return { solidGeometry, morphTargetNames };
}