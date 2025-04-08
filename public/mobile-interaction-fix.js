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
  
  // Check if this is a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth < 768;
  
  if (isMobile) {
    console.log('Applying enhanced mobile interaction fixes');
    
    // Variables to track touch interaction
    let startY = 0;
    let startX = 0;
    let isScrolling = false;
    const scrollThreshold = 15; // pixels to detect scroll vs. rotation intent
    
    // Set up canvas touch behavior
    canvas.style.touchAction = 'none'; // We'll handle touch behavior manually
    
    // Detect touch start on canvas
    canvas.addEventListener('touchstart', (event) => {
      if (event.touches.length !== 1) return;
      
      // Record initial touch position
      startY = event.touches[0].clientY;
      startX = event.touches[0].clientX;
      isScrolling = false;
      
      // Check if in bottom 20% of screen - prioritize scrolling
      const viewportHeight = window.innerHeight;
      const touchY = event.touches[0].clientY;
      if (touchY > viewportHeight * 0.8) {
        canvas.style.pointerEvents = 'none';
        setTimeout(() => {
          canvas.style.pointerEvents = 'auto';
        }, 500); // Re-enable after scrolling starts
      }
    }, { passive: true });
    
    // Detect scroll vs. rotation
    canvas.addEventListener('touchmove', (event) => {
      if (event.touches.length !== 1 || isScrolling) return;
      
      const currentY = event.touches[0].clientY;
      const currentX = event.touches[0].clientX;
      const deltaY = Math.abs(currentY - startY);
      const deltaX = Math.abs(currentX - startX);
      
      // If primarily vertical movement, assume scrolling
      if (deltaY > deltaX && deltaY > scrollThreshold) {
        isScrolling = true;
        canvas.style.pointerEvents = 'none';
        
        // Re-enable rotation after touch ends
        const enableCanvas = () => {
          setTimeout(() => {
            canvas.style.pointerEvents = 'auto';
            document.removeEventListener('touchend', enableCanvas);
          }, 300);
        };
        
        document.addEventListener('touchend', enableCanvas, { once: true });
      }
    }, { passive: true });
  }
  
  // Add a class to the canvas container to indicate the fix is active
  const canvasContainer = canvas.closest('.canvas-container');
  if (canvasContainer) {
    canvasContainer.classList.add('mobile-interaction-fixed');
  }
  
  // Ensure buttons are properly clickable
  const buttons = document.querySelectorAll('.overlay-button');
  buttons.forEach(button => {
    // Add event listener to prevent event propagation to canvas
    button.addEventListener('touchstart', (event) => {
      event.stopPropagation();
    }, { passive: false });
    
    // Add click handler to ensure smooth scrolling to target sections
    button.addEventListener('click', (event) => {
      const href = button.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          event.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
  
  // Add mobile instruction if on mobile
  if (isMobile) {
    const instructionDiv = document.createElement('div');
    instructionDiv.textContent = 'Rotate shape with horizontal swipes • Scroll page with vertical swipes';
    instructionDiv.style.cssText = `
      position: absolute;
      bottom: 5vh;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 0.7rem;
      color: rgba(255,255,255,0.6);
      z-index: 1000;
      pointer-events: none;
      padding: 5px;
      text-shadow: 0 0 3px rgba(0,0,0,0.8);
    `;
    
    // Add the instruction after a delay
    setTimeout(() => {
      document.body.appendChild(instructionDiv);
      // Fade out after 5 seconds
      setTimeout(() => {
        instructionDiv.style.transition = 'opacity 1s ease';
        instructionDiv.style.opacity = '0';
        setTimeout(() => instructionDiv.remove(), 1000);
      }, 5000);
    }, 1500);
  }
  
  console.log('Mobile interaction fix applied with enhanced scrolling behavior');
});