import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js'; // Import directly
import * as C from '../constants.js';

export function setupSceneAndCamera(canvas, THREEInstance) {
  // Use passed THREE instance or fall back to direct import
  const LocalTHREE = THREEInstance || THREE;
  if (!LocalTHREE) {
      throw new Error("THREE is not available for scene setup (src).");
  }

  const scene = new LocalTHREE.Scene();
  scene.background = new LocalTHREE.Color(C.FALLBACK_BG_COLOR);

  const camera = new LocalTHREE.PerspectiveCamera(
    C.CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    C.NEAR_PLANE,
    C.FAR_PLANE
  );
  camera.position.z = C.CAMERA_Z;

  const renderer = new LocalTHREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Add Lighting (Moved from old init, using constants from src/constants)
  const ambientLight = new LocalTHREE.AmbientLight(C.AMBIENT_COLOR, C.AMBIENT_INTENSITY);
  scene.add(ambientLight);
  
  const directionalLight = new LocalTHREE.DirectionalLight(C.DIR_LIGHT_COLOR, C.DIR_LIGHT_INTENSITY);
  directionalLight.position.set(C.DIR_LIGHT_POS.x, C.DIR_LIGHT_POS.y, C.DIR_LIGHT_POS.z);
  scene.add(directionalLight);

  const pointLight = new LocalTHREE.PointLight(C.POINT_LIGHT_COLOR, C.POINT_LIGHT_INTENSITY);
  pointLight.position.set(C.POINT_LIGHT_POS.x, C.POINT_LIGHT_POS.y, C.POINT_LIGHT_POS.z);
  scene.add(pointLight);
  console.log("💡 Lighting added to scene (src).");

  // Handle window resize
  let resizeListenerActive = true;
  const handleResize = () => {
    if (!resizeListenerActive || !canvas) return; // Added check for canvas existence
    
    // Use canvas dimensions instead of window dimensions
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    // Check for zero dimensions and use window dimensions as fallback
    if (width === 0 || height === 0) {
        console.warn("Canvas dimensions are zero during resize. Using window dimensions as fallback.");
        width = window.innerWidth;
        height = window.innerHeight;
    }

    // Adjust camera position based on width (closer on mobile)
    const baseZ = C.CAMERA_Z; // Get base Z from constants
    const mobileThreshold = 768; // Example threshold for mobile
    camera.position.z = width < mobileThreshold ? baseZ * 0.75 : baseZ; // Move 25% closer on mobile

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false); // Use canvas dimensions and set updateStyle to false
    // renderer.setPixelRatio(window.devicePixelRatio); // setPixelRatio is often less critical than size/aspect
    // console.log("Resized renderer and camera (src)."); // Optional: uncomment for debugging resize
  };
  // Initial call to set size correctly
  requestAnimationFrame(() => {
    console.log("Running delayed initial resize");
    handleResize();
  });
  
  window.addEventListener('resize', handleResize);
  console.log("Setup resize listener (src).");

  // Return the created objects and a cleanup function 
  return {
    scene,
    camera,
    renderer,
    cleanup: () => {
        if (resizeListenerActive) {
             console.log("Removing resize listener (src).");
             window.removeEventListener('resize', handleResize);
             resizeListenerActive = false;
        }
        // Add renderer disposal etc. if needed
        // renderer.dispose();
    }
  };
} 