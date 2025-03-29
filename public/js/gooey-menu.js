// gooey-menu.js - Handles the gooey menu animation and interaction
document.addEventListener('DOMContentLoaded', function() {
    // Gooey menu is currently disabled
    const GOOEY_MENU_ENABLED = false; // Set to false to disable the menu
    
    // Wait for DOM to be ready
    const initGooeyMenu = () => {
        // Exit early if menu is disabled
        if (!GOOEY_MENU_ENABLED) {
            console.log('Gooey menu is currently disabled');
            return;
        }
        
        console.log('Initializing gooey menu');
        
        const menuContainer = document.querySelector('.gooey-menu-container');
        if (!menuContainer) {
            console.warn('No gooey menu container found');
            return;
        }
        
        const menuToggle = document.querySelector('.gooey-menu-toggle');
        const menuItems = document.querySelectorAll('.gooey-menu-item');
        
        // Auto-expand the menu after 5 seconds
        setTimeout(function() {
            console.log('Auto-expanding gooey menu');
            menuContainer.classList.add('menu-open');
            menuToggle.classList.add('clicked');
            
            // Remove the animation class after it completes
            setTimeout(function() {
                menuToggle.classList.remove('clicked');
            }, 500);
        }, 5000);
        
        // Make the menu toggle clickable
        menuToggle.addEventListener('click', function() {
            console.log('Menu toggle clicked');
            menuContainer.classList.toggle('menu-open');
            this.classList.add('clicked');
            
            // Remove the animation class after it completes
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 500);
        });
        
        // Make each menu item clickable too
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                // Add a pulse effect
                this.classList.add('clicked');
                
                // Remove the animation class after it completes
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 300);
                
                // You could add additional actions here, like navigation
                console.log('Menu item clicked:', this.querySelector('span').innerText);
            });
        });
        
        // Add subtle floating animation to enhance the arc layout
        const addFloatingAnimation = () => {
            if (!document.getElementById('floating-animations')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'floating-animations';
                
                // Create subtle floating animations
                styleEl.textContent = `
                    @keyframes itemFloat {
                        0% { transform: translate3d(0, 0, 0); }
                        100% { transform: translate3d(0, -5px, 0); }
                    }
                    
                    .menu-open .gooey-menu-item {
                        animation: itemFloat 3s infinite alternate ease-in-out;
                    }
                    
                    .menu-open .gooey-menu-item:nth-child(2) {
                        animation-delay: 0.5s;
                    }
                    
                    .menu-open .gooey-menu-item:nth-child(3) {
                        animation-delay: 1s;
                    }
                    
                    .menu-open .gooey-menu-item:nth-child(4) {
                        animation-delay: 1.5s;
                    }
                    
                    .menu-open .gooey-menu-item:nth-child(5) {
                        animation-delay: 2s;
                    }
                    
                    .menu-open .gooey-menu-item:nth-child(6) {
                        animation-delay: 2.5s;
                    }
                    
                    .gooey-menu-item.clicked {
                        animation: itemPulse 0.3s !important;
                    }
                    
                    @keyframes itemPulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                    }
                `;
                
                document.head.appendChild(styleEl);
            }
        };
        
        // Add the floating animations
        addFloatingAnimation();
        
        // Add subtle glow pulse to bubbles
        const addGlowPulse = () => {
            if (!document.getElementById('glow-pulse')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'glow-pulse';
                
                styleEl.textContent = `
                    @keyframes glowPulse {
                        0% { box-shadow: 0 0 15px rgba(66, 238, 255, 0.7); }
                        50% { box-shadow: 0 0 25px rgba(66, 238, 255, 0.9); }
                        100% { box-shadow: 0 0 15px rgba(66, 238, 255, 0.7); }
                    }
                    
                    .menu-open .gooey-menu-item {
                        animation: glowPulse 3s infinite alternate ease-in-out;
                    }
                    
                    .gooey-menu-toggle {
                        animation: glowPulse 4s infinite alternate ease-in-out;
                    }
                `;
                
                document.head.appendChild(styleEl);
            }
        };
        
        // Add glow pulse
        addGlowPulse();
    };
    
    // Initialize the menu (will exit early if disabled)
    initGooeyMenu();
    
    // Re-initialize if page content changes
    const documentObserver = new MutationObserver(function(mutations) {
        // Only proceed if menu is enabled
        if (!GOOEY_MENU_ENABLED) return;
        
        for (let mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if our target element has been added
                if (document.querySelector('.gooey-menu-container')) {
                    initGooeyMenu();
                    break;
                }
            }
        }
    });
    
    // Start observing the document body for changes only if menu is enabled
    if (GOOEY_MENU_ENABLED) {
        documentObserver.observe(document.body, { childList: true, subtree: true });
    }
});
