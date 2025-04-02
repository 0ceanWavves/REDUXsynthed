/**
 * Optimize will-change memory consumption
 * Applies will-change CSS property only when needed for better performance
 */
(function() {
  console.log("🔧 Will-change optimizer: Initializing");
  
  // Elements with will-change that need to be modified
  document.addEventListener('DOMContentLoaded', function() {
    // Find all elements with will-change in inline styles
    const elementsWithWillChange = document.querySelectorAll('[style*="will-change"]');
    
    if (elementsWithWillChange.length > 0) {
      console.log(`🔧 Found ${elementsWithWillChange.length} elements with will-change`);
      
      // For each element, only apply will-change during interactions
      elementsWithWillChange.forEach(element => {
        // Store the original will-change value
        const originalWillChange = element.style.willChange;
        
        // Remove will-change by default
        element.style.willChange = 'auto';
        
        // Add will-change during user interaction
        element.addEventListener('mouseenter', () => {
          element.style.willChange = originalWillChange;
        });
        
        // Remove will-change after interaction ends
        element.addEventListener('mouseleave', () => {
          // Delay removal slightly to allow for animations to complete
          setTimeout(() => {
            element.style.willChange = 'auto';
          }, 200);
        });
        
        // For touch devices
        element.addEventListener('touchstart', () => {
          element.style.willChange = originalWillChange;
        });
        
        element.addEventListener('touchend', () => {
          setTimeout(() => {
            element.style.willChange = 'auto';
          }, 200);
        });
        
        console.log(`🔧 Applied dynamic will-change to element: ${element.id || element.tagName}`);
      });
    }
    
    // Handle the canvas element specifically if it exists
    const canvas = document.getElementById('morphing-poly-canvas');
    if (canvas) {
      // Only apply will-change when interacting with the canvas
      canvas.style.willChange = 'auto';
      
      canvas.addEventListener('mousedown', () => {
        canvas.style.willChange = 'transform';
      });
      
      canvas.addEventListener('mouseup', () => {
        setTimeout(() => {
          canvas.style.willChange = 'auto';
        }, 500); // Longer delay for canvas as animations might take longer
      });
      
      // For touch devices
      canvas.addEventListener('touchstart', () => {
        canvas.style.willChange = 'transform';
      });
      
      canvas.addEventListener('touchend', () => {
        setTimeout(() => {
          canvas.style.willChange = 'auto';
        }, 500);
      });
      
      console.log("🔧 Applied dynamic will-change to canvas");
    }
    
    console.log("🔧 Will-change optimizer: Initialization complete");
  });
})(); 