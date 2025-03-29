/**
 * Touch Events Fix for 3D Models
 * This script enhances touch interaction for 3D models on mobile devices.
 */
(function() {
  console.log("📱 Touch Events Fix: Initializing...");

  // Give the main script a moment to initialize
  setTimeout(() => {
    const canvas = document.getElementById('morphing-poly-canvas');
    if (!canvas) {
      console.warn("📱 Touch Events Fix: Target canvas not found");
      return;
    }
    
    console.log("📱 Touch Events Fix: Found target canvas");
    
    // Ensure the canvas has the right touch properties
    canvas.style.touchAction = 'none';
    canvas.style.pointerEvents = 'auto';
    canvas.style.cursor = 'grab';
    
    // Remove any conflicting attributes
    canvas.removeAttribute('touch-action'); // HTML attribute can conflict with CSS
    
    // Set explicit CSS properties for touch handling
    const enhancedTouchStyle = document.createElement('style');
    enhancedTouchStyle.textContent = `
      #morphing-poly-canvas {
        touch-action: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: rgba(0,0,0,0) !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        pointer-events: auto !important;
        cursor: grab !important;
        z-index: 50 !important;
      }
      
      /* Prevent scrolling when touching the canvas */
      body.canvas-touch-active {
        overflow: hidden;
      }
    `;
    document.head.appendChild(enhancedTouchStyle);
    
    // Prevent native touch events from interfering
    function handleTouchStart(e) {
      // Allow touches on the canvas to be processed for 3D interactions
      if (e.target === canvas) {
        e.preventDefault();
        document.body.classList.add('canvas-touch-active');
        canvas.style.cursor = 'grabbing';
      }
    }
    
    function handleTouchEnd(e) {
      // Re-enable normal touch behavior when touch ends
      document.body.classList.remove('canvas-touch-active');
      canvas.style.cursor = 'grab';
    }
    
    // Add the event listeners to the document
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    // Setup THREE.js specific touch event handler if THREE is available
    if (window.THREE) {
      setupThreeTouch(window.THREE);
    } else {
      window.addEventListener('threeReady', (event) => {
        const THREE = event.detail.THREE || window.THREE;
        if (THREE) {
          setupThreeTouch(THREE);
        }
      }, { once: true });
    }
    
    function setupThreeTouch(THREE) {
      if (!THREE || !canvas) return;
      
      console.log("📱 Setting up THREE-specific touch handlers");
      
      // Create a touch coordinate normalizer for THREE
      const normalizeTouch = (touch, element) => {
        const rect = element.getBoundingClientRect();
        return {
          x: ((touch.clientX - rect.left) / rect.width) * 2 - 1,
          y: -((touch.clientY - rect.top) / rect.height) * 2 + 1
        };
      };
      
      // Store coordinates for rotation calculation
      let lastX = 0, lastY = 0;
      let isDragging = false;
      
      // Clean up previous events to avoid duplicates
      canvas.removeEventListener('touchstart', onCanvasTouchStart);
      canvas.removeEventListener('touchmove', onCanvasTouchMove);
      canvas.removeEventListener('touchend', onCanvasTouchEnd);
      
      // Touch event handlers specifically for THREE.js interaction
      function onCanvasTouchStart(e) {
        if (e.touches.length !== 1) return;
        
        e.preventDefault();
        isDragging = true;
        canvas.style.cursor = 'grabbing';
        
        const touch = e.touches[0];
        lastX = touch.clientX;
        lastY = touch.clientY;
        
        // Dispatch normalized events for THREE
        if (window.prismaticScene && window.prismaticScene.onTouchStart) {
          const coords = normalizeTouch(touch, canvas);
          window.prismaticScene.onTouchStart(coords);
        }
      }
      
      function onCanvasTouchMove(e) {
        if (!isDragging || e.touches.length !== 1) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        
        // Calculate deltas for rotation
        const deltaX = touch.clientX - lastX;
        const deltaY = touch.clientY - lastY;
        lastX = touch.clientX;
        lastY = touch.clientY;
        
        // Dispatch custom event with normalized coordinates
        if (window.prismaticScene && window.prismaticScene.onTouchMove) {
          const coords = normalizeTouch(touch, canvas);
          window.prismaticScene.onTouchMove(coords, { deltaX, deltaY });
        }
      }
      
      function onCanvasTouchEnd(e) {
        e.preventDefault();
        isDragging = false;
        canvas.style.cursor = 'grab';
        
        // Dispatch touch end event
        if (window.prismaticScene && window.prismaticScene.onTouchEnd) {
          window.prismaticScene.onTouchEnd();
        }
      }
      
      // Add our enhanced touch handlers
      canvas.addEventListener('touchstart', onCanvasTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onCanvasTouchMove, { passive: false });
      canvas.addEventListener('touchend', onCanvasTouchEnd, { passive: false });
      
      console.log("📱 THREE-specific touch handlers installed");
    }
    
    console.log("📱 Touch Events Fix: Setup complete");
  }, 1000); // Wait for other scripts to initialize
})(); 