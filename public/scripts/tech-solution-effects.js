// Advanced tech effects for solution items
document.addEventListener('DOMContentLoaded', () => {
  console.log("Tech solution effects initialized");
  
  // Wait for animation to complete
  setTimeout(() => {
    enhanceSolutionItems();
  }, 4000);
  
  function enhanceSolutionItems() {
    const items = document.querySelectorAll('.crystal-bullet-item');
    
    // Apply enhancements to each item
    items.forEach((item, index) => {
      // Add tech-enhanced class
      item.classList.add('tech-enhanced');
      
      // Create canvas for circuit/particle background
      createCircuitCanvas(item, index);
      
      // Add 3D perspective effect on hover
      add3DEffect(item);
      
      // Add custom data attribute for service type
      const serviceType = item.querySelector('.crystal-text').textContent.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      item.setAttribute('data-service', serviceType);
      
      // Add glitch effect on hover
      addGlitchEffect(item);
      
      // Add tech-themed details based on service type
      addTechDetails(item, serviceType);
    });
  }
  
  function createCircuitCanvas(element, index) {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'circuit-canvas';
    canvas.width = element.offsetWidth;
    canvas.height = element.offsetHeight;
    
    // Set canvas style
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      z-index: -1;
      opacity: 0.2;
      pointer-events: none;
    `;
    
    // Prepend canvas to element (so it appears behind content)
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.prepend(canvas);
    
    // Get context and draw circuit pattern
    const ctx = canvas.getContext('2d');
    
    // Different pattern for each service
    const patterns = [
      drawCircuitPattern,  // Business Apps
      drawGridPattern,     // Web & Mobile Dev
      drawDataPattern,     // Tech Consulting
      drawDesignPattern    // UI/UX Design
    ];
    
    // Initial draw
    const draw = patterns[index % patterns.length];
    draw(ctx, canvas.width, canvas.height);
    
    // Animate the canvas
    let animationFrame;
    const animate = () => {
      // Redraw with slight variation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw(ctx, canvas.width, canvas.height, performance.now() / 1000);
      animationFrame = requestAnimationFrame(animate);
    };
    
    // Start animation when element is hovered
    element.addEventListener('mouseenter', () => {
      animate();
    });
    
    // Stop animation when mouse leaves
    element.addEventListener('mouseleave', () => {
      cancelAnimationFrame(animationFrame);
      // Redraw static version
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw(ctx, canvas.width, canvas.height);
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
      if (element.offsetWidth > 0 && element.offsetHeight > 0) {
        canvas.width = element.offsetWidth;
        canvas.height = element.offsetHeight;
        draw(ctx, canvas.width, canvas.height);
      }
    });
  }
  
  function drawCircuitPattern(ctx, width, height, time = 0) {
    // Circuit pattern for Business Apps
    ctx.strokeStyle = '#00e599';
    ctx.lineWidth = 1;
    
    const nodeCount = Math.floor(width / 30);
    const nodes = [];
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        // Add slight movement over time if time is provided
        offsetX: time ? Math.sin(time + i * 0.5) * 2 : 0,
        offsetY: time ? Math.cos(time + i * 0.5) * 2 : 0
      });
    }
    
    // Connect nodes with lines
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Draw node
      ctx.beginPath();
      ctx.arc(node.x + (node.offsetX || 0), node.y + (node.offsetY || 0), 2, 0, Math.PI * 2);
      ctx.fillStyle = '#00e599';
      ctx.fill();
      
      // Connect to closest nodes
      for (let j = 0; j < nodes.length; j++) {
        if (i !== j) {
          const target = nodes[j];
          const dx = target.x - node.x;
          const dy = target.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < width / 5) {
            ctx.beginPath();
            ctx.moveTo(node.x + (node.offsetX || 0), node.y + (node.offsetY || 0));
            
            // Draw a line with a small perpendicular offset to create circuit-like paths
            const midX = (node.x + target.x) / 2;
            const midY = (node.y + target.y) / 2;
            
            if (Math.random() > 0.5) {
              // Straight line
              ctx.lineTo(midX + (target.offsetX || 0)/2, midY + (target.offsetY || 0)/2);
              ctx.lineTo(target.x + (target.offsetX || 0), target.y + (target.offsetY || 0));
            } else {
              // Right angle
              if (Math.random() > 0.5) {
                ctx.lineTo(node.x + (node.offsetX || 0), midY + (target.offsetY || 0)/2);
                ctx.lineTo(target.x + (target.offsetX || 0), midY + (target.offsetY || 0)/2);
              } else {
                ctx.lineTo(midX + (target.offsetX || 0)/2, node.y + (node.offsetY || 0));
                ctx.lineTo(midX + (target.offsetX || 0)/2, target.y + (target.offsetY || 0));
              }
              ctx.lineTo(target.x + (target.offsetX || 0), target.y + (target.offsetY || 0));
            }
            
            ctx.stroke();
          }
        }
      }
    }
    
    // Add some small circuit components
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 10 + 5;
      
      ctx.beginPath();
      ctx.rect(x, y, size, size);
      ctx.strokeStyle = '#00e599';
      ctx.stroke();
      
      // Add connector lines
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y + size);
      ctx.lineTo(x + size / 2, y + size + 10);
      ctx.stroke();
    }
  }
  
  function drawGridPattern(ctx, width, height, time = 0) {
    // Grid pattern for Web & Mobile Dev
    ctx.strokeStyle = '#4a57ff';
    ctx.lineWidth = 1;
    
    // Grid size
    const gridSize = 15;
    
    // Draw vertical lines
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      // Add subtle wave effect if time is provided
      if (time) {
        ctx.moveTo(x, 0);
        for (let y = 0; y < height; y += 5) {
          const offsetX = Math.sin(y * 0.05 + time) * 2;
          ctx.lineTo(x + offsetX, y);
        }
      } else {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      // Add subtle wave effect if time is provided
      if (time) {
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x += 5) {
          const offsetY = Math.cos(x * 0.05 + time) * 2;
          ctx.lineTo(x, y + offsetY);
        }
      } else {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }
    
    // Add some device icons
    const deviceSize = 20;
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(Math.random() * (width - deviceSize) / gridSize) * gridSize;
      const y = Math.floor(Math.random() * (height - deviceSize) / gridSize) * gridSize;
      
      // Draw device outline (phone or computer)
      ctx.beginPath();
      if (Math.random() > 0.5) {
        // Phone
        ctx.rect(x, y, deviceSize / 2, deviceSize);
        ctx.stroke();
      } else {
        // Computer
        ctx.rect(x, y, deviceSize, deviceSize * 0.7);
        ctx.moveTo(x + deviceSize / 2 - 5, y + deviceSize * 0.7);
        ctx.lineTo(x + deviceSize / 2 + 5, y + deviceSize);
        ctx.lineTo(x + deviceSize / 2 - 5, y + deviceSize);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }
  
  function drawDataPattern(ctx, width, height, time = 0) {
    // Data visualization pattern for Tech Consulting
    ctx.strokeStyle = '#8162ff';
    ctx.fillStyle = 'rgba(129, 98, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw bar chart
    const barCount = 8;
    const barWidth = width / (barCount * 2);
    
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth * 2 + barWidth / 2;
      
      // Generate dynamic height based on time if provided
      let barHeight;
      if (time) {
        barHeight = (Math.sin(time + i * 0.5) * 0.5 + 0.5) * height * 0.6;
      } else {
        barHeight = Math.random() * height * 0.6;
      }
      
      // Draw bar
      ctx.beginPath();
      ctx.rect(x, height - barHeight, barWidth, barHeight);
      ctx.fill();
      ctx.stroke();
    }
    
    // Draw line graph across top
    ctx.beginPath();
    ctx.moveTo(0, height * 0.2);
    
    for (let i = 0; i <= width; i += width / 20) {
      // Create smooth line with variation
      let y;
      if (time) {
        y = height * 0.2 + Math.sin(i * 0.05 + time) * height * 0.1;
      } else {
        y = height * 0.2 + Math.sin(i * 0.05) * height * 0.1;
      }
      
      ctx.lineTo(i, y);
    }
    
    ctx.stroke();
    
    // Draw some data points
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Connection lines
      if (i > 0) {
        const prevX = Math.random() * width;
        const prevY = Math.random() * height;
        
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  }
  
  function drawDesignPattern(ctx, width, height, time = 0) {
    // Design pattern for UI/UX Design
    ctx.strokeStyle = '#ff61b0';
    ctx.lineWidth = 1;
    
    // Draw design grid with circles and guides
    const gridSize = 20;
    
    // Draw dots at grid intersections
    for (let x = gridSize; x < width; x += gridSize) {
      for (let y = gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        // Add subtle movement if time is provided
        let offsetX = 0;
        let offsetY = 0;
        
        if (time) {
          offsetX = Math.sin(time + x * 0.01 + y * 0.01) * 2;
          offsetY = Math.cos(time + x * 0.01 + y * 0.01) * 2;
        }
        
        ctx.arc(x + offsetX, y + offsetY, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw some UI elements
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(Math.random() * (width - 40) / gridSize) * gridSize;
      const y = Math.floor(Math.random() * (height - 40) / gridSize) * gridSize;
      const elementWidth = Math.floor(Math.random() * 3 + 2) * gridSize;
      const elementHeight = Math.floor(Math.random() * 2 + 1) * gridSize;
      
      // Draw UI component
      ctx.beginPath();
      ctx.rect(x, y, elementWidth, elementHeight);
      ctx.stroke();
      
      // Add some details (button, text line, etc)
      if (Math.random() > 0.5) {
        // Button
        ctx.beginPath();
        ctx.rect(x + gridSize / 2, y + elementHeight - gridSize / 2 - 5, elementWidth - gridSize, 10);
        ctx.stroke();
      } else {
        // Text lines
        for (let j = 0; j < 2; j++) {
          ctx.beginPath();
          ctx.moveTo(x + gridSize / 2, y + gridSize / 2 + j * 8);
          ctx.lineTo(x + elementWidth - gridSize / 2, y + gridSize / 2 + j * 8);
          ctx.stroke();
        }
      }
    }
    
    // Add some circular design elements
    for (let i = 0; i < 2; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 20 + 10;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Add crosshair guides
      ctx.beginPath();
      ctx.moveTo(x - radius - 5, y);
      ctx.lineTo(x + radius + 5, y);
      ctx.moveTo(x, y - radius - 5);
      ctx.lineTo(x, y + radius + 5);
      ctx.stroke();
    }
  }
  
  function add3DEffect(element) {
    // Add 3D tilt effect on hover
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation angle based on mouse position
      const rotateY = ((x - centerX) / centerX) * 8; // max 8 degrees
      const rotateX = ((y - centerY) / centerY) * -8; // max 8 degrees
      
      // Apply transform and highlight effect
      element.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
      element.style.boxShadow = `
        0 5px 15px rgba(0, 0, 0, 0.2),
        0 0 20px rgba(0, 229, 153, 0.3),
        inset 0 0 ${Math.abs(rotateY)}px rgba(255, 255, 255, 0.1)
      `;
      element.style.zIndex = '10';
      
      // Light effect following cursor
      const iconElement = element.querySelector('.crystal-icon');
      if (iconElement) {
        iconElement.style.boxShadow = `
          ${(x - centerX) / 10}px ${(y - centerY) / 10}px 15px rgba(0, 229, 153, 0.3)
        `;
      }
    });
    
    // Reset on mouse leave
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      element.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      element.style.zIndex = '1';
      
      const iconElement = element.querySelector('.crystal-icon');
      if (iconElement) {
        iconElement.style.boxShadow = 'none';
      }
    });
  }
  
  function addGlitchEffect(element) {
    // Create glitch elements
    const glitchFragments = [];
    for (let i = 0; i < 3; i++) {
      const fragment = document.createElement('div');
      fragment.className = 'glitch-fragment';
      fragment.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: inherit;
        border-radius: inherit;
        opacity: 0;
        pointer-events: none;
        z-index: -1;
        clip-path: inset(${Math.random() * 80}% ${Math.random() * 80}% ${Math.random() * 80}% ${Math.random() * 80}%);
      `;
      
      element.appendChild(fragment);
      glitchFragments.push(fragment);
    }
    
    // Add glitch animation on hover
    element.addEventListener('mouseenter', () => {
      // Trigger short glitch effect
      triggerGlitch(glitchFragments);
      
      // Schedule occasional glitches during hover
      const glitchInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          triggerGlitch(glitchFragments);
        }
      }, 1000);
      
      // Store interval ID for cleanup
      element._glitchInterval = glitchInterval;
    });
    
    // Clean up on mouse leave
    element.addEventListener('mouseleave', () => {
      if (element._glitchInterval) {
        clearInterval(element._glitchInterval);
      }
      
      // Reset all fragments
      glitchFragments.forEach(fragment => {
        fragment.style.opacity = '0';
        fragment.style.transform = 'translate(0, 0)';
      });
    });
  }
  
  function triggerGlitch(fragments) {
    fragments.forEach((fragment, i) => {
      // Generate random glitch offsets
      const offsetX = (Math.random() - 0.5) * 10;
      const offsetY = (Math.random() - 0.5) * 10;
      const color = i === 0 ? 'rgba(0, 229, 153, 0.8)' : 
                  i === 1 ? 'rgba(129, 98, 255, 0.8)' : 
                  'rgba(255, 97, 176, 0.8)';
      
      // Apply glitch effect
      fragment.style.opacity = '0.8';
      fragment.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      fragment.style.backgroundColor = color;
      
      // Reset after short duration
      setTimeout(() => {
        fragment.style.opacity = '0';
        fragment.style.transform = 'translate(0, 0)';
      }, 100 + Math.random() * 150);
    });
  }
  
  function addTechDetails(element, serviceType) {
    // Create service-specific tech details
    const details = document.createElement('div');
    details.className = 'tech-details';
    details.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      background: rgba(10, 10, 30, 0.85);
      border-radius: inherit;
      padding: 12px;
      opacity: 0;
      transform: translateX(100%);
      transition: opacity 0.3s ease, transform 0.4s ease;
      display: flex;
      flex-direction: column;
      justify-content: center;
      pointer-events: none;
      z-index: 5;
    `;
    
    // Add service-specific tech detail content
    switch(serviceType) {
      case 'business-apps':
        details.innerHTML = `
          <div class="tech-badge">Enterprise Ready</div>
          <div class="tech-badge">Cloud Native</div>
          <div class="tech-badge">Microservices</div>
          <div class="tech-badge">Real-time Analytics</div>
        `;
        break;
      case 'web-mobile-dev':
        details.innerHTML = `
          <div class="tech-badge">Progressive Web Apps</div>
          <div class="tech-badge">React/Vue/Angular</div>
          <div class="tech-badge">Native Mobile</div>
          <div class="tech-badge">Responsive Design</div>
        `;
        break;
      case 'tech-consulting':
        details.innerHTML = `
          <div class="tech-badge">System Architecture</div>
          <div class="tech-badge">DevOps Implementation</div>
          <div class="tech-badge">Tech Strategy</div>
          <div class="tech-badge">Legacy Modernization</div>
        `;
        break;
      case 'ui-ux-design':
        details.innerHTML = `
          <div class="tech-badge">Wireframing & Prototyping</div>
          <div class="tech-badge">Usability Testing</div>
          <div class="tech-badge">Design Systems</div>
          <div class="tech-badge">Interaction Design</div>
        `;
        break;
      default:
        details.innerHTML = `
          <div class="tech-badge">Custom Solutions</div>
          <div class="tech-badge">Modern Tech Stack</div>
        `;
    }
    
    // Add badge styling
    const style = document.createElement('style');
    style.textContent = `
      .tech-badge {
        background: linear-gradient(90deg, rgba(74, 87, 255, 0.3), rgba(0, 229, 153, 0.3));
        border-left: 3px solid #00e599;
        padding: 6px 12px;
        margin: 4px 0;
        font-size: 0.85rem;
        font-weight: 500;
        color: white;
        text-shadow: 0 0 10px rgba(0, 229, 153, 0.5);
        border-radius: 0 4px 4px 0;
        opacity: 0;
        transform: translateX(-10px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    
    // Add details to element
    element.appendChild(details);
    
    // Show details on click
    element.addEventListener('click', (e) => {
      const isActive = details.style.opacity === '1';
      
      // Toggle details visibility
      details.style.opacity = isActive ? '0' : '1';
      details.style.transform = isActive ? 'translateX(100%)' : 'translateX(0)';
      details.style.pointerEvents = isActive ? 'none' : 'auto';
      
      // Animate badges with delay
      if (!isActive) {
        const badges = details.querySelectorAll('.tech-badge');
        badges.forEach((badge, index) => {
          setTimeout(() => {
            badge.style.opacity = '1';
            badge.style.transform = 'translateX(0)';
          }, 100 + index * 100);
        });
      }
      
      // Prevent event bubbling
      e.stopPropagation();
    });
    
    // Add click indicator
    const clickIndicator = document.createElement('div');
    clickIndicator.className = 'click-indicator';
    clickIndicator.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 8 16 12 12 16"></polyline>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    `;
    clickIndicator.style.cssText = `
      position: absolute;
      right: 8px;
      bottom: 8px;
      color: white;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    
    element.appendChild(clickIndicator);
    
    // Show click indicator on hover
    element.addEventListener('mouseenter', () => {
      clickIndicator.style.opacity = '0.8';
    });
    
    element.addEventListener('mouseleave', () => {
      clickIndicator.style.opacity = '0';
    });
    
    // Close on click outside
    document.addEventListener('click', () => {
      details.style.opacity = '0';
      details.style.transform = 'translateX(100%)';
      details.style.pointerEvents = 'none';
    });
  }
});
