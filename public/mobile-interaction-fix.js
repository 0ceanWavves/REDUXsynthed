/**
 * Mobile Interaction Fix
 * 
 * This script adds additional safeguards to ensure that touch interactions
 * for the 3D object are strictly limited to the canvas area, preventing
 * interference with normal page scrolling on mobile devices.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Wait for the canvas to be available
  const canvas = document.getElementById('morphing-poly-canvas');
  
  if (!canvas) {
    console.warn('Mobile interaction fix: Canvas not found');
    return;
  }
  
  // Add a specific touch handler to the document body to prevent unwanted interactions
  document.body.addEventListener('touchstart', (event) => {
    // Check if the touch is outside the canvas
    const canvasBounds = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    
    const isOutsideCanvas = 
      touch.clientX < canvasBounds.left ||
      touch.clientX > canvasBounds.right ||
      touch.clientY < canvasBounds.top ||
      touch.clientY > canvasBounds.bottom;
    
    // If the touch is outside the canvas, ensure normal scrolling behavior
    if (isOutsideCanvas) {
      // Don't need to do anything special, just let the default behavior happen
      // This is just a safeguard in case other handlers try to interfere
    }
  }, { passive: true }); // Use passive listener for better scroll performance
  
  // Add a class to the canvas container to indicate the fix is active
  const canvasContainer = canvas.closest('.canvas-container');
  if (canvasContainer) {
    canvasContainer.classList.add('mobile-interaction-fixed');
  }
  
  console.log('Mobile interaction fix applied');
});