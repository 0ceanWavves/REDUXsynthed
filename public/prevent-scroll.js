/**
 * PREVENT SCROLL
 * Controls canvas interaction without preventing page scrolling
 */

(function() {
  console.log("PREVENT SCROLL: Initializing (modified version)");
  
  // Function to manage touch interaction with canvas without preventing page scroll
  function manageCanvasInteraction() {
    let touchTarget = null;
    let interactionTimer = null;
    
    // Listen for touch start on the entire document
    document.addEventListener('touchstart', function(e) {
      // Check if the touch is on a canvas element
      if (e.target.tagName.toLowerCase() === 'canvas') {
        console.log("PREVENT SCROLL: Touch started on canvas");
        
        // Store the canvas being touched
        touchTarget = e.target;
        
        // Only prevent default for this specific touch event
        // This allows the canvas to receive the event but doesn't lock the page
        e.preventDefault();
        
        // Add a class to just the canvas to indicate interaction
        touchTarget.classList.add('canvas-interaction');
      }
    }, { passive: false });
    
    // Listen for touch end
    document.addEventListener('touchend', function(e) {
      if (touchTarget) {
        console.log("PREVENT SCROLL: Touch ended");
        
        // Remove the interaction class
        touchTarget.classList.remove('canvas-interaction');
        
        // Clear any interaction timer
        if (interactionTimer) {
          clearTimeout(interactionTimer);
        }
        
        // Add a small delay before allowing page interactions again
        interactionTimer = setTimeout(() => {
          document.body.classList.remove('brief-touch-lock');
        }, 100);
        
        touchTarget = null;
      }
    }, { passive: false });
    
    // Listen for touch cancel
    document.addEventListener('touchcancel', function(e) {
      if (touchTarget) {
        console.log("PREVENT SCROLL: Touch cancelled");
        
        // Remove the interaction class
        touchTarget.classList.remove('canvas-interaction');
        document.body.classList.remove('brief-touch-lock');
        touchTarget = null;
        
        if (interactionTimer) {
          clearTimeout(interactionTimer);
        }
      }
    }, { passive: false });
    
    // Add necessary CSS - modified to only affect the canvas, not the whole page
    const style = document.createElement('style');
    style.textContent = `
      canvas.canvas-interaction {
        touch-action: none !important;
      }
      
      /* Brief touch lock only prevents scrolling for a very short time to avoid accidental scrolls */
      body.brief-touch-lock {
        overflow: auto !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log("PREVENT SCROLL: Setup complete (modified version)");
  }
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', manageCanvasInteraction);
  } else {
    manageCanvasInteraction();
  }
})(); 