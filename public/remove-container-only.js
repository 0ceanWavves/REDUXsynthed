// Simple script to remove only the outer container/frame around service cards
document.addEventListener('DOMContentLoaded', function() {
  console.log("Remove container only script running");
  
  // Create a link element for the CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/remove-container-only.css';
  
  // Add timestamp to bust cache
  link.href = link.href + '?v=' + new Date().getTime();
  
  // Append to head
  document.head.appendChild(link);
  
  // Function to find and remove only the outer container
  function removeOuterContainerOnly() {
    // Common selectors that might match the outer container
    const containerSelectors = [
      '.service-bullets',
      '.crystal-container',
      '.service-container',
      '[class*="service-container"]',
      '[class*="service-bullets"]',
      '[class*="crystal-container"]'
    ];
    
    // Try each selector
    for (const selector of containerSelectors) {
      const containers = document.querySelectorAll(selector);
      
      if (containers.length > 0) {
        console.log(`Found ${containers.length} containers with selector ${selector}`);
        
        // For each container, remove background/border without changing children
        containers.forEach(container => {
          // Remove only the outer styling
          container.style.background = 'transparent';
          container.style.border = 'none';
          container.style.boxShadow = 'none';
          container.style.backdropFilter = 'none';
          
          // Remove any background elements
          const backgrounds = container.querySelectorAll('[class*="background"], [class*="gradient"]');
          backgrounds.forEach(bg => {
            if (bg !== container) {
              bg.style.display = 'none';
            }
          });
          
          console.log("Removed outer container styling");
        });
      }
    }
  }
  
  // Run initially
  removeOuterContainerOnly();
  
  // Run again after a delay in case of delayed rendering
  setTimeout(removeOuterContainerOnly, 1000);
});
