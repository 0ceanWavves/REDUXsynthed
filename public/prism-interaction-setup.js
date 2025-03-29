/**
 * PRISM INTERACTION SETUP
 * 
 * This script sets up direct handlers for the AmorphousPrism/morphing polyhedron 
 * and ensures proper window.applyPrismRotation function is available
 */

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    console.log("PRISM INTERACTION SETUP: Initializing...");
    
    // Wait for the prismatic scene to be fully initialized
    let attempts = 0;
    const maxAttempts = 20;
    
    function setupDirectInteraction() {
      if (attempts >= maxAttempts) {
        console.warn("PRISM INTERACTION SETUP: Gave up waiting for prismatic scene initialization");
        return;
      }
      
      attempts++;
      
      // Check if prismatic scene is available
      if (typeof window.prismaticScene === 'undefined' || !window.prismaticScene) {
        console.log("PRISM INTERACTION SETUP: Waiting for prismatic scene...");
        setTimeout(setupDirectInteraction, 300);
        return;
      }
      
      // Get the canvas elements that might control the prism
      const canvasElements = [
        document.getElementById('morphing-poly-canvas'),
        document.getElementById('flow-bg-canvas'),
        document.getElementById('amorphous-canvas'),
        ...Array.from(document.querySelectorAll('canvas'))
      ].filter(Boolean);
      
      if (canvasElements.length === 0) {
        console.warn("PRISM INTERACTION SETUP: No canvas elements found");
        return;
      }
      
      console.log(`PRISM INTERACTION SETUP: Found ${canvasElements.length} canvas elements`);
      
      // For each canvas, set up direct interaction
      canvasElements.forEach(function(canvas) {
        if (!canvas) return; // Skip if canvas is null
        
        // Ensure the canvas has pointer events enabled
        canvas.style.pointerEvents = 'auto';
        console.log(`PRISM INTERACTION SETUP: Direct interaction set up for ${canvas.id || 'unnamed canvas'}`);
      });
      
      // Define rotation function for direct calls
      window.applyPrismRotation = function(deltaX, deltaY) {
        const rotationSpeed = window.innerWidth < 768 ? 0.005 : 0.003;
        const rotX = -deltaY * rotationSpeed;
        const rotY = deltaX * rotationSpeed;
        
        console.log("PRISM INTERACTION SETUP: Applying rotation:", rotX, rotY);
        
        // Check if prismaticScene exists before accessing its properties
        if (typeof window.prismaticScene !== 'undefined' && window.prismaticScene) {
          if (typeof window.prismaticScene.setRotationVelocity === 'function') {
            window.prismaticScene.setRotationVelocity(rotY, rotX);
            return true;
          } 
          else if (typeof window.prismaticScene.applyRotation === 'function') {
            window.prismaticScene.applyRotation(rotX, rotY);
            return true;
          }
          else if (window.prismaticScene.prism && typeof window.prismaticScene.prism.rotation !== 'undefined') {
            window.prismaticScene.prism.rotation.x += rotX;
            window.prismaticScene.prism.rotation.y += rotY;
            return true;
          }
        }
        return false;
      };
      
      // Override or patch prismaticScene methods if they exist
      if (typeof window.prismaticScene !== 'undefined' && window.prismaticScene) {
        // Store original methods if they exist
        const originalMethods = {
          setRotationVelocity: window.prismaticScene.setRotationVelocity || null,
          applyRotation: window.prismaticScene.applyRotation || null
        };
        
        // Create new setRotationVelocity method if it doesn't exist
        if (typeof window.prismaticScene.setRotationVelocity !== 'function') {
          window.prismaticScene.setRotationVelocity = function(rotY, rotX) {
            console.log("PRISM INTERACTION SETUP: Using custom setRotationVelocity", rotY, rotX);
            if (window.prismaticScene && window.prismaticScene.prism && 
                typeof window.prismaticScene.prism.rotation !== 'undefined') {
              window.prismaticScene.prism.rotation.x += rotX;
              window.prismaticScene.prism.rotation.y += rotY;
            }
          };
        }
        
        // Create new applyRotation method if it doesn't exist
        if (typeof window.prismaticScene.applyRotation !== 'function') {
          window.prismaticScene.applyRotation = function(rotX, rotY) {
            console.log("PRISM INTERACTION SETUP: Using custom applyRotation", rotX, rotY);
            if (window.prismaticScene && window.prismaticScene.prism && 
                typeof window.prismaticScene.prism.rotation !== 'undefined') {
              window.prismaticScene.prism.rotation.x += rotX;
              window.prismaticScene.prism.rotation.y += rotY;
            }
          };
        }
      }
      
      console.log("PRISM INTERACTION SETUP: Setup complete");
    }
    
    // Start setup process
    setupDirectInteraction();
  });
})(); 