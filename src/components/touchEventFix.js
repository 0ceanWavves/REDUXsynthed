/**
 * Cross-browser touch event handling fix
 * This script helps normalize touch event behavior across Firefox, Chrome, Safari, and iOS devices.
 */

// Detect browsers for targeted fixes
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
             (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isMobile = window.innerWidth < 768;

// Universal touch event handler - works across all browsers
export function applyTouchEventFixes() {
  console.log("Applying universal cross-browser touch event fixes");
  console.log("Browser detection:", { isFirefox, isChrome, isSafari, isIOS, isMobile });
  
  // Find all canvases and interactive 3D elements
  // IMPORTANT: EXCLUDE #prism-bg-canvas and prism-background since they are handled by AmorphousPrism.astro
  const canvases = document.querySelectorAll('canvas:not(#prism-bg-canvas), .prism-interactive-area:not(#prism-background)');
  
  canvases.forEach(canvas => {
    if (canvas instanceof HTMLElement) {
      // Set universal styles first
      canvas.style.pointerEvents = 'auto';
      
      // On mobile, set touch-action to allow scrolling
      if (isMobile) {
        canvas.style.touchAction = 'pan-y';
      }
      
      // Firefox-specific fixes
      if (isFirefox) {
        // Firefox needs these specific styles
        canvas.style.touchAction = isMobile ? 'pan-y' : 'auto';
        canvas.style.userSelect = 'none';
        canvas.style.mozUserSelect = 'none';
      }
      // Chrome/Safari/iOS-specific fixes
      else if (isChrome || isSafari || isIOS) {
        canvas.style.touchAction = isMobile ? 'pan-y' : 'none';
        canvas.style.webkitTouchCallout = 'none';
        canvas.style.webkitUserSelect = 'none';
        canvas.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
        
        // CRITICAL: For Chrome, we need special handling to ensure both touch and mouse work
        // This flag helps us track which type of event initiated the interaction
        canvas.dataset.interactionType = 'none';
        canvas.setAttribute('data-interaction-type', 'none'); // Force attribute to be set directly
        
        // Add touch event listeners specifically for Chrome
        const handleTouchStart = function(e) {
          // Don't prevent default on mobile to allow scrolling
          if (!isMobile) {
            e.preventDefault();
          }
          console.log("Chrome touch event captured");
          canvas.dataset.interactionType = 'touch';
          canvas.setAttribute('data-interaction-type', 'touch'); // Force attribute to be set directly
        };
        
        const handleTouchMove = function(e) {
          // Don't prevent default on mobile to allow scrolling
          if (!isMobile) {
            e.preventDefault();
          }
          console.log("Chrome touch move with interaction type:", canvas.dataset.interactionType);
        };
        
        canvas.addEventListener('touchstart', handleTouchStart, { passive: isMobile, capture: true });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: isMobile, capture: true });
        
        // Handle mouse events separately from touch
        canvas.addEventListener('mousedown', function(e) {
          console.log("Chrome mouse event captured");
          canvas.dataset.interactionType = 'mouse';
          canvas.setAttribute('data-interaction-type', 'mouse'); // Force attribute to be set directly
        });
      }
      
      // Universal pointer events - EXCLUDE BOTH prism-bg-canvas AND prism-background
      if (canvas.id !== 'prism-bg-canvas' && canvas.id !== 'prism-background') {
        canvas.addEventListener('pointerdown', function(e) {
          // Don't prevent default on mobile or in Firefox for pointer events
          if (!isFirefox && !isMobile) {
            e.preventDefault();
          }
          console.log(`${isFirefox ? 'Firefox' : 'Browser'} pointerdown captured on ${canvas.id || 'canvas'}`);
        }, { passive: isFirefox || isMobile });
        
        canvas.addEventListener('pointermove', function(e) {
          // Don't prevent default on mobile or in Firefox for pointer events
          if (!isFirefox && !isMobile) {
            e.preventDefault();
          }
        }, { passive: isFirefox || isMobile });
      }
      
      console.log(`Applied ${isFirefox ? 'Firefox' : 'standard'} touch fixes to: ${canvas.id || "canvas element"}`);
    }
  });
  
  // Universal document settings
  if (isFirefox) {
    // Firefox needs different document settings
    document.documentElement.style.overscrollBehavior = 'none';
  } else {
    // Chrome/Safari/iOS settings
    document.documentElement.style.touchAction = 'manipulation';
    document.documentElement.style.overscrollBehavior = 'none';
  }
  
  // Fix prism background - COMPLETELY SKIP FOR ALL EVENT HANDLERS
  const prismBackground = document.getElementById('prism-background');
  if (prismBackground) {
    console.log('Detected prism-background but SKIPPING event handlers to avoid conflicts with AmorphousPrism');
    
    // Only set some basic styles but DO NOT attach any event handlers
    prismBackground.style.pointerEvents = 'auto';
    
    // Check if AmorphousPrism is active before applying any styles
    const isAmorphousPrismActive = window.prismaticScene && window.prismaticScene.canvas;
    
    // Only apply styles if AmorphousPrism is NOT active
    if (!isAmorphousPrismActive) {
      console.log('AmorphousPrism not active, applying minimal styles to prism-background');
      
      if (isFirefox) {
        prismBackground.style.userSelect = 'none';
      } else {
        // On mobile, set touch-action to allow scrolling
        prismBackground.style.touchAction = isMobile ? 'pan-y' : 'none';
        prismBackground.style.webkitUserSelect = 'none';
        
        // CRITICAL: For Chrome, set initial interaction type but NO EVENT HANDLERS
        prismBackground.dataset.interactionType = 'none';
      }
    } else {
      console.log('AmorphousPrism active, skipping ALL styles for prism-background');
    }
  }
}

// Cross-browser event setup that prioritizes the correct event type for each browser
export function setupCrossBrowserInteraction(element, onInteractionStart, onInteractionMove, onInteractionEnd) {
  if (!element) return;
  
  // CRITICAL: Check if element is prism-bg-canvas or prism-background AND if AmorphousPrism is active
  const isPrismElement = element.id === 'prism-bg-canvas' || element.id === 'prism-background';
  const isAmorphousPrismActive = window.prismaticScene && window.prismaticScene.canvas;
  
  // If this is a prism element and AmorphousPrism is active, don't set up interaction
  if (isPrismElement && isAmorphousPrismActive) {
    console.log(`Skipping setupCrossBrowserInteraction for ${element.id} because AmorphousPrism is active`);
    return {
      destroy: function() {
        // No-op since we didn't set up any listeners
      }
    };
  }
  
  // Apply different event handling based on browser
  if (isFirefox) {
    // Firefox works best with pointer events
    setupPointerEvents(element, onInteractionStart, onInteractionMove, onInteractionEnd);
  } else if (isChrome || isIOS || isSafari) {
    // Chrome/iOS - set up BOTH independently
    setupTouchEvents(element, onInteractionStart, onInteractionMove, onInteractionEnd);
    setupMouseEvents(element, onInteractionStart, onInteractionMove, onInteractionEnd);
  } else {
    // All other browsers - use pointer events
    setupPointerEvents(element, onInteractionStart, onInteractionMove, onInteractionEnd);
  }
  
  return {
    destroy: function() {
      // Cleanup function would remove all event listeners
    }
  };
}

// Setup pointer events (better for Firefox)
function setupPointerEvents(element, onStart, onMove, onEnd) {
  // For Firefox or mobile, we use passive event listeners to allow scrolling
  const passive = isFirefox || isMobile;
  
  element.addEventListener('pointerdown', function(e) {
    if (!isFirefox && !isMobile) e.preventDefault();
    onStart({
      clientX: e.clientX,
      clientY: e.clientY,
      preventDefault: () => isFirefox || isMobile ? null : e.preventDefault(),
      stopPropagation: () => e.stopPropagation()
    });
    
    const handlePointerMove = function(moveEvent) {
      if (!isFirefox && !isMobile) moveEvent.preventDefault();
      onMove({
        clientX: moveEvent.clientX,
        clientY: moveEvent.clientY,
        preventDefault: () => isFirefox || isMobile ? null : moveEvent.preventDefault(),
        stopPropagation: () => moveEvent.stopPropagation()
      });
    };
    
    const handlePointerUp = function(upEvent) {
      if (!isFirefox && !isMobile) upEvent.preventDefault();
      onEnd({
        preventDefault: () => isFirefox || isMobile ? null : upEvent.preventDefault(),
        stopPropagation: () => upEvent.stopPropagation()
      });
      
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
    
    document.addEventListener('pointermove', handlePointerMove, { passive });
    document.addEventListener('pointerup', handlePointerUp, { passive });
  }, { passive });
}

// Setup touch events specifically for Chrome/iOS - independent from mouse events
function setupTouchEvents(element, onStart, onMove, onEnd) {
  // Use passive event listeners on mobile to allow scrolling
  const passive = isMobile;
  
  element.addEventListener('touchstart', function(e) {
    if (!isMobile) e.preventDefault();
    element.dataset.interactionType = 'touch';
    element.setAttribute('data-interaction-type', 'touch'); // Force attribute to be set directly
    
    console.log("Touch start with type:", element.dataset.interactionType);
    
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      onStart({
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => isMobile ? null : e.preventDefault(),
        stopPropagation: () => e.stopPropagation()
      });
    }
    
    const handleTouchMove = function(moveEvent) {
      if (!isMobile) moveEvent.preventDefault();
      
      console.log("Touch move with type:", element.dataset.interactionType);
      
      if (moveEvent.touches.length > 0) {
        const touch = moveEvent.touches[0];
        onMove({
          clientX: touch.clientX,
          clientY: touch.clientY,
          preventDefault: () => isMobile ? null : moveEvent.preventDefault(),
          stopPropagation: () => moveEvent.stopPropagation()
        });
      }
    };
    
    const handleTouchEnd = function(endEvent) {
      if (!isMobile) endEvent.preventDefault();
      element.dataset.interactionType = 'none';
      element.setAttribute('data-interaction-type', 'none'); // Force attribute to be set directly
      
      onEnd({
        preventDefault: () => isMobile ? null : endEvent.preventDefault(),
        stopPropagation: () => endEvent.stopPropagation()
      });
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive, capture: true });
  }, { passive, capture: true });
}

// Setup separate mouse events for Chrome/iOS
function setupMouseEvents(element, onStart, onMove, onEnd) {
  element.addEventListener('mousedown', function(e) {
    // Skip if currently in a touch interaction
    if (element.dataset.interactionType === 'touch') return;
    
    element.dataset.interactionType = 'mouse';
    
    onStart({
      clientX: e.clientX,
      clientY: e.clientY,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation()
    });
    
    const handleMouseMove = function(moveEvent) {
      // Skip if not in a mouse interaction
      if (element.dataset.interactionType !== 'mouse') return;
      
      onMove({
        clientX: moveEvent.clientX,
        clientY: moveEvent.clientY,
        preventDefault: () => moveEvent.preventDefault(),
        stopPropagation: () => moveEvent.stopPropagation()
      });
    };
    
    const handleMouseUp = function() {
      element.dataset.interactionType = 'none';
      
      onEnd({
        preventDefault: () => {},
        stopPropagation: () => {}
      });
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });
}