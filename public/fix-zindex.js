// Emergency fix for z-index issues
document.addEventListener('DOMContentLoaded', () => {
  console.log("Running z-index fix script");
  
  // Force canvas to lower z-index
  const canvas = document.getElementById('prism-bg-canvas');
  if (canvas) {
    canvas.style.zIndex = '5';
    console.log("Set canvas z-index to 5");
  }
  
  // Force prism-background to lower z-index
  const prismBackground = document.getElementById('prism-background');
  if (prismBackground) {
    prismBackground.style.zIndex = '6';
    console.log("Set prism-background z-index to 6");
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
  
  // Apply to content but skip title elements
  contentSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.position = 'relative';
        el.style.zIndex = '999';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
      }
    });
  });
  
  console.log("Z-index fix applied to content elements only");
  
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
});