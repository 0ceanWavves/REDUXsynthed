// Mobile Chrome scrolling fix
(function() {
  // Detect Chrome on mobile
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isChrome && isMobile) {
    console.log("Applying Chrome mobile scrolling fixes");
    
    // Add Chrome class
    document.documentElement.classList.add('chrome');
    document.body.classList.add('chrome');
    
    // Fix passive event listeners issue
    document.addEventListener('touchstart', function() {}, {passive: true});
    document.addEventListener('touchmove', function() {}, {passive: true});
    
    // Ensure all canvas elements don't block scrolling
    document.querySelectorAll('canvas').forEach(canvas => {
      canvas.style.pointerEvents = 'none';
      canvas.style.touchAction = 'none';
    });
    
    // Fix any animation frames that might be blocking scrolling
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      return originalRAF.call(window, function(timestamp) {
        // Ensure callback doesn't block UI thread for too long
        try {
          callback(timestamp);
        } catch (e) {
          console.error("Error in animation frame:", e);
        }
      });
    };
    
    // Periodic check to ensure scrolling works
    setInterval(() => {
      document.querySelectorAll('.wave-container, #prism-background, #flow-bg-canvas, canvas').forEach(el => {
        if (el && typeof el.style !== 'undefined') {
          el.style.pointerEvents = 'none';
          el.style.touchAction = 'none';
        }
      });
    }, 1000);
  }
})();
