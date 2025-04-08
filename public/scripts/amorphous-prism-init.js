/**
 * Amorphous Prism Initialization - Sacred Geometry Edition
 * Orchestrates the creation and animation of sacred geometry platonic solids
 * with morphing between different shapes - Tetrahedron, Cube, Octahedron, Icosahedron, and Dodecahedron
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js'; // Import THREE from CDN
import { fallbackCheck } from './utils/fallback.js';
import { setupSceneAndCamera } from './core/sceneSetup.js';

// Import geometry and visual components
import { createMorphGeometry } from './geometry/mainGeometry.js';
import { createMaterials } from './visuals/materials.js';
import { createGalaxyParticles } from './visuals/enhancedParticles.js';
import { createAndAddWireframe } from './visuals/wireframe.js'; 

// Import controls and animation
import { setupOverlayInteractionListeners, interactionState } from './controls/interaction.js';
import { startAnimationLoop } from './animation/animationLoop.js';

// Import sacred geometry element information
import { getSacredGeometryTitle } from './utils/sacredGeometryLabels.js';

// Import constants
import * as C from './constants.js';

// --- START: New Overlay Management Function ---
// Get a reference to the overlay element ONCE
const contentOverlay = document.getElementById('content-overlay');

// Define all possible shape classes based on your morphTargetNames
const ALL_SHAPE_CLASSES = [
    'tetrahedron-shape',
    'cube-shape',
    'octahedron-shape',
    'icosahedron-shape',
    'dodecahedron-shape'
    // Add any other shape names (lowercase) + "-shape"
];

// Function to apply the correct class based on the shape name
export function applyShapeSpecificStyles(shapeName) {
  // --- DEBUG LOG --- 
  console.log(`applyShapeSpecificStyles called with shapeName: "${shapeName}" (Type: ${typeof shapeName})`);
  // --- END DEBUG LOG ---
  
  if (!contentOverlay) {
    console.warn("Content overlay element not found for style update.");
    return;
  }

  // Convert shapeName (e.g., "Tetrahedron") to class name (e.g., "tetrahedron-shape")
  const shapeClassName = shapeName ? `${shapeName.toLowerCase()}-shape` : '';

  // Remove any existing shape classes efficiently
  contentOverlay.classList.remove(...ALL_SHAPE_CLASSES);

  // Add the new class if shapeClassName is valid and exists in our list
  if (shapeClassName && ALL_SHAPE_CLASSES.includes(shapeClassName)) {
    contentOverlay.classList.add(shapeClassName);
    console.log(`Applied overlay style: ${shapeClassName}`);
    
    // Get the shape index to alternate headline text
    const shapeIndex = ALL_SHAPE_CLASSES.indexOf(shapeClassName);
    updateHeadlineText(shapeIndex);
    
  } else if (shapeClassName) {
    // --- DEBUG LOG --- 
    console.warn(`Shape class name "${shapeClassName}" (from input "${shapeName}") is not defined in ALL_SHAPE_CLASSES: [${ALL_SHAPE_CLASSES.join(', ')}]`);
    // --- END DEBUG LOG ---
  } else {
      // --- DEBUG LOG --- 
      console.log("applyShapeSpecificStyles: No valid shapeName provided, clearing classes.");
      // --- END DEBUG LOG ---
  }
}

// Function to alternate headline text based on shape index
function updateHeadlineText(currentShapeIndex) {
  console.log(`📝 updateHeadlineText called with index: ${currentShapeIndex}`);
  
  // Make sure we wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performTextUpdate(currentShapeIndex);
    });
  } else {
    performTextUpdate(currentShapeIndex);
  }
}

function performTextUpdate(currentShapeIndex) {
  const headlineElement = document.getElementById('dynamic-headline');
  console.log(`📝 Finding headline element: `, headlineElement);
  
  // Alternating text options
  const texts = ["Digital Solutions", "Transforming ideas into"];
  
  if (headlineElement) {
    // Alternate text based on shape index
    const newText = texts[currentShapeIndex % texts.length];
    console.log(`📝 Changing text to: "${newText}" for shape index ${currentShapeIndex}`);
    
    // Check for GSAP
    if (window.gsap) {
      console.log("✅ GSAP detected, using smooth animation.");
      gsap.to(headlineElement, {duration: 0.3, opacity: 0, onComplete: () => {
        headlineElement.textContent = newText;
        gsap.to(headlineElement, {duration: 0.3, opacity: 1});
      }});
    } else {
      console.log("⚠️ GSAP not available, using basic CSS transition");
      // Fallback to basic fade
      headlineElement.style.opacity = 0;
      setTimeout(() => {
        headlineElement.textContent = newText;
        headlineElement.style.opacity = 1;
      }, 300);
    }
  } else {
    console.warn("⚠️ Dynamic headline element not found");
    // Let's try to find by query selector as a fallback
    const altHeadline = document.querySelector('.digital-solutions h2');
    if (altHeadline) {
      console.log("📝 Found headline via alternate selector");
      altHeadline.id = 'dynamic-headline'; // Add the ID
      performTextUpdate(currentShapeIndex); // Try again
    }
  }
}
// --- END: New Overlay Management Function ---

/**
 * Initialize the Sacred Geometry Amorphous Prism visualization
 */
function initAmorphousPrism() {
    console.log("🚀 Initializing Sacred Geometry Amorphous Prism (src)...");

    // 1. Check for WebGL compatibility
    if (!fallbackCheck(C.WEBGL_REQ_LEVEL)) {
        return;
    }

    try {
        // 3. Find the CANVAS element
        const canvas = document.getElementById(C.CANVAS_ID);
        if (!canvas) {
            console.error(`Canvas element #${C.CANVAS_ID} not found (src).`);
            return;
        }
        canvas.style.display = 'block'; 

        // 4. Setup Scene, Camera, Renderer
        const { scene, camera, renderer } = setupSceneAndCamera(canvas, THREE);

        // 5. Create Materials optimized for sacred geometry
        const materials = createMaterials(THREE); 

        // 6. Create Geometry with sacred geometry morph targets
        const { solidGeometry, morphTargetNames } = createMorphGeometry(THREE);
        
        // Store morph target names with element information for animation loop access
        solidGeometry.userData = { 
            morphTargetNames,
            elementNames: morphTargetNames.map(name => getSacredGeometryTitle(name))
        }; 

        // 7. Create Main Mesh (Using SOLID material)
        const mainMesh = new THREE.Mesh(solidGeometry, materials.solidMaterial);
        // --- START: Copy userData from geometry to mesh ---
        // This ensures morphTargetNames are accessible on the mesh in animationLoop
        mainMesh.userData = { ...solidGeometry.userData }; 
        // --- END: Copy userData ---
        mainMesh.scale.set(1.2, 1.2, 1.2); // Increase scale by 20%
        mainMesh.position.set(0, 0, 0); // Explicitly center the mesh
        scene.add(mainMesh);
        console.log("✨ Sacred geometry main mesh created and added to scene (src).");
        
        // 8. Create Wireframe that follows the sacred geometry shapes precisely
        const wireframeMesh = createAndAddWireframe(
            scene, 
            solidGeometry, 
            materials.edgesMaterial, 
            THREE, 
            mainMesh // Pass mainMesh to link morph targets
        );
        if (wireframeMesh) {
          wireframeMesh.scale.set(1.2, 1.2, 1.2); // Increase scale by 20%
        }

        // 9. Create enhanced galaxy particles
        const { particleSystem: galaxyParticles, updateParticles: updateGalaxyParticles } = 
            createGalaxyParticles(scene, THREE);
        console.log("✨ Enhanced galaxy particle system created to complement sacred geometry.");

        // 10. Setup Interaction Listeners using the new overlay logic
        const cleanupInteraction = setupOverlayInteractionListeners(renderer.domElement, mainMesh.quaternion);

        // --- START: Initial Overlay Style Set ---
        // Apply style for the initial shape (assuming index 0)
        if (morphTargetNames && morphTargetNames.length > 0) {
          const initialShapeName = morphTargetNames[0];
          applyShapeSpecificStyles(initialShapeName);
        } else {
          console.warn("Morph target names not available for initial style set.");
        }
        // --- END: Initial Overlay Style Set ---

        // 11. Start Animation Loop with sacred geometry morphing
        const stopAnimation = startAnimationLoop({
            scene,
            camera,
            renderer,
            mainMesh,
            wireframeMesh,
            backgroundParticles: galaxyParticles,
            interactionState,
            updateGalaxyParticles
        });
        console.log("🏁 Sacred geometry animation loop started (src).");

        // Add event listener for cleanup if needed
        window.addEventListener('beforeunload', () => {
            if (typeof stopAnimation === 'function') stopAnimation();
            if (typeof cleanupInteraction === 'function') cleanupInteraction();
        });

    } catch (error) {
        console.error("💥 Error during sacred geometry prism initialization setup (src):", error);
        // Fallback to simple display if there's an error during setup (before geometry)
        const loadingEl = document.getElementById(C.LOADING_ID);
        if (loadingEl) {
            loadingEl.innerHTML = 'Unable to initialize sacred geometry visualization setup. Please try refreshing.';
        }
    }
}

// Run initialization once
if (!window._prismInitialized) { 
    window._prismInitialized = true;
    initAmorphousPrism();
} else {
    console.log("Skipping duplicate sacred geometry prism initialization (src).");
}
