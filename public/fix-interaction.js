// Script to fix 3D interaction issues
document.addEventListener('DOMContentLoaded', function() {
  console.log("Running interaction fix script");
  
  // Apply basic fixes that don't require THREE immediately
  document.querySelectorAll('.splash-title, .title-word, .gradient-text, .splash-content, .content-item, .check-circle').forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.pointerEvents = 'none'; 
    }
  });
  
  // Make buttons interactive
  document.querySelectorAll('.buttons-container a').forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.pointerEvents = 'auto';
    }
  });
  
  // Function to run 3D-specific fixes when THREE is available
  function initializeThreeInteraction(THREE) {
    try {
      // Check if AmorphousPrism is already active
      const amorphousPrismActive = document.getElementById('prism-controller') !== null || 
                                  (window.prismaticScene && window.prismaticScene.setInteraction);
      
      if (amorphousPrismActive) {
        console.log("AmorphousPrism already active - skipping interaction fix");
        return;
      }
      
      // Force the canvas to receive pointer events - check for both canvas IDs
      const canvasIds = ['prism-bg-canvas', 'morphing-poly-canvas'];
      let canvas = null;
      
      for (const id of canvasIds) {
        canvas = document.getElementById(id);
        if (canvas) {
          console.log(`Found canvas with id: ${id}`);
          // Enhanced pointer events setup
          canvas.style.pointerEvents = 'auto';
          canvas.style.zIndex = '50'; // Higher z-index to ensure it gets events
          canvas.style.touchAction = 'none'; // Prevent browser gestures from interfering
          canvas.style.cursor = 'grab';
          
          // Add touch-specific attributes
          canvas.setAttribute('touch-action', 'none');
          canvas.setAttribute('data-interactive', 'true');
          
          // Add touch and mouse event listeners directly to ensure they work
          const eventListeners = {
            'mousedown': () => { canvas.style.cursor = 'grabbing'; },
            'mouseup': () => { canvas.style.cursor = 'grab'; },
            'mouseleave': () => { canvas.style.cursor = 'grab'; },
            'touchstart': (e) => { e.preventDefault(); canvas.style.cursor = 'grabbing'; },
            'touchend': () => { canvas.style.cursor = 'grab'; },
            'touchcancel': () => { canvas.style.cursor = 'grab'; }
          };
          
          Object.entries(eventListeners).forEach(([event, handler]) => {
            canvas.addEventListener(event, handler, { passive: false });
          });
          
          console.log(`Canvas ${id} enabled for interaction with enhanced event handling`);
          break;
        }
      }
      
      if (!canvas) {
        console.warn("No 3D canvas found with expected IDs");
      }
      
      // Force prism-background to receive pointer events
      const prismBg = document.getElementById('prism-background');
      if (prismBg) {
        prismBg.style.pointerEvents = 'auto';
        prismBg.style.zIndex = '6';
        prismBg.style.touchAction = 'none';
        console.log("Prism background enabled for interaction");
      }
      
      // Now we can use THREE if needed for any additional fixes
      console.log("Interaction fixes applying using THREE:", THREE ? "Available" : "Not available");
      
      // Verify THREE is actually valid
      if (THREE && typeof THREE === 'object') {
        // Add event handling fix for THREE Raycaster if needed
        if (THREE.Raycaster && typeof THREE.Raycaster === 'function') {
          // Force Raycaster to use specific event coordinates conversion
          const originalRaycasterSetFromEvent = THREE.Raycaster.prototype.setFromCamera;
          if (originalRaycasterSetFromEvent) {
            THREE.Raycaster.prototype.setFromCamera = function(coords, camera) {
              // Fix for Firefox and Safari touch issues
              if (coords.clientX !== undefined && coords.clientY !== undefined) {
                const rect = this._canvas ? this._canvas.getBoundingClientRect() : 
                            document.getElementById('morphing-poly-canvas')?.getBoundingClientRect();
                if (rect) {
                  coords.x = ((coords.clientX - rect.left) / rect.width) * 2 - 1;
                  coords.y = -((coords.clientY - rect.top) / rect.height) * 2 + 1;
                }
              }
              return originalRaycasterSetFromEvent.call(this, coords, camera);
            };
          }
        }
        console.log("THREE object is valid and available for use");
        console.log("3D-specific interaction fixes applied with Raycaster enhancements");
      } else {
        console.warn("THREE object is not valid, skipping THREE-specific fixes");
      }
    } catch (error) {
      console.error("Error applying 3D interaction fixes:", error);
    }
  }
  
  let threeReadyHandled = false;
  
  // Handle the threeReady event
  function handleThreeReady(event) {
    if (threeReadyHandled) return;
    threeReadyHandled = true;
    
    console.log("threeReady event received for interaction fixes.", event);
    let threeInstance = null;
    
    // Try to get THREE from event detail
    if (event && event.detail && event.detail.THREE) {
      console.log("Using THREE from event detail");
      threeInstance = event.detail.THREE;
    } 
    // Fallback to window.THREE
    else if (window.THREE) {
      console.log("Using THREE from window object (fallback)");
      threeInstance = window.THREE;
    } else {
      console.warn("THREE object not found in event.detail or window");
    }
    
    // Apply fixes with whatever THREE instance we found (might be null)
    initializeThreeInteraction(threeInstance);
  }
  
  // Check if THREE is already defined and use it
  if (window.THREE) {
    console.log("THREE is already defined, applying 3D interaction fixes");
    initializeThreeInteraction(window.THREE);
  } else {
    // Wait for the custom event with proper event data
    console.log("Waiting for threeReady event for 3D interaction fixes...");
    window.addEventListener('threeReady', handleThreeReady, { once: true });
    
    // Fallback: check again after a delay
    setTimeout(() => {
      if (!threeReadyHandled && !document.hidden) {
        console.log("Fallback check for THREE after timeout");
        if (window.THREE) {
          console.log("THREE is now defined (fallback check), applying 3D interaction fixes");
          initializeThreeInteraction(window.THREE);
        } else {
          console.warn("THREE is still not defined after waiting. 3D interaction fixes may be incomplete.");
          // Try to apply fixes anyway with null THREE
          initializeThreeInteraction(null);
        }
      }
    }, 5000); // Increased timeout to give more time for THREE to load
  }
  
  // Extra fallback - add MutationObserver to detect when canvas is added/modified
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        const canvas = document.getElementById('morphing-poly-canvas');
        if (canvas && !canvas.hasAttribute('data-interaction-fixed')) {
          canvas.setAttribute('data-interaction-fixed', 'true');
          console.log("MutationObserver detected canvas change, applying interaction fixes");
          canvas.style.pointerEvents = 'auto';
          canvas.style.touchAction = 'none';
          canvas.style.cursor = 'grab';
          canvas.style.zIndex = '50';
          
          // Reinitialize THREE interaction if available
          if (window.THREE) {
            initializeThreeInteraction(window.THREE);
          }
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  
  console.log("Interaction fix basic styles applied. Waiting for THREE if needed.");
});