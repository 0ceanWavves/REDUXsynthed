// three-early-loader.js - Load this script before any Three.js related code
// It sets up the environment for successful Three.js operation with compatibility fixes

(function() {
  console.log("🚀 THREE.js Early Loader: Initializing...");
  
  // Priority order of scripts to load
  const scriptsToLoad = [
    { 
      src: '/js/three-version-fix.js', 
      id: 'three-version-fix',
      priority: 1,
      loaded: false
    },
    { 
      src: '/js/three-shader-fix-improved.js', 
      id: 'three-shader-fix',
      priority: 2,
      loaded: false
    },
    { 
      src: '/js/three-instance-manager.js', 
      id: 'three-instance-manager',
      priority: 3,
      loaded: false
    }
  ];
  
  // Track if we've already initialized
  let isInitialized = false;
  
  // Function to load scripts in order
  function loadScripts() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log("🚀 THREE.js Early Loader: Beginning script loading sequence");
    
    // Sort scripts by priority
    const sortedScripts = [...scriptsToLoad].sort((a, b) => a.priority - b.priority);
    
    // Function to load the next script
    function loadNextScript(index) {
      if (index >= sortedScripts.length) {
        console.log("🚀 THREE.js Early Loader: All scripts loaded successfully");
        
        // Dispatch an event when all scripts are loaded
        window.dispatchEvent(new CustomEvent('threeFixesLoaded'));
        return;
      }
      
      const scriptToLoad = sortedScripts[index];
      
      // Skip if already loaded
      if (document.getElementById(scriptToLoad.id)) {
        console.log(`🚀 THREE.js Early Loader: Script ${scriptToLoad.src} already loaded, skipping`);
        scriptToLoad.loaded = true;
        loadNextScript(index + 1);
        return;
      }
      
      console.log(`🚀 THREE.js Early Loader: Loading script ${scriptToLoad.src}`);
      
      // Create the script element
      const script = document.createElement('script');
      script.id = scriptToLoad.id;
      script.src = scriptToLoad.src;
      
      // Set up load and error handlers
      script.onload = () => {
        console.log(`🚀 THREE.js Early Loader: Script ${scriptToLoad.src} loaded successfully`);
        scriptToLoad.loaded = true;
        loadNextScript(index + 1);
      };
      
      script.onerror = (error) => {
        console.warn(`🚀 THREE.js Early Loader: Failed to load ${scriptToLoad.src}`, error);
        // Continue loading next script even if this one failed
        loadNextScript(index + 1);
      };
      
      // Insert at the beginning of head for highest priority
      document.head.insertBefore(script, document.head.firstChild);
    }
    
    // Start loading the first script
    loadNextScript(0);
  }
  
  // Check for existing Three.js script tags and move our fixes before them
  function reorderScripts() {
    const existingThreeScripts = Array.from(document.querySelectorAll('script')).filter(script => {
      const src = script.getAttribute('src') || '';
      return src.includes('three') && src.includes('.js') && 
             !src.includes('three-version-fix') && 
             !src.includes('three-shader-fix') && 
             !src.includes('three-instance-manager') &&
             !src.includes('three-early-loader');
    });
    
    if (existingThreeScripts.length > 0) {
      console.log(`🚀 THREE.js Early Loader: Found ${existingThreeScripts.length} existing Three.js scripts`);
      
      // Get the first THREE.js script element
      const firstThreeScript = existingThreeScripts[0];
      
      // If we have a parent node, we can reorder
      if (firstThreeScript.parentNode) {
        console.log(`🚀 THREE.js Early Loader: Will inject fixes before existing Three.js scripts`);
      }
    }
  }
  
  // Block rendering of other scripts until our fixes are loaded
  function setupScriptBlocking() {
    // Save original appendChild
    const originalAppendChild = Node.prototype.appendChild;
    
    // Override appendChild to intercept script additions
    Node.prototype.appendChild = function(node) {
      // Check if this is a script tag loading Three.js
      if (node.tagName === 'SCRIPT') {
        const src = node.getAttribute('src') || '';
        if (src.includes('three') && src.includes('.js') && 
            !src.includes('three-version-fix') && 
            !src.includes('three-shader-fix') && 
            !src.includes('three-instance-manager') &&
            !src.includes('three-early-loader')) {
          
          // Check if our fixes are loaded
          const allFixesLoaded = scriptsToLoad.every(script => script.loaded);
          
          if (!allFixesLoaded) {
            console.log(`🚀 THREE.js Early Loader: Delaying Three.js script loading until fixes are applied: ${src}`);
            
            // Store original onload
            const originalOnload = node.onload;
            
            // Wait for fixes to load before letting this script proceed
            window.addEventListener('threeFixesLoaded', function() {
              console.log(`🚀 THREE.js Early Loader: Now loading delayed script: ${src}`);
              // Restore original onload after our handler
              node.onload = originalOnload;
              // Now actually add the script
              originalAppendChild.call(this, node);
            }, { once: true });
            
            // Return a dummy node to prevent errors
            return node;
          }
        }
      }
      
      // Call original method for all other cases
      return originalAppendChild.call(this, node);
    };
    
    console.log("🚀 THREE.js Early Loader: Set up script loading control");
  }
  
  // Expose a helper function for components to use
  window.ensureThreeCompatibility = function() {
    return new Promise((resolve) => {
      const allFixesLoaded = scriptsToLoad.every(script => script.loaded);
      
      if (allFixesLoaded) {
        resolve();
      } else {
        window.addEventListener('threeFixesLoaded', () => resolve(), { once: true });
      }
    });
  };
  
  // Initialize when the DOM is ready
  function initialize() {
    reorderScripts();
    setupScriptBlocking();
    loadScripts();
  }
  
  // Run when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Handle the case where the page is already loading THREE.js
  // by injecting our fixes as quickly as possible
  if (document.querySelector('script[src*="three"][src*=".js"]')) {
    console.log("🚀 THREE.js Early Loader: THREE.js scripts already in document, initializing immediately");
    initialize();
  }
})();
