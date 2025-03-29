// Service Items Enhancer - Makes the service items more playful and less formal
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Service Items Enhancer activated');
    
    // Wait a bit for the page to fully render
    setTimeout(enhanceServiceItems, 800);
    
    function enhanceServiceItems() {
      // Find all service bullet items by their content or structure
      const itemSelectors = [
        '.bullet-item', 
        '[class*="bullet-item"]',
        '.crystal-bullet-item',
        '.service-bullets div'
      ];
      
      // Try to find the service items container first
      const containerSelectors = [
        '.service-bullets',
        '.crystal-container',
        '[class*="service-bullets"]'
      ];
      
      let serviceContainer = null;
      for (const selector of containerSelectors) {
        const container = document.querySelector(selector);
        if (container) {
          serviceContainer = container;
          console.log(`Found service container using selector: ${selector}`);
          break;
        }
      }
      
      // If we didn't find a container, look by checking content
      if (!serviceContainer) {
        // Look for any container with common services
        const allDivs = document.querySelectorAll('div');
        for (const div of allDivs) {
          const text = div.textContent?.toLowerCase() || '';
          if (
            (text.includes('custom business') || text.includes('applications')) &&
            (text.includes('mobile development') || text.includes('web')) &&
            (text.includes('technology') || text.includes('consulting')) &&
            (text.includes('ui/ux') || text.includes('design excellence'))
          ) {
            serviceContainer = div;
            console.log('Found service container by text content');
            break;
          }
        }
      }
      
      // If we found a container, enhance it first
      if (serviceContainer) {
        styleContainer(serviceContainer);
      }
      
      // Now find all service items
      let serviceItems = [];
      for (const selector of itemSelectors) {
        const items = document.querySelectorAll(selector);
        if (items.length >= 3) {
          serviceItems = Array.from(items);
          console.log(`Found ${items.length} service items using selector: ${selector}`);
          break;
        }
      }
      
      // If we still don't have items, try finding by text content
      if (serviceItems.length === 0) {
        const contentMatchers = [
          'Custom Business Applications',
          'Modern Web & Mobile Development',
          'Strategic Technology Consulting',
          'UI/UX Design Excellence'
        ];
        
        serviceItems = [];
        
        contentMatchers.forEach(matcher => {
          const elements = Array.from(document.querySelectorAll('div, span, p, li'))
            .filter(el => el.textContent?.includes(matcher));
          
          if (elements.length > 0) {
            // Get the closest parent that could be a service item
            const item = elements[0].closest('div') || elements[0];
            serviceItems.push(item);
            console.log(`Found service item by text content: ${matcher}`);
          }
        });
      }
      
      // Now enhance each service item
      serviceItems.forEach((item, index) => styleServiceItem(item, index));
      
      console.log(`Enhanced ${serviceItems.length} service items`);
    }
    
    // Style the container with fun wavy effects
    function styleContainer(container) {
      container.style.position = 'relative';
      container.style.borderRadius = '16px';
      container.style.padding = '16px';
      container.style.background = 'rgba(74, 87, 255, 0.05)';
      container.style.backdropFilter = 'blur(8px)';
      container.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.05)';
      container.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      container.style.overflow = 'hidden';
      
      // Add gradient wave effect
      const wave = document.createElement('div');
      wave.style.position = 'absolute';
      wave.style.top = '-50%';
      wave.style.left = '-50%';
      wave.style.width = '200%';
      wave.style.height = '200%';
      wave.style.background = 'radial-gradient(ellipse at center, rgba(74, 87, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%)';
      wave.style.animation = 'rotate 10s linear infinite';
      wave.style.pointerEvents = 'none';
      wave.style.zIndex = '-1';
      
      // Add keyframes for rotate animation if not already present
      if (!document.querySelector('#rotate-keyframes')) {
        const style = document.createElement('style');
        style.id = 'rotate-keyframes';
        style.textContent = `
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
      
      container.appendChild(wave);
    }
    
    // Style each service item with playful interactive effects
    function styleServiceItem(item, index) {
      // Skip if item is null or undefined
      if (!item) return;
      
      // Basic styling
      item.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      item.style.background = 'rgba(74, 87, 255, 0.15)';
      item.style.borderRadius = '12px';
      item.style.padding = '8px 12px';
      item.style.margin = '8px 0';
      item.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)';
      item.style.position = 'relative';
      item.style.overflow = 'hidden';
      item.style.cursor = 'pointer';
      
      // Add a small pulse indicator
      const pulse = document.createElement('div');
      pulse.style.position = 'absolute';
      pulse.style.width = '5px';
      pulse.style.height = '5px';
      pulse.style.borderRadius = '50%';
      pulse.style.background = 'cyan';
      pulse.style.right = '10px';
      pulse.style.top = '50%';
      pulse.style.transform = 'translateY(-50%)';
      pulse.style.opacity = '0.6';
      
      // Add keyframes for pulse animation if not already present
      if (!document.querySelector('#pulse-keyframes')) {
        const style = document.createElement('style');
        style.id = 'pulse-keyframes';
        style.textContent = `
          @keyframes pulse {
            0% { transform: translateY(-50%) scale(1); opacity: 0.6; }
            50% { transform: translateY(-50%) scale(1.5); opacity: 0.3; }
            100% { transform: translateY(-50%) scale(1); opacity: 0.6; }
          }
          
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg) scale(1.2); }
            25% { transform: rotate(-10deg) scale(1.3); }
            50% { transform: rotate(5deg) scale(1.2); }
            75% { transform: rotate(-5deg) scale(1.25); }
          }
          
          @keyframes glint {
            0% { transform: translateX(-100%) rotate(-45deg); opacity: 0; }
            10% { opacity: 0.7; }
            100% { transform: translateX(100%) rotate(-45deg); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      pulse.style.animation = 'pulse 2s infinite';
      item.appendChild(pulse);
      
      // Add hover effects
      item.addEventListener('mouseenter', function() {
        this.style.transform = 'perspective(500px) rotateX(5deg) translateY(-5px)';
        this.style.background = 'rgba(74, 87, 255, 0.25)';
        this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)';
        
        // Find and animate any icon
        const icon = this.querySelector('svg, img, .crystal-icon, .bullet');
        if (icon) {
          icon.style.animation = 'wiggle 0.5s ease';
          icon.style.transform = 'scale(1.2)';
          icon.style.filter = 'brightness(1.5)';
        }
        
        // Add glint effect
        const glint = document.createElement('div');
        glint.style.position = 'absolute';
        glint.style.width = '100%';
        glint.style.height = '100%';
        glint.style.top = '0';
        glint.style.left = '0';
        glint.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)';
        glint.style.transform = 'translateX(-100%) rotate(-45deg)';
        glint.style.animation = 'glint 1.5s ease-out forwards';
        glint.style.pointerEvents = 'none';
        this.appendChild(glint);
        
        setTimeout(() => {
          glint.remove();
        }, 1500);
      });
      
      item.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(500px) rotateX(0deg)';
        this.style.background = 'rgba(74, 87, 255, 0.15)';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)';
        
        // Reset icon
        const icon = this.querySelector('svg, img, .crystal-icon, .bullet');
        if (icon) {
          icon.style.animation = '';
          icon.style.transform = '';
          icon.style.filter = '';
        }
      });
      
      // Add staggered appearance animation
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 3200 + (index * 200)); // Stagger each item's appearance
    }
  });
})();
