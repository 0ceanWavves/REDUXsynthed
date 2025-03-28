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
  
  // Force all text elements to higher z-index
  const textSelectors = [
    '.splash-title', 
    '.title-word', 
    '.gradient-text', 
    '.splash-content', 
    '.content-item',
    '.check-circle', 
    '.buttons-container',
    '.relative.z-50'
  ];
  
  textSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.position = 'relative';
        el.style.zIndex = '999';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
      }
    });
  });
  
  console.log("Z-index fix applied to all text elements");
});