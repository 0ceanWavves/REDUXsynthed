/**
 * Scene Exposer - Make Three.js scene accessible for debugging and fixes
 * This script exposes the Three.js scene, camera, and renderer globally
 * so that other scripts can access and manipulate them
 */

(function() {
  console.log("🔍 Scene Exposer: Initializing...");

  // Create global object to store Three.js objects
  window._threeExposer = {
    scene: null,
    camera: null,
    renderer: null,
    objects: {},
    isInitialized: false
  };

  // Function to check if an object is likely a THREE.js object
  function isThreeObject(obj) {
    if (!obj) return false;
    
    // Check for common THREE.js object properties
    const hasCommonProperties = 
      (obj.type && typeof obj.type === 'string') &&
      (obj.uuid && typeof obj.uuid === 'string') &&
      (typeof obj.clone === 'function' || typeof obj.copy === 'function');
      
    // Special checks for common THREE objects
    const isScene = obj.isScene === true;
    const isCamera = obj.isCamera === true || 
                    (obj.isPerspectiveCamera === true || obj.isOrthographicCamera === true);
    const isRenderer = 
      obj.domElement instanceof HTMLCanvasElement && 
      typeof obj.render === 'function' &&
      typeof obj.setSize === 'function';
      
    return hasCommonProperties || isScene || isCamera || isRenderer;
  }

  // Scan window object for Three.js objects
  function scanForThreeObjects() {
    console.log("🔍 Scene Exposer: Scanning for Three.js objects...");
    
    // Check for scene in window.scene, window.THREE.scene, etc.
    if (window.scene && isThreeObject(window.scene)) {
      window._threeExposer.scene = window.scene;
      console.log("🔍 Scene Exposer: Found scene in window object");
    }
    
    // Check for camera in window.camera, window.THREE.camera, etc.
    if (window.camera && isThreeObject(window.camera)) {
      window._threeExposer.camera = window.camera;
      console.log("🔍 Scene Exposer: Found camera in window object");
    }
    
    // Check for renderer in window.renderer, window.THREE.renderer, etc.
    if (window.renderer && isThreeObject(window.renderer)) {
      window._threeExposer.renderer = window.renderer;
      console.log("🔍 Scene Exposer: Found renderer in window object");
    }
    
    // Look for any other Three.js objects
    for (const key in window) {
      if (key.includes('scene') || key.includes('Scene')) {
        if (isThreeObject(window[key])) {
          window._threeExposer.scene = window[key];
          console.log(`🔍 Scene Exposer: Found scene in window.${key}`);
        }
      } else if (key.includes('camera') || key.includes('Camera')) {
        if (isThreeObject(window[key])) {
          window._threeExposer.camera = window[key];
          console.log(`🔍 Scene Exposer: Found camera in window.${key}`);
        }
      } else if (key.includes('renderer') || key.includes('Renderer')) {
        if (isThreeObject(window[key])) {
          window._threeExposer.renderer = window[key];
          console.log(`🔍 Scene Exposer: Found renderer in window.${key}`);
        }
      }
    }
    
    // Update initialization state
    window._threeExposer.isInitialized = 
      window._threeExposer.scene || 
      window._threeExposer.camera || 
      window._threeExposer.renderer;
      
    console.log(`🔍 Scene Exposer: Initialization state: ${window._threeExposer.isInitialized}`);
  }
  
  // Hook into requestAnimationFrame to find the scene
  const originalRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = function(callback) {
    // Call the original requestAnimationFrame
    return originalRAF.call(window, function(timestamp) {
      // If we haven't found a scene yet, try to find it
      if (!window._threeExposer.isInitialized) {
        scanForThreeObjects();
      }
      
      // Call the original callback
      callback(timestamp);
    });
  };
  
  // Listen for WebGL context creation
  function setupWebGLContextListener() {
    // Get the original getContext method
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    
    // Override getContext to capture WebGL contexts
    HTMLCanvasElement.prototype.getContext = function() {
      const context = originalGetContext.apply(this, arguments);
      const contextType = arguments[0];
      
      // If this is a WebGL context, it might be part of a THREE.js renderer
      if (contextType === 'webgl' || contextType === 'webgl2' || contextType === 'experimental-webgl') {
        // We'll check again later to find the renderer
        setTimeout(scanForThreeObjects, 100);
        setTimeout(scanForThreeObjects, 500);
        setTimeout(scanForThreeObjects, 1000);
      }
      
      return context;
    };
  }

  // Set up MutationObserver to watch for canvas elements
  function setupCanvasObserver() {
    const observer = new MutationObserver(function(mutations) {
      let shouldScan = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            
            // Check if this is a canvas element
            if (node.nodeName === 'CANVAS') {
              shouldScan = true;
            }
            
            // Check if this contains a canvas element
            if (node.querySelectorAll) {
              const canvases = node.querySelectorAll('canvas');
              if (canvases.length > 0) {
                shouldScan = true;
              }
            }
          }
        }
      });
      
      // If we found a canvas, scan for Three.js objects
      if (shouldScan) {
        setTimeout(scanForThreeObjects, 100);
      }
    });
    
    // Start observing the document body for canvas elements
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize the scene exposer
  function initialize() {
    // Scan for existing Three.js objects
    scanForThreeObjects();
    
    // Set up WebGL context listener
    setupWebGLContextListener();
    
    // Set up canvas observer
    setupCanvasObserver();
    
    // Schedule additional scans (3D scene might load later)
    setTimeout(scanForThreeObjects, 1000);
    setTimeout(scanForThreeObjects, 2000);
    
    console.log("🔍 Scene Exposer: Initialization complete");
  }
  
  // Start the initialization process
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Expose the scanning function globally
  window._threeExposer.scan = scanForThreeObjects;
  
  // Add function to force camera centering
  window._threeExposer.centerCamera = function() {
    if (window._threeExposer.camera) {
      console.log("🔍 Scene Exposer: Centering camera");
      const camera = window._threeExposer.camera;
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      
      if (window._threeExposer.renderer && window._threeExposer.scene) {
        window._threeExposer.renderer.render(
          window._threeExposer.scene,
          window._threeExposer.camera
        );
      }
    } else {
      console.warn("🔍 Scene Exposer: Cannot center camera - not found");
    }
  };
})();
