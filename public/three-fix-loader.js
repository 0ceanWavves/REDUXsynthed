/**
 * Three.js Comprehensive Fix Loader
 * This script dynamically injects all necessary fixes for Three.js compatibility
 * It resolves issues with:
 * - Multiple Three.js instances
 * - Shader compatibility ("Cannot resolve #include <colorspace_fragment>")
 * - Browser compatibility (especially Firefox)
 * - WebGL context loss
 * - Property deprecations
 */
(function() {
  console.log("🔧 THREE.js Fix Loader: Initializing...");
  
  // Configuration - fix scripts in loading order
  const fixScripts = [
    { 
      src: "/js/three-early-loader.js",
      id: "three-early-loader",
      critical: true
    },
    { 
      src: "/js/three-version-fix.js",
      id: "three-version-fix",
      critical: true
    },
    { 
      src: "/js/three-shader-fix-improved.js",
      id: "three-shader-fix",
      critical: true
    },
    { 
      src: "/js/webgl-compatibility-fix.js",
      id: "webgl-compatibility-fix",
      critical: false
    },
    { 
      src: "/js/three-instance-manager.js",
      id: "three-instance-manager",
      critical: false
    }
  ];
  
  // Track loaded scripts
  const loadedScripts = {};
  
  // Load a script and return a promise
  function loadScript(scriptConfig) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.getElementById(scriptConfig.id)) {
        console.log(`🔧 THREE.js Fix Loader: Script ${scriptConfig.src} already loaded`);
        loadedScripts[scriptConfig.id] = true;
        resolve();
        return;
      }
      
      // Create script element
      const script = document.createElement('script');
      script.id = scriptConfig.id;
      script.src = scriptConfig.src;
      
      // Set up handlers
      script.onload = () => {
        console.log(`🔧 THREE.js Fix Loader: Loaded ${scriptConfig.src}`);
        loadedScripts[scriptConfig.id] = true;
        resolve();
      };
      
      script.onerror = (error) => {
        console.warn(`🔧 THREE.js Fix Loader: Failed to load ${scriptConfig.src}`, error);
        if (scriptConfig.critical) {
          reject(new Error(`Failed to load critical fix script: ${scriptConfig.src}`));
        } else {
          // Continue even if non-critical script fails
          resolve();
        }
      };
      
      // Add to document
      (document.head || document.documentElement).appendChild(script);
    });
  }
  
  // Load scripts in sequence
  async function loadFixScriptsSequentially() {
    console.log("🔧 THREE.js Fix Loader: Starting sequential script loading");
    
    try {
      // Load scripts one by one in order
      for (const scriptConfig of fixScripts) {
        await loadScript(scriptConfig);
      }
      
      console.log("🔧 THREE.js Fix Loader: All fix scripts loaded successfully");
      
      // Dispatch event when all scripts are loaded
      window.dispatchEvent(new CustomEvent('threejsFixesLoaded'));
      
      // Expose a global flag
      window.__threejsFixesLoaded = true;
    } catch (error) {
      console.error("🔧 THREE.js Fix Loader: Error loading fix scripts", error);
    }
  }
  
  // Add a helper method to wait for fixes to load
  window.waitForThreeJsFixes = function() {
    return new Promise((resolve) => {
      if (window.__threejsFixesLoaded) {
        resolve();
      } else {
        window.addEventListener('threejsFixesLoaded', () => resolve(), { once: true });
      }
    });
  };
  
  // Load scripts as soon as possible
  loadFixScriptsSequentially();
  
  console.log("🔧 THREE.js Fix Loader: Initialization complete");
})();
