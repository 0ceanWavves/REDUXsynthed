// Script to animate the title words one by one
(function() {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log("Title animator loaded");
    
    // Function to find title words regardless of exact structure
    function findTitleWords() {
      // Try different selectors that might contain our title words
      const selectors = [
        '.title-word', 
        '.splash-title div', 
        '.impact-text span',
        'h1 span',
        // If we need to be more aggressive, add more general selectors
        '.gradient-text > div',
        '.font-extrabold > div'
      ];
      
      // Try each selector
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length >= 3) {
          const words = Array.from(elements).filter(el => {
            const text = el.textContent?.trim().toLowerCase();
            return text === 'create' || text === 'design' || text === 'build';
          });
          
          if (words.length === 3) {
            console.log(`Found title words using selector: ${selector}`);
            return words;
          }
        }
      }
      
      // If we couldn't find the elements with our selectors, look for any elements with these exact texts
      const allElements = document.querySelectorAll('div, span, h1, h2, h3, p');
      const createElements = Array.from(allElements).filter(el => el.textContent?.trim().toLowerCase() === 'create');
      const designElements = Array.from(allElements).filter(el => el.textContent?.trim().toLowerCase() === 'design');
      const buildElements = Array.from(allElements).filter(el => el.textContent?.trim().toLowerCase() === 'build');
      
      if (createElements.length && designElements.length && buildElements.length) {
        console.log("Found title words by text content");
        return [createElements[0], designElements[0], buildElements[0]];
      }
      
      console.warn("Could not find title words");
      return null;
    }
    
    // Animation code
    function animateTitleWords() {
      const titleWords = findTitleWords();
      if (!titleWords) return;
      
      console.log("Starting title animation");
      
      // Define keyframes
      const floatDownKeyframes = [
        { opacity: 0, transform: 'translateY(-100px) scale(1.5)' },
        { opacity: 1, transform: 'translateY(10px) scale(0.95)', offset: 0.6 },
        { transform: 'translateY(-5px) scale(1.02)', offset: 0.8 },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ];
      
      const floatOptions = {
        duration: 800,
        fill: 'forwards',
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      };
      
      // Reset initial state
      titleWords.forEach(word => {
        word.style.opacity = '0';
        word.style.transform = 'translateY(-100px) scale(1.5)';
      });
      
      // Force a reflow
      void titleWords[0].offsetWidth;
      
      // Animate each word with a delay
      titleWords[0].animate(floatDownKeyframes, { ...floatOptions, delay: 300 });
      
      titleWords[1].animate(floatDownKeyframes, { ...floatOptions, delay: 1200 });
      
      titleWords[2].animate(floatDownKeyframes, { ...floatOptions, delay: 2100 });
      
      // Add continuous floating animation after initial animation
      setTimeout(() => {
        const floatKeyframes = [
          { transform: 'translateY(0) scale(1)' },
          { transform: 'translateY(-10px) scale(1.02)', offset: 0.5 },
          { transform: 'translateY(0) scale(1)' }
        ];
        
        titleWords.forEach((word, index) => {
          word.animate(floatKeyframes, {
            duration: 5000,
            iterations: Infinity,
            delay: index * 1000,
            easing: 'ease-in-out'
          });
        });
        
        console.log("Started continuous floating animation");
      }, 3000);
    }
    
    // Try to initialize immediately
    setTimeout(animateTitleWords, 500);
    
    // Also try again later in case the DOM is still loading
    setTimeout(animateTitleWords, 1500);
  });
})();
