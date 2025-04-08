/**
 * Debug Shape Transitions - Helper script for troubleshooting the morphing shapes
 * Also provides tools for debugging Cloudflare-specific issues
 */

(function() {
  // Only initialize in development or when debugging is explicitly enabled
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.search.includes('debug=true');
    
  const isCloudflare = 
    window.location.hostname.includes('pages.dev') || 
    window.location.href.includes('pages.dev');
  
  // Skip initialization in production unless debugging is enabled
  if (!isDevelopment && !isCloudflare) {
    console.log("Debug shape transitions script skipped in production");
    return;
  }
  
  // Log initialization
  console.log(`Debug shape transitions initialized in ${isDevelopment ? 'development' : 'production'} mode`);
  
  // Track canvas status
  function checkCanvasStatus() {
    const canvas = document.getElementById('morphing-poly-canvas');
    if (!canvas) {
      console.warn("🔍 Canvas not found!");
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    console.log("🔍 Canvas status:", {
      id: canvas.id,
      width: canvas.width,
      height: canvas.height,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
      style: {
        width: canvas.style.width,
        height: canvas.style.height,
        position: canvas.style.position,
        left: canvas.style.left,
        top: canvas.style.top,
        transform: canvas.style.transform
      },
      boundingRect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left
      },
      computedStyle: window.getComputedStyle(canvas)
    });
  }
  
  // Track ThreeJS scene status
  function checkSceneStatus() {
    // Try to access scene from global objects or _threeExposer
    const scene = window.scene || (window._threeExposer && window._threeExposer.scene);
    const camera = window.camera || (window._threeExposer && window._threeExposer.camera);
    const renderer = window.renderer || (window._threeExposer && window._threeExposer.renderer);
    
    // Log what we found
    console.log("🔍 ThreeJS status:", {
      sceneAvailable: !!scene,
      cameraAvailable: !!camera,
      rendererAvailable: !!renderer,
      cameraPosition: camera ? {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      } : null,
      rendererSize: renderer ? {
        width: renderer.domElement.width,
        height: renderer.domElement.height,
        pixelRatio: renderer.getPixelRatio()
      } : null
    });
  }
  
  // Check for Cloudflare environment
  function checkCloudflareStatus() {
    console.log("🔍 Cloudflare status:", {
      isCloudflareHost: window.location.hostname.includes('pages.dev'),
      isCloudflareURL: window.location.href.includes('pages.dev'),
      hasCloudflareMeta: !!document.querySelector('meta[name="cf-pages"]'),
      hasCloudflareCookies: document.cookie.includes('__cf'),
      hasCloudflareHeaders: window.navigator.userAgent.includes('CloudFront')
    });
  }
  
  // Utility to apply quick Cloudflare fixes (for manual debugging)
  function applyQuickFixes() {
    console.log("🔧 Applying quick fixes for Cloudflare...");
    
    // Force canvas to center
    const canvas = document.getElementById('morphing-poly-canvas');
    if (canvas) {
      canvas.style.position = 'absolute';
      canvas.style.top = '50%';
      canvas.style.left = '50%';
      canvas.style.transform = 'translate(-50%, -50%)';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      console.log("🔧 Applied centering fix to canvas");
    }
    
    // Force camera position
    const camera = window.camera || (window._threeExposer && window._threeExposer.camera);
    if (camera) {
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      console.log("🔧 Applied camera position fix");
    }
    
    // Force render if possible
    const renderer = window.renderer || (window._threeExposer && window._threeExposer.renderer);
    const scene = window.scene || (window._threeExposer && window._threeExposer.scene);
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
      console.log("🔧 Forced a render");
    }
    
    checkCanvasStatus();
    return "Fixes applied!";
  }
  
  // Monitor shape transitions
  let lastShapeName = '';
  function monitorShapeChanges() {
    // Check if content overlay has a shape class
    const overlay = document.getElementById('content-overlay');
    if (!overlay) return;
    
    const classList = Array.from(overlay.classList);
    const shapeClass = classList.find(c => c.includes('-shape'));
    
    if (shapeClass && shapeClass !== lastShapeName) {
      console.log(`🔄 Shape changed to: ${shapeClass}`);
      lastShapeName = shapeClass;
      
      // Check canvas and camera status after shape change
      setTimeout(() => {
        checkCanvasStatus();
        checkSceneStatus();
      }, 500);
    }
  }
  
  // Run initial checks
  setTimeout(() => {
    console.log("🔍 Running initial diagnostic checks...");
    checkCanvasStatus();
    checkSceneStatus();
    checkCloudflareStatus();
    
    // Set up periodic monitoring
    setInterval(monitorShapeChanges, 1000);
    
    // If in Cloudflare environment, apply positioning checks after a delay
    if (isCloudflare) {
      console.log("🔍 Scheduling Cloudflare position checks...");
      
      setTimeout(() => {
        console.log("🔍 Running Cloudflare position check...");
        checkCanvasStatus();
        
        const canvas = document.getElementById('morphing-poly-canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const windowCenter = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
          };
          
          const canvasCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
          
          const offset = {
            x: canvasCenter.x - windowCenter.x,
            y: canvasCenter.y - windowCenter.y
          };
          
          console.log("🔍 Canvas centering measurement:", {
            windowCenter,
            canvasCenter,
            offset,
            isCentered: Math.abs(offset.x) < 5 && Math.abs(offset.y) < 5
          });
          
          // Auto-apply fix if needed
          if (Math.abs(offset.x) > 5 || Math.abs(offset.y) > 5) {
            console.log("🔧 Canvas not centered, applying fix...");
            applyQuickFixes();
          }
        }
      }, 3000);
    }
  }, 1000);
  
  // Add global debugging commands
  window.__debugCanvas = checkCanvasStatus;
  window.__debugScene = checkSceneStatus;
  window.__debugCloudflare = checkCloudflareStatus;
  window.__debugApplyFixes = applyQuickFixes;
  
  console.log("🔍 Debug tools available in console: __debugCanvas(), __debugScene(), __debugCloudflare(), __debugApplyFixes()");
})();
