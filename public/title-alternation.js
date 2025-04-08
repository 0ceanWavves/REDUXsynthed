/**
 * Title Alternation Script
 * This script alternates the headline text when the 3D shape changes
 */

(function() {
  console.log("🔄 Title alternation script loaded");
  
  // Define the possible texts
  const texts = ["Digital Solutions", "Transforming ideas into"];
  const headlineId = 'dynamic-headline';
  
  // Track the current class to avoid duplicate transitions
  let currentClass = '';
  
  // Function to change the text
  function changeHeadlineText(newText) {
    const headlineElement = document.getElementById(headlineId);
    
    if (!headlineElement) {
      console.warn(`Headline element with id "${headlineId}" not found`);
      return;
    }
    
    console.log(`🔄 Changing headline text to: "${newText}"`);
    
    // Apply the fade effect
    if (window.gsap) {
      gsap.to(headlineElement, {
        duration: 0.3, 
        opacity: 0, 
        onComplete: () => {
          headlineElement.textContent = newText;
          gsap.to(headlineElement, {duration: 0.3, opacity: 1});
        }
      });
    } else {
      // Basic CSS transition fallback
      headlineElement.style.opacity = 0;
      setTimeout(() => {
        headlineElement.textContent = newText;
        headlineElement.style.opacity = 1;
      }, 300);
    }
  }
  
  // Monitor for shape change by observing class changes on content-overlay
  const contentOverlay = document.getElementById('content-overlay');
  
  if (contentOverlay) {
    // Use MutationObserver to watch for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newClass = contentOverlay.className;
          
          // Only react if the class actually changed
          if (newClass !== currentClass) {
            currentClass = newClass;
            console.log(`Shape changed to: ${newClass}`);
            
            // Determine which shape we're on
            if (newClass.includes('tetrahedron') || newClass.includes('octahedron') || 
                newClass.includes('dodecahedron')) {
              changeHeadlineText(texts[0]); // "Digital Solutions"
            } else if (newClass.includes('cube') || newClass.includes('icosahedron')) {
              changeHeadlineText(texts[1]); // "Transforming ideas into"
            }
          }
        }
      });
    });
    
    // Start observing
    observer.observe(contentOverlay, { attributes: true });
    console.log("🔍 Shape change observer started");
    
    // Set initial text based on current class
    currentClass = contentOverlay.className;
    if (currentClass.includes('tetrahedron')) {
      setTimeout(() => changeHeadlineText(texts[0]), 1000);
    }
  } else {
    console.warn("Content overlay element not found for observation");
  }
})();