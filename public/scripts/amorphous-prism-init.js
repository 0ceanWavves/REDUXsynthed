import loadThree from './utils/loadThree.js';
import { fallbackCheck } from './utils/fallback.js';
import { setupSceneAndCamera } from './core/sceneSetup.js';
import { createMorphGeometry } from './geometry/mainGeometry.js';
import { createMaterials } from './visuals/materials.js';
import { createParticleSystem } from './visuals/particles.js';
import { createAndAddWireframe } from './visuals/wireframe.js';
import { setupInteractionListeners, interactionState } from './controls/interaction.js';
import { startAnimationLoop } from './animation/animationLoop.js';
import * as C from './constants.js';

async function initAmorphousPrism() {
    console.log("🚀 Initializing Amorphous Prism...");

    // 1. Check for WebGL compatibility
    if (!fallbackCheck(C.WEBGL_REQ_LEVEL)) {
        // Fallback handled within fallbackCheck, exit initialization
        return;
    }

    try {
        // 2. Load Three.js dynamically
        const THREE = await loadThree();
        if (!THREE) {
            console.error("Failed to load THREE object.");
            // Potentially show a user-friendly error message on the page
            return;
        }
        window.THREE = THREE; // Make THREE global for modules that expect it (like interaction.js)

        // 3. Find the CANVAS element (CHANGED)
        const canvas = document.getElementById('morphing-poly-canvas'); // Use the canvas ID from Astro component
        if (!canvas) {
            console.error("Canvas element #morphing-poly-canvas not found.");
            return;
        }
         // Ensure canvas has style if needed (though usually set in HTML/CSS)
         canvas.style.display = 'block'; // Ensure it behaves like a block


        // 4. Setup Scene, Camera, Renderer
        // Pass the CANVAS directly (needs adjustment in sceneSetup.js)
        const { scene, camera, renderer } = setupSceneAndCamera(canvas, THREE);

        // 5. Create Materials
        const materials = createMaterials(THREE); // Assuming this returns an object like { main, particles }

        // 6. Create Geometry (adjust based on how mainGeometry expects args)
        const { solidGeometry, morphTargetNames } = await createMorphGeometry(THREE);

        // 7. Create Main Mesh (Using SOLID material)
        const mainMesh = new THREE.Mesh(solidGeometry, materials.solidMaterial);
        scene.add(mainMesh);
        console.log("✨ Main mesh created and added to scene.");
        
        // --- USE NEW MODULE for Wireframe ---
        const wireframeMesh = createAndAddWireframe(
            scene, 
            solidGeometry, 
            materials.edgesMaterial, 
            THREE, 
            mainMesh // Pass mainMesh to link morph targets
        );
        // --- END NEW ---

        // 8. Create Particles (Optional, based on visuals/particles.js)
        // --- REMOVED PARTICLE CREATION ---
        // const particles = createParticleSystem(scene, THREE, materials.particles); 
        // console.log("✨ Particles created.");


        // 9. Setup Interaction Listeners
        const cleanupInteraction = setupInteractionListeners(renderer.domElement, mainMesh.quaternion); // Pass canvas and initial mesh rotation

        // 10. Start Animation Loop
        const stopAnimation = startAnimationLoop({
            scene,
            camera,
            renderer,
            mainMesh, // Pass the solid mesh for morphing/rotation control
            // particles, // --- REMOVED PARTICLES FROM LOOP --- 
            interactionState, 
            THREE 
        });
        console.log("🏁 Animation loop started.");


        // Optional: Handle cleanup on page unload or component unmount
        // window.addEventListener('beforeunload', () => {
        //     console.log("🧹 Cleaning up prism resources...");
        //     stopAnimation();
        //     cleanupInteraction();
        //     renderer.dispose();
        //     // Dispose geometry, materials, textures if needed
        //     console.log(" Prism resources cleaned up.");
        // });


    } catch (error) {
        console.error("💥 Error during prism initialization:", error);
        const errorContainer = document.getElementById('error-message-container'); // Use a dedicated error container if available
        if (errorContainer) {
            errorContainer.innerHTML = `<p style="color: red; padding: 20px;">Failed to load visualization. Please check the console for details.</p>`;
        } else { // Fallback to logging if container doesn't exist
             console.error("No error message container found on page.")
        }
    }
}

// Run initialization when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAmorphousPrism);
} else {
    // DOMContentLoaded has already fired
    initAmorphousPrism();
} 