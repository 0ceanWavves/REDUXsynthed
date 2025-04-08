/**
 * Cloudflare Three.js Position Fix
 * 
 * This script addresses the centering issue with Three.js objects
 * when deployed to Cloudflare or other environments.
 */

(function() {
  // Wait for DOMContentLoaded or run immediately if already loaded
  const run = () => {
    // Check if we're on Cloudflare by looking for specific headers or behaviors
    // We'll use a simple check for now based on URL
    const isCloudflare = 
      window.location.hostname.includes('pages.dev') || 
      window.location.hostname.includes('workers.dev') ||
      !window.location.hostname.includes('localhost');
    
    if (!isCloudflare) {
      console.log("Not detected as Cloudflare environment, position fix not applied");
      return;
    }
    
    console.log("Cloudflare environment detected, applying Three.js position fix");
    
    // Find the canvas element (try a few different selectors)
    const findCanvas = () => {
      const selectors = [
        '#morphing-poly-canvas',
        'canvas[data-engine="three.js"]',
        '#three-container canvas',
        'canvas'
      ];
      
      for (const selector of selectors) {
        const canvas = document.querySelector(selector);
        if (canvas) {
          return canvas;
        }
      }
      return null;
    };
    
    // Apply centering fix to canvas
    const applyCanvasFix = (canvas) => {
      if (!canvas) return;
      
      // Make sure canvas is properly positioned
      canvas.style.position = 'absolute';
      canvas.style.left = '50%';
      canvas.style.top = '50%';
      canvas.style.transform = 'translate(-50%, -50%)';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.maxWidth = '100vw';
      canvas.style.maxHeight = '100vh';
      canvas.style.margin = '0';
      canvas.style.padding = '0';
      
      // Make sure the renderer resizes properly
      const resizeRenderer = () => {
        // Attempt to access the renderer via global variables
        if (window.renderer || window.THREE?.WebGLRenderer?.current) {
          const renderer = window.renderer || window.THREE.WebGLRenderer.current;
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      };
      
      // Ensure camera is centered
      const centerCamera = () => {
        // Attempt to access the camera via global variables
        if (window.camera) {
          window.camera.position.x = 0;
          window.camera.lookAt(0, 0, 0);
          window.camera.updateProjectionMatrix();
        }
      };
      
      // Apply fixes on resize
      window.addEventListener('resize', () => {
        resizeRenderer();
        centerCamera();
      });
      
      // Initial resize call
      resizeRenderer();
      centerCamera();
    };
    
    // Find and fix canvas immediately
    let canvas = findCanvas();
    if (canvas) {
      applyCanvasFix(canvas);
    }
    
    // Also watch for canvas being added to the DOM later
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            // Check if this is a canvas or contains a canvas
            if (node.nodeName === 'CANVAS') {
              applyCanvasFix(node);
            } else if (node.querySelector) {
              const canvas = node.querySelector('canvas');
              if (canvas) {
                applyCanvasFix(canvas);
              }
            }
          });
        }
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // After a few seconds, try one more time
    setTimeout(() => {
      const canvas = findCanvas();
      if (canvas) {
        applyCanvasFix(canvas);
      }
    }, 3000);
  };
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();