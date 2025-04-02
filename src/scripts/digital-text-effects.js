// Enhanced digital text effects
document.addEventListener('DOMContentLoaded', () => {
  // Target the Digital Solutions text and wait for letter animation to complete
  setTimeout(() => {
    initDigitalEffects();
  }, 2000);
  
  function initDigitalEffects() {
    // Get all digital letters
    const digitalLetters = document.querySelectorAll('.digital-letter');
    
    // Apply advanced effects to each letter
    digitalLetters.forEach((letter, index) => {
      // Add data line effects - small tech lines around some letters
      if (index % 2 === 0) {
        addTechLines(letter, index);
      }
      
      // Add occasional particle burst
      if (index === 2 || index === 5) {
        // Start particle bursts for select letters
        setInterval(() => {
          if (Math.random() > 0.7) {
            createParticleBurst(letter);
          }
        }, 2000);
      }
      
      // Add subtle hover effects
      letter.addEventListener('mouseenter', () => {
        letter.style.transform = 'translateY(-3px) scale(1.1)';
        letter.style.filter = 'brightness(1.3)';
        createParticleBurst(letter);
      });
      
      letter.addEventListener('mouseleave', () => {
        letter.style.transform = 'translateY(0) scale(1)';
        letter.style.filter = 'brightness(1)';
      });
    });
  }
  
  // Add tech lines to letter
  function addTechLines(element, index) {
    // Create tech line container
    const lineContainer = document.createElement('div');
    lineContainer.className = 'tech-lines-container';
    lineContainer.style.cssText = `
      position: absolute;
      top: -5px;
      left: -5px;
      width: calc(100% + 10px);
      height: calc(100% + 10px);
      pointer-events: none;
      z-index: -1;
    `;
    
    // Create a few tech lines
    const lineCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < lineCount; i++) {
      const line = document.createElement('div');
      
      // Randomize line position and size
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const width = 5 + Math.random() * 15;
      const height = 1;
      
      // Apply styles
      line.style.cssText = `
        position: absolute;
        top: ${top}%;
        left: ${left}%;
        width: ${width}px;
        height: ${height}px;
        background: rgba(0, 255, 170, 0.7);
        box-shadow: 0 0 5px rgba(0, 255, 170, 0.7);
        transform: rotate(${Math.random() * 360}deg);
        opacity: 0.7;
        pointer-events: none;
      `;
      
      // Add to container
      lineContainer.appendChild(line);
      
      // Animate with subtle pulsing
      line.animate(
        [
          { opacity: 0.4, boxShadow: '0 0 3px rgba(0, 255, 170, 0.5)' },
          { opacity: 0.8, boxShadow: '0 0 8px rgba(0, 255, 170, 0.8)' },
          { opacity: 0.4, boxShadow: '0 0 3px rgba(0, 255, 170, 0.5)' }
        ],
        {
          duration: 2000 + Math.random() * 1000,
          iterations: Infinity,
          delay: Math.random() * 1000
        }
      );
    }
    
    // Add to letter
    element.style.position = 'relative';
    element.appendChild(lineContainer);
  }
  
  // Create particle burst effect
  function createParticleBurst(element) {
    // Create container for particles
    const burstContainer = document.createElement('div');
    burstContainer.className = 'particle-burst';
    burstContainer.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 3;
    `;
    
    // Create particles
    const particleCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      
      // Random size and position
      const size = 1 + Math.random() * 2;
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 20;
      const duration = 500 + Math.random() * 500;
      
      // Calculate end position
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      // Apply styles
      particle.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: ${size}px;
        height: ${size}px;
        background: rgba(0, 255, 170, 0.9);
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0, 255, 170, 0.8);
        transform: translate(0, 0);
        opacity: 1;
        pointer-events: none;
      `;
      
      // Add to container
      burstContainer.appendChild(particle);
      
      // Animate particle
      particle.animate(
        [
          { transform: 'translate(0, 0)', opacity: 1 },
          { transform: `translate(${endX}px, ${endY}px)`, opacity: 0 }
        ],
        {
          duration: duration,
          easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
          fill: 'forwards'
        }
      );
    }
    
    // Add to element
    element.appendChild(burstContainer);
    
    // Remove after animation completes
    setTimeout(() => {
      burstContainer.remove();
    }, 1500);
  }
});
