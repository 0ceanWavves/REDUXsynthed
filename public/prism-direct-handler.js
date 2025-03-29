/**
 * PRISM DIRECT HANDLER
 * 
 * This script directly attaches event handlers to canvas elements
 * to ensure rotation works consistently across all browsers.
 * It bypasses the normal event system for maximum compatibility.
 */

(function() {
  console.log("PRISM DIRECT HANDLER: Initializing...");
  
  document.addEventListener('DOMContentLoaded', function() {
    // Try to run immediately and then set a delayed run as fallback
    setupDirectHandlers();
    setTimeout(setupDirectHandlers, 1000);
  });
  
  function setupDirectHandlers() {
    console.log("PRISM DIRECT HANDLER: Setting up handlers...");
    
    // Get all canvas elements
    const canvases = document.querySelectorAll('canvas');
    
    if (canvases.length === 0) {
      console.log("PRISM DIRECT HANDLER: No canvas elements found, will retry later");
      return;
    }
    
    console.log(`PRISM DIRECT HANDLER: Found ${canvases.length} canvas elements`);
    
    // Process each canvas
    canvases.forEach(function(canvas, index) {
      // Add ID if missing for easier debugging
      if (!canvas.id) {
        canvas.id = `direct-canvas-${index}`;
      }
      
      // Set critical styles
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = 'grab';
      canvas.style.touchAction = 'none'; // Disable browser touch actions on the canvas
      
      // Setup state for this canvas
      const state = {
        isInteracting: false,
        previousX: 0,
        previousY: 0,
        interactionType: null
      };
      
      // MOUSE HANDLERS
      canvas.addEventListener('mousedown', function(e) {
        e.preventDefault();
        console.log(`PRISM DIRECT HANDLER: Mouse down on ${canvas.id}`);
        
        state.isInteracting = true;
        state.interactionType = 'mouse';
        state.previousX = e.clientX;
        state.previousY = e.clientY;
        
        canvas.style.cursor = 'grabbing';
      }, { passive: false });
      
      document.addEventListener('mousemove', function(e) {
        if (!state.isInteracting || state.interactionType !== 'mouse') return;
        
        e.preventDefault();
        
        const deltaX = e.clientX - state.previousX;
        const deltaY = e.clientY - state.previousY;
        
        // Apply rotation
        applyRotation(deltaX, deltaY);
        
        state.previousX = e.clientX;
        state.previousY = e.clientY;
      }, { passive: false });
      
      document.addEventListener('mouseup', function(e) {
        if (!state.isInteracting || state.interactionType !== 'mouse') return;
        
        console.log(`PRISM DIRECT HANDLER: Mouse up from ${canvas.id}`);
        
        state.isInteracting = false;
        state.interactionType = null;
        
        canvas.style.cursor = 'grab';
      }, { passive: false });
      
      // TOUCH HANDLERS
      canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length !== 1) return;
        
        e.preventDefault();
        console.log(`PRISM DIRECT HANDLER: Touch start on ${canvas.id}`);
        
        state.isInteracting = true;
        state.interactionType = 'touch';
        state.previousX = e.touches[0].clientX;
        state.previousY = e.touches[0].clientY;
      }, { passive: false });
      
      document.addEventListener('touchmove', function(e) {
        if (!state.isInteracting || state.interactionType !== 'touch' || e.touches.length !== 1) return;
        
        e.preventDefault();
        
        const deltaX = e.touches[0].clientX - state.previousX;
        const deltaY = e.touches[0].clientY - state.previousY;
        
        // Apply rotation
        applyRotation(deltaX, deltaY);
        
        state.previousX = e.touches[0].clientX;
        state.previousY = e.touches[0].clientY;
      }, { passive: false });
      
      document.addEventListener('touchend', function(e) {
        if (!state.isInteracting || state.interactionType !== 'touch') return;
        
        console.log(`PRISM DIRECT HANDLER: Touch end from ${canvas.id}`);
        
        state.isInteracting = false;
        state.interactionType = null;
      }, { passive: false });
      
      console.log(`PRISM DIRECT HANDLER: Handlers attached to ${canvas.id}`);
    });
    
    // Set up mutation observer to catch new canvas elements
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          const newCanvases = [];
          
          mutation.addedNodes.forEach(function(node) {
            if (node.tagName === 'CANVAS') {
              newCanvases.push(node);
            } else if (node.querySelectorAll) {
              node.querySelectorAll('canvas').forEach(function(canvas) {
                newCanvases.push(canvas);
              });
            }
          });
          
          if (newCanvases.length > 0) {
            console.log(`PRISM DIRECT HANDLER: Found ${newCanvases.length} new canvas elements`);
            // Process each new canvas
            newCanvases.forEach(function(canvas, index) {
              setupDirectHandlers();
            });
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("PRISM DIRECT HANDLER: Setup complete");
  }
  
  function applyRotation(deltaX, deltaY) {
    // First try using the global applyPrismRotation function if available
    if (window.applyPrismRotation) {
      console.log("PRISM DIRECT HANDLER: Using global rotation function");
      window.applyPrismRotation(deltaX, deltaY);
      return;
    }
    
    // Fallback to direct rotation if available
    if (window.prismaticScene && window.prismaticScene.prism) {
      const rotationSpeed = window.innerWidth < 768 ? 0.005 : 0.003;
      const rotX = -deltaY * rotationSpeed;
      const rotY = deltaX * rotationSpeed;
      
      console.log("PRISM DIRECT HANDLER: Applying direct rotation", rotX, rotY);
      
      // Try all possible rotation methods
      if (window.prismaticScene.setRotationVelocity) {
        window.prismaticScene.setRotationVelocity(rotY, rotX);
      } 
      else if (window.prismaticScene.applyRotation) {
        window.prismaticScene.applyRotation(rotX, rotY);
      }
      else if (window.prismaticScene.prism.rotation) {
        window.prismaticScene.prism.rotation.x += rotX;
        window.prismaticScene.prism.rotation.y += rotY;
      }
    } else {
      console.log("PRISM DIRECT HANDLER: No rotation targets available");
    }
  }
})(); 