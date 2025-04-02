/**
 * Hero Layout Fix
 * 
 * This script ensures proper sizing and positioning of the hero section
 * and the 3D visualization canvas.
 */

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Ensure canvas size matches viewport
    function resizeCanvas() {
      const canvas = document.getElementById('morphing-poly-canvas');
      if (canvas) {
        // Set canvas dimensions to match window
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Update style for proper scaling
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '0';
      }
      
      // Ensure text elements are on top of canvas
      const contentWrapper = document.querySelector('.content-wrapper');
      if (contentWrapper) {
        contentWrapper.style.position = 'relative';
        contentWrapper.style.zIndex = '10';
      }
    }
    
    // Run immediately and on window resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Run again after a delay to catch any late-loading elements
    setTimeout(resizeCanvas, 1000);
    
    console.log('Hero layout fix applied');
  });
})();
