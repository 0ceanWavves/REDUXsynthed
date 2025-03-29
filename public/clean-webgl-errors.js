/**
 * Clean WebGL Errors Script
 * This script runs after all other scripts to check if WebGL is actually working
 * through a fallback mechanism and removes any error messages if so.
 */
(function() {
  console.log("🧹 WebGL Error Cleaner: Initializing...");
  
  // Check if error message exists and WebGL is actually working
  function checkAndCleanErrors() {
    const errorMessage = document.querySelector('[data-webgl-error="true"]');
    if (!errorMessage) {
      console.log("🧹 WebGL Error Cleaner: No error message found, nothing to clean");
      return;
    }
    
    // Check for signs that WebGL is actually working through fallbacks
    const workingWebGL = 
      // Successful fallback canvas
      document.getElementById('morphing-poly-canvas-fallback') || 
      // Any canvas showing THREE.js is working
      document.querySelector('canvas[data-engine^="three.js"]') ||
      // Active Three.js scene
      (typeof THREE !== 'undefined' && THREE.WebGLRenderer && document.querySelector('canvas'));
    
    if (workingWebGL) {
      console.log("🧹 WebGL Error Cleaner: WebGL is working through fallback, removing error message");
      errorMessage.style.opacity = '0';
      errorMessage.style.transition = 'opacity 0.5s ease-out';
      
      setTimeout(() => {
        try {
          errorMessage.style.display = 'none';
          // Try to remove completely after transition
          setTimeout(() => {
            try {
              if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
              }
            } catch (e) {
              // Ignore
            }
          }, 500);
        } catch (e) {
          console.warn("🧹 WebGL Error Cleaner: Error hiding message", e);
        }
      }, 500);
      
      return true;
    }
    
    console.log("🧹 WebGL Error Cleaner: WebGL still not working, keeping error message");
    return false;
  }
  
  // Run immediately if document is already loaded
  if (document.readyState === 'complete') {
    checkAndCleanErrors();
  } else {
    // Wait for everything to load
    window.addEventListener('load', () => {
      // Wait a bit longer to ensure all fallbacks have had time to initialize
      setTimeout(checkAndCleanErrors, 2000);
    });
  }
  
  // Also listen for Three.js specific events
  window.addEventListener('threeReady', () => {
    setTimeout(checkAndCleanErrors, 500);
  });
  
  window.addEventListener('webglRendererCreated', () => {
    setTimeout(checkAndCleanErrors, 100);
  });
  
  // Make function globally available
  window.cleanWebGLErrors = checkAndCleanErrors;
  
  console.log("🧹 WebGL Error Cleaner: Setup complete");
})(); 