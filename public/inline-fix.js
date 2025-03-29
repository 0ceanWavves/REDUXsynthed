// Copy this script and paste it directly into your HTML before the closing </body> tag

// Create and add a style element
const style = document.createElement('style');
style.textContent = `
  /* Target common container class names */
  .service-bullets,
  .crystal-container,
  .service-container,
  [class*="service-container"],
  [class*="service-bullets"],
  [class*="crystal-container"] {
    /* Make container fully transparent */
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
  }

  /* Make sure any background elements inside the container are hidden */
  .service-bullets::before,
  .crystal-container::before,
  .service-container::before,
  [class*="service-container"]::before,
  [class*="service-bullets"]::before,
  [class*="crystal-container"]::before,
  .crystal-background {
    display: none !important;
    opacity: 0 !important;
  }
`;
document.head.appendChild(style);

// Function to find and remove the outer container
function removeOuterContainer() {
  // Try various selectors that might match the container
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
      });
    }
  }
}

// Run on page load and after a small delay
removeOuterContainer();
setTimeout(removeOuterContainer, 1000);
