// Script to fix 3D interaction issues
document.addEventListener('DOMContentLoaded', function() {
  console.log("Running interaction fix script");
  
  // Force the canvas to receive pointer events
  const canvas = document.getElementById('prism-bg-canvas');
  if (canvas) {
    canvas.style.pointerEvents = 'auto';
    canvas.style.zIndex = '5';
    console.log("Canvas enabled for interaction");
  }
  
  // Force prism-background to receive pointer events
  const prismBg = document.getElementById('prism-background');
  if (prismBg) {
    prismBg.style.pointerEvents = 'auto';
    prismBg.style.zIndex = '6';
    console.log("Prism background enabled for interaction");
  }
  
  // Make splash content non-interactive to let clicks pass through
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
  
  // Add direct event handlers to canvas as a fallback
  if (canvas) {
    let isDown = false;
    let startX, startY;
    
    canvas.addEventListener('mousedown', function(e) {
      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
      console.log("Canvas direct mousedown detected");
      
      // Try to trigger the window prismaticScene if it exists
      if (window.prismaticScene && window.prismaticScene.setInteraction) {
        window.prismaticScene.setInteraction(true);
      }
    });
    
    canvas.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      
      // Calculate deltas
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      // Apply rotation if possible
      if (window.prismaticScene && window.prismaticScene.applyRotation) {
        window.prismaticScene.applyRotation(-dy * 0.005, dx * 0.005);
      }
      
      startX = e.clientX;
      startY = e.clientY;
    });
    
    canvas.addEventListener('mouseup', function() {
      isDown = false;
      if (window.prismaticScene && window.prismaticScene.setInteraction) {
        setTimeout(() => {
          window.prismaticScene.setInteraction(false);
        }, 800);
      }
    });
    
    // Touch events
    canvas.addEventListener('touchstart', function(e) {
      if (e.touches.length > 0) {
        isDown = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        console.log("Canvas direct touchstart detected");
        
        if (window.prismaticScene && window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(true);
        }
      }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', function(e) {
      if (!isDown || e.touches.length === 0) return;
      
      // Calculate deltas
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      
      // Apply rotation if possible
      if (window.prismaticScene && window.prismaticScene.applyRotation) {
        window.prismaticScene.applyRotation(-dy * 0.005, dx * 0.005);
      }
      
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: false });
    
    canvas.addEventListener('touchend', function() {
      isDown = false;
      if (window.prismaticScene && window.prismaticScene.setInteraction) {
        setTimeout(() => {
          window.prismaticScene.setInteraction(false);
        }, 800);
      }
    }, { passive: false });
  }
  
  console.log("Interaction fix completed");
});