/**
 * RendererManager.js
 * Handles renderer creation and management with fallbacks
 */

/**
 * Creates a Three.js renderer, scene, camera, and clock
 * @param {Object} options - Configuration options
 * @returns {Object} Object containing scene, camera, renderer, etc.
 */
export async function createRenderer(options) {
  const { THREE, canvas, isMobile, colors } = options;
  
  // Create scene
  const scene = new THREE.Scene();
  scene.background = colors.background;
  
  // Create clock for smooth animation timing
  const clock = new THREE.Clock();

  // Create camera
  const fov = isMobile ? 60 : 55;
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = isMobile ? 4.8 : 4.2;

  // Check for Firefox
  const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
  
  // Try to create the renderer with various fallback options
  let renderer;
  
  try {
    // First attempt - standard settings
    console.log('Creating WebGLRenderer - first attempt');
    
    // Use Firefox helper for WebGL2 if available
    let rendererOptions = {
      canvas: canvas,
      antialias: !isFirefox, // Disable antialiasing in Firefox
      alpha: true,
      preserveDrawingBuffer: isFirefox, // Needed for Firefox
      powerPreference: 'high-performance'
    };
    
    // For Firefox, try to use the helper function if available
    if (isFirefox && window.__FIREFOX_WEBGL2_HELPER) {
      console.log('Using Firefox WebGL2 helper');
      const webgl2Context = window.__FIREFOX_WEBGL2_HELPER(canvas);
      if (webgl2Context) {
        rendererOptions.context = webgl2Context;
        console.log('Firefox WebGL2 context created successfully');
      }
    }
    
    renderer = new THREE.WebGLRenderer(rendererOptions);
  } catch (err) {
    console.warn('Initial WebGLRenderer creation failed:', err);
    
    // Try simpler renderer options
    try {
      console.log('Creating WebGLRenderer - second attempt');
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        alpha: true
      });
    } catch (err2) {
      console.error('Failed to create renderer:', err2);
      throw new Error('Could not create WebGL renderer');
    }
  }
  
  // Set renderer size and pixel ratio
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  
  // Handle window resize
  let animationFrameId = null;
  
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  });
  
  // Return all created objects and a cleanup function
  return {
    scene,
    camera,
    renderer,
    clock,
    canvas,
    cleanup: () => {
      if (renderer) {
        console.log('Disposing renderer');
        window.removeEventListener('resize', () => {});
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        renderer.dispose();
        renderer = null;
      }
    },
    setAnimationFrameId: (id) => {
      const oldId = animationFrameId;
      animationFrameId = id;
      return oldId;
    }
  };
}
