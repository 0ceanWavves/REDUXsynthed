/**
 * disable-splash-prism.js - Disables SplashPrism interactions when AmorphousPrism is present
 * 
 * This script runs early in the page load process and aggressively disables any SplashPrism
 * elements that could interfere with AmorphousPrism's interaction handlers.
 */
(function() {
  console.log("🛑 DISABLE-SPLASH: Initializing...");
  
  // Track whether we've done the disabling
  let hasDisabledSplashPrism = false;

  // Check for AmorphousPrism initially - including both original and fallback canvas
  const initialCheck = 
    document.getElementById('morphing-poly-canvas') !== null ||
    document.getElementById('morphing-poly-canvas-fallback') !== null;
  
  if (!initialCheck) {
    console.log("🛑 DISABLE-SPLASH: AmorphousPrism not found initially, will keep watching");
    // Don't return, continue to set up observer
  } else {
    // Immediately disable if found
    disableSplashPrism();
  }
  
  function disableSplashPrism() {
    if (hasDisabledSplashPrism) {
      console.log("🛑 DISABLE-SPLASH: Already disabled SplashPrism");
      return;
    }
    
    console.log("🛑 DISABLE-SPLASH: AmorphousPrism detected, disabling SplashPrism");
    hasDisabledSplashPrism = true;
    
    // Elements to disable - only SplashPrism elements, NOT AmorphousPrism elements
    const elementsToDisable = [
      'prism-background',
      'hero-prism-container',
      'prism-bg-canvas',
      'splash-animation-canvas'
    ];
    
    // Explicitly exclude these IDs from being disabled
    const protectedIds = [
      'morphing-poly-canvas',
      'morphing-poly-canvas-fallback',
      'sacred-geometry-container'
    ];
    
    // Disable each element
    elementsToDisable.forEach(id => {
      const element = document.getElementById(id);
      if (element && !element.querySelector('.splash-content') && !element.classList.contains('splash-content')) { 
        console.log(`🛑 DISABLE-SPLASH: Disabling ${id}`);
        
        // Clone the element to remove all event listeners
        const clone = element.cloneNode(true);
        
        // Make it non-interactive
        clone.style.pointerEvents = 'none';
        clone.style.touchAction = 'none';
        clone.style.zIndex = '1'; // Push it below everything
        clone.style.opacity = '0.1'; // Make it nearly invisible
        
        // Mark it as disabled
        clone.setAttribute('data-disabled', 'true');
        clone.setAttribute('disabled', 'true');
        
        // Replace the original element
        if (element.parentNode) {
          element.parentNode.replaceChild(clone, element);
        }
      }
    });
    
    // Also disable any global variables
    disablePrismaticScene();
  }
  
  // Disable global prismaticScene if it exists
  function disablePrismaticScene() {
    if (window.prismaticScene) {
      console.log("🛑 DISABLE-SPLASH: Neutralizing prismaticScene methods");
      
      // Create empty function for methods
      const noop = function() {
        console.log("🛑 DISABLED: SplashPrism method call blocked");
        return false;
      };
      
      // List of methods to disable
      const methods = ['setInteraction', 'applyRotation', 'rotate'];
      
      // Override each method
      methods.forEach(method => {
        if (typeof window.prismaticScene[method] === 'function') {
          window.prismaticScene[method] = noop;
        }
      });
      
      // Mark as disabled
      window.prismaticScene._disabled = true;
    }
  }
  
  // Try to disable again after a short delay (helps with race conditions)
  setTimeout(() => {
    if (document.getElementById('morphing-poly-canvas')) {
      disableSplashPrism();
    }
    disablePrismaticScene(); // Always try to disable global variables
  }, 100);
  
  // Set up a MutationObserver to watch for both:
  // 1. AmorphousPrism being added to the DOM
  // 2. SplashPrism elements being re-added
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        // Check if AmorphousPrism was added (including fallback)
        if (!hasDisabledSplashPrism) {
          const amorphousPrismAdded = Array.from(mutation.addedNodes).some(node => {
            return node.nodeType === 1 && 
                  (node.id === 'morphing-poly-canvas' || 
                   node.id === 'morphing-poly-canvas-fallback' || 
                   (node.querySelector && (
                     node.querySelector('#morphing-poly-canvas') || 
                     node.querySelector('#morphing-poly-canvas-fallback')
                   )));
          });
          
          if (amorphousPrismAdded) {
            console.log("🛑 DISABLE-SPLASH: AmorphousPrism appeared, now disabling SplashPrism");
            disableSplashPrism();
          }
        }
        
        // Always check if any SplashPrism elements were re-added
        const elementsToDisable = ['prism-background', 'hero-prism-container', 'prism-bg-canvas', 'splash-animation-canvas'];
        const protectedIds = ['morphing-poly-canvas', 'morphing-poly-canvas-fallback', 'sacred-geometry-container'];
        
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Skip if this is a protected element
            if (protectedIds.includes(node.id)) {
              console.log(`🛑 DISABLE-SPLASH: Skipping protected element ${node.id}`);
              return;
            }
            
            // Check if the node is a target element
            const isContentContainer = node.classList?.contains('splash-content') || node.querySelector?.('.splash-content');
            const isTextElement = node.classList?.contains('digital-solutions-text') || node.classList?.contains('title-word') || node.classList?.contains('transforming-text');

            if (elementsToDisable.includes(node.id) && !isContentContainer && !isTextElement) {
              console.log(`🛑 DISABLE-SPLASH: Re-disabling ${node.id} after DOM mutation`);
              
              // Disable the element
              node.style.pointerEvents = 'none';
              node.style.touchAction = 'none';
              node.style.zIndex = '1';
              node.style.opacity = '0.1';
              node.setAttribute('data-disabled', 'true');
              node.setAttribute('disabled', 'true');
            }
            
            // Also check children of the node
            if (node.querySelectorAll) {
              // First check if node contains any protected elements
              const hasProtectedElements = protectedIds.some(id => node.querySelector(`#${id}`));
              if (hasProtectedElements) {
                console.log(`🛑 DISABLE-SPLASH: Node contains protected elements, handling carefully`);
                // Only disable specific target elements, not the entire node
                elementsToDisable.forEach(id => {
                  const childElement = node.querySelector(`#${id}`);
                  if (childElement) {
                    // *** Add check: Do not disable critical content containers/text elements ***
                    const childIsContent = childElement?.classList?.contains('splash-content') || childElement?.closest('.splash-content');
                    const childIsText = childElement?.classList?.contains('digital-solutions-text') || childElement?.classList?.contains('title-word') || childElement?.classList?.contains('transforming-text');

                    if (childElement && !childIsContent && !childIsText) {
                      console.log(`🛑 DISABLE-SPLASH: Re-disabling ${id} in added subtree containing protected elements`);
                      childElement.style.pointerEvents = 'none';
                      childElement.style.touchAction = 'none';
                      childElement.style.zIndex = '1';
                      childElement.style.opacity = '0.1';
                      childElement.setAttribute('data-disabled', 'true');
                      childElement.setAttribute('disabled', 'true');
                    }
                  }
                });
              } else {
                // Regular handling for nodes without protected elements
                elementsToDisable.forEach(id => {
                  const childElement = node.querySelector(`#${id}`);
                  if (childElement) {
                    // *** Add check: Do not disable critical content containers/text elements ***
                    const childIsContent = childElement?.classList?.contains('splash-content') || childElement?.closest('.splash-content');
                    const childIsText = childElement?.classList?.contains('digital-solutions-text') || childElement?.classList?.contains('title-word') || childElement?.classList?.contains('transforming-text');

                    if (childElement && !childIsContent && !childIsText) {
                      console.log(`🛑 DISABLE-SPLASH: Re-disabling ${id} in added subtree`);
                      childElement.style.pointerEvents = 'none';
                      childElement.style.touchAction = 'none';
                      childElement.style.zIndex = '1';
                      childElement.style.opacity = '0.1';
                      childElement.setAttribute('data-disabled', 'true');
                      childElement.setAttribute('disabled', 'true');
                    }
                  }
                });
              }
            }
          }
        });
      }
    });
  });
  
  // Start observing the entire document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Check one more time after everything is loaded
  window.addEventListener('load', () => {
    if (document.getElementById('morphing-poly-canvas')) {
      disableSplashPrism();
    }
  });
  
  console.log("🛑 DISABLE-SPLASH: Setup complete, watching for AmorphousPrism");
})(); 