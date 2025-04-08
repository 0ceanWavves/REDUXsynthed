// Import from centralized module
import ThreeModule from '../../utils/three.js';
import * as C from '../constants.js';

export async function setupSceneAndCamera(canvas, THREEInstance) {
  // Use passed THREE instance or get from centralized module
  let LocalTHREE = THREEInstance;
  
  if (!LocalTHREE) {
    // Initialize if not already initialized
    await ThreeModule.init();
    LocalTHREE = ThreeModule.THREE;
  }
  
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
  camera.position.x = 0; // Ensure camera is centered horizontally
  camera.position.y = 0; // Ensure camera is centered vertically
  camera.lookAt(0, 0, 0); // Make camera look at the center

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
    if (!resizeListenerActive) return;
    
    // Get container dimensions for better fit (falls back to window if container not found)
    const container = canvas.parentElement;
    const width = container ? container.clientWidth : window.innerWidth;
    const height = container ? container.clientHeight : window.innerHeight;
    
    console.log(`Resize: Container size ${width}x${height}`);

    // Adjust camera position and field of view based on device
    const baseZ = C.CAMERA_Z; // Get base Z from constants
    const mobileThreshold = 768; // Threshold for mobile
    const isMobile = width < mobileThreshold;
    
    if (isMobile) {
      // Mobile optimization - adjust FOV for better object visibility
      camera.fov = 75; // Wider FOV on mobile
      camera.position.z = baseZ * 1.5; // Move further back to show more of the object
      
      // Slight top-down angle for better perspective on mobile
      camera.position.y = -1.0;
      
      // Apply scale to renderer for mobile
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lower pixel ratio for mobile performance
      console.log("Mobile view optimizations applied");
    } else {
      // Desktop settings
      camera.fov = C.CAMERA_FOV; // Reset to default FOV
      camera.position.z = baseZ;
      camera.position.y = 0;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Higher quality for desktop
    }
    
    // Always center horizontally
    camera.position.x = 0;
    camera.lookAt(0, 0, 0);

    // Update camera and renderer
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    
    console.log(`Resized renderer: ${width}x${height}, PR: ${renderer.getPixelRatio()}, FOV: ${camera.fov}`);
  };
  // Initial call to set size correctly
  handleResize(); 
  
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