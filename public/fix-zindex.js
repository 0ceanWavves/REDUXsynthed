// Emergency fix for z-index issues
document.addEventListener('DOMContentLoaded', () => {
  console.log("Running z-index fix script");
  
  // Check if AmorphousPrism is active
  const isAmorphousPrismActive = document.getElementById('prism-controller') !== null ||
                                 (window.prismaticScene && window.prismaticScene.setInteraction);
  
  // Force canvas to appropriate z-index
  const canvas = document.getElementById('prism-bg-canvas');
  if (canvas) {
    // If AmorphousPrism is active, we need higher z-index for interaction
    canvas.style.zIndex = isAmorphousPrismActive ? '999' : '5';
    console.log(`Set canvas z-index to ${canvas.style.zIndex}`);
  }
  
  // Force prism-background to appropriate z-index
  const prismBackground = document.getElementById('prism-background');
  if (prismBackground) {
    // If AmorphousPrism is active, we need higher z-index for interaction
    prismBackground.style.zIndex = isAmorphousPrismActive ? '1000' : '6';
    console.log(`Set prism-background z-index to ${prismBackground.style.zIndex}`);
    
    // Ensure pointer events are enabled
    prismBackground.style.pointerEvents = 'auto';
  }
  
  // IMPORTANT: Do NOT touch the title words, they are handled by SplashTitle.astro
  // Only apply to these specific content elements
  const contentSelectors = [
    '.splash-content', 
    '.content-item',
    '.check-circle', 
    '.buttons-container',
    '.relative.z-50'
  ];
  
  // Content z-index depends on whether AmorphousPrism is active
  const contentZIndex = isAmorphousPrismActive ? '800' : '999';
  
  // Apply to content but skip title elements
  contentSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.position = 'relative';
        el.style.zIndex = contentZIndex;
        el.style.opacity = '1';
        el.style.visibility = 'visible';
      }
    });
  });
  
  console.log(`Z-index fix applied to content elements with z-index: ${contentZIndex}`);
  
  // Add a safety check after a short delay to ensure title words are not affected
  setTimeout(() => {
    const titleWords = document.querySelectorAll('.title-word');
    titleWords.forEach(word => {
      if (word instanceof HTMLElement && !word.classList.contains('animation-complete')) {
        console.log("Found title word not yet animated");
        // Don't force visibility, let animations handle it
      }
    });
  }, 500);
  
  // Set up a mutation observer to detect AmorphousPrism activation
  if (!isAmorphousPrismActive) {
    console.log("Setting up observer for AmorphousPrism activation");
    
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          if (document.getElementById('prism-controller') || 
              (window.prismaticScene && window.prismaticScene.setInteraction)) {
            console.log("AmorphousPrism activation detected - updating z-indexes");
            
            // Update canvas z-index
            if (canvas) {
              canvas.style.zIndex = '999';
              console.log("Updated canvas z-index to 999");
            }
            
            // Update prism-background z-index
            if (prismBackground) {
              prismBackground.style.zIndex = '1000';
              prismBackground.style.pointerEvents = 'auto';
              console.log("Updated prism-background z-index to 1000");
            }
            
            // Update content elements z-index
            contentSelectors.forEach(selector => {
              document.querySelectorAll(selector).forEach(el => {
                if (el instanceof HTMLElement) {
                  el.style.zIndex = '800';
                }
              });
            });
            
            console.log("Z-index updated for AmorphousPrism");
            observer.disconnect();
            return;
          }
        }
      }
    });
    
    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also set an interval check
    const intervalCheck = setInterval(() => {
      if (document.getElementById('prism-controller') || 
          (window.prismaticScene && window.prismaticScene.setInteraction)) {
        console.log("AmorphousPrism activation detected via interval - updating z-indexes");
        
        // Update canvas z-index
        if (canvas) {
          canvas.style.zIndex = '999';
        }
        
        // Update prism-background z-index
        if (prismBackground) {
          prismBackground.style.zIndex = '1000';
          prismBackground.style.pointerEvents = 'auto';
        }
        
        // Update content elements z-index
        contentSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.zIndex = '800';
            }
          });
        });
        
        clearInterval(intervalCheck);
      }
    }, 1000);
  }
});