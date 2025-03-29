// Script to remove the gooey menu bubbles (circular items) while keeping the card menu items
document.addEventListener('DOMContentLoaded', function() {
  console.log("Looking for gooey menu to remove...");
  
  // 1. Try to find the gooey menu container first
  function removeGooeyMenu() {
    // Look for the container
    const gooeyContainer = document.querySelector('.gooey-menu-container');
    if (gooeyContainer) {
      console.log("Found gooey menu container, removing it");
      gooeyContainer.remove();
      return true;
    }
    
    // Also look for gooey menu items
    const gooeyItems = document.querySelectorAll('.gooey-menu-item');
    if (gooeyItems.length > 0) {
      console.log(`Found ${gooeyItems.length} gooey menu items`);
      gooeyItems.forEach(item => item.remove());
      
      // Also remove the toggle button
      const gooeyToggle = document.querySelector('.gooey-menu-toggle');
      if (gooeyToggle) {
        gooeyToggle.remove();
      }
      return true;
    }
    
    return false;
  }
  
  // 2. Also look for and remove any dynamically created bubbles that might be created by Three.js
  function removeDynamicBubbles() {
    // These are common classnames for bubbles or circles in Three.js visualizations
    const possibleBubbleSelectors = [
      'div[style*="border-radius: 100%"]',
      'div[style*="border-radius: 50%"]',
      '[class*="bubble"]',
      '[class*="circle"]',
      '[class*="orb"]',
      'div[class*="dot"]'
    ];
    
    let removedCount = 0;
    
    // Check each selector
    possibleBubbleSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Only remove if it's positioned absolutely/fixed and has high z-index
        // And contains text related to our services
        const style = window.getComputedStyle(element);
        const text = element.textContent || '';
        const isPositioned = style.position === 'absolute' || style.position === 'fixed';
        const hasHighZIndex = parseInt(style.zIndex) > 50;
        const isServiceBubble = text.includes('Business') || 
                               text.includes('Web') || 
                               text.includes('Mobile') || 
                               text.includes('Technology') || 
                               text.includes('UI/UX') || 
                               text.includes('Design') ||
                               text.includes('AI') ||
                               text.includes('Cloud');
        
        if (isPositioned && isServiceBubble) {
          console.log("Removing bubble with text:", text.substring(0, 30) + "...");
          element.remove();
          removedCount++;
        }
      });
    });
    
    return removedCount > 0;
  }
  
  // 3. Disable CSS that might be creating the bubble effect
  function disableBubbleCSS() {
    // Create a style element to override bubble/gooey styles
    const style = document.createElement('style');
    style.textContent = `
      /* Hide gooey menu elements */
      .gooey-menu-container,
      .gooey-menu-item,
      .gooey-menu-toggle {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
      
      /* Disable any filters that create the gooey effect */
      [filter*="gooey"],
      [style*="filter: url('#gooey')"],
      [style*="filter:url('#gooey')"] {
        filter: none !important;
      }
      
      /* Hide the SVG filter for gooey effect */
      filter#gooey,
      filter#gooey-effect {
        display: none !important;
      }
      
      /* Ensure crystal-container has no gooey effect */
      .crystal-container {
        filter: none !important;
      }
    `;
    
    document.head.appendChild(style);
    console.log("Added CSS to disable bubble/gooey effects");
    
    // Remove any SVG filters for gooey effect
    const filters = document.querySelectorAll('filter[id*="gooey"]');
    filters.forEach(filter => {
      console.log("Removing gooey filter:", filter.id);
      filter.remove();
    });
  }
  
  // 4. Remove script tags related to gooey menu
  function removeGooeyScripts() {
    // Find script tags with gooey in the src or text content
    const scripts = document.querySelectorAll('script');
    let removedCount = 0;
    
    scripts.forEach(script => {
      const src = script.src || '';
      const content = script.textContent || '';
      
      if (src.includes('gooey') || content.includes('gooey-menu') || content.includes('gooeyMenu')) {
        console.log("Removing gooey script:", src || "inline script");
        script.remove();
        removedCount++;
      }
    });
    
    // Look for and remove link tags to gooey CSS
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const href = link.href || '';
      if (href.includes('gooey')) {
        console.log("Removing gooey stylesheet:", href);
        link.remove();
        removedCount++;
      }
    });
    
    return removedCount > 0;
  }
  
  // Run all methods to ensure we catch the gooey menu in all its forms
  removeGooeyMenu();
  removeDynamicBubbles();
  disableBubbleCSS();
  removeGooeyScripts();
  
  // Set up an observer to keep removing any new gooey elements that might appear
  const observer = new MutationObserver((mutations) => {
    let foundGooey = false;
    
    mutations.forEach(mutation => {
      // Check added nodes
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          // Check if node is an element and has gooey-related classes
          if (node.nodeType === 1) { // Element node
            const element = node;
            if (element.className && element.id) { // Make sure these properties exist
              const className = element.className || '';
              
              if (className.includes('gooey') || 
                  className.includes('bubble') || 
                  element.id.includes('gooey')) {
                console.log("Observer found new gooey element, removing:", element);
                element.remove();
                foundGooey = true;
              }
            }
          }
        });
      }
    });
    
    // If we found any gooey elements, run our cleanup again
    if (foundGooey) {
      removeGooeyMenu();
      removeDynamicBubbles();
    }
  });
  
  // Start observing the document
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Run the removal again after page is fully loaded in case scripts add bubbles later
  window.addEventListener('load', () => {
    setTimeout(() => {
      removeGooeyMenu();
      removeDynamicBubbles();
    }, 500);
  });
});
