// direct-rotation-fix.js - Enhanced rotation handler for all browsers and devices

/**
 * This script fixes rotation handling for the 3D objects
 * It specifically solves issues with Chrome, Safari, and touch devices
 * While preserving normal page scrolling functionality
 */
(function() {
  console.log("ROTATION FIX: Initializing...");
  
  // Detect browsers for specific fixes
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobile = window.innerWidth < 768;
  
  // Configuration
  const rotationSpeed = isMobile ? 0.005 : 0.003; // Higher speed on mobile
  const maxAttempts = 20;
  let attempts = 0;
  
  // Wait for Three.js to be available and set up
  function waitForThree() {
    if (attempts >= maxAttempts) {
      console.log("ROTATION FIX: Giving up after multiple attempts. The 3D object may not be present on this page.");
      return;
    }
    
    attempts++;
    
    // Check if we have the 3D scene available
    if (!window.prismaticScene || !window.prismaticScene.prism) {
      console.log("ROTATION FIX: Waiting for Three.js to fully initialize...");
      setTimeout(waitForThree, 300); // Try again soon
      return;
    }
    
    console.log("ROTATION FIX: Three.js detected, setting up rotation handler");
    setupRotationHandler();
  }
  
  // Main function to set up the rotation handler
  function setupRotationHandler() {
    // Get all interactive elements that might contain our 3D object
    const interactiveElements = [
      document.getElementById('morphing-poly-canvas'), // Put the actual canvas first!
      document.getElementById('prism-background'),
      document.getElementById('hero-prism-container'),
      document.getElementById('prism-bg-canvas')
    ].filter(el => el); // Filter out null elements
    
    // Exit if no interactive elements found
    if (interactiveElements.length === 0) {
      console.log("ROTATION FIX: No interactive elements found, trying fallback method");
      // Fallback - just try to grab any canvas element
      const canvases = document.querySelectorAll('canvas');
      if (canvases.length > 0) {
        console.log("ROTATION FIX: Found canvas via fallback");
        Array.from(canvases).forEach(canvas => {
          setupInteractionForElement(canvas);
        });
      } else {
        console.log("ROTATION FIX: No canvas elements found at all");
      }
      return;
    }
    
    // Set up interaction for each element found
    interactiveElements.forEach(el => {
      setupInteractionForElement(el);
    });
    
    console.log("ROTATION FIX: Setup complete for interactive elements:", interactiveElements.length);
  }
  
  // Sets up interaction handlers for a single element
  function setupInteractionForElement(el) {
    if (!el) return;
    
    console.log("ROTATION FIX: Setting up interaction for", el.id || "unknown element");
    
    // Common state
    let isInteracting = false;
    let previousPosition = { x: 0, y: 0 };
    let currentInteractionType = 'none'; // 'none', 'mouse', or 'touch'
    
    // Define specific areas for interaction vs. scrolling
    // Only apply 3D object interaction to the top part of the screen
    // Allow normal scrolling elsewhere
    function isInteractionArea(y) {
      // On mobile, only the top 70% of screen is for 3D interaction
      if (isMobile) {
        return y < window.innerHeight * 0.7;
      }
      // On desktop, most of screen is for 3D interaction
      return y < window.innerHeight * 0.85;
    }
    
    // Apply critical styles but DON'T use touch-action: none globally
    // This will allow normal scrolling
    el.style.cssText += `
      -webkit-user-select: none !important;
      -webkit-touch-callout: none !important;
      -webkit-tap-highlight-color: rgba(0,0,0,0) !important;
      user-select: none !important;
      pointer-events: auto !important;
      cursor: grab !important;
    `;
    
    // Ensure it has a z-index
    if (!el.style.zIndex) el.style.zIndex = '50';
    // Ensure pointer events are enabled
    if (!el.style.pointerEvents) el.style.pointerEvents = 'auto';
    
    // For Chrome, set initial interaction state
    el.setAttribute('data-interaction-type', 'none');
    
    // Mouse event handlers
    const handleMouseDown = function(e) {
      // Skip if currently in a touch interaction
      if (currentInteractionType === 'touch') return;
      
      // Prevent default to avoid browser handling
      e.preventDefault();
      e.stopPropagation();
      
      console.log("ROTATION FIX: Mouse interaction started on", el.id || "unknown element");
      
      // Update state
      isInteracting = true;
      currentInteractionType = 'mouse';
      
      // Update element state
      el.setAttribute('data-interaction-type', 'mouse');
      el.style.cursor = 'grabbing';
      
      // Store initial position
      previousPosition = { x: e.clientX, y: e.clientY };
      
      // Enable interaction flag in prismatic scene
      if (window.prismaticScene && window.prismaticScene.setInteraction) {
        window.prismaticScene.setInteraction(true);
      }
      
      // Set up move and end handlers
      const handleMouseMove = function(moveEvent) {
        // Skip if not in mouse interaction mode
        if (currentInteractionType !== 'mouse') return;
        
        // Prevent default to avoid dragging
        moveEvent.preventDefault();
        moveEvent.stopPropagation();
        
        // Calculate movement delta
        const deltaX = moveEvent.clientX - previousPosition.x;
        const deltaY = moveEvent.clientY - previousPosition.y;
        
        // Apply rotation
        applyRotation(deltaX, deltaY);
        
        // Update previous position
        previousPosition = { x: moveEvent.clientX, y: moveEvent.clientY };
      };
      
      const handleMouseUp = function(upEvent) {
        // Skip if not in mouse interaction mode
        if (currentInteractionType !== 'mouse') return;
        
        if (upEvent) {
          upEvent.preventDefault();
          upEvent.stopPropagation();
        }
        
        console.log("ROTATION FIX: Mouse interaction ended");
        
        // Update state
        isInteracting = false;
        currentInteractionType = 'none';
        
        // Update element state
        el.setAttribute('data-interaction-type', 'none');
        el.style.cursor = 'grab';
        
        // Disable interaction flag in prismatic scene
        if (window.prismaticScene && window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(false);
        }
        
        // Remove event listeners
        document.removeEventListener('mousemove', handleMouseMove, { capture: true });
        document.removeEventListener('mouseup', handleMouseUp, { capture: true });
        document.removeEventListener('mouseleave', handleMouseUp, { capture: true });
      };
      
      // Add document-level event listeners to catch all mouse movements
      document.addEventListener('mousemove', handleMouseMove, { capture: true });
      document.addEventListener('mouseup', handleMouseUp, { capture: true });
      document.addEventListener('mouseleave', handleMouseUp, { capture: true });
    };
    
    // Touch event handlers
    const handleTouchStart = function(e) {
      // Only prevent default in 3D interaction area
      // This allows normal scrolling elsewhere on the page
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        if (!isInteractionArea(touch.clientY)) {
          // Outside interaction area, allow normal touch behavior
          return;
        }
      } else {
        // No touch points, exit
        return;
      }
      
      // Prevent default behavior on touch only in the interaction area
      e.preventDefault();
      e.stopPropagation();
      
      console.log("ROTATION FIX: Touch interaction started on", el.id || "unknown element");
      
      // Update state
      isInteracting = true;
      currentInteractionType = 'touch';
      
      // Update element state
      el.setAttribute('data-interaction-type', 'touch');
      el.style.cursor = 'grabbing';
      
      // Store initial position from first touch point
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        previousPosition = { x: touch.clientX, y: touch.clientY };
      }
      
      // Enable interaction flag in prismatic scene
      if (window.prismaticScene && window.prismaticScene.setInteraction) {
        window.prismaticScene.setInteraction(true);
      }
      
      // Set up move and end handlers
      const handleTouchMove = function(moveEvent) {
        // Skip if not in touch interaction mode
        if (currentInteractionType !== 'touch') return;
        
        // Only prevent default in 3D interaction area
        if (moveEvent.touches.length > 0) {
          const touch = moveEvent.touches[0];
          if (!isInteractionArea(touch.clientY)) {
            // End the interaction if moved outside area
            handleTouchEnd();
            return;
          }
          
          // Prevent default to avoid scrolling while in interaction area
          moveEvent.preventDefault();
          moveEvent.stopPropagation();
          
          // Calculate movement delta
          const deltaX = touch.clientX - previousPosition.x;
          const deltaY = touch.clientY - previousPosition.y;
          
          // Apply rotation
          applyRotation(deltaX, deltaY);
          
          // Update previous position
          previousPosition = { x: touch.clientX, y: touch.clientY };
        }
      };
      
      const handleTouchEnd = function(endEvent) {
        // Skip if not in touch interaction mode
        if (currentInteractionType !== 'touch') return;
        
        if (endEvent) {
          // Only prevent default in interaction area to allow scrolling elsewhere
          if (isInteractionArea(previousPosition.y)) {
            endEvent.preventDefault();
            endEvent.stopPropagation();
          }
        }
        
        console.log("ROTATION FIX: Touch interaction ended");
        
        // Update state
        isInteracting = false;
        currentInteractionType = 'none';
        
        // Update element state
        el.setAttribute('data-interaction-type', 'none');
        el.style.cursor = 'grab';
        
        // Disable interaction flag in prismatic scene
        if (window.prismaticScene && window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(false);
        }
        
        // Remove event listeners
        document.removeEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
        document.removeEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
        document.removeEventListener('touchcancel', handleTouchEnd, { capture: true, passive: false });
      };
      
      // Add document-level event listeners to catch all touch movements
      document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
      document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
      document.addEventListener('touchcancel', handleTouchEnd, { capture: true, passive: false });
    };
    
    // Function to apply rotation to the 3D object
    function applyRotation(deltaX, deltaY) {
      // Apply rotation only if we have access to the prismatic scene
      if (window.prismaticScene && window.prismaticScene.prism) {
        // Invert Y axis for natural touch/mouse feel
        const rotX = -deltaY * rotationSpeed;
        const rotY = deltaX * rotationSpeed;
        
        // Check for valid prismatic scene with rotation method
        if (window.prismaticScene.setRotationVelocity) {
          window.prismaticScene.setRotationVelocity(rotY, rotX);
        } 
        // Or apply directly to prism rotation if available
        else if (window.prismaticScene.prism && window.prismaticScene.prism.rotation) {
          window.prismaticScene.prism.rotation.x += rotX;
          window.prismaticScene.prism.rotation.y += rotY;
        }
      }
    }
    
    // Add initial event listeners based on browser
    el.addEventListener('mousedown', handleMouseDown, { capture: true });
    el.addEventListener('touchstart', handleTouchStart, { capture: true, passive: false });
    
    // Log that we've set up handlers for this element
    console.log(`ROTATION FIX: Added handlers to ${el.id || 'element'}`);
  }
  
  // Start the initialization process
  // For Firefox, just apply immediately since it loads faster
  if (isFirefox) {
    setTimeout(waitForThree, 100);
  } else {
    // For other browsers, wait a bit longer
    setTimeout(waitForThree, 500);
  }
  
  // Also set up a mutation observer to catch dynamically added elements
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.id === 'morphing-poly-canvas' || node.id === 'prism-bg-canvas') {
            console.log(`ROTATION FIX: Detected dynamic addition of canvas ${node.id}`);
            setupInteractionForElement(node);
          }
        }
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log("ROTATION FIX: Setup complete");
})();