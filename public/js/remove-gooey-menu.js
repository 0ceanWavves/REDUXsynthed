/**
 * Remove GooeyMenu - Cleanly removes any instances of the gooey menu
 * This script properly removes the GooeyMenu component from the DOM
 */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Checking for gooey menu to remove...');
    
    // Find and remove any gooey menu containers
    const removeGooeyMenu = () => {
      const menuContainer = document.querySelector('.gooey-menu-container');
      if (menuContainer) {
        console.log('Found gooey menu container, removing it');
        menuContainer.remove();
        
        // Also remove the SVG filter
        const svgFilter = document.querySelector('svg [id="gooey"]')?.closest('svg');
        if (svgFilter) {
          console.log('Removing SVG filter for gooey effect');
          svgFilter.remove();
        }
        
        return true;
      }
      return false;
    };
    
    // Initial removal attempt
    const removed = removeGooeyMenu();
    
    // If we found and removed the menu, also remove the CSS
    if (removed) {
      // Remove the CSS files
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
      cssLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('gooey-menu.css') || href.includes('gooey-menu-textures.css'))) {
          console.log(`Removing CSS: ${href}`);
          link.remove();
        }
      });
      
      // Remove any scripts
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && src.includes('gooey-menu.js')) {
          console.log(`Removing script: ${src}`);
          script.remove();
        }
      });
    }
    
    // Set up a MutationObserver to catch any dynamically added instances
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          // Check added nodes for gooey menu elements
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.classList) { // Element node
              if (node.classList.contains('gooey-menu-container')) {
                console.log('Found dynamically added gooey menu, removing it');
                node.remove();
              }
              
              // Check children recursively
              const containers = node.querySelectorAll('.gooey-menu-container');
              if (containers.length) {
                console.log(`Found ${containers.length} gooey menu containers in added nodes`);
                containers.forEach(container => container.remove());
              }
            }
          });
        }
      });
    });
    
    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also clean up at window load (sometimes components render later)
    window.addEventListener('load', () => {
      setTimeout(removeGooeyMenu, 500); // Small delay to catch late renders
    });
  });
})();
