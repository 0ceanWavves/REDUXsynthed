// public/scripts/animation/animationLoop.js
// import * as THREE from 'three'; // Assuming THREE is globally available
import * as C from '../constants.js';
import { smoothstep } from '../utils/smoothstep.js';
import { interactionState } from '../controls/interaction.js'; // Import shared state
// import { calculateReactiveRadius } from '../visuals/reactiveShell.js'; // <<< REMOVED IMPORT

let rafId = null; // To store requestAnimationFrame ID for potential cleanup

// --- Module-level state for morphing ---
let currentTargetIndex = -1; // Start at base shape index (-1 means no target active)
let nextTargetIndex = 0;     // The target we are currently moving towards
let morphProgress = 0;       // Progress of the current morph (0 to 1)
let timeSinceLastMorph = 0;  // Time elapsed since the last morph completed
let isMorphing = false;      // Flag indicating if a morph transition is active

// --- REMOVED PARTICLE RADIUS STATE ---
// const isMobile = window.innerWidth < 768;
// const baseAtmosphereRadius = isMobile ? C.PARTICLE_RADIUS_MOBILE : C.PARTICLE_RADIUS_DESKTOP;
// let currentTargetRadius = baseAtmosphereRadius * C.PARTICLE_RADIUS_FACTOR_BASE; // Initialize

// --- REMOVED LERP HELPER ---

// REMOVED particlesData from function signature
export function startAnimationLoop({ scene, camera, renderer, mainMesh, interactionState, THREE }) {
  // Check if THREE is loaded (used directly or via window)
  if (!THREE && !window.THREE) throw new Error("THREE not available for animation loop.");
  THREE = THREE || window.THREE;

  const morphMesh = mainMesh; // Use mainMesh directly
  const numTargets = morphMesh.geometry.morphAttributes.position?.length ?? 0;
  const morphTargetNames = morphMesh.userData.morphTargetNames || []; // Get names if stored in userData
  const rotationSlerpFactor = C.ROTATION_LERP_FACTOR; // Use constant
  const clock = new THREE.Clock(); // Create clock inside the function

  // --- REMOVED PARTICLE SETUP ---
  // const particleGeometry = particlesData.geometry;
  // const particlePositions = particleGeometry.attributes.position; // BufferAttribute
  // const particleInitialRadii = particlesData.initialRadii; // Plain array
  // const particleCount = particlePositions.count;
  // const particleLerpFactor = 0.05; // How fast particles move to target radius (adjust)
  // const isMobile = window.innerWidth < 768;
  // const baseAtmosphereRadius = isMobile ? C.PARTICLE_RADIUS_MOBILE : C.PARTICLE_RADIUS_DESKTOP;
  // let currentTargetShellRadius = baseAtmosphereRadius * C.PARTICLE_RADIUS_FACTOR_BASE; // Global target radius for the shell

  // --- Initial Rotation Setup ---
  interactionState.targetRotation.copy(morphMesh.quaternion);

  // --- REMOVED Temp Vector ---

  function animateScene() {
    rafId = requestAnimationFrame(animateScene);
    const delta = Math.min(clock.getDelta(), C.MAX_DELTA_TIME); // Cap delta time
    // const elapsedTime = clock.getElapsedTime(); // Keep if needed for shaders later

    // --- REMOVED Target Shell Radius Calculation ---

    // --- REMOVED Particle Position Update (JS) --- 
    // for (let i = 0; i < particleCount; i++) { ... }
    // particlePositions.needsUpdate = true; 

    // --- REMOVED Particle Shader Uniform Update ---
    // if (particlesData?.material?.uniforms) { ... }

    // --- Morphing Logic ---
    if (numTargets > 0) { 
        timeSinceLastMorph += delta;

        if (isMorphing) {
            morphProgress += delta; 
            const influence = smoothstep(0, 1, morphProgress / C.MORPH_DURATION); 

            if (!morphMesh.morphTargetInfluences || morphMesh.morphTargetInfluences.length !== numTargets) {
              console.warn("Reinitializing morphTargetInfluences array.");
              morphMesh.morphTargetInfluences = new Array(numTargets).fill(0);
            }

            if (currentTargetIndex >= 0) {
              morphMesh.morphTargetInfluences[currentTargetIndex] = 1.0 - influence;
            }
            morphMesh.morphTargetInfluences[nextTargetIndex] = influence;

            if (morphProgress >= C.MORPH_DURATION) {
              if (currentTargetIndex >= 0) morphMesh.morphTargetInfluences[currentTargetIndex] = 0;
              morphMesh.morphTargetInfluences[nextTargetIndex] = 1;
              currentTargetIndex = nextTargetIndex; 
              isMorphing = false;
              morphProgress = 0;
              timeSinceLastMorph = 0; 
            }
        } else {
            if (timeSinceLastMorph >= C.HOLD_DURATION) {
                isMorphing = true;
                morphProgress = 0;
                nextTargetIndex = (currentTargetIndex + 1) % numTargets;
                const fromShape = currentTargetIndex === -1 ? 'Base' : (morphTargetNames[currentTargetIndex] || `Target ${currentTargetIndex}`);
                const toShape = morphTargetNames[nextTargetIndex] || `Target ${nextTargetIndex}`;
                console.log(`🔄 Morphing from ${fromShape} to ${toShape}`);
            }
        }
    } 

    // Apply automatic rotation if enabled
    if (interactionState.autoRotate && !interactionState.isDragging) {
        const autoRotationEuler = new THREE.Euler(C.ROTATION_SPEED_X, C.ROTATION_SPEED_Y, 0, 'XYZ');
        const autoRotationQuaternion = new THREE.Quaternion().setFromEuler(autoRotationEuler);
        interactionState.targetRotation.multiplyQuaternions(autoRotationQuaternion, interactionState.targetRotation);
        interactionState.targetRotation.normalize();
    }

    // Smoothly interpolate the mesh's ACTUAL rotation towards the TARGET rotation
    morphMesh.quaternion.slerp(interactionState.targetRotation, rotationSlerpFactor);

    // --- Rendering ---
    renderer.render(scene, camera);
  } // End animateScene function

  // --- Initial State before starting loop ---
  currentTargetIndex = -1; 
  nextTargetIndex = 0; // Ensure nextTargetIndex is initialized
  isMorphing = false;      
  timeSinceLastMorph = 0;  
  if (morphMesh.morphTargetInfluences) {
      morphMesh.morphTargetInfluences.fill(0);
  }

  console.log("▶️ Starting Animation Loop...");
  animateScene(); // Start the loop

  // Return a cleanup function to stop the animation
  return () => {
      console.log("⏹️ Stopping Animation Loop...");
      cancelAnimationFrame(rafId);
      clock.stop(); // Stop the clock as well
  };
}

// --- REMOVED Helper Map ---
// const targetRadiusFactors = { ... }; 