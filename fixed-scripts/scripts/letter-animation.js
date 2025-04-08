// Letter-by-letter animation for s text
document.addEventListener('DOMContentLoaded', () => {
  // Target the Digital Solutions text
  const digitalSolutionsElement = document.querySelector('.digital-solutions-text');
  
  if (digitalSolutionsElement) {
    // Get the original text and create a span for each letter
    const originalText = digitalSolutionsElement.textContent;
    let htmlContent = '';
    
    // Split text into "Digital" and "Solutions" parts
    const digitalPart = 'Digital';
    const solutionsPart = ' Solutions';
    
    // Create spans for each letter in "Digital" with data-index for animation
    for (let i = 0; i < digitalPart.length; i++) {
      htmlContent += `<span class="digital-letter" data-index="${i}" style="opacity: 0; transform: translateY(10px);">${digitalPart[i]}</span>`;
    }
    
    // Add the "Solutions" part without animation
    htmlContent += `<span class="solutions-text">${solutionsPart}</span>`;
    
    // Replace the content
    digitalSolutionsElement.innerHTML = htmlContent;
    
    // Animate each letter one by one
    const letters = document.querySelectorAll('.digital-letter');
    
    // Start animation with delay
    setTimeout(() => {
      letters.forEach((letter, index) => {
        // Staggered animation timing
        setTimeout(() => {
          // Apply animation
          letter.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          letter.style.opacity = '1';
          letter.style.transform = 'translateY(0)';
          
          // Add glitch effect to each letter
          addGlitchEffect(letter);
          
          // Add a small "pop" effect
          setTimeout(() => {
            letter.style.transform = 'translateY(-2px) scale(1.1)';
            setTimeout(() => {
              letter.style.transform = 'translateY(0) scale(1)';
            }, 100);
          }, 200);
          
          // Add flash of light effect
          const flash = document.createElement('div');
          flash.className = 'letter-flash';
          flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, rgba(0, 255, 170, 0.9) 0%, rgba(0, 255, 170, 0) 80%);
            pointer-events: none;
            opacity: 0;
            z-index: 2;
          `;
          
          letter.style.position = 'relative';
          letter.appendChild(flash);
          
          // Animate flash
          flash.animate(
            [
              { opacity: 0 },
              { opacity: 0.8 },
              { opacity: 0 }
            ],
            {
              duration: 400,
              easing: 'ease-out'
            }
          );
          
          // Remove flash after animation
          setTimeout(() => {
            flash.remove();
          }, 400);
          
        }, index * 150); // 150ms delay between each letter
      });
    }, 300); // Delay before starting the animation
    
    // Make sure the Solutions part is visible
    const solutionsText = document.querySelector('.solutions-text');
    if (solutionsText) {
      solutionsText.style.opacity = '1';
    }
  }

  // Function to add glitch effect to a letter
  function addGlitchEffect(element) {
    // Create glitch overlay elements
    const glitch1 = document.createElement('div');
    const glitch2 = document.createElement('div');
    
    // Set common styles
    const commonStyles = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: inherit;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-fill-color: transparent;
      pointer-events: none;
    `;
    
    // Apply styles to glitch elements
    glitch1.style.cssText = commonStyles + 'left: -2px; opacity: 0.8; color: rgba(0, 255, 200, 0.8);';
    glitch2.style.cssText = commonStyles + 'left: 2px; opacity: 0.8; color: rgba(255, 0, 255, 0.8);';
    
    // Add glitch elements to the letter
    element.appendChild(glitch1);
    element.appendChild(glitch2);
    
    // Create glitch animation
    function glitchAnimation() {
      // Only apply glitch occasionally
      if (Math.random() > 0.95) {
        // Random offsets
        const offsetX1 = Math.random() * 4 - 2;
        const offsetY1 = Math.random() * 4 - 2;
        const offsetX2 = Math.random() * 4 - 2;
        const offsetY2 = Math.random() * 4 - 2;
        
        // Apply random transforms
        glitch1.style.transform = `translate(${offsetX1}px, ${offsetY1}px)`;
        glitch2.style.transform = `translate(${offsetX2}px, ${offsetY2}px)`;
        
        // Show glitch
        glitch1.style.opacity = '0.8';
        glitch2.style.opacity = '0.8';
        
        // Hide after short duration
        setTimeout(() => {
          glitch1.style.transform = 'translate(0, 0)';
          glitch2.style.transform = 'translate(0, 0)';
          glitch1.style.opacity = '0';
          glitch2.style.opacity = '0';
        }, 50 + Math.random() * 100);
      }
    }
    
    // Run glitch effect periodically
    const glitchInterval = setInterval(glitchAnimation, 200);
    
    // Store interval ID for cleanup
    element.dataset.glitchInterval = String(glitchInterval);
  }
});
