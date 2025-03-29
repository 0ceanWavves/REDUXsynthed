// touchEventFix.js - Handles cross-browser touch and mouse interactions properly

/**
 * Sets up cross-browser compatible interaction handlers for 3D objects
 * This function addresses specific issues in Chrome, Safari, Firefox, and mobile browsers
 */
export function setupowserInteraction(element, callbacks) {
  if (!element) return { cleanup: () => {} };
  
  // Detect browser
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  console.log("Setting up interaction for:", { isFirefox, isChrome, isSafari, isIOS });
  
  // Shared state
  let isInteracting = false;
  let interactionType = 'none'; // 'none', 'mouse', or 'touch'
  let previousPosition = { x: 0, y: 0 };
  
  // Store reference to event handlers for cleanup
  const handlers = {};
  
  // Set options for different browsers
  const touchOptions = { passive: false, capture: true };
  const mouseOptions = { capture: true };
  
  // Apply style fixes
  element.style.touchAction = 'none';
  element.style.webkitUserSelect = 'none';
  element.style.userSelect = 'none';
  element.style.webkitTouchCallout = 'none';
  element.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
  
  // Set the interaction type directly on the element
  element.setAttribute('data-interaction-type', 'none');
  
  // Mouse event handlers
  handlers.mouseDown = (e) => {
    // Prevent handling mouse events during touch interaction
    if (interactionType === 'touch') return;
    
    console.log("Mouse interaction started");
    e.preventDefault();
    
    // Set interaction state
    isInteracting = true;
    interactionType = 'mouse';
    element.setAttribute('data-interaction-type', 'mouse');
    
    // Update cursor
    element.classList.add('cursor-grabbing');
    element.classList.remove('cursor-grab');
    
    // Store initial position
    previousPosition = { x: e.clientX, y: e.clientY };
    
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
    
    // Calculate delta
    const deltaX = e.clientX - previousPosition.x;
    const deltaY = e.clientY - previousPosition.y;
    
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
    
    if (e) e.preventDefault();
    
    console.log("Mouse interaction ended");
    
    // Reset interaction state
    isInteracting = false;
    interactionType = 'none';
    element.setAttribute('data-interaction-type', 'none');
    
    // Update cursor
    element.classList.remove('cursor-grabbing');
    element.classList.add('cursor-grab');
    
    // Call callback if provided
    if (callbacks?.onEnd) callbacks.onEnd();
    
    // Remove document-level handlers
    document.removeEventListener('mousemove', handlers.mouseMove, mouseOptions);
    document.removeEventListener('mouseup', handlers.mouseUp, mouseOptions);
    document.removeEventListener('mouseleave', handlers.mouseUp, mouseOptions);
  };
  
  // Touch event handlers
  handlers.touchStart = (e) => {
    console.log("Touch interaction started");
    e.preventDefault();
    
    // Set interaction state
    isInteracting = true;
    interactionType = 'touch';
    element.setAttribute('data-interaction-type', 'touch');
    
    // Get the first touch point
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      previousPosition = { x: touch.clientX, y: touch.clientY };
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
    
    e.preventDefault();
    
    // Get the first touch point
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      
      // Calculate delta
      const deltaX = touch.clientX - previousPosition.x;
      const deltaY = touch.clientY - previousPosition.y;
      
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
    
    if (e) e.preventDefault();
    
    console.log("Touch interaction ended");
    
    // Reset interaction state
    isInteracting = false;
    interactionType = 'none';
    element.setAttribute('data-interaction-type', 'none');
    
    // Call callback if provided
    if (callbacks?.onEnd) callbacks.onEnd();
    
    // Remove document-level handlers
    document.removeEventListener('touchmove', handlers.touchMove, touchOptions);
    document.removeEventListener('touchend', handlers.touchEnd, touchOptions);
    document.removeEventListener('touchcancel', handlers.touchEnd, touchOptions);
  };
  
  // Add initial event listeners based on browser
  if (isFirefox) {
    // Firefox-specific handling
    element.addEventListener('mousedown', handlers.mouseDown);
    element.addEventListener('touchstart', handlers.touchStart, touchOptions);
  } else if (isChrome || isSafari || isIOS) {
    // Chrome/Safari/iOS handling
    element.addEventListener('mousedown', handlers.mouseDown, mouseOptions);
    element.addEventListener('touchstart', handlers.touchStart, touchOptions);
    
    // Set initial values
    element.setAttribute('data-interaction-type', 'none');
  } else {
    // Default handling for other browsers
    element.addEventListener('mousedown', handlers.mouseDown);
    element.addEventListener('touchstart', handlers.touchStart, touchOptions);
  }
  
  // Cleanup function to remove all event listeners
  const cleanup = () => {
    element.removeEventListener('mousedown', handlers.mouseDown);
    element.removeEventListener('touchstart', handlers.touchStart);
    
    document.removeEventListener('mousemove', handlers.mouseMove);
    document.removeEventListener('mouseup', handlers.mouseUp);
    document.removeEventListener('mouseleave', handlers.mouseUp);
    
    document.removeEventListener('touchmove', handlers.touchMove);
    document.removeEventListener('touchend', handlers.touchEnd);
    document.removeEventListener('touchcancel', handlers.touchEnd);
    
    console.log("All interaction event handlers cleaned up");
  };
  
  // Method to check if interaction is happening
  const isCurrentlyInteracting = () => isInteracting;
  
  // Return interface to cleanup and check state
  return {
    cleanup,
    isInteracting: isCurrentlyInteracting
  };
}