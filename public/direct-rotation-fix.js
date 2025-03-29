/**
 * direct-rotation-fix.js
 * 
 * A direct manipulation solution for 3D object interaction that
 * bypasses the standard event handling system and directly applies
 * rotation to the Three.js object.
 * 
 * Enhanced with smart direction detection to allow regular scrolling.
 */

// Immediately invoke the function to set everything up
(function() {
  console.log("ROTATION FIX: Installing direct rotation control with scroll detection");
  
  // Exit early if THREE is not defined or not available
  if (typeof window.THREE === 'undefined') {
    console.log("ROTATION FIX: THREE is not defined. Rotation fix will not be applied.");
    return;
  }
  
  // Find the prism object directly
  function applyRotationFix() {
    // Check if Three.js scene is ready - more thorough check
    if (!window.prismaticScene || 
        !window.prismaticScene.prism || 
        !window.prismaticScene.THREE) {
      console.log("ROTATION FIX: Waiting for Three.js to fully initialize...");
      
      // Limit the retry attempts to avoid infinite loop
      if (!window.rotationFixAttempts) {
        window.rotationFixAttempts = 1;
      } else {
        window.rotationFixAttempts++;
      }
      
      // Give up after 10 attempts
      if (window.rotationFixAttempts > 10) {
        console.log("ROTATION FIX: Giving up after multiple attempts. The 3D object may not be present on this page.");
        return;
      }
      
      setTimeout(applyRotationFix, 500);
      return;
    }
    
    // Get direct reference to the 3D object
    const prism = window.prismaticScene.prism;
    console.log("ROTATION FIX: Found prism object, bypassing event system");
    
    // Variables for tracking
    let isDragging = false;
    let isScrollingDown = false;
    let previousX = 0;
    let previousY = 0;
    let startY = 0;
    let lastMoveTime = 0;
    let moveCount = 0;
    let verticalMoveDistance = 0;
    let horizontalMoveDistance = 0;
    
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
      // Only handle clicks within the hero section
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        if (e.clientY > rect.bottom) {
          return; // Click is below the hero section, ignore
        }
      }
      
      // Update cursor on drag start
      if (canvas) {
        canvas.style.cursor = 'grabbing';
      }
      
      isDragging = true;
      isScrollingDown = false;
      previousX = e.clientX;
      previousY = e.clientY;
      startY = e.clientY;
      moveCount = 0;
      verticalMoveDistance = 0;
      horizontalMoveDistance = 0;
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
    
    // Touch event versions with scrolling detection
    document.addEventListener('touchstart', function(e) {
      // Only handle touches within the hero section
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        if (e.touches[0].clientY > rect.bottom) {
          return; // Touch is below the hero section, ignore
        }
      }
      
      if (e.touches.length > 0) {
        // Track initial touch position
        isDragging = true;
        isScrollingDown = false;
        previousX = e.touches[0].clientX;
        previousY = e.touches[0].clientY;
        startY = e.touches[0].clientY;
        lastMoveTime = Date.now();
        moveCount = 0;
        verticalMoveDistance = 0;
        horizontalMoveDistance = 0;
        console.log("ROTATION FIX: Touch start detected");
        
        // Don't prevent default immediately - wait to see if this is a scroll
      }
    }, { capture: true, passive: true });
    
    document.addEventListener('touchmove', function(e) {
      if (!isDragging || e.touches.length === 0) return;
      
      const now = Date.now();
      const timeDelta = now - lastMoveTime;
      lastMoveTime = now;
      
      const deltaX = e.touches[0].clientX - previousX;
      const deltaY = e.touches[0].clientY - previousY;
      
      // Track total movement in each direction
      verticalMoveDistance += Math.abs(deltaY);
      horizontalMoveDistance += Math.abs(deltaX);
      moveCount++;
      
      // Check for vertical scrolling pattern
      // If the user is primarily moving vertically downward and we're just starting the gesture
      if (moveCount < 5 && 
          Math.abs(deltaY) > Math.abs(deltaX) * 2 && // Moving more vertically than horizontally
          deltaY > 0 && // Moving downward
          e.touches[0].clientY - startY > 30) { // Moved down significantly
        
        console.log("ROTATION FIX: Detected vertical scrolling pattern, releasing interaction");
        isScrollingDown = true;
        isDragging = false;
        
        // Allow the browser to handle this as a scroll
        return;
      }
      
      // If we already detected this as a scrolling gesture, don't interfere
      if (isScrollingDown) return;
      
      // If more vertical movement than horizontal overall, and we're just starting,
      // this might be a scroll attempt
      if (moveCount < 8 && verticalMoveDistance > horizontalMoveDistance * 1.5) {
        console.log("ROTATION FIX: More vertical than horizontal movement, treating as scroll");
        isScrollingDown = true;
        isDragging = false;
        return;
      }
      
      // Only prevent default if we're sure this is a rotation, not a scroll
      if (!isScrollingDown) {
        e.preventDefault();
        
        // Update tracking for next move event
        previousX = e.touches[0].clientX;
        previousY = e.touches[0].clientY;
        
        // Apply rotation
        rotateObject(deltaX, -deltaY);
      }
    }, { capture: true, passive: false });
    
    document.addEventListener('touchend', function(e) {
      if (!isDragging && !isScrollingDown) return;
      
      isDragging = false;
      isScrollingDown = false;
      console.log("ROTATION FIX: Touch end detected");
      
      // Notify the original system after a delay
      setTimeout(() => {
        if (window.prismaticScene && window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(false);
        }
      }, 800);
    }, { capture: true, passive: true });
    
    console.log("ROTATION FIX: Direct rotation control installed with scroll detection");
  }
  
  // Start the fix with a slight delay to ensure everything is loaded
  setTimeout(applyRotationFix, 1000);
})();
