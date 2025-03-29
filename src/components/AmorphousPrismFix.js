/**
 * AmorphousPrismFix.js - Universal touch event fix for the 3D object
 * Replaces all existing event handling with a single, reliable implementation
 */

export function applyPrismTouchFix() {
  console.log("Applying universal prism touch fix");
  
  // Wait for everything to be fully loaded
  setTimeout(() => {
    const canvas = document.getElementById('prism-bg-canvas');
    if (!canvas) {
      console.error("Prism canvas not found");
      return;
    }
    
    // Ensure canvas has correct styles for all browsers
    canvas.style.pointerEvents = 'auto';
    canvas.style.touchAction = 'none';
    canvas.style.zIndex = '5';
    canvas.style.cursor = 'grab';
    
    // Ensure prismaticScene exists
    if (!window.prismaticScene) {
      console.warn("prismaticScene not available - touch fix cannot be applied");
      return;
    }
    
    console.log("Setting up universal touch handling for prism");
    
    // State variables
    let isInteracting = false;
    let previousX = 0;
    let previousY = 0;
    
    // Browser detection
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    
    // Universal pointerdown handler
    function onPointerDown(event) {
      // Always prevent default to avoid scrolling
      event.preventDefault();
      
      // Start interaction
      isInteracting = true;
      previousX = event.clientX;
      previousY = event.clientY;
      canvas.style.cursor = 'grabbing';
      
      // Notify the prism system
      if (window.prismaticScene && window.prismaticScene.setInteraction) {
        window.prismaticScene.setInteraction(true);
      }
      
      console.log("PRISM-FIX: Pointer down detected");
      
      // Try to use pointer capture API
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (err) {
        console.warn("Could not capture pointer - using document event handlers instead");
        // Add document-level handlers as fallback
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
      }
    }
    
    // Universal pointermove handler
    function onPointerMove(event) {
      if (!isInteracting) return;
      
      // Prevent default to avoid scrolling
      event.preventDefault();
      
      // Calculate deltas
      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;
      previousX = event.clientX;
      previousY = event.clientY;
      
      // Apply rotation via global API
      if (window.prismaticScene && window.prismaticScene.applyRotation) {
        // Adjust for mobile
        const factor = isMobile ? 0.5 : 1.0;
        window.prismaticScene.applyRotation(-deltaY * 0.005 * factor, deltaX * 0.005 * factor);
      }
      
      console.log("PRISM-FIX: Pointer move processed");
    }
    
    // Universal pointerup handler
    function onPointerUp(event) {
      if (!isInteracting) return;
      
      // End interaction
      isInteracting = false;
      canvas.style.cursor = 'grab';
      
      // Try to release pointer capture
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch (err) {
        console.warn("Could not release pointer capture");
        // Remove document-level handlers
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
      }
      
      // Notify the prism system after a short delay
      setTimeout(() => {
        if (window.prismaticScene && window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(false);
        }
      }, 800);
      
      console.log("PRISM-FIX: Pointer up processed");
    }
    
    // Extra touch handlers for iOS/Safari
    function onTouchStart(event) {
      // Critical: prevent default for touch events
      event.preventDefault();
      
      if (event.touches.length > 0) {
        isInteracting = true;
        previousX = event.touches[0].clientX;
        previousY = event.touches[0].clientY;
        
        // Notify the prism system
        if (window.prismaticScene && window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(true);
        }
      }
      
      console.log("PRISM-FIX: Touch start detected");
    }
    
    function onTouchMove(event) {
      // Critical: prevent default for touch events
      event.preventDefault();
      
      if (!isInteracting || event.touches.length === 0) return;
      
      // Calculate deltas
      const deltaX = event.touches[0].clientX - previousX;
      const deltaY = event.touches[0].clientY - previousY;
      previousX = event.touches[0].clientX;
      previousY = event.touches[0].clientY;
      
      // Apply rotation via global API
      if (window.prismaticScene && window.prismaticScene.applyRotation) {
        // Mobile factor already applied in the prismaticScene API
        window.prismaticScene.applyRotation(-deltaY * 0.005, deltaX * 0.005);
      }
      
      console.log("PRISM-FIX: Touch move processed");
    }
    
    function onTouchEnd(event) {
      // Critical: prevent default for touch events
      event.preventDefault();
      
      if (!isInteracting) return;
      
      // End interaction
      isInteracting = false;
      
      // Notify the prism system after a short delay
      setTimeout(() => {
        if (window.prismaticScene && window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(false);
        }
      }, 800);
      
      console.log("PRISM-FIX: Touch end processed");
    }
    
    // Add all event listeners with appropriate flags
    
    // Pointer events (modern browsers)
    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    canvas.addEventListener('pointerup', onPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', onPointerUp, { passive: false });
    
    // Touch events (iOS fallback)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });
    
    // Clean up any existing fix-interaction.js listeners (if any)
    const fixInteractionScript = document.querySelector('script[src*="fix-interaction.js"]');
    if (fixInteractionScript && fixInteractionScript.parentNode) {
      console.log("Removing fix-interaction.js script");
      fixInteractionScript.parentNode.removeChild(fixInteractionScript);
    }
    
    console.log("Prism touch fix applied successfully");
  }, 1000); // Delay to ensure everything is loaded
}
