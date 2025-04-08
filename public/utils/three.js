/**
 * Centralized Three.js Module
 * 
 * This is the SINGLE source of truth for Three.js imports across the application.
 * All components should import Three.js from this module to prevent duplicate instances.
 */

// Create a placeholder until the real module is loaded
let _THREE = null;
let _isInitializing = false;
let _initPromise = null;
let _initCallbacks = [];

// Initialize Three.js on the client side
async function initThreeJS() {
  // Prevent multiple simultaneous initializations
  if (_isInitializing) {
    return _initPromise;
  }
  
  // If already initialized, return the cached instance
  if (_THREE) {
    return _THREE;
  }
  
  console.log("🔄 Initializing centralized Three.js module");
  _isInitializing = true;
  
  // Create a promise to track initialization
  _initPromise = new Promise(async (resolve, reject) => {
    try {
      // Check if THREE is already defined globally (from another script)
      if (typeof window !== 'undefined' && window.THREE && !window.THREE.__isPlaceholder) {
        console.log("🔄 Using existing global THREE instance");
        _THREE = window.THREE;
        
        // Apply any necessary fixes
        applyThreeJSFixes(_THREE);
        
        // Resolve with the existing instance
        setTimeout(() => {
          _isInitializing = false;
          resolve(_THREE);
          notifyInitCallbacks(_THREE);
        }, 0);
        return;
      }
      
      // Import Three.js - try from the importmap first
      let importedTHREE;
      try {
        importedTHREE = await import('three');
        console.log("🔄 Loaded Three.js from importmap");
      } catch (e) {
        // Try from CDN if importmap fails
        console.warn("🔄 Failed to load from importmap, trying CDN:", e);
        const module = await import('https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js');
        importedTHREE = module.default || module;
        console.log("🔄 Loaded Three.js from CDN");
      }
      
      // Store the imported module
      _THREE = importedTHREE;
      
      // Make it globally available
      if (typeof window !== 'undefined') {
        window.THREE = _THREE;
        
        // Remove placeholder flag if it exists
        if (window.THREE.__isPlaceholder) {
          delete window.THREE.__isPlaceholder;
        }
        
        // Dispatch event for compatibility with existing code
        window.dispatchEvent(new CustomEvent('threeReady', { 
          detail: { THREE: _THREE } 
        }));
      }
      
      // Apply any necessary fixes
      applyThreeJSFixes(_THREE);
      
      // Debug logging
      console.log(`🔄 Three.js version ${_THREE.REVISION} initialized from centralized module`);
      
      // Initialization complete
      _isInitializing = false;
      resolve(_THREE);
      notifyInitCallbacks(_THREE);
      
    } catch (error) {
      console.error("🔄 Failed to initialize Three.js:", error);
      _isInitializing = false;
      reject(error);
      
      // Attempt to notify callbacks about the error
      _initCallbacks.forEach(callback => {
        try {
          callback(null, error);
        } catch (e) {
          console.error("Error in init callback:", e);
        }
      });
      _initCallbacks = [];
    }
  });
  
  return _initPromise;
}

// Apply necessary fixes to Three.js
function applyThreeJSFixes(THREE) {
  if (!THREE || !THREE.ShaderChunk) return;
  
  // Add colorspace_fragment chunk if missing
  if (!THREE.ShaderChunk.colorspace_fragment) {
    THREE.ShaderChunk.colorspace_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
    console.log("🔄 Applied fix: Added missing colorspace_fragment shader chunk");
  }
  
  // Add colorspace_pars_fragment chunk if missing
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
    console.log("🔄 Applied fix: Added missing colorspace_pars_fragment shader chunk");
  }
  
  // Add encodings_pars_fragment if missing (for older Three.js versions)
  if (!THREE.ShaderChunk.encodings_pars_fragment) {
    THREE.ShaderChunk.encodings_pars_fragment = THREE.ShaderChunk.colorspace_pars_fragment;
    console.log("🔄 Applied fix: Added encodings_pars_fragment compatibility");
  }
}

// Register a callback to be notified when Three.js is initialized
function onInitialized(callback) {
  if (_THREE) {
    // Already initialized, call immediately
    setTimeout(() => callback(_THREE), 0);
  } else {
    // Add to callback queue
    _initCallbacks.push(callback);
    
    // Initialize if not already in progress
    if (!_isInitializing) {
      initThreeJS().catch(err => {
        console.error("Error initializing Three.js:", err);
      });
    }
  }
}

// Notify all registered callbacks
function notifyInitCallbacks(three) {
  _initCallbacks.forEach(callback => {
    try {
      callback(three);
    } catch (e) {
      console.error("Error in init callback:", e);
    }
  });
  _initCallbacks = [];
}

// Utility function to create a circular particle texture
function createCircleTexture(size = 128) {
  if (!_THREE || typeof document === 'undefined') return null;
  
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new _THREE.Texture();
  
  ctx.clearRect(0, 0, size, size);
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  const texture = new _THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = _THREE.LinearFilter;
  texture.magFilter = _THREE.LinearFilter;
  texture.format = _THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
}

// Add helper for barycentric coordinates (used for wireframe effects)
function addBarycentricCoordinates(geometry) {
  if (!_THREE || !geometry) return;
  
  const count = geometry.attributes.position.count;
  const barycentric = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const indexInTriangle = i % 3; // 0, 1, or 2
    
    // Set barycentric coordinates
    if (indexInTriangle === 0) {
      barycentric[i3 + 0] = 1.0;
      barycentric[i3 + 1] = 0.0;
      barycentric[i3 + 2] = 0.0;
    } else if (indexInTriangle === 1) {
      barycentric[i3 + 0] = 0.0;
      barycentric[i3 + 1] = 1.0;
      barycentric[i3 + 2] = 0.0;
    } else {
      barycentric[i3 + 0] = 0.0;
      barycentric[i3 + 1] = 0.0;
      barycentric[i3 + 2] = 1.0;
    }
  }
  
  geometry.setAttribute('a_barycentric', new _THREE.BufferAttribute(barycentric, 3));
}

// Debug utility to detect multiple Three.js instances
function detectMultipleInstances() {
  if (typeof window === 'undefined') return;
  
  // Store original import
  const originalImport = window.import || Function.prototype;
  
  // Track import attempts
  window.__threeImportTracker = {
    imports: [],
    log: function(source, url) {
      this.imports.push({
        source: source,
        url: url,
        time: new Date().toISOString(),
        stack: new Error().stack
      });
      
      // Log if this is a duplicate import
      if (this.imports.length > 1 && url.includes('three')) {
        console.warn(`WARNING: Multiple Three.js imports detected. Latest from: ${source}`);
        console.log('Import history:', this.imports);
      }
    }
  };
  
  // Override import to track Three.js imports
  window.import = function(...args) {
    const importPath = args[0];
    
    // Check if this is a Three.js import
    if (importPath && (
      importPath === 'three' || 
      importPath.includes('three@') || 
      importPath.includes('three.module')
    )) {
      // Record import attempt
      if (window.__threeImportTracker) {
        try {
          const stackLines = new Error().stack.split('\n');
          const callerLine = stackLines.length > 2 ? stackLines[2] : 'unknown';
          window.__threeImportTracker.log(callerLine.trim(), importPath);
        } catch (e) {
          // If we can't get a stack trace, just record the path
          window.__threeImportTracker.log('unknown', importPath);
        }
      }
      
      // Warn about duplicate imports
      if (_THREE) {
        console.warn(`WARNING: Three.js already loaded. Use the centralized module instead of importing from "${importPath}".`);
      }
    }
    
    // Call the original import function
    return originalImport.apply(this, args);
  };
  
  console.log("🔄 Three.js import tracker initialized");
}

// Initialize if in browser environment
if (typeof window !== 'undefined') {
  detectMultipleInstances();
  initThreeJS().catch(err => {
    console.error("Error during automatic Three.js initialization:", err);
  });
}

// Export the module
export default {
  get THREE() {
    return _THREE;
  },
  init: initThreeJS,
  onInitialized,
  createCircleTexture,
  addBarycentricCoordinates
};