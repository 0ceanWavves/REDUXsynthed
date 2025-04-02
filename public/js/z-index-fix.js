/**
 * Z-index fix - ensures text content appears on top of 3D visualization
 * This script injects the fix CSS and applies direct style fixes to critical elements
 */

(function() {
  // Guard to prevent multiple executions
  if (window.__Z_INDEX_FIX_APPLIED) {
    console.log("Z-index fix already applied, skipping duplicate execution");
    return;
  }
  
  // Mark as applied immediately
  window.__Z_INDEX_FIX_APPLIED = true;
  
  console.log("🔍 Initializing z-index and text visibility fix...");
  
  // Function to inject CSS file
  function injectCSS(url) {
    // Check if already injected
    if (document.getElementById('z-index-fix-css')) {
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.id = 'z-index-fix-css';
    document.head.appendChild(link);
    console.log("✅ Injected CSS fix:", url);
  }
  
  // Function to apply direct style fixes to critical elements - runs only once
  function applyDirectFixes() {
    // Fix splash content
    const splashContent = document.querySelector('.splash-content');
    if (splashContent && !splashContent.dataset.zIndexFixed) {
      splashContent.style.zIndex = "1000";
      splashContent.style.position = "relative";
      splashContent.dataset.zIndexFixed = "true";
      console.log("✅ Fixed splash content z-index");
    }
    
    // Fix title and text elements with stronger styles
    const textElements = document.querySelectorAll('.title-word, .digital-solutions-text, .transforming-text');
    textElements.forEach(el => {
      if (el.dataset.zIndexFixed) return;
      
      el.style.zIndex = "1001";
      el.style.position = "relative";
      el.dataset.zIndexFixed = "true";
      
      // Add specific shadow effects by class
      if (el.classList.contains('digital-solutions-text')) {
        el.style.textShadow = '0 0 30px rgba(0, 255, 170, 1), 0 0 60px rgba(0, 255, 170, 0.8), 0 0 90px rgba(0, 255, 170, 0.6), 0 0 15px rgba(0, 0, 0, 0.9)';
        el.style.filter = 'drop-shadow(0 0 15px rgba(0, 255, 170, 0.9)) drop-shadow(0 0 30px rgba(0, 255, 170, 0.6))';
      } else if (el.classList.contains('title-word')) {
        el.style.textShadow = '0 0 30px rgba(0, 255, 170, 1), 0 0 60px rgba(129, 98, 255, 0.8), 0 0 15px rgba(0, 0, 0, 0.9)';
        el.style.filter = 'drop-shadow(0 0 15px rgba(0, 255, 204, 0.9)) drop-shadow(0 0 30px rgba(129, 98, 255, 0.8))';
      } else if (el.classList.contains('transforming-text')) {
        el.style.textShadow = '0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.7), 0 0 15px rgba(0, 0, 0, 0.8)';
      }
    });
    console.log("✅ Applied enhanced text shadows and z-index fixes");
    
    // Ensure 3D elements stay below text content
    const canvas = document.getElementById('morphing-poly-canvas');
    if (canvas && !canvas.dataset.zIndexFixed) {
      canvas.style.zIndex = "5";
      canvas.dataset.zIndexFixed = "true";
      console.log("✅ Fixed canvas z-index");
    }
    
    // Fix action buttons container
    const buttonsContainer = document.querySelector('.buttons-container, .action-buttons-container');
    if (buttonsContainer && !buttonsContainer.dataset.zIndexFixed) {
      buttonsContainer.style.zIndex = "1002";
      buttonsContainer.style.position = "relative";
      buttonsContainer.style.pointerEvents = "auto";
      buttonsContainer.dataset.zIndexFixed = "true";
      console.log("✅ Fixed buttons container z-index");
    }
    
    // Set flag to prevent multiple runs
    document.body.dataset.zIndexFixApplied = "true";
  }
  
  // Ensure fixes run once after DOM is ready
  function runFixesOnce() {
    // Guard against multiple runs even with different event timings
    if (document.body.dataset.zIndexFixApplied === "true") {
      return;
    }
    injectCSS('/css/z-index-fix.css');
    applyDirectFixes(); // This function already has its own internal guard
    console.log("🔍 Z-index fix initialization complete (run once)");
  }
  
  if (document.readyState === 'loading') {  // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', runFixesOnce);
  } else {  // `DOMContentLoaded` has already fired
    runFixesOnce();
  }
})();
