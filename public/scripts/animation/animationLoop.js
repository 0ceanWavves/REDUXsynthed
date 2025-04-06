import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js'; // Import THREE directly if possible in Astro env
import * as C from '../constants.js';
import { smoothstep } from '../utils/smoothstep.js'; // Assuming smoothstep exists or is created
import { interactionState } from '../controls/interaction.js'; // Assuming controls/interaction exists or is created
import { getSacredGeometryTitle } from '../utils/sacredGeometryLabels.js';
import { applyShapeSpecificStyles } from '../amorphous-prism-init.js';

// Get reference to the content wrapper for position updates
const contentWrapper = document.querySelector('.content-wrapper');

let rafId = null; 
let currentTargetIndex = -1; 
let nextTargetIndex = 0;     
let morphProgress = 0;       
let timeSinceLastMorph = 0;  
let isMorphing = false;      

export function startAnimationLoop({ 
  scene, 
  camera, 
  renderer, 
  mainMesh, 
  wireframeMesh, // <-- Receive wireframe mesh
  backgroundParticles, 
  interactionState,
  updateGalaxyParticles // Galaxy particles update function
}) {
  if (!THREE) throw new Error("THREE not available for animation loop.");

  const morphMesh = mainMesh;
  // --- START: Ensure wireframe also morphs ---
  const wireMorphMesh = wireframeMesh; 
  // --- END: Ensure wireframe also morphs ---
  const numTargets = morphMesh.geometry.morphAttributes.position?.length ?? 0;
  const morphTargetNames = morphMesh.userData?.morphTargetNames || Array.from({length: numTargets}, (_, i) => `Target ${i}`);
  const rotationSlerpFactor = C.ROTATION_LERP_FACTOR;
  const clock = new THREE.Clock();

  // --- Initial Rotation Setup ---
  if (interactionState && morphMesh.quaternion) {
    interactionState.targetRotation.copy(morphMesh.quaternion);
  } else {
    console.warn("InteractionState or mainMesh.quaternion missing for initial rotation setup.");
    if(interactionState) interactionState.targetRotation = new THREE.Quaternion(); 
  }

  function animateScene() {
    rafId = requestAnimationFrame(animateScene);
    const delta = Math.min(clock.getDelta(), C.MAX_DELTA_TIME); 

    // --- Morphing Logic ---
    if (numTargets > 0 && morphMesh.morphTargetInfluences) { 
      timeSinceLastMorph += delta;

      if (isMorphing) {
        morphProgress += delta; 
        const influence = smoothstep(0, 1, morphProgress / C.MORPH_DURATION); 
        
        // Ensure influences array has the correct length
        if (morphMesh.morphTargetInfluences.length !== numTargets) {
          console.warn("Reinitializing morphTargetInfluences array during animation.");
          morphMesh.morphTargetInfluences.length = numTargets; 
          morphMesh.morphTargetInfluences.fill(0); 
        }

        if (currentTargetIndex >= 0 && currentTargetIndex < numTargets) {
          morphMesh.morphTargetInfluences[currentTargetIndex] = 1.0 - influence;
        }
        
        if (nextTargetIndex >= 0 && nextTargetIndex < numTargets) { 
          morphMesh.morphTargetInfluences[nextTargetIndex] = influence;
        }

        // --- START: Sync wireframe morph --- 
        if (wireMorphMesh && wireMorphMesh.morphTargetInfluences) {
          if (wireMorphMesh.morphTargetInfluences.length !== numTargets) {
             wireMorphMesh.morphTargetInfluences.length = numTargets;
             wireMorphMesh.morphTargetInfluences.fill(0);
          }
          if (currentTargetIndex >= 0 && currentTargetIndex < numTargets) {
            wireMorphMesh.morphTargetInfluences[currentTargetIndex] = 1.0 - influence;
          }
          if (nextTargetIndex >= 0 && nextTargetIndex < numTargets) { 
            wireMorphMesh.morphTargetInfluences[nextTargetIndex] = influence;
          }
        }
        // --- END: Sync wireframe morph ---

        if (morphProgress >= C.MORPH_DURATION) {
          // Snap influences
          if (currentTargetIndex >= 0 && currentTargetIndex < numTargets) {
            morphMesh.morphTargetInfluences[currentTargetIndex] = 0;
            // --- START: Sync wireframe snap ---
            if (wireMorphMesh && wireMorphMesh.morphTargetInfluences) {
              wireMorphMesh.morphTargetInfluences[currentTargetIndex] = 0;
            }
            // --- END: Sync wireframe snap ---
          }
          if (nextTargetIndex >= 0 && nextTargetIndex < numTargets) {
            morphMesh.morphTargetInfluences[nextTargetIndex] = 1;
            // --- START: Sync wireframe snap ---
            if (wireMorphMesh && wireMorphMesh.morphTargetInfluences) {
              wireMorphMesh.morphTargetInfluences[nextTargetIndex] = 1;
            }
            // --- END: Sync wireframe snap ---
          }
          
          currentTargetIndex = nextTargetIndex; 
          isMorphing = false;
          morphProgress = 0;
          timeSinceLastMorph = 0; 
          
          // Update the label when shape is fully morphed
          if (currentTargetIndex >= 0 && currentTargetIndex < morphTargetNames.length) {
            const currentShapeName = morphTargetNames[currentTargetIndex];
            // --- DEBUG LOG --- 
            console.log(`[animationLoop] Morph complete. Index: ${currentTargetIndex}, Name from array: "${currentShapeName}". Calling applyShapeSpecificStyles...`);
            // --- END DEBUG LOG ---
            applyShapeSpecificStyles(currentShapeName);
          }
        }
      } else if (timeSinceLastMorph >= C.HOLD_DURATION) {
        isMorphing = true;
        morphProgress = 0;
        
        // Calculate next target index
        if (numTargets > 0) {
          nextTargetIndex = (currentTargetIndex + 1) % numTargets;
        } else {
          nextTargetIndex = 0;
        }
        
        // Log morphing info with sacred geometry element
        const fromShape = currentTargetIndex === -1 ? 'Base' : (morphTargetNames[currentTargetIndex] || `Target ${currentTargetIndex}`);
        const toShape = morphTargetNames[nextTargetIndex] || `Target ${nextTargetIndex}`;
        
        // Use the sacred geometry titles if available
        const fromTitle = currentTargetIndex === -1 ? 'Base' : getSacredGeometryTitle(fromShape);
        const toTitle = getSacredGeometryTitle(toShape);
        
        console.log(`🔄 Morphing from ${fromTitle} to ${toTitle} (src)`);
      }
    } 

    // --- Rotation Logic ---
    if (interactionState && !interactionState.isDragging) {
      // Apply automatic rotation if enabled
      if (interactionState.autoRotate) {
        const autoRotationEuler = new THREE.Euler(C.AUTO_ROTATE_SPEED_X, C.AUTO_ROTATE_SPEED_Y, 0, 'XYZ');
        const autoRotationQuaternion = new THREE.Quaternion().setFromEuler(autoRotationEuler);
        interactionState.targetRotation.multiplyQuaternions(autoRotationQuaternion, interactionState.targetRotation);
        interactionState.targetRotation.normalize();
      }

      // Smoothly interpolate rotation
      if (morphMesh.quaternion) {
        // --- DEBUG LOG --- 
        // if(interactionState.isDragging) { // Log only while dragging to reduce noise
        //     console.log(`Target: ${interactionState.targetRotation.x.toFixed(2)}, ${interactionState.targetRotation.y.toFixed(2)}, ${interactionState.targetRotation.z.toFixed(2)} | Current: ${morphMesh.quaternion.x.toFixed(2)}, ${morphMesh.quaternion.y.toFixed(2)}, ${morphMesh.quaternion.z.toFixed(2)}`);
        // }
        // --- END DEBUG LOG ---
        morphMesh.quaternion.slerp(interactionState.targetRotation, rotationSlerpFactor);
      }
    }

    // --- Particle System Animation ---
    // First try to use enhanced galaxy particles
    if (typeof updateGalaxyParticles === 'function') {
      updateGalaxyParticles(delta);
    }
    // Fall back to simple rotation for backwards compatibility
    else if (backgroundParticles) {
      backgroundParticles.rotation.y += 0.0005;
    }
    
    // --- Update Content Position to Follow 3D Object ---
    if (contentWrapper && morphMesh) {
      // Create a vector at the center of the mesh
      const meshPosition = new THREE.Vector3(0, 0, 0);
      // Apply the mesh's world matrix to get its position in world space
      meshPosition.applyMatrix4(morphMesh.matrixWorld);
      
      // Project the 3D position to 2D screen coordinates
      meshPosition.project(camera);
      
      // Convert to CSS coordinates
      const x = (meshPosition.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(meshPosition.y * 0.5) + 0.5) * window.innerHeight;
      
      // Add a slight offset based on time for a floating effect
      const time = clock.getElapsedTime();
      const offsetX = Math.sin(time * 0.5) * 15;
      const offsetY = Math.cos(time * 0.3) * 10;
      
      // Apply position with transform for smooth animation
      contentWrapper.style.transform = `translate(calc(-50% + ${x - window.innerWidth/2 + offsetX}px), calc(-50% + ${y - window.innerHeight/2 + offsetY}px))`;
      
      // Add a subtle color shift based on position
      const hue = ((time * 10) % 360);
      contentWrapper.style.boxShadow = `0 0 30px rgba(${Math.sin(time) * 50 + 150}, ${Math.cos(time * 0.7) * 50 + 200}, ${Math.sin(time * 0.5) * 50 + 200}, 0.15)`;
    }

    // --- Rendering ---
    renderer.render(scene, camera);
  } 

  // --- Initial State ---
  currentTargetIndex = -1; 
  nextTargetIndex = 0; 
  isMorphing = false;      
  timeSinceLastMorph = 0;  
  
  if (morphMesh.morphTargetInfluences) {
    morphMesh.morphTargetInfluences.fill(0);
    // --- START: Sync wireframe initial state ---
    if (wireMorphMesh && wireMorphMesh.morphTargetInfluences) {
      wireMorphMesh.morphTargetInfluences.fill(0);
    }
    // --- END: Sync wireframe initial state ---
  }

  console.log("▶️ Starting Animation Loop with Sacred Geometry Morphing...");
  animateScene(); 

  return () => {
    console.log("⏹️ Stopping Animation Loop (src)...");
    cancelAnimationFrame(rafId);
    clock.stop(); 
  };
}