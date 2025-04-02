// title-animation-controller.js - Manages the slam animation sequence for title words

document.addEventListener('DOMContentLoaded', () => {
  console.log("Title animation controller initialized");
  
  // Listen for the custom event to start the animation
  document.addEventListener('startTitleAnimation', () => {
    animateTitleWithSlam();
  });
  
  // Main animation function with true slam effect
  function animateTitleWithSlam() {
    console.log("Starting true slam title animation");
    
    // Get all title words using the new class
    const titleWords = document.querySelectorAll('.hero-rebuild-title-word');
    
    // Get impact effect elements
    const ripples = document.querySelectorAll('.impact-ripple');
    const shake = document.querySelector('.impact-shake');
    const flash = document.querySelector('.impact-flash');
    
    // Animation configuration
    const baseDelay = 800; // ms between words
    const animDuration = 600; // ms for animation - faster for more impact
    
    // Start by hiding all words off-screen (above viewport)
    titleWords.forEach(word => {
      word.style.opacity = '0';
      word.style.transform = 'translateY(-100vh) scale(1.2)';
      word.style.visibility = 'visible'; // Make sure it's visible but just off-screen
    });
    
    // Apply animations with dramatic staggered timing to each word
    titleWords.forEach((word, index) => {
      // Calculate delay for this word
      const wordDelay = baseDelay * index;
      
      // Get corresponding shadow and ripple elements
      const shadow = word.querySelector('.title-shadow');
      const ripple = ripples[index];
      
      // Start the slam animation after delay
      setTimeout(() => {
        console.log(`Slamming word ${index}`);
        
        // Animation for the word dropping in from above
        animateSlam(word);
        
        // Shadow effect
        setTimeout(() => {
          animateShadow(shadow);
        }, animDuration * 0.6); // Apply shadow when word lands
        
        // Ripple effect
        setTimeout(() => {
          animateRipple(ripple);
        }, animDuration * 0.6); // Apply ripple when word lands
        
        // Shake effect (only on the first and last words for more impact)
        if (index === 0 || index === titleWords.length - 1) {
          setTimeout(() => {
            animateShake(shake);
          }, animDuration * 0.6);
        }
        
        // Flash effect
        setTimeout(() => {
          animateFlash(flash);
        }, animDuration * 0.6);
        
        // Ensure word visibility with completed class
        setTimeout(() => {
          word.classList.add('animation-complete');
        }, animDuration);
        
      }, wordDelay);
    });
  }
  
  // Function to animate the word slamming down from above
  function animateSlam(element) {
    // Create keyframes for a true slam effect
    const keyframes = [
      { 
        opacity: 0, 
        transform: 'translateY(-100vh) scale(1.2)' // Start completely off-screen above
      },
      { 
        opacity: 1, 
        transform: 'translateY(0) scale(1.05)', // Land at position
        offset: 0.6 // 60% of the way through animation
      },
      { 
        opacity: 1, 
        transform: 'translateY(10px) scale(0.95)', // Slight bounce down
        offset: 0.8
      },
      { 
        opacity: 1, 
        transform: 'translateY(0) scale(1)' // Settle in final position
      }
    ];
    
    // Animation options
    const options = {
      duration: 600, // Faster for more impact
      easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)', // More abrupt easing
      fill: 'forwards'
    };
    
    // Perform animation
    const animation = element.animate(keyframes, options);
    
    // Get element's data-index attribute
    const index = element.getAttribute('data-index');
    
    // Add impact effect when the word lands
    animation.onfinish = () => {
      // Add additional bounce effect after landing
      element.animate([
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(5px) scale(0.98)' }, 
        { transform: 'translateY(-3px) scale(1.02)' },
        { transform: 'translateY(0) scale(1)' }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.5, 0, 0.5, 1)'
      });
    };
  }
  
  // Function to animate shadow expansion
  function animateShadow(element) {
    if (!element) return;
    
    const keyframes = [
      { opacity: 0, transform: 'scale(0)' },
      { opacity: 1, transform: 'scale(2.5)', offset: 0.5 }, // More dramatic expansion
      { opacity: 0.7, transform: 'scale(1.2)' } // Larger final size
    ];
    
    const options = {
      duration: 500,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy easing
      fill: 'forwards'
    };
    
    element.animate(keyframes, options);
  }
  
  // Function to animate ripple effect
  function animateRipple(element) {
    if (!element) return;
    
    const keyframes = [
      { opacity: 0, transform: 'scaleX(0.1)' },
      { opacity: 1, transform: 'scaleX(1.2)', offset: 0.4 }, // Larger expansion
      { opacity: 0, transform: 'scaleX(1.5)' } // Larger final size
    ];
    
    const options = {
      duration: 500,
      easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      fill: 'forwards'
    };
    
    element.animate(keyframes, options);
  }
  
  // Function to animate container shake
  function animateShake(element) {
    if (!element) return;
    
    const keyframes = [];
    const intensity = 5; // More shake intensity
    
    // Generate more intense shake keyframes
    for (let i = 0; i <= 10; i++) {
      const offset = i / 10;
      const translateX = i % 2 === 0 ? intensity : -intensity;
      const translateY = i % 4 === 0 ? intensity / 2 : 0;
      const opacity = i === 0 || i === 10 ? 0 : 0.8;
      
      keyframes.push({
        transform: `translateX(${translateX}px) translateY(${translateY}px)`,
        opacity: opacity,
        offset: offset
      });
    }
    
    const options = {
      duration: 400, // Faster shake
      easing: 'ease-out',
      fill: 'forwards'
    };
    
    element.animate(keyframes, options);
  }
  
  // Function to animate flash effect
  function animateFlash(element) {
    if (!element) return;
    
    const keyframes = [
      { opacity: 0 },
      { opacity: 0.4, offset: 0.2 }, // Brighter flash
      { opacity: 0 }
    ];
    
    const options = {
      duration: 300, // Faster flash
      easing: 'ease-out',
      fill: 'forwards'
    };
    
    element.animate(keyframes, options);
  }
  
  // Function to shake an individual element
  function shakeElement(element) {
    const keyframes = [
      { transform: 'translateY(0) translateX(0) rotate(0deg)' },
      { transform: 'translateY(0) translateX(-6px) rotate(-0.5deg)', offset: 0.1 }, // More intense
      { transform: 'translateY(0) translateX(6px) rotate(0.5deg)', offset: 0.2 },
      { transform: 'translateY(0) translateX(-6px) rotate(-0.3deg)', offset: 0.3 },
      { transform: 'translateY(0) translateX(6px) rotate(0.3deg)', offset: 0.4 },
      { transform: 'translateY(0) translateX(-3px) rotate(-0.2deg)', offset: 0.5 },
      { transform: 'translateY(0) translateX(3px) rotate(0.2deg)', offset: 0.6 },
      { transform: 'translateY(0) translateX(-1px) rotate(-0.1deg)', offset: 0.8 },
      { transform: 'translateY(0) translateX(0) rotate(0deg)' }
    ];
    
    const options = {
      duration: 400, // Faster shake
      easing: 'ease-out',
      fill: 'forwards'
    };
    
    element.animate(keyframes, options);
  }
  
  // Emergency visibility fallback
  function ensureTitleVisibility() {
    document.querySelectorAll('.hero-rebuild-title-word').forEach(word => {
      if (word.style.opacity !== '1') {
        word.style.opacity = '1';
        word.style.visibility = 'visible';
        word.style.transform = 'translateY(0) scale(1)';
        word.classList.add('animation-complete');
      }
    });
    console.log("Title visibility enforced");
  }
  
  // Apply the safety measure with a backup timeout
  setTimeout(ensureTitleVisibility, 8000);
  
  // For debugging: log when the animation is triggered
  document.addEventListener('startTitleAnimation', () => {
    console.log("startTitleAnimation event received");
  });
  
  // Trigger animation immediately after load for testing
  // Comment this out if you want to rely on the event only
  setTimeout(() => {
    console.log("Auto-triggering title animation for testing");
    document.dispatchEvent(new CustomEvent('startTitleAnimation'));
  }, 1000);
});
