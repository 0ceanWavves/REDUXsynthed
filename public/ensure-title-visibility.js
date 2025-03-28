// Extra safety measure to ensure title words remain visible
// This script runs after a delay to force all title words to be visible

(function() {
  // Wait for window load
  window.addEventListener('load', () => {
    console.log("Running title visibility safety script");
    
    // First check - run after 2 seconds
    setTimeout(() => {
      const titleWords = document.querySelectorAll('.title-word');
      titleWords.forEach(word => {
        if (word instanceof HTMLElement) {
          // Check if word is not visible
          if (word.style.opacity !== '1' || getComputedStyle(word).opacity < 0.9) {
            console.log("Fixing title word visibility (early check):", word.textContent);
            word.style.opacity = '1';
            word.style.transform = 'translateY(0) scale(1)';
            word.classList.add('animation-complete');
          }
        }
      });
    }, 2000);
    
    // Second check - run after 5 seconds (failsafe)
    setTimeout(() => {
      console.log("Running title visibility failsafe check");
      document.querySelectorAll('.title-word').forEach(word => {
        if (word instanceof HTMLElement) {
          // Force visibility no matter what
          word.style.opacity = '1';
          word.style.transform = 'translateY(0) scale(1)';
          word.classList.add('animation-complete');
          console.log("Title word visibility ensured:", word.textContent);
        }
      });
      
      // Also check the container
      const titleContainer = document.querySelector('.splash-title');
      if (titleContainer instanceof HTMLElement) {
        titleContainer.style.opacity = '1';
        titleContainer.style.visibility = 'visible';
      }
      
      // Check gradient text container
      const gradientText = document.querySelector('.gradient-text');
      if (gradientText instanceof HTMLElement) {
        gradientText.style.opacity = '1';
        gradientText.style.visibility = 'visible';
      }
    }, 5000);
  });
})();