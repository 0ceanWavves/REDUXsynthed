// public/scripts/animation/animationLoop.js
// import * as THREE from 'three'; // Assuming THREE is globally available
import * as C from '../constants.js';
import { smoothstep } from '../utils/smoothstep.js';
import { interactionState } from '../controls/interaction.js'; // Import shared state
import { calculateReactiveRadius } from '../visuals/reactiveShell.js'; // <<< NEW IMPORT

let rafId = null; // To store requestAnimationFrame ID for potential cleanup

// --- Module-level state for morphing ---
let currentTargetIndex = -1; // Start at base shape index (-1 means no target active)
let nextTargetIndex = 0;     // The target we are currently moving towards
let morphProgress = 0;       // Progress of the current morph (0 to 1)
let timeSinceLastMorph = 0;  // Time elapsed since the last morph completed
let isMorphing = false;      // Flag indicating if a morph transition is active

// --- NEW: Get base particle radius based on screen size ---
const isMobile = window.innerWidth < 768;
const baseAtmosphereRadius = isMobile ? C.PARTICLE_RADIUS_MOBILE : C.PARTICLE_RADIUS_DESKTOP;
let currentTargetRadius = baseAtmosphereRadius * C.PARTICLE_RADIUS_FACTOR_BASE; // Initialize

export function startAnimationLoop(scene, camera, renderer, morphMesh, morphTargetNames, particlesData, clock) {
  if (!window.THREE) throw new Error("THREE not available for animation loop.");
  const THREE = window.THREE;

  const numTargets = morphMesh.geometry.morphAttributes.position?.length ?? 0;
  const rotationSlerpFactor = 0.1; // Smoothing factor for rotation (0 to 1)

  // Ensure initial rotation state is synced
  interactionState.targetRotation.copy(morphMesh.quaternion);


  function animateScene() {
    rafId = requestAnimationFrame(animateScene); // Store ID for cleanup
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // --- Calculate Reactive Radius --- <<< NEW BLOCK
    if (numTargets > 0 && isMorphing) { // Only calculate when morphing
      currentTargetRadius = calculateReactiveRadius(
        currentTargetIndex,
        nextTargetIndex,
        morphProgress,
        morphTargetNames,
        baseAtmosphereRadius
      );
    } else if (numTargets > 0 && !isMorphing) {
       // When not morphing, ensure radius snaps to the current shape's target radius
       const currentShapeName = currentTargetIndex === -1 ? 'Base' : morphTargetNames[currentTargetIndex];
       const currentFactor = targetRadiusFactors[currentShapeName] ?? C.PARTICLE_RADIUS_FACTOR_BASE; // <<< Needs targetRadiusFactors from reactiveShell.js - REFACTOR NEEDED?
       // --> Let's recalculate instead of importing the map
       currentTargetRadius = calculateReactiveRadius(
           currentTargetIndex, 
           currentTargetIndex === -1 ? 0 : currentTargetIndex, // Morph TO itself when not morphing
           0, // Progress is 0
           morphTargetNames, 
           baseAtmosphereRadius
       );
    }
    // --- END NEW BLOCK ---

    // --- Particle Animation ---
    if (particlesData?.material?.uniforms) {
        particlesData.material.uniforms.uTime.value = elapsedTime; // Use .value
        // --- NEW: Update target radius uniform ---
        if (!particlesData.material.uniforms.uTargetRadius) {
            // Add uniform if it doesn't exist (first frame)
            particlesData.material.uniforms.uTargetRadius = { value: currentTargetRadius };
        } else {
            particlesData.material.uniforms.uTargetRadius.value = currentTargetRadius;
        }
    }

    // --- Morphing Logic ---
    if (numTargets > 0) { // Only run morphing if targets exist
        timeSinceLastMorph += delta;

        if (isMorphing) {
            morphProgress += delta;
            // Calculate influence using smoothstep for easing
            const influence = smoothstep(0, 1, morphProgress / C.MORPH_DURATION);

            // Ensure influences array exists and has the correct length
            if (!morphMesh.morphTargetInfluences || morphMesh.morphTargetInfluences.length !== numTargets) {
              console.warn("Reinitializing morphTargetInfluences array.");
              morphMesh.morphTargetInfluences = new Array(numTargets).fill(0);
            }

            // Apply influences: fade out current, fade in next
            if (currentTargetIndex >= 0) { // Only fade out if coming FROM a target
              morphMesh.morphTargetInfluences[currentTargetIndex] = 1.0 - influence;
            }
            // Always apply influence to the target we are moving towards
            morphMesh.morphTargetInfluences[nextTargetIndex] = influence;


            // Check if morph transition is complete
            if (morphProgress >= C.MORPH_DURATION) {
              // Snap influences to final state
              if (currentTargetIndex >= 0) morphMesh.morphTargetInfluences[currentTargetIndex] = 0;
              morphMesh.morphTargetInfluences[nextTargetIndex] = 1;

              // Update state for next cycle
              currentTargetIndex = nextTargetIndex; // The target we just reached is now current
              isMorphing = false;
              morphProgress = 0;
              timeSinceLastMorph = 0; // Reset hold timer
            }
        } else {
            // Not currently morphing, check if it's time to start the next one
            if (timeSinceLastMorph >= C.HOLD_DURATION) {
                isMorphing = true;
                morphProgress = 0;
                // Cycle to the next target (0 -> 1 -> ... -> N-1 -> 0)
                nextTargetIndex = (currentTargetIndex + 1) % numTargets;

                // Log the transition
                const fromShape = currentTargetIndex === -1 ? 'Base' : morphTargetNames[currentTargetIndex];
                const toShape = morphTargetNames[nextTargetIndex];
                console.log(`🔄 Morphing from ${fromShape} to ${toShape}`);
            }
        }
    } // End if (numTargets > 0)


    // Smoothly interpolate the mesh's ACTUAL rotation towards the TARGET rotation
    morphMesh.quaternion.slerp(interactionState.targetRotation, rotationSlerpFactor);


    // --- Rendering ---
    renderer.render(scene, camera);
  } // End animateScene function

  // --- Initial State before starting loop ---
  currentTargetIndex = -1; // Start at base shape
  isMorphing = false;      // Don't start morphing immediately
  timeSinceLastMorph = 0;  // Start the hold timer immediately
  // Ensure morph influences are zeroed initially
  if (morphMesh.morphTargetInfluences) {
      morphMesh.morphTargetInfluences.fill(0);
  }


  console.log("▶️ Starting Animation Loop...");
  animateScene(); // Start the loop

  // Return a cleanup function to stop the animation
  return () => {
      console.log("⏹️ Stopping Animation Loop...");
      cancelAnimationFrame(rafId);
  };
}

// --- Helper Map (needed if accessing factors directly) ---
// Duplicate this from reactiveShell.js or refactor reactiveShell.js to export it.
// For simplicity here, let's duplicate it (less ideal design-wise).
const targetRadiusFactors = {
    'Base': C.PARTICLE_RADIUS_FACTOR_BASE,
    'Cube': C.PARTICLE_RADIUS_FACTOR_CUBE,
    'Octahedron': C.PARTICLE_RADIUS_FACTOR_OCTA,
    'Dodecahedron': C.PARTICLE_RADIUS_FACTOR_DODECA,
    'Tetrahedron': C.PARTICLE_RADIUS_FACTOR_TETRA,
}; 