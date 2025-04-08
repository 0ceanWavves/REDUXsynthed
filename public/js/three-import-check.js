/**
 * Three.js Import Checker
 * 
 * A script to detect and report multiple Three.js imports in the browser.
 * Logs to console when detected.
 */

(function() {
  // Initialize tracking object if not already present
  if (!window._threeImportTracker) {
    window._threeImportTracker = {
      imports: [],
      instances: [],
      log: function(source, path) {
        const time = new Date().toISOString();
        const stack = new Error().stack || 'No stack trace available';
        
        // Record the import
        this.imports.push({ source, path, time, stack });
        
        // Log to console if this isn't the first one
        if (this.imports.length > 1) {
          console.warn(`⚠️ [THREE.js Import #${this.imports.length}] from ${source} loading ${path}`);
          
          // Detail log only for the verbose mode
          if (window._threeDebugVerbose) {
            console.log('Import stack trace:', stack);
          }
        } else {
          console.log(`✅ [THREE.js Import #1] from ${source} loading ${path}`);
        }
      },
      addInstance: function(instance, source) {
        if (!instance) return;
        
        const revision = instance.REVISION || 'unknown';
        const time = new Date().toISOString();
        
        // Check if this is a new instance or the same one
        const isDuplicate = this.instances.some(i => i.instance === instance);
        
        if (!isDuplicate) {
          this.instances.push({ instance, revision, source, time });
          
          if (this.instances.length > 1) {
            console.warn(`⚠️ [THREE.js Instance #${this.instances.length}] revision ${revision} from ${source}`);
            
            // Add to window as window.THREE_1, THREE_2, etc.
            window[`THREE_${this.instances.length}`] = instance;
          } else {
            console.log(`✅ [THREE.js Instance #1] revision ${revision} from ${source}`);
          }
        }
      }
    };
  }
  
  // Intercept dynamic imports of Three.js
  const originalDynamicImport = window.import || Function.prototype;
  window.import = function(...args) {
    const importPath = args[0];
    
    // Check if this is a Three.js import
    if (importPath && (
      importPath === 'three' || 
      importPath.includes('three@') || 
      importPath.includes('three.module')
    )) {
      // Get caller information
      let caller = 'unknown';
      try {
        const stackLines = new Error().stack.split('\n');
        caller = stackLines.length > 2 ? stackLines[2].trim() : 'unknown';
      } catch (e) {}
      
      // Log the import attempt
      if (window._threeImportTracker) {
        window._threeImportTracker.log(caller, importPath);
      }
    }
    
    // Call the original import function
    return originalDynamicImport.apply(this, args);
  };
  
  // Watch for THREE being defined on window
  let previousTHREE = window.THREE;
  Object.defineProperty(window, 'THREE', {
    get: function() {
      return previousTHREE;
    },
    set: function(newValue) {
      // Skip if it's the same instance
      if (newValue === previousTHREE) return;
      
      // Get caller information
      let caller = 'unknown';
      try {
        const stackLines = new Error().stack.split('\n');
        caller = stackLines.length > 2 ? stackLines[2].trim() : 'unknown';
      } catch (e) {}
      
      // Log if this is a new instance
      if (window._threeImportTracker) {
        window._threeImportTracker.addInstance(newValue, caller);
      }
      
      // Update the reference
      previousTHREE = newValue;
    },
    configurable: true
  });
  
  // Enable verbose logging from URL parameter
  window._threeDebugVerbose = new URLSearchParams(window.location.search).has('threedebug');
  
  console.log('🔍 Three.js import checker initialized. Add ?threedebug to URL for verbose logging.');
})();