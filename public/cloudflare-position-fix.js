/**
 * Cloudflare-Specific Position Fix
 * This script addresses the centering issues specifically occurring in Cloudflare Pages deployments
 */

(function() {
  console.log("🔧 Initializing Cloudflare position fix...");

  // Function to detect if we're in Cloudflare environment
  function isCloudflareEnvironment() {
    // Check for Cloudflare specific domains or headers
    const isCloudflareHost = window.location.hostname.includes('pages.dev');
    const hasCloudflareHeaders = !!document.querySelector('meta[name="cf-pages"]');
    // Additional check for known Cloudflare patterns
    const isCloudflareURL = window.location.href.includes('pages.dev') || 
                            window.location.href.includes('workers.dev');
    
    return isCloudflareHost || hasCloudflareHeaders || isCloudflareURL;
  }

  // Apply centering fixes to canvas
  function applyCenteringFixes(canvasElement) {
    if (!canvasElement) return;
    
    console.log("🔧 Applying centering fixes to canvas:", canvasElement.id);
    
    // Force the canvas into an absolute centered position
    canvasElement.style.position = 'absolute';
    canvasElement.style.top = '50%';
    canvasElement.style.left = '50%';
    canvasElement.style.transform = 'translate(-50%, -50%)';
    canvasElement.style.margin = '0';
    canvasElement.style.maxWidth = '100vw';
    canvasElement.style.maxHeight = '100vh';
    canvasElement.style.willChange = 'transform';
    canvasElement.style.backfaceVisibility = 'hidden';
    canvasElement.style.webkitBackfaceVisibility = 'hidden';
    canvasElement.style.transformStyle = 'preserve-3d';
    canvasElement.style.webkitTransformStyle = 'preserve-3d';
    
    // Add a data attribute to mark as fixed
    canvasElement.setAttribute('data-cloudflare-fixed', 'true');
    
    // Force a repaint/reflow
    void canvasElement.offsetWidth;
  }

  // Function to fix Three.js camera centering
  function fixCameraPosition() {
    // Try to access THREE.js camera in global scope (if available)
    if (window.scene && window.camera) {
      // Force camera to look at center
      console.log("🔧 Fixing camera position - global camera found");
      window.camera.position.set(0, 0, 5); // Set camera position
      window.camera.lookAt(0, 0, 0); // Look at center
      window.camera.updateProjectionMatrix();
      window.camera.updateMatrixWorld(true);
      
      // Force renderer update if available
      if (window.renderer) {
        window.renderer.render(window.scene, window.camera);
      }
    }
    
    // Try to access THREE via exposed scene (if available)
    if (window._threeExposer && window._threeExposer.camera) {
      console.log("🔧 Fixing camera position - scene exposer found");
      const camera = window._threeExposer.camera;
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      
      // Force renderer update if available
      if (window._threeExposer.renderer) {
        window._threeExposer.renderer.render(
          window._threeExposer.scene, 
          window._threeExposer.camera
        );
      }
    }
  }

  // Initialize MutationObserver to catch dynamically added canvas elements
  function initCanvasObserver() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            
            // Check if node is a canvas element
            if (node.nodeName === 'CANVAS') {
              console.log("🔧 MutationObserver: Found new canvas element");
              applyCenteringFixes(node);
            }
            
            // Check if node contains canvas elements
            if (node.querySelectorAll) {
              const canvases = node.querySelectorAll('canvas');
              canvases.forEach(canvas => {
                console.log("🔧 MutationObserver: Found canvas in new element");
                applyCenteringFixes(canvas);
              });
            }
          }
        }
      });
    });

    // Start observing the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("🔧 Canvas observer initialized");
    
    // Return the observer to stop it if needed
    return observer;
  }

  // Apply fixes when document is ready
  function applyAllFixes() {
    console.log("🔧 Applying all Cloudflare centering fixes");
    
    // 1. Find all canvas elements and fix them
    const canvases = document.querySelectorAll('canvas');
    if (canvases.length > 0) {
      console.log(`🔧 Found ${canvases.length} canvas elements`);
      canvases.forEach(canvas => applyCenteringFixes(canvas));
    } else {
      console.log("🔧 No canvas elements found yet, will observe DOM");
    }
    
    // 2. Specifically look for Three.js canvas
    const threeCanvas = document.getElementById('morphing-poly-canvas');
    if (threeCanvas) {
      console.log("🔧 Found main Three.js canvas");
      applyCenteringFixes(threeCanvas);
    }
    
    // 3. Fix camera position
    fixCameraPosition();
    
    // 4. Start observing for new canvas elements
    const observer = initCanvasObserver();
    
    // 5. Add window resize handler for persistent fixes
    window.addEventListener('resize', function() {
      console.log("🔧 Window resize detected, re-applying fixes");
      
      // Re-center canvas elements
      document.querySelectorAll('canvas').forEach(canvas => {
        if (!canvas.getAttribute('data-cloudflare-fixed')) {
          applyCenteringFixes(canvas);
        }
      });
      
      // Update camera on resize
      fixCameraPosition();
    });
    
    // 6. Apply fixes again after a short delay (for async loaded content)
    setTimeout(function() {
      const delayedCanvas = document.getElementById('morphing-poly-canvas');
      if (delayedCanvas) {
        console.log("🔧 Applying delayed fixes to canvas");
        applyCenteringFixes(delayedCanvas);
        fixCameraPosition();
      }
    }, 1000);
  }

  // Only apply fixes in Cloudflare environment
  if (isCloudflareEnvironment()) {
    console.log("🔧 Detected Cloudflare environment, applying position fixes");
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyAllFixes);
    } else {
      applyAllFixes();
    }
  } else {
    console.log("🔧 Not in Cloudflare environment, skipping position fixes");
  }
})();
