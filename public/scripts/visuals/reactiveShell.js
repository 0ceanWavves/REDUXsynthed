// public/scripts/visuals/reactiveShell.js

import * as C from '../constants.js';
import { smoothstep } from '../utils/smoothstep.js';

// Map morph target names (from mainGeometry.js) to their radius factors
const targetRadiusFactors = {
    'Base': C.PARTICLE_RADIUS_FACTOR_BASE, // Add Base for initial state
    'Cube': C.PARTICLE_RADIUS_FACTOR_CUBE,
    'Octahedron': C.PARTICLE_RADIUS_FACTOR_OCTA,
    'Dodecahedron': C.PARTICLE_RADIUS_FACTOR_DODECA,
    'Tetrahedron': C.PARTICLE_RADIUS_FACTOR_TETRA,
};

/**
 * Calculates the target radius for the particle shell based on the current morph state.
 *
 * @param {number} currentTargetIndex - Index of the shape we are morphing FROM (-1 for base).
 * @param {number} nextTargetIndex - Index of the shape we are morphing TO.
 * @param {number} morphProgress - Current progress of the morph animation (0 to MORPH_DURATION).
 * @param {string[]} morphTargetNames - Array of names for the morph targets.
 * @param {number} baseAtmosphereRadius - The base radius defined for desktop/mobile.
 * @returns {number} The calculated target radius for the particle shell.
 */
export function calculateReactiveRadius(currentTargetIndex, nextTargetIndex, morphProgress, morphTargetNames, baseAtmosphereRadius) {
    // Determine the names of the 'from' and 'to' shapes
    const fromShapeName = currentTargetIndex === -1 ? 'Base' : morphTargetNames[currentTargetIndex];
    const toShapeName = morphTargetNames[nextTargetIndex]; // Assumes nextTargetIndex is always valid when morphing

    // Get the radius factors for the from/to shapes (default to base factor if name not found)
    const fromFactor = targetRadiusFactors[fromShapeName] ?? C.PARTICLE_RADIUS_FACTOR_BASE;
    const toFactor = targetRadiusFactors[toShapeName] ?? C.PARTICLE_RADIUS_FACTOR_BASE;

    // Calculate the radius for the 'from' and 'to' states
    const fromRadius = baseAtmosphereRadius * fromFactor;
    const toRadius = baseAtmosphereRadius * toFactor;

    // Calculate the interpolation amount using smoothstep for easing
    const t = smoothstep(0, 1, morphProgress / C.MORPH_DURATION);

    // Interpolate between the 'from' and 'to' radii
    const targetRadius = fromRadius + (toRadius - fromRadius) * t;

    return targetRadius;
} 