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

// Universal touch event handler - works across all browsers
export function applyTouchEventFixes() {
  console.log("Applying universal cross-browser touch event fixes");
  console.log("Browser detection:", { isFirefox, isChrome, isSafari, isIOS });
  
  // Find all canvases and interactive 3D elements
  const canvases = document.querySelectorAll('canvas, #prism-bg-canvas, .prism-interactive-area');
  
  canvases.forEach(canvas => {
    if (canvas instanceof HTMLElement) {
      // Set universal styles first
      canvas.style.pointerEvents = 'auto';
      
      // Firefox-specific fixes
      if (isFirefox) {
        // Firefox needs these specific styles
        canvas.style.touchAction = 'none';
        canvas.style.userSelect = 'none';
        canvas.style.mozUserSelect = 'none';
        
        // Firefox sometimes needs the touch-action applied directly to the element
        const forceStyle = document.createElement('style');
        forceStyle.textContent = `
          #${canvas.id} {
            touch-action: none !important;
            -moz-user-select: none !important;
            user-select: none !important;
            pointer-events: auto !important;
          }
        `;
        document.head.appendChild(forceStyle);
      }
      // Chrome/Safari/iOS-specific fixes
      else if (isChrome || isSafari || isIOS) {
        canvas.style.touchAction = 'none';
        canvas.style.webkitTouchCallout = 'none';
        canvas.style.webkitUserSelect = 'none';
        canvas.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
      }
      
      // Universal pointer events (more reliable in Firefox)
      canvas.addEventListener('pointerdown', function(e) {
        // Don't prevent default in Firefox for pointer events
        if (!isFirefox) {
          e.preventDefault();
        }
        console.log(`${isFirefox ? 'Firefox' : 'Browser'} pointerdown captured on ${canvas.id || 'canvas'}`);
      }, { passive: isFirefox });
      
      canvas.addEventListener('pointermove', function(e) {
        // Don't prevent default in Firefox for pointer events
        if (!isFirefox) {
          e.preventDefault();
        }
      }, { passive: isFirefox });
      
      // Add non-passive touch event listeners for iOS/Chrome
      if (isChrome || isSafari || isIOS) {
        const handleTouchStart = function(e) {
          e.preventDefault();
          console.log("Touch start captured");
        };
        
        const handleTouchMove = function(e) {
          e.preventDefault();
        };
        
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
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
  
  // Fix prism background
  const prismBackground = document.getElementById('prism-background');
  if (prismBackground) {
    prismBackground.style.pointerEvents = 'auto';
    
    if (isFirefox) {
      prismBackground.style.mozUserSelect = 'none';
      prismBackground.style.userSelect = 'none';
    } else {
      prismBackground.style.touchAction = 'none';
      prismBackground.style.webkitUserSelect = 'none';
    }
  }
}

// Cross-browser event setup that prioritizes the correct event type for each browser
export function setupCrossBrowserInteraction(element, onInteractionStart, onInteractionMove, onInteractionEnd) {
  if (!element) return;
  
  // Apply different event handling based on browser
  if (isFirefox) {
    // Firefox works best with pointer events
    setupPointerEvents(element, onInteractionStart, onInteractionMove, onInteractionEnd);
  } else if (isChrome || isIOS || isSafari) {
    // Chrome/iOS work best with touch events
    setupTouchEvents(element, onInteractionStart, onInteractionMove, onInteractionEnd);
    // But also add pointer events as backup
    setupPointerEvents(element, onInteractionStart, onInteractionMove, onInteractionEnd);
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
  // For Firefox, we use non-preventDefaullt pointer events
  const passive = isFirefox;
  
  element.addEventListener('pointerdown', function(e) {
    if (!isFirefox) e.preventDefault();
    onStart({
      clientX: e.clientX,
      clientY: e.clientY,
      preventDefault: () => isFirefox ? null : e.preventDefault(),
      stopPropagation: () => e.stopPropagation()
    });
    
    const handlePointerMove = function(moveEvent) {
      if (!isFirefox) moveEvent.preventDefault();
      onMove({
        clientX: moveEvent.clientX,
        clientY: moveEvent.clientY,
        preventDefault: () => isFirefox ? null : moveEvent.preventDefault(),
        stopPropagation: () => moveEvent.stopPropagation()
      });
    };
    
    const handlePointerUp = function(upEvent) {
      if (!isFirefox) upEvent.preventDefault();
      onEnd({
        preventDefault: () => isFirefox ? null : upEvent.preventDefault(),
        stopPropagation: () => upEvent.stopPropagation()
      });
      
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
    
    document.addEventListener('pointermove', handlePointerMove, { passive });
    document.addEventListener('pointerup', handlePointerUp, { passive });
  }, { passive });
}

// Setup touch events (better for Chrome/iOS)
function setupTouchEvents(element, onStart, onMove, onEnd) {
  element.addEventListener('touchstart', function(e) {
    e.preventDefault();
    
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      onStart({
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation()
      });
    }
    
    const handleTouchMove = function(moveEvent) {
      moveEvent.preventDefault();
      
      if (moveEvent.touches.length > 0) {
        const touch = moveEvent.touches[0];
        onMove({
          clientX: touch.clientX,
          clientY: touch.clientY,
          preventDefault: () => moveEvent.preventDefault(),
          stopPropagation: () => moveEvent.stopPropagation()
        });
      }
    };
    
    const handleTouchEnd = function(endEvent) {
      endEvent.preventDefault();
      
      onEnd({
        preventDefault: () => endEvent.preventDefault(),
        stopPropagation: () => endEvent.stopPropagation()
      });
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
  }, { passive: false });
}