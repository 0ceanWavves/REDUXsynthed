/**
 * Three.js Version Guard
 * 
 * A script that prevents multiple instances of Three.js from being imported
 * by monitoring and controlling the loading process.
 */

(function() {
  // Configuration
  const TARGET_VERSION = "0.154.0"; // Target version of Three.js
  const DEBUG = true; // Enable debugging messages

  // State tracking
  let primaryInstance = null;
  let instanceVersion = null;
  let isVersionGuardActive = false;
  let pendingImports = [];
  
  // Console logging wrapper
  const log = {
    info: message => DEBUG && console.log(`🔒 THREE Guard: ${message}`),
    warn: message => console.warn(`⚠️ THREE Guard: ${message}`),
    error: message => console.error(`❌ THREE Guard: ${message}`)
  };
  
  // Initialize the version guard
  function initVersionGuard() {
    if (isVersionGuardActive) return;
    log.info("Initializing Three.js version guard");
    
    // 1. Check if THREE is already defined
    if (typeof window.THREE !== 'undefined') {
      primaryInstance = window.THREE;
      instanceVersion = window.THREE.REVISION;
      log.info(`Found existing THREE instance (v${instanceVersion})`);
    }
    
    // 2. Override dynamic imports of Three.js modules
    overrideImports();
    
    // 3. Monitor window.THREE property
    monitorThreeProperty();
    
    // 4. Add importmap for Three.js if not already present
    ensureImportMap();
    
    isVersionGuardActive = true;
    log.info("Version guard initialized");
  }
  
  // Override the import function to intercept Three.js imports
  function overrideImports() {
    const originalImport = window.import;
    
    if (typeof originalImport !== 'function') {
      log.warn("Dynamic import not available, some protections will be limited");
      return;
    }
    
    window.import = function(...args) {
      const importPath = args[0];
      
      // Check if this is a Three.js import
      if (importPath && (
        importPath === 'three' || 
        importPath.includes('three@') || 
        importPath.includes('three.module')
      )) {
        // If we already have a primary instance, intercept the import
        if (primaryInstance) {
          log.warn(`Intercepted import of Three.js from: ${importPath}`);
          log.info(`Returning existing instance (v${instanceVersion}) instead`);
          
          // Return a promise that resolves to the primary instance
          return Promise.resolve(primaryInstance);
        }
        
        // Otherwise, track this import for future reference
        log.info(`Tracking initial Three.js import from: ${importPath}`);
        pendingImports.push(importPath);
      }
      
      // Call the original import function
      return originalImport.apply(this, args);
    };
  }
  
  // Monitor the window.THREE property for changes
  function monitorThreeProperty() {
    let currentThree = window.THREE;
    
    // Define a property that intercepts sets to window.THREE
    Object.defineProperty(window, 'THREE', {
      get: function() {
        return currentThree;
      },
      set: function(newValue) {
        // If this is the first time setting THREE
        if (!primaryInstance && newValue) {
          log.info(`Setting primary THREE instance (v${newValue.REVISION || 'unknown'})`);
          primaryInstance = newValue;
          instanceVersion = newValue.REVISION;
          currentThree = newValue;
          
          // Apply fixes to the primary instance
          applyThreeJSFixes(primaryInstance);
          
          // Fire an event that the primary THREE instance is ready
          window.dispatchEvent(new CustomEvent('threeReady', { 
            detail: { THREE: primaryInstance }
          }));
          
          return true;
        }
        
        // If trying to set a different instance
        if (primaryInstance && newValue && newValue !== primaryInstance) {
          log.warn(`Blocking attempt to replace THREE instance v${instanceVersion} with v${newValue.REVISION || 'unknown'}`);
          
          // Merge any new properties/methods from the new instance
          mergeThreeInstances(primaryInstance, newValue);
          
          return true;
        }
        
        // Allow setting to null or same instance
        currentThree = newValue;
        return true;
      },
      configurable: true // Allow reconfiguring this property
    });
  }
  
  // Merge properties from secondaryInstance into primaryInstance
  function mergeThreeInstances(primaryInstance, secondaryInstance) {
    if (!primaryInstance || !secondaryInstance) return;
    
    try {
      // Get all properties from the secondary instance
      const props = Object.getOwnPropertyNames(secondaryInstance);
      
      // Copy any missing properties to the primary instance
      for (const prop of props) {
        if (primaryInstance[prop] === undefined) {
          log.info(`Copying property "${prop}" from secondary instance to primary`);
          primaryInstance[prop] = secondaryInstance[prop];
        }
      }
      
      log.info("Merged compatible properties from secondary Three.js instance");
    } catch (err) {
      log.error(`Error merging THREE instances: ${err.message}`);
    }
  }
  
  // Apply fixes to Three.js instance
  function applyThreeJSFixes(THREE) {
    if (!THREE || !THREE.ShaderChunk) return;
    
    // Add missing shader chunks if needed
    if (!THREE.ShaderChunk.colorspace_fragment) {
      THREE.ShaderChunk.colorspace_fragment = `
  #if defined( TONE_MAPPING )
    gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
  #endif
  #ifdef LINEAR_TO_SRGB
    gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
  #endif
  `;
      log.info("Applied fix: Added missing colorspace_fragment shader chunk");
    }
    
    // Add missing colorspace_pars_fragment
    if (!THREE.ShaderChunk.colorspace_pars_fragment) {
      THREE.ShaderChunk.colorspace_pars_fragment = `
  #ifdef LINEAR_TO_SRGB
    vec3 linearToSRGB(vec3 value) {
      return mix(
        pow(value, vec3(0.41666)) * 1.055 - vec3(0.055),
        value * 12.92,
        vec3(lessThanEqual(value, vec3(0.0031308)))
      );
    }
  #endif
  #ifdef SRGB_TO_LINEAR
    vec3 sRGBToLinear(vec3 value) {
      return mix(
        pow((value + vec3(0.055)) / vec3(1.055), vec3(2.4)),
        value / vec3(12.92),
        vec3(lessThanEqual(value, vec3(0.04045)))
      );
    }
  #endif
  `;
      log.info("Applied fix: Added missing colorspace_pars_fragment shader chunk");
    }
    
    // Backward compatibility for older versions
    if (!THREE.ShaderChunk.encodings_pars_fragment && THREE.ShaderChunk.colorspace_pars_fragment) {
      THREE.ShaderChunk.encodings_pars_fragment = THREE.ShaderChunk.colorspace_pars_fragment;
      log.info("Applied fix: Added compatibility mapping for encodings_pars_fragment");
    }
  }
  
  // Ensure there's an importmap for Three.js
  function ensureImportMap() {
    // Check if an importmap already exists
    let importMapScript = document.querySelector('script[type="importmap"]');
    
    // If no importmap exists, create one
    if (!importMapScript) {
      log.info("No importmap found, creating one for Three.js");
      importMapScript = document.createElement('script');
      importMapScript.type = 'importmap';
      importMapScript.textContent = JSON.stringify({
        imports: {
          "three": `https://cdn.jsdelivr.net/npm/three@${TARGET_VERSION}/build/three.module.js`
        }
      });
      document.head.appendChild(importMapScript);
    } else {
      // Check if the importmap includes Three.js
      try {
        const importMap = JSON.parse(importMapScript.textContent);
        if (!importMap.imports || !importMap.imports.three) {
          log.info("Adding Three.js to existing importmap");
          importMap.imports = importMap.imports || {};
          importMap.imports.three = `https://cdn.jsdelivr.net/npm/three@${TARGET_VERSION}/build/three.module.js`;
          importMapScript.textContent = JSON.stringify(importMap);
        }
      } catch (e) {
        log.error(`Error parsing existing importmap: ${e.message}`);
      }
    }
  }
  
  // Expose a helper for modules to safely get the Three.js instance
  window.getThreeJS = function() {
    return primaryInstance;
  };
  
  // Initialize the version guard
  initVersionGuard();
  
  // Log status when the page has loaded
  window.addEventListener('load', () => {
    if (primaryInstance) {
      log.info(`Page loaded with Three.js v${instanceVersion} as primary instance`);
    } else {
      log.warn("Page loaded but no Three.js instance was detected");
    }
  });
})();