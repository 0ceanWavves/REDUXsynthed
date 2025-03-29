/**
 * Enhanced Touch Handling for 3D Objects
 * Specifically for touch issues on mobile browsers with Cloudflare
 */

(function() {
  console.log('Enhanced touch fix: Starting initialization');
  
  // Wait for DOM to be ready
  function init() {
    try {
      // Target canvas elements for prism and other 3D objects
      const canvasElements = document.querySelectorAll('canvas');
      
      if (canvasElements.length === 0) {
        console.log('Enhanced touch fix: No canvas elements found yet, waiting...');
        // Wait for canvas elements to be added to the DOM
        const observer = new MutationObserver((mutations, obs) => {
          const canvases = document.querySelectorAll('canvas');
          if (canvases.length > 0) {
            console.log(`Enhanced touch fix: Found ${canvases.length} canvas elements`);
            canvases.forEach(setupCanvasInteraction);
            obs.disconnect(); // Stop observing once we've found our canvas
          }
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      } else {
        console.log(`Enhanced touch fix: Found ${canvasElements.length} canvas elements immediately`);
        canvasElements.forEach(setupCanvasInteraction);
      }
      
      // Also add global touch event listeners
      setupGlobalTouchHandlers();
    } catch (error) {
      console.error('Enhanced touch fix: Error during initialization:', error);
    }
  }
  
  // Set up interaction for a specific canvas
  function setupCanvasInteraction(canvas) {
    try {
      console.log('Enhanced touch fix: Setting up canvas interaction for', canvas);
      
      // Ensure the canvas has the right styles for touch
      canvas.style.touchAction = 'none';
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = 'grab';
      
      // Force pointer-events in CSS to ensure it works in all browsers
      const style = document.createElement('style');
      style.textContent = `
        canvas {
          touch-action: none !important;
          pointer-events: auto !important;
          -webkit-user-select: none !important;
          user-select: none !important;
        }
        
        /* Ensure parent elements don't block touch */
        canvas:not([style*="pointer-events: none"]) {
          z-index: 10 !important;
        }
        
        /* Fix for Firefox */
        body:not(.firefox-fix) canvas {
          touch-action: manipulation !important;
        }
      `;
      document.head.appendChild(style);
      
      // Add Firefox-specific class if needed
      if (navigator.userAgent.includes('Firefox')) {
        document.body.classList.add('firefox-fix');
      }
      
      // Add iOS-specific class if needed
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.classList.add('ios-fix');
        
        // Add extra style for iOS
        const iOSStyle = document.createElement('style');
        iOSStyle.textContent = `
          .ios-fix canvas {
            position: relative !important;
            z-index: 100 !important;
            transform: translateZ(0) !important;
          }
        `;
        document.head.appendChild(iOSStyle);
      }
      
      // Mark canvas as touch-enabled
      canvas.setAttribute('data-touch-enabled', 'true');
      
      // Attach direct event listeners to the canvas
      attachCanvasEventListeners(canvas);
    } catch (error) {
      console.error('Enhanced touch fix: Error setting up canvas:', error);
    }
  }
  
  // Attach event listeners directly to canvas
  function attachCanvasEventListeners(canvas) {
    // Mouse events
    canvas.addEventListener('mousedown', handleMouseDown, { passive: false });
    
    // Touch events with passive: false to allow preventDefault()
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Pointer events (unified API)
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
    canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
    canvas.addEventListener('pointerup', handlePointerUp, { passive: false });
    
    console.log('Enhanced touch fix: Attached direct event listeners to canvas');
  }
  
  // Event handlers
  function handleMouseDown(event) {
    console.log('Enhanced touch fix: Mouse down on canvas');
    // Prevent default only if it's a special key combo or right click
    if (event.button !== 0 || event.ctrlKey || event.metaKey) {
      event.preventDefault();
    }
    
    // Add global mouse move and up handlers
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });
    
    // Change cursor
    event.target.style.cursor = 'grabbing';
  }
  
  function handleMouseMove(event) {
    // No need to prevent default for mouse move
  }
  
  function handleMouseUp(event) {
    console.log('Enhanced touch fix: Mouse up');
    // Remove global handlers
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Reset cursor
    if (event.target.tagName === 'CANVAS') {
      event.target.style.cursor = 'grab';
    }
  }
  
  function handleTouchStart(event) {
    console.log('Enhanced touch fix: Touch start on canvas, touches:', event.touches.length);
    
    // Prevent default to avoid scrolling when touching the canvas
    // But only if it's a single touch - allow pinch zooming with multiple touches
    if (event.touches.length === 1) {
      event.preventDefault();
    }
    
    // Change cursor
    event.target.style.cursor = 'grabbing';
  }
  
  function handleTouchMove(event) {
    // Prevent default to stop page scrolling, but only for single touch
    if (event.touches.length === 1) {
      event.preventDefault();
    }
  }
  
  function handleTouchEnd(event) {
    console.log('Enhanced touch fix: Touch end, remaining touches:', event.touches.length);
    
    // Reset cursor if no touches remain
    if (event.touches.length === 0 && event.target.tagName === 'CANVAS') {
      event.target.style.cursor = 'grab';
    }
  }
  
  function handlePointerDown(event) {
    console.log('Enhanced touch fix: Pointer down on canvas, type:', event.pointerType);
    
    // Set pointer capture to ensure we get all pointer events
    event.target.setPointerCapture(event.pointerId);
    
    // Change cursor
    event.target.style.cursor = 'grabbing';
  }
  
  function handlePointerMove(event) {
    // No need to prevent default for pointer move
  }
  
  function handlePointerUp(event) {
    console.log('Enhanced touch fix: Pointer up');
    
    // Release pointer capture
    if (event.target.hasPointerCapture(event.pointerId)) {
      event.target.releasePointerCapture(event.pointerId);
    }
    
    // Reset cursor
    if (event.target.tagName === 'CANVAS') {
      event.target.style.cursor = 'grab';
    }
  }
  
  // Set up global handlers that will work even if canvas handlers don't
  function setupGlobalTouchHandlers() {
    // Track if we're currently interacting with a canvas
    let activeCanvas = null;
    
    // Add a class to the HTML element to indicate touch support
    document.documentElement.classList.add('touch-enabled');
    
    // Add global event handlers with capturing phase
    document.addEventListener('touchstart', function(event) {
      if (event.target.tagName === 'CANVAS') {
        activeCanvas = event.target;
        console.log('Global touch handler: Touch start on canvas');
      }
    }, { capture: true });
    
    document.addEventListener('touchmove', function(event) {
      if (activeCanvas && event.touches.length === 1) {
        // Prevent scrolling when touching canvas
        event.preventDefault();
        console.log('Global touch handler: Preventing scroll during canvas touch');
      }
    }, { capture: true, passive: false });
    
    document.addEventListener('touchend', function(event) {
      if (activeCanvas && event.touches.length === 0) {
        activeCanvas = null;
        console.log('Global touch handler: Touch interaction ended');
      }
    }, { capture: true });
    
    console.log('Enhanced touch fix: Set up global touch handlers');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also try after window load in case Three.js is loaded dynamically
  window.addEventListener('load', function() {
    console.log('Enhanced touch fix: Window loaded, checking again for canvas elements');
    
    // Small delay to ensure Three.js has time to create canvases
    setTimeout(() => {
      const canvases = document.querySelectorAll('canvas:not([data-touch-enabled="true"])');
      if (canvases.length > 0) {
        console.log(`Enhanced touch fix: Found ${canvases.length} new canvas elements after load`);
        canvases.forEach(setupCanvasInteraction);
      }
    }, 1000);
  });
  
  console.log('Enhanced touch fix: Initialization complete');
})(); 