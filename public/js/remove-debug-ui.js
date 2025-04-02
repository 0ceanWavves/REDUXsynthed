/**
 * Remove Debug UI
 * 
 * This script removes development debug UI elements that might be present
 * in the rendered output.
 */

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Identify and remove debug UI elements
    function removeDebugElements() {
      // Common debug class names and IDs
      const debugSelectors = [
        '.debug-panel', 
        '.debug-info', 
        '.debug-controls',
        '#debug-panel',
        '#fps-counter',
        '.stats-panel',
        '[data-debug="true"]',
        '.dev-only',
        '.debug-grid',
        '.debug-bounds'
      ];
      
      // Remove elements matching debug selectors
      debugSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      });
      
      // Find elements containing debug-related text
      document.querySelectorAll('div, span, p').forEach(el => {
        if (
          el.textContent && (
            el.textContent.includes('Debug:') ||
            el.textContent.includes('FPS:') ||
            el.textContent.includes('Development Only') ||
            el.textContent.includes('Hold SHIFT') ||
            el.textContent.includes('Desktop:') ||
            el.textContent.includes('Mobile:') ||
            el.textContent.match(/Press \w+ to/)
          )
        ) {
          if (el.parentNode) {
            el.style.display = 'none';
          }
        }
      });
    }
    
    // Run immediately and after a short delay to catch dynamic elements
    removeDebugElements();
    setTimeout(removeDebugElements, 1000);
    
    // Also run on any content change
    const observer = new MutationObserver(function(mutations) {
      removeDebugElements();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Clean up observer after 10 seconds
    setTimeout(() => {
      observer.disconnect();
    }, 10000);
    
    console.log('Debug UI removal complete');
  });
})();
