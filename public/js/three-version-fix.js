// three-version-fix.js - Ensures consistent Three.js version across components
// Prevents "Multiple instances of Three.js being imported" warning

(function() {
  console.log("🔄 THREE.js Version Fix: Initializing...");
  
  // Define our target version
  const TARGET_VERSION = "0.154.0"; // Keep at 0.154.0 to match existing code
  
  // Track script tags that are loading or have loaded Three.js
  const threeScripts = [];
  let primaryScriptUrl = null;
  let primaryScriptElement = null;
  
  // Store our preferred CDN URLs
  const PREFERRED_CDN = `https://cdn.jsdelivr.net/npm/three@${TARGET_VERSION}/build/three.module.js`;
  const FALLBACK_CDN = `https://unpkg.com/three@${TARGET_VERSION}/build/three.module.js`;
  
  // Track if we've already loaded Three.js
  let isThreeLoaded = typeof THREE !== 'undefined';
  
  // Function to scan for and manage Three.js script tags
  function scanForThreeScripts() {
    // Get all script tags
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach(script => {
      const src = script.getAttribute('src') || '';
      
      // Check if this is a Three.js script
      if (src.includes('three') && src.includes('.js') && !src.includes('three-version-fix')) {
        threeScripts.push({
          element: script,
          src: src,
          version: extractVersion(src)
        });
      }
    });
    
    // Also check module preloads
    const preloads = document.querySelectorAll('link[rel="modulepreload"]');
    preloads.forEach(link => {
      const href = link.getAttribute('href') || '';
      
      // Check if this is a Three.js preload
      if (href.includes('three') && href.includes('.js')) {
        threeScripts.push({
          element: link,
          src: href,
          version: extractVersion(href),
          isPreload: true
        });
      }
    });
    
    // Log what we found
    if (threeScripts.length > 0) {
      console.log(`🔄 THREE.js Version Fix: Found ${threeScripts.length} Three.js script/preload references`);
      threeScripts.forEach(s => {
        console.log(`  - ${s.isPreload ? 'Preload' : 'Script'}: ${s.src} (v${s.version || 'unknown'})`);
      });
      
      // Handle multiple versions
      handleMultipleVersions();
    } else {
      console.log("🔄 THREE.js Version Fix: No Three.js scripts found, will inject our target version");
      injectThreeScript();
    }
  }
  
  // Extract version from URL
  function extractVersion(url) {
    const versionMatch = url.match(/@([0-9.]+)/);
    return versionMatch ? versionMatch[1] : null;
  }
  
  // Handle case where multiple versions were found
  function handleMultipleVersions() {
    // Check if we already have our target version loaded
    const targetVersionScripts = threeScripts.filter(s => s.version === TARGET_VERSION);
    
    if (targetVersionScripts.length > 0) {
      console.log(`🔄 THREE.js Version Fix: Found ${targetVersionScripts.length} scripts with target version ${TARGET_VERSION}`);
      
      // Use the first one as primary
      primaryScriptUrl = targetVersionScripts[0].src;
      primaryScriptElement = targetVersionScripts[0].element;
      
      // If THREE is already defined, we're good to go
      if (isThreeLoaded) {
        console.log(`🔄 THREE.js Version Fix: THREE is already defined, using existing instance`);
        return;
      }
      
      // Otherwise monitor for THREE to be defined
      monitorThreeLoad();
    } else {
      console.log(`🔄 THREE.js Version Fix: No scripts with target version ${TARGET_VERSION} found`);
      
      // Remove all non-target versions if THREE isn't loaded yet
      if (!isThreeLoaded) {
        threeScripts.forEach(s => {
          if (s.element.parentNode && !s.isPreload) {
            console.log(`🔄 THREE.js Version Fix: Removing non-target version script: ${s.src}`);
            s.element.parentNode.removeChild(s.element);
          }
        });
        
        // Inject our target version
        injectThreeScript();
      } else {
        console.log(`🔄 THREE.js Version Fix: THREE already defined but version mismatch. Using existing instance.`);
      }
    }
  }
  
  // Inject our preferred Three.js script
  function injectThreeScript() {
    // Don't inject if THREE is already defined
    if (isThreeLoaded) {
      console.log(`🔄 THREE.js Version Fix: THREE is already defined, skipping injection`);
      return;
    }
    
    console.log(`🔄 THREE.js Version Fix: Injecting Three.js v${TARGET_VERSION} from preferred CDN`);
    
    // Create script element
    const script = document.createElement('script');
    script.type = 'module';
    script.src = PREFERRED_CDN;
    script.onerror = () => {
      console.warn(`🔄 THREE.js Version Fix: Failed to load from preferred CDN, trying fallback`);
      script.src = FALLBACK_CDN;
    };
    script.onload = () => {
      console.log(`🔄 THREE.js Version Fix: Successfully loaded Three.js v${TARGET_VERSION}`);
      isThreeLoaded = true;
      primaryScriptUrl = script.src;
      primaryScriptElement = script;
      
      // Dispatch event for other scripts
      window.dispatchEvent(new CustomEvent('threeReady', { 
        detail: { 
          THREE: window.THREE, 
          version: TARGET_VERSION 
        } 
      }));
    };
    
    // Inject at beginning of body for quick loading
    document.body.insertBefore(script, document.body.firstChild);
    primaryScriptUrl = script.src;
    primaryScriptElement = script;
  }
  
  // Monitor for THREE to be defined if using existing script
  function monitorThreeLoad() {
    const checkThreeInterval = setInterval(() => {
      if (typeof THREE !== 'undefined') {
        clearInterval(checkThreeInterval);
        isThreeLoaded = true;
        console.log(`🔄 THREE.js Version Fix: THREE is now defined, version ${THREE.REVISION}`);
        
        // Dispatch event for other scripts
        window.dispatchEvent(new CustomEvent('threeReady', { 
          detail: { 
            THREE: window.THREE, 
            version: THREE.REVISION 
          } 
        }));
      }
    }, 100);
    
    // Stop checking after 10 seconds
    setTimeout(() => {
      if (!isThreeLoaded) {
        clearInterval(checkThreeInterval);
        console.warn(`🔄 THREE.js Version Fix: THREE not defined after 10 seconds, forcing injection`);
        injectThreeScript();
      }
    }, 10000);
  }
  
  // Block attempts to manually redefine THREE
  function blockThreeRedefinition() {
    // Store original value if it exists
    const originalThree = window.THREE;
    
    Object.defineProperty(window, 'THREE', {
      get: function() {
        return originalThree;
      },
      set: function(newValue) {
        // If THREE is not yet defined, allow it to be set
        if (!originalThree) {
          console.log(`🔄 THREE.js Version Fix: THREE being defined for the first time`);
          originalThree = newValue;
          isThreeLoaded = true;
          
          // Dispatch event for other scripts
          window.dispatchEvent(new CustomEvent('threeReady', { 
            detail: { 
              THREE: originalThree, 
              version: originalThree.REVISION 
            } 
          }));
          
          return true;
        }
        
        console.warn(`🔄 THREE.js Version Fix: Blocked attempt to redefine THREE global!`);
        console.log(`Existing version: ${originalThree.REVISION}, attempted new version: ${newValue.REVISION}`);
        
        // Merge any missing properties from new value into existing THREE
        if (newValue && typeof newValue === 'object') {
          for (const key in newValue) {
            if (newValue.hasOwnProperty(key) && originalThree[key] === undefined) {
              console.log(`🔄 THREE.js Version Fix: Adding missing property "${key}" to THREE global`);
              originalThree[key] = newValue[key];
            }
          }
        }
        
        return true;
      },
      configurable: false
    });
    
    console.log(`🔄 THREE.js Version Fix: Protected THREE global from redefinition`);
  }
  
  // Monitor for dynamic loading of scripts
  function monitorScriptAdditions() {
    const observer = new MutationObserver(mutations => {
      let newThreeScriptsFound = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            // Check for added script tags
            if (node.tagName === 'SCRIPT') {
              const src = node.getAttribute('src') || '';
              
              if (src.includes('three') && src.includes('.js') && !src.includes('three-version-fix')) {
                console.log(`🔄 THREE.js Version Fix: Detected dynamic Three.js script: ${src}`);
                newThreeScriptsFound = true;
                
                // If we already have THREE defined, prevent this script from loading
                if (isThreeLoaded && src !== primaryScriptUrl) {
                  if (node.parentNode) {
                    console.log(`🔄 THREE.js Version Fix: Removing redundant script: ${src}`);
                    node.parentNode.removeChild(node);
                  }
                }
              }
            }
            
            // Check for added link (preload) tags
            if (node.tagName === 'LINK' && node.getAttribute('rel') === 'modulepreload') {
              const href = node.getAttribute('href') || '';
              
              if (href.includes('three') && href.includes('.js')) {
                console.log(`🔄 THREE.js Version Fix: Detected dynamic Three.js preload: ${href}`);
                newThreeScriptsFound = true;
              }
            }
          });
        }
      });
      
      // If new Three.js scripts were found, rescan
      if (newThreeScriptsFound) {
        threeScripts.length = 0; // Clear existing data
        scanForThreeScripts();
      }
    });
    
    // Start observing the document for script additions
    observer.observe(document, { childList: true, subtree: true });
    console.log("🔄 THREE.js Version Fix: Monitoring for dynamic script additions");
  }
  
  // Expose a global helper to safely load THREE-dependent code
  window.waitForThree = function(callback) {
    if (typeof THREE !== 'undefined') {
      callback(THREE);
    } else {
      window.addEventListener('threeReady', (e) => callback(e.detail.THREE), { once: true });
    }
  };
  
  // Initialize
  function initialize() {
    console.log(`🔄 THREE.js Version Fix: Starting initialization`);
    
    // Check if THREE is already defined
    if (typeof THREE !== 'undefined') {
      console.log(`🔄 THREE.js Version Fix: THREE is already defined (v${THREE.REVISION})`);
      isThreeLoaded = true;
    }
    
    // Block future attempts to redefine THREE
    blockThreeRedefinition();
    
    // Scan for existing Three.js scripts
    scanForThreeScripts();
    
    // Monitor for future script additions
    monitorScriptAdditions();
    
    console.log(`🔄 THREE.js Version Fix: Initialization complete`);
  }
  
  // Run when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
