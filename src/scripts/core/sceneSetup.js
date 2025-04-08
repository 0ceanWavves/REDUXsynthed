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
  // Center camera on the scene origin
  camera.position.set(0, 0, C.CAMERA_Z);
  camera.lookAt(0, 0, 0);
  
  // Force camera update to ensure correct position
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);

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

    // Force renderer to use the full size of the container
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';
    
    // Adjust camera position and field of view based on device
    const baseZ = C.CAMERA_Z; // Get base Z from constants
    const mobileThreshold = 768; // Threshold for mobile
    const isMobile = width < mobileThreshold;
    
    if (isMobile) {
      // Mobile optimization - adjust FOV for better object visibility
      camera.fov = 75; // Wider FOV on mobile
      
      // Position camera to see the whole object
      camera.position.set(0, -0.5, baseZ * 1.5); // Centered with slight top-down view
      
      // Apply scale to renderer for mobile performance
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      console.log("Mobile view optimizations applied");
    } else {
      // Desktop settings
      camera.fov = C.CAMERA_FOV; // Reset to default FOV
      
      // Position camera centrally
      camera.position.set(0, 0, baseZ);
      
      // High quality for desktop, but not too high
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    }
    
    // Always force looking at center (important for Cloudflare environment)
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