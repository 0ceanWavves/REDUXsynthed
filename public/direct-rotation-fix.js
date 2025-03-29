/**
 * direct-rotation-fix.js
 * 
 * A direct manipulation solution for 3D object interaction that
 * bypasses the standard event handling system and directly applies
 * rotation to the Three.js object.
 */

// Immediately invoke the function to set everything up
(function() {
  console.log("ROTATION FIX: Installing direct rotation control");
  
  // Find the prism object directly
  function applyRotationFix() {
    // Check if Three.js scene is ready
    if (!window.prismaticScene || !window.prismaticScene.prism) {
      console.log("ROTATION FIX: Waiting for Three.js to initialize...");
      setTimeout(applyRotationFix, 500);
      return;
    }
    
    // Get direct reference to the 3D object
    const prism = window.prismaticScene.prism;
    console.log("ROTATION FIX: Found prism object, bypassing event system");
    
    // Variables for tracking
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    
    // Get a reference to the canvas for styles
    const canvas = document.getElementById('prism-bg-canvas');
    if (canvas) {
      // Ensure canvas has correct styling
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = 'grab';
    }
    
    // Function to apply rotation directly to the 3D object
    function rotateObject(deltaX, deltaY) {
      if (!prism) return;
      
      // Apply rotation directly to the object
      prism.rotation.y += deltaX * 0.01;
      prism.rotation.x += deltaY * 0.01;
      
      // Also update any mesh that needs to sync with the prism
      if (window.prismaticScene.glowMesh) {
        window.prismaticScene.glowMesh.rotation.copy(prism.rotation);
      }
      
      if (window.prismaticScene.prismEdges) {
        window.prismaticScene.prismEdges.rotation.copy(prism.rotation);
      }
      
      // Notify the original system that interaction happened
      if (window.prismaticScene.setInteraction) {
        window.prismaticScene.setInteraction(true);
      }
    }
    
    // Set up direct event listeners on document
    document.addEventListener('mousedown', function(e) {
      // Update cursor on drag start
      if (canvas) {
        canvas.style.cursor = 'grabbing';
      }
      
      isDragging = true;
      previousX = e.clientX;
      previousY = e.clientY;
      console.log("ROTATION FIX: Mouse down detected");
      
      // Notify the original system
      if (window.prismaticScene.setInteraction) {
        window.prismaticScene.setInteraction(true);
      }
    }, true);
    
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      
      const deltaX = e.clientX - previousX;
      const deltaY = e.clientY - previousY;
      previousX = e.clientX;
      previousY = e.clientY;
      
      rotateObject(deltaX, -deltaY);
    }, true);
    
    document.addEventListener('mouseup', function() {
      isDragging = false;
      console.log("ROTATION FIX: Mouse up detected");
      
      // Restore cursor
      if (canvas) {
        canvas.style.cursor = 'grab';
      }
      
      // Notify the original system after a delay
      setTimeout(() => {
        if (window.prismaticScene && window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(false);
        }
      }, 800);
    }, true);
    
    // Touch event versions
    document.addEventListener('touchstart', function(e) {
      // Prevent default to stop scrolling
      e.preventDefault();
      
      if (e.touches.length > 0) {
        isDragging = true;
        previousX = e.touches[0].clientX;
        previousY = e.touches[0].clientY;
        console.log("ROTATION FIX: Touch start detected");
        
        // Notify the original system
        if (window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(true);
        }
      }
    }, { capture: true, passive: false });
    
    document.addEventListener('touchmove', function(e) {
      // Prevent default to stop scrolling
      e.preventDefault();
      
      if (!isDragging || e.touches.length === 0) return;
      
      const deltaX = e.touches[0].clientX - previousX;
      const deltaY = e.touches[0].clientY - previousY;
      previousX = e.touches[0].clientX;
      previousY = e.touches[0].clientY;
      
      rotateObject(deltaX, -deltaY);
    }, { capture: true, passive: false });
    
    document.addEventListener('touchend', function(e) {
      // Prevent default to be safe
      e.preventDefault();
      
      isDragging = false;
      console.log("ROTATION FIX: Touch end detected");
      
      // Notify the original system after a delay
      setTimeout(() => {
        if (window.prismaticScene && window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(false);
        }
      }, 800);
    }, { capture: true, passive: false });
    
    console.log("ROTATION FIX: Direct rotation control installed");
  }
  
  // Start the fix with a slight delay to ensure everything is loaded
  setTimeout(applyRotationFix, 1000);
})();
