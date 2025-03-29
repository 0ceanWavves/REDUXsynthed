/**
 * Firefox-specific fixes for 3D interaction
 * This script adds special handling for Firefox which has different event requirements
 */

(function() {
  console.log("Firefox-specific fixes loaded");
  
  document.addEventListener('DOMContentLoaded', function() {
    // Apply Firefox-specific fixes to canvas and interactive areas
    const canvas = document.getElementById('prism-bg-canvas');
    const prismBackground = document.getElementById('prism-background');
    
    if (canvas) {
      // Fix #1: Reset pointer events and user-select styles
      canvas.style.pointerEvents = 'auto';
      canvas.style.userSelect = 'none';
      canvas.style.mozUserSelect = 'none';
      canvas.style.zIndex = '5';
      
      // Special Firefox CSS rules
      canvas.style.cssText += '; touch-action: auto !important;';
    }
    
    if (prismBackground) {
      // Apply similar fixes to the prism background
      prismBackground.style.pointerEvents = 'auto';
      prismBackground.style.userSelect = 'none';
      prismBackground.style.mozUserSelect = 'none';
      prismBackground.style.zIndex = '20';
      prismBackground.style.cssText += '; touch-action: auto !important;';
      
      // Clear any existing event listeners that might conflict
      prismBackground.replaceWith(prismBackground.cloneNode(true));
      
      // Get the fresh reference after cloning
      const freshPrismBg = document.getElementById('prism-background');
      if (!freshPrismBg) return;
      
      // Initialize tracking variables for smooth movement
      let isInteracting = false;
      let previousPosition = { x: 0, y: 0 };
      let rotationVelocity = { x: 0, y: 0 };
      
      // REDUCED rotation speed specifically for Firefox
      // Original was 0.005 or 0.003, now we're using a much smaller value
      const rotationSpeed = window.innerWidth < 768 ? 0.0008 : 0.0005;
      
      // Damping factor to smooth out movement
      const dampingFactor = 0.92;
      
      // Fix Firefox direct interaction with smoother movement
      freshPrismBg.addEventListener('pointerdown', function(e) {
        console.log("Firefox prism pointerdown");
        
        // Track interaction state
        isInteracting = true;
        
        // Set cursor style
        freshPrismBg.style.cursor = 'grabbing';
        
        // Record initial position
        previousPosition = { x: e.clientX, y: e.clientY };
        
        // Update prismatic scene state
        if (window.prismaticScene && window.prismaticScene.setInteraction) {
          window.prismaticScene.setInteraction(true);
        }
        
        // Pointer move handler with dampening for smooth movement
        const handlePointerMove = function(moveEvent) {
          if (!isInteracting) return;
          
          // Calculate delta with reduced sensitivity
          const deltaX = (moveEvent.clientX - previousPosition.x) * rotationSpeed;
          const deltaY = (moveEvent.clientY - previousPosition.y) * rotationSpeed;
          
          // Apply smoothing through velocity rather than direct movement
          rotationVelocity.x = rotationVelocity.x * dampingFactor - deltaY;
          rotationVelocity.y = rotationVelocity.y * dampingFactor + deltaX;
          
          // Update rotation through direct access to the object
          if (window.prismaticScene && window.prismaticScene.prism) {
            window.prismaticScene.prism.rotation.x += rotationVelocity.x;
            window.prismaticScene.prism.rotation.y += rotationVelocity.y;
          }
          
          // Update previous position for next frame
          previousPosition = { x: moveEvent.clientX, y: moveEvent.clientY };
        };
        
        // Pointer up handler
        const handlePointerUp = function() {
          // Track interaction state
          isInteracting = false;
          
          // Restore cursor
          freshPrismBg.style.cursor = 'grab';
          
          // Continue momentum but gradually reduce it
          const applyMomentum = function() {
            if (Math.abs(rotationVelocity.x) < 0.0001 && Math.abs(rotationVelocity.y) < 0.0001) {
              // Stop when velocity is very small
              rotationVelocity = { x: 0, y: 0 };
              return;
            }
            
            // Apply damping to gradually slow down
            rotationVelocity.x *= dampingFactor;
            rotationVelocity.y *= dampingFactor;
            
            // Apply rotation
            if (window.prismaticScene && window.prismaticScene.prism) {
              window.prismaticScene.prism.rotation.x += rotationVelocity.x;
              window.prismaticScene.prism.rotation.y += rotationVelocity.y;
            }
            
            // Continue momentum with requestAnimationFrame
            requestAnimationFrame(applyMomentum);
          };
          
          // Start momentum effect
          applyMomentum();
          
          // Remove event listeners
          document.removeEventListener('pointermove', handlePointerMove);
          document.removeEventListener('pointerup', handlePointerUp);
          
          // Reset interaction state in prismatic scene
          setTimeout(() => {
            if (window.prismaticScene && window.prismaticScene.setInteraction) {
              window.prismaticScene.setInteraction(false);
            }
          }, 300);
        };
        
        // Add event listeners for move and up events
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
      });
      
      // Add proper hover effects for Firefox
      freshPrismBg.addEventListener('mouseover', function() {
        freshPrismBg.style.cursor = 'grab';
      });
      
      freshPrismBg.addEventListener('mouseout', function() {
        if (!isInteracting) {
          freshPrismBg.style.cursor = '';
        }
      });
    }
    
    // Fix parent elements
    if (canvas && canvas.parentElement) {
      let parent = canvas.parentElement;
      while (parent && parent !== document.body) {
        parent.style.pointerEvents = 'auto';
        parent.style.userSelect = 'none';
        parent.style.mozUserSelect = 'none';
        parent = parent.parentElement;
      }
    }
  });
})();