// touchEventFix.js - Handles cross-browser touch and mouse interactions properly

/**
 * Sets up cross-browser compatible interaction handlers for 3D objects
 * This function addresses specific issues in Chrome, Safari, Firefox, and mobile browsers
 * While preserving normal scrolling functionality on mobile devices
 */
export function setupCrossBrowserInteraction(element, callbacks) {
  if (!element) return { cleanup: () => {} };
  
  // Detect browser
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobile = window.innerWidth < 768;
  
  console.log("TouchEventFix: Setting up for element", element.id || "unnamed element", { isFirefox, isChrome, isSafari, isIOS, isMobile });
  
  // Shared state
  let isInteracting = false;
  let interactionType = 'none'; // 'none', 'mouse', or 'touch'
  let previousPosition = { x: 0, y: 0 };
  
  // Store reference to event handlers for cleanup
  const handlers = {};
  
  // Set options for different browsers
  const touchOptions = { passive: false, capture: true };
  const mouseOptions = { capture: true };
  
  // Apply style fixes - but don't use touch-action: none which blocks scrolling
  element.style.cssText += `
    -webkit-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-tap-highlight-color: rgba(0,0,0,0) !important;
    pointer-events: auto !important;
    cursor: grab !important;
    z-index: 100 !important;
  `;
  
  // Set the interaction type directly on the element
  element.setAttribute('data-interaction-type', 'none');
  
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
  
  // Mouse event handlers
  handlers.mouseDown = (e) => {
    // Prevent handling mouse events during touch interaction
    if (interactionType === 'touch') return;
    
    console.log("TouchEventFix: Mouse interaction started on", element.id || "unnamed element");
    e.preventDefault();
    e.stopPropagation();
    
    // Set interaction state
    isInteracting = true;
    interactionType = 'mouse';
    element.setAttribute('data-interaction-type', 'mouse');
    
    // Update cursor
    element.style.cursor = 'grabbing';
    
    // Store initial position
    previousPosition = { x: e.clientX, y: e.clientY };
    
    // Signal to ThreeJS scene that interaction is starting
    if (window.prismaticScene && window.prismaticScene.setInteraction) {
      window.prismaticScene.setInteraction(true);
    }
    
    // Call callback if provided
    if (callbacks?.onStart) callbacks.onStart();
    
    // Add document-level handlers
    document.addEventListener('mousemove', handlers.mouseMove, mouseOptions);
    document.addEventListener('mouseup', handlers.mouseUp, mouseOptions);
    document.addEventListener('mouseleave', handlers.mouseUp, mouseOptions);
  };
  
  handlers.mouseMove = (e) => {
    // Only process if we're in mouse interaction mode
    if (interactionType !== 'mouse') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate delta
    const deltaX = e.clientX - previousPosition.x;
    const deltaY = e.clientY - previousPosition.y;
    
    // Apply rotation to ThreeJS object if available
    applyRotationToScene(deltaX, deltaY);
    
    // Call callback with movement data
    if (callbacks?.onMove) {
      callbacks.onMove({ deltaX, deltaY, event: e });
    }
    
    // Update previous position
    previousPosition = { x: e.clientX, y: e.clientY };
  };
  
  handlers.mouseUp = (e) => {
    // Only process if we're in mouse interaction mode
    if (interactionType !== 'mouse') return;
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("TouchEventFix: Mouse interaction ended");
    
    // Reset interaction state
    isInteracting = false;
    interactionType = 'none';
    element.setAttribute('data-interaction-type', 'none');
    
    // Update cursor
    element.style.cursor = 'grab';
    
    // Signal to ThreeJS scene that interaction is ending
    if (window.prismaticScene && window.prismaticScene.setInteraction) {
      window.prismaticScene.setInteraction(false);
    }
    
    // Call callback if provided
    if (callbacks?.onEnd) callbacks.onEnd();
    
    // Remove document-level handlers
    document.removeEventListener('mousemove', handlers.mouseMove, mouseOptions);
    document.removeEventListener('mouseup', handlers.mouseUp, mouseOptions);
    document.removeEventListener('mouseleave', handlers.mouseUp, mouseOptions);
  };
  
  // Touch event handlers
  handlers.touchStart = (e) => {
    // Check if touch is in 3D interaction area
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (!isInteractionArea(touch.clientY)) {
        // Outside interaction area, allow normal touch behavior
        return;
      }
      
      // Only prevent default in interaction area
      e.preventDefault();
      e.stopPropagation();
    } else {
      // No touch points, exit
      return;
    }
    
    console.log("TouchEventFix: Touch interaction started on", element.id || "unnamed element");
    
    // Set interaction state
    isInteracting = true;
    interactionType = 'touch';
    element.setAttribute('data-interaction-type', 'touch');
    
    // Update cursor
    element.style.cursor = 'grabbing';
    
    // Get the first touch point
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      previousPosition = { x: touch.clientX, y: touch.clientY };
    }
    
    // Signal to ThreeJS scene that interaction is starting
    if (window.prismaticScene && window.prismaticScene.setInteraction) {
      window.prismaticScene.setInteraction(true);
    }
    
    // Call callback if provided
    if (callbacks?.onStart) callbacks.onStart();
    
    // Add document-level handlers
    document.addEventListener('touchmove', handlers.touchMove, touchOptions);
    document.addEventListener('touchend', handlers.touchEnd, touchOptions);
    document.addEventListener('touchcancel', handlers.touchEnd, touchOptions);
  };
  
  handlers.touchMove = (e) => {
    // Only process if we're in touch interaction mode
    if (interactionType !== 'touch') return;
    
    // Only prevent default in 3D interaction area
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (!isInteractionArea(touch.clientY)) {
        // End the interaction if moved outside area
        handlers.touchEnd();
        return;
      }
      
      // Prevent default to avoid scrolling while in interaction area
      e.preventDefault();
      e.stopPropagation();
      
      // Calculate delta
      const deltaX = touch.clientX - previousPosition.x;
      const deltaY = touch.clientY - previousPosition.y;
      
      // Apply rotation to ThreeJS object if available
      applyRotationToScene(deltaX, deltaY);
      
      // Call callback with movement data
      if (callbacks?.onMove) {
        callbacks.onMove({ deltaX, deltaY, event: e });
      }
      
      // Update previous position
      previousPosition = { x: touch.clientX, y: touch.clientY };
    }
  };
  
  handlers.touchEnd = (e) => {
    // Only process if we're in touch interaction mode
    if (interactionType !== 'touch') return;
    
    // Only prevent default in interaction area to allow scrolling elsewhere
    if (e && isInteractionArea(previousPosition.y)) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("TouchEventFix: Touch interaction ended");
    
    // Reset interaction state
    isInteracting = false;
    interactionType = 'none';
    element.setAttribute('data-interaction-type', 'none');
    
    // Update cursor
    element.style.cursor = 'grab';
    
    // Signal to ThreeJS scene that interaction is ending
    if (window.prismaticScene && window.prismaticScene.setInteraction) {
      window.prismaticScene.setInteraction(false);
    }
    
    // Call callback if provided
    if (callbacks?.onEnd) callbacks.onEnd();
    
    // Remove document-level handlers
    document.removeEventListener('touchmove', handlers.touchMove, touchOptions);
    document.removeEventListener('touchend', handlers.touchEnd, touchOptions);
    document.removeEventListener('touchcancel', handlers.touchEnd, touchOptions);
  };

  // Helper function to apply rotation to the ThreeJS scene
  function applyRotationToScene(deltaX, deltaY) {
    const rotationSpeed = isMobile ? 0.005 : 0.003;
    
    // First try using the global rotation function if available
    if (window.applyPrismRotation) {
      console.log("TouchEventFix: Using global rotation function");
      return window.applyPrismRotation(deltaX, deltaY);
    }
    
    // Apply rotation only if we have access to the prismatic scene
    if (window.prismaticScene && window.prismaticScene.prism) {
      // Invert Y axis for natural touch/mouse feel
      const rotX = -deltaY * rotationSpeed;
      const rotY = deltaX * rotationSpeed;
      
      console.log("TouchEventFix: Applying rotation directly", rotX, rotY);
      
      // Try different methods to rotate the object
      if (window.prismaticScene.setRotationVelocity) {
        window.prismaticScene.setRotationVelocity(rotY, rotX);
        return true;
      } 
      else if (window.prismaticScene.applyRotation) {
        window.prismaticScene.applyRotation(rotX, rotY);
        return true;
      }
      else if (window.prismaticScene.prism.rotation) {
        window.prismaticScene.prism.rotation.x += rotX;
        window.prismaticScene.prism.rotation.y += rotY;
        return true;
      }
    }
    
    return false;
  }
  
  // Add initial event listeners based on browser
  // For reliable touch handling, use capture phase and prevent default
  element.addEventListener('mousedown', handlers.mouseDown, mouseOptions);
  element.addEventListener('touchstart', handlers.touchStart, touchOptions);
  
  console.log("TouchEventFix: Setup complete for", element.id || "unnamed element");
  
  // Cleanup function to remove all event listeners
  const cleanup = () => {
    element.removeEventListener('mousedown', handlers.mouseDown, mouseOptions);
    element.removeEventListener('touchstart', handlers.touchStart, touchOptions);
    
    document.removeEventListener('mousemove', handlers.mouseMove, mouseOptions);
    document.removeEventListener('mouseup', handlers.mouseUp, mouseOptions);
    document.removeEventListener('mouseleave', handlers.mouseUp, mouseOptions);
    
    document.removeEventListener('touchmove', handlers.touchMove, touchOptions);
    document.removeEventListener('touchend', handlers.touchEnd, touchOptions);
    document.removeEventListener('touchcancel', handlers.touchEnd, touchOptions);
  };
  
  // Return cleanup function for component unmounting
  return { cleanup };
}