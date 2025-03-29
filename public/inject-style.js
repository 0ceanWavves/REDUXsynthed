// Script to inject the custom styles
document.addEventListener('DOMContentLoaded', function() {
  console.log("Injecting playful crystal styling...");
  
  // Create link element for the CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/crystal-override.css';
  link.id = 'crystal-override-styles';
  
  // Add timestamp to bust cache
  link.href = link.href + '?v=' + new Date().getTime();
  
  // Append to head with high priority
  document.head.appendChild(link);
  
  // Force immediate application of some styles
  setTimeout(function() {
    // Apply animation classes directly to elements
    const titleWords = document.querySelectorAll('.title-word, .impact-text span');
    titleWords.forEach((word, index) => {
      word.style.animationDelay = (0.9 * (index + 1)) + 's';
      word.style.opacity = '0';
    });
    
    // Force reapplication of animations
    setTimeout(function() {
      titleWords.forEach(word => {
        word.style.opacity = '';
      });
      console.log("Title animations restarted");
    }, 100);
    
    // Apply hover effects to service items
    const serviceItems = document.querySelectorAll('.bullet-item, [class*="bullet-item"]');
    serviceItems.forEach(item => {
      item.addEventListener('mouseenter', function() {
        this.style.transform = 'perspective(500px) rotateX(5deg) translateY(-5px)';
        this.style.background = 'rgba(74, 87, 255, 0.25)';
      });
      
      item.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(500px) rotateX(0deg)';
        this.style.background = 'rgba(74, 87, 255, 0.15)';
      });
    });
    
    console.log("Applied interactive effects");
  }, 500);
});
