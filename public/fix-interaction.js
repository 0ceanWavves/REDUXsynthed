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
          canvas.style.pointerEvents = 'auto';
          canvas.style.zIndex = '5';
          console.log(`Canvas ${id} enabled for interaction`);
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
        console.log("Prism background enabled for interaction");
      }
      
      // Now we can use THREE if needed for any additional fixes
      console.log("Interaction fixes applying using THREE:", THREE ? "Available" : "Not available");
      
      // Verify THREE is actually valid
      if (THREE && typeof THREE === 'object') {
        // Add any THREE-specific fixes here
        // For example:
        // - Modify raycaster behavior
        // - Adjust event handling for THREE objects
        // - Setup custom interaction with THREE elements
        
        console.log("THREE object is valid and available for use");
      } else {
        console.warn("THREE object is not valid, skipping THREE-specific fixes");
      }
      
      console.log("3D-specific interaction fixes applied");
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
    }, 3500); // Increased timeout to give more time for THREE to load
  }
  
  console.log("Interaction fix basic styles applied. Waiting for THREE if needed.");
});