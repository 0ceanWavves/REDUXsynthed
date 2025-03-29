// three-interaction-fix.js
// Helps manage 3D object interaction without affecting page scrolling

(function() {
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Find all 3D object containers
    const containers = document.querySelectorAll('.simple-3d-container');
    
    if (!containers.length) {
      console.log('No 3D containers found on page');
      return;
    }
    
    console.log(`Found ${containers.length} 3D container(s)`);
    
    // Add a check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      console.log('Not a mobile device, no special handling needed');
      return;
    }
    
    console.log('Mobile device detected, applying special touch handling');
    
    // For each container, set up touch event handling
    containers.forEach(container => {
      // Find the canvas element inside the container
      const canvas = container.querySelector('canvas');
      
      if (!canvas) {
        console.warn(`No canvas found in container #${container.id}`);
        return;
      }
      
      // Track if touch started inside the container
      let touchStartedInside = false;
      
      // Handle touch start
      document.addEventListener('touchstart', function(e) {
        // Check if touch is inside this container
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        
        if (touch.clientX >= rect.left && touch.clientX <= rect.right && 
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          touchStartedInside = true;
          // Don't prevent default here - let the canvas handler do that
        } else {
          touchStartedInside = false;
        }
      }, { passive: true });
      
      // Handle touch move
      document.addEventListener('touchmove', function(e) {
        // If touch started outside container, always allow scrolling
        if (!touchStartedInside) {
          return;
        }
        
        // Check if touch is still inside this container
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        
        if (touch.clientX < rect.left || touch.clientX > rect.right || 
            touch.clientY < rect.top || touch.clientY > rect.bottom) {
          // Touch moved outside container, allow page scrolling
          touchStartedInside = false;
        }
      }, { passive: true });
      
      // Reset on touch end
      document.addEventListener('touchend', function() {
        touchStartedInside = false;
      }, { passive: true });
    });
    
    console.log('Touch interaction fix applied');
  });
})();
