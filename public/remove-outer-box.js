// Script to remove the outer box and style individual service cards
document.addEventListener('DOMContentLoaded', function() {
  console.log("Remove outer box script running");
  
  // Function to find and modify the service cards container
  function enhanceServiceCards() {
    // Possible selectors for the container that has the outer box
    const containerSelectors = [
      '.service-bullets',
      '.crystal-container',
      '.bullet-items-container',
      '[class*="service-bullets"]'
    ];
    
    // Find the container
    let container = null;
    for (const selector of containerSelectors) {
      const found = document.querySelector(selector);
      if (found) {
        container = found;
        console.log(`Found service container using selector: ${selector}`);
        break;
      }
    }
    
    // If we can't find by class, look for container by structure
    if (!container) {
      // Look for any element that contains all four service items
      const allDivs = document.querySelectorAll('div');
      for (const div of allDivs) {
        const text = div.textContent?.toLowerCase() || '';
        if (
          (text.includes('custom business') || text.includes('applications')) &&
          (text.includes('mobile development') || text.includes('web')) &&
          (text.includes('technology') || text.includes('consulting')) &&
          (text.includes('ui/ux') || text.includes('design excellence'))
        ) {
          container = div;
          console.log('Found service container by content');
          break;
        }
      }
    }
    
    // If we found the container, modify it to remove the outer box
    if (container) {
      // Remove the outer box styling
      container.style.background = 'transparent';
      container.style.backdropFilter = 'none';
      container.style.boxShadow = 'none';
      container.style.border = 'none';
      
      // Make sure any padding is reset
      container.style.padding = '0';
      container.style.margin = '10px 0';
      
      // Remove any gradient or animated background elements
      const backgrounds = container.querySelectorAll('[class*="background"], [class*="gradient"]');
      backgrounds.forEach(bg => {
        if (bg !== container) {
          bg.style.display = 'none';
        }
      });
      
      // Now find all individual service cards
      const serviceCards = container.querySelectorAll('div[class*="bullet"], div[class*="crystal"]');
      if (serviceCards.length === 0) {
        // If we didn't find the cards by class, get all child divs that could be the cards
        const childDivs = container.children;
        if (childDivs.length >= 4) {
          // Assume these are the service cards
          styleServiceCards(Array.from(childDivs));
        }
      } else {
        styleServiceCards(Array.from(serviceCards));
      }
      
      console.log(`Enhanced ${serviceCards.length} service cards`);
    } else {
      console.log('Could not find service container, trying to find individual cards');
      
      // If we can't find the container, try to find individual cards directly
      const cardTextContent = [
        'Custom Business Applications',
        'Modern Web & Mobile Development',
        'Strategic Technology Consulting',
        'UI/UX Design Excellence'
      ];
      
      const foundCards = [];
      
      cardTextContent.forEach(text => {
        const elements = Array.from(document.querySelectorAll('div, p, span'))
          .filter(el => el.textContent?.includes(text));
        
        if (elements.length > 0) {
          // Get the closest parent div that could be a card
          const card = elements[0].closest('div');
          if (card) {
            foundCards.push(card);
            console.log(`Found service card for: ${text}`);
          }
        }
      });
      
      if (foundCards.length > 0) {
        styleServiceCards(foundCards);
      }
    }
  }
  
  // Function to style individual service cards
  function styleServiceCards(cards) {
    // The four icons to use for each service
    const icons = [
      // Document/App icon for Custom Business Applications
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line></svg>',
      
      // Computer/Device icon for Web & Mobile Development
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
      
      // Chart/Strategy icon for Strategic Technology Consulting
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
      
      // Design/UI icon for UI/UX Design Excellence
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>'
    ];
    
    // Make sure keyframes are added for animations
    if (!document.getElementById('service-card-keyframes')) {
      const style = document.createElement('style');
      style.id = 'service-card-keyframes';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        
        @keyframes iconGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Style each card
    cards.forEach((card, index) => {
      if (!card) return;
      
      // Reset all previous styling first
      card.style.background = 'transparent';
      card.style.backdropFilter = 'none';
      card.style.boxShadow = 'none';
      card.style.border = 'none';
      
      // Create the new styled card
      const newCard = document.createElement('div');
      newCard.className = 'enhanced-service-card';
      newCard.style.background = 'rgba(74, 87, 255, 0.15)';
      newCard.style.backdropFilter = 'blur(10px)';
      newCard.style.borderRadius = '12px';
      newCard.style.padding = '16px';
      newCard.style.margin = '12px';
      newCard.style.display = 'flex';
      newCard.style.alignItems = 'center';
      newCard.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1)';
      newCard.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      newCard.style.cursor = 'pointer';
      newCard.style.animation = `fadeIn 0.5s ease-out forwards ${0.3 + (index * 0.1)}s`;
      newCard.style.opacity = '0'; // Start hidden for animation
      
      // Create icon container
      const iconContainer = document.createElement('div');
      iconContainer.className = 'service-icon';
      iconContainer.style.width = '40px';
      iconContainer.style.height = '40px';
      iconContainer.style.borderRadius = '50%';
      iconContainer.style.background = 'rgba(74, 87, 255, 0.3)';
      iconContainer.style.marginRight = '12px';
      iconContainer.style.display = 'flex';
      iconContainer.style.alignItems = 'center';
      iconContainer.style.justifyContent = 'center';
      iconContainer.style.flexShrink = '0';
      iconContainer.style.color = 'white';
      iconContainer.style.animation = 'iconGlow 3s infinite ease-in-out';
      iconContainer.style.boxShadow = '0 0 10px rgba(74, 87, 255, 0.5)';
      
      // Set icon
      iconContainer.innerHTML = icons[index] || icons[0];
      
      // Create text container
      const textContainer = document.createElement('div');
      textContainer.className = 'service-text';
      textContainer.style.color = 'white';
      textContainer.style.fontSize = '16px';
      textContainer.style.fontWeight = '500';
      textContainer.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
      
      // Get the text from the original card
      const cardText = card.textContent?.trim() || '';
      textContainer.textContent = cardText;
      
      // Append icon and text to the new card
      newCard.appendChild(iconContainer);
      newCard.appendChild(textContainer);
      
      // Add hover effects
      newCard.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
        this.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.2)';
        this.style.background = 'rgba(74, 87, 255, 0.25)';
        
        const icon = this.querySelector('.service-icon');
        if (icon) {
          icon.style.background = 'rgba(74, 87, 255, 0.5)';
        }
      });
      
      newCard.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1)';
        this.style.background = 'rgba(74, 87, 255, 0.15)';
        
        const icon = this.querySelector('.service-icon');
        if (icon) {
          icon.style.background = 'rgba(74, 87, 255, 0.3)';
        }
      });
      
      // Replace the old card with the new one
      if (card.parentNode) {
        card.parentNode.replaceChild(newCard, card);
      }
    });
    
    // If we found less than 4 cards, look for container to style it properly
    if (cards.length < 4) {
      const parentContainer = cards[0]?.parentNode;
      if (parentContainer) {
        parentContainer.style.display = 'grid';
        parentContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
        parentContainer.style.gap = '15px';
        parentContainer.style.padding = '15px';
        parentContainer.style.background = 'transparent';
      }
    }
  }
  
  // Run our enhancement function
  enhanceServiceCards();
  
  // Try again after a little delay in case the DOM is still loading
  setTimeout(enhanceServiceCards, 800);
  
  // And once more after a longer delay for good measure
  setTimeout(enhanceServiceCards, 2000);
});
