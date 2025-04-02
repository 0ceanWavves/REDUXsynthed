// three-shader-fix.js - Advanced compatibility patch for Three.js
// Handles shader issues, version mismatches, and WebGL compatibility

(function() {
  console.log("🔧 THREE.js Compatibility Fix: Initializing...");
  
  // Track when we've applied fixes
  let fixesApplied = false;
  
  // Wait for Three.js to be available - now supports both global THREE and module THREE
  function waitForThree() {
    // First, check for global THREE
    if (typeof THREE !== 'undefined') {
      console.log('🔧 THREE.js Fix: Found global THREE object');
      applyThreeFixes(THREE);
      return;
    }
    
    // If global THREE not found, listen for threeReady event (from AmorphousPrism)
    console.log('🔧 THREE.js Fix: Waiting for threeReady event...');
    window.addEventListener('threeReady', function(e) {
      if (fixesApplied) return; // Prevent duplicate application
      
      console.log('🔧 THREE.js Fix: Received threeReady event');
      const THREE = e.detail.THREE;
      applyThreeFixes(THREE);
    });
    
    // Fallback: Try again after delay
    setTimeout(function() {
      if (!fixesApplied && typeof THREE !== 'undefined') {
        console.log('🔧 THREE.js Fix: Found global THREE after delay');
        applyThreeFixes(THREE);
      }
    }, 500);
  }
  
  function applyThreeFixes(THREE) {
    if (fixesApplied) return; // Prevent duplicate application
    
    console.log('🔧 THREE.js Fix: Applying compatibility fixes');
    
    // Fix for missing shader chunks
    fixShaderChunks(THREE);
    
    // Fix for property deprecations
    fixPropertyDeprecations(THREE);
    
    // Fix for renderer compatibility
    fixRendererCompatibility(THREE);
    
    fixesApplied = true;
    console.log('🔧 THREE.js Fix: All fixes applied successfully');
  }
  
  function fixShaderChunks(THREE) {
    // Check if ShaderChunk is available
    if (!THREE.ShaderChunk) {
      console.warn('THREE.ShaderChunk not available, shader fixes cannot be applied');
      return;
    }
    
    // Add missing colorspace_fragment if it doesn't exist
    if (!THREE.ShaderChunk.colorspace_fragment) {
      THREE.ShaderChunk.colorspace_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef GAMMA_OUTPUT
  gl_FragColor.rgb = pow( gl_FragColor.rgb, vec3( 1.0 / gamma ) );
#endif
      `;
      console.log('🔧 THREE.js Fix: Added missing colorspace_fragment shader chunk');
    }
    
    // Add other common missing chunks
    const missingChunks = {
      'encodings_pars_fragment': `
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
      `,
      'colorspace_pars_fragment': `
#ifdef USE_SRGB_ENCODING
  uniform float gamma;
#endif
      `
    };
    
    // Apply missing chunks
    Object.keys(missingChunks).forEach(chunkName => {
      if (!THREE.ShaderChunk[chunkName]) {
        THREE.ShaderChunk[chunkName] = missingChunks[chunkName];
        console.log(`🔧 THREE.js Fix: Added missing ${chunkName} shader chunk`);
      }
    });
  }
  
  function fixPropertyDeprecations(THREE) {
    // Only apply to older THREE versions where needed
    if (!THREE.WebGLRenderer) return;
    
    // Keep track of original WebGLRenderer
    const originalWebGLRenderer = THREE.WebGLRenderer;
    
    // Create a wrapper for WebGLRenderer to fix deprecated properties
    THREE.WebGLRenderer = function(parameters) {
      const renderer = new originalWebGLRenderer(parameters);
      
      // Handle outputEncoding vs outputColorSpace
      if (!renderer.outputColorSpace && renderer.outputEncoding !== undefined) {
        Object.defineProperty(renderer, 'outputColorSpace', {
          get: function() {
            // Map from old encoding to new colorspace
            switch(this.outputEncoding) {
              case THREE.sRGBEncoding:
                return 'srgb';
              case THREE.LinearEncoding:
              default:
                return 'linear';
            }
          },
          set: function(value) {
            // Map from new colorspace to old encoding
            if (value === 'srgb') {
              this.outputEncoding = THREE.sRGBEncoding;
            } else {
              this.outputEncoding = THREE.LinearEncoding;
            }
          }
        });
      }
      
      return renderer;
    };
    
    // Copy over prototype and statics
    THREE.WebGLRenderer.prototype = originalWebGLRenderer.prototype;
    for (let prop in originalWebGLRenderer) {
      if (originalWebGLRenderer.hasOwnProperty(prop)) {
        THREE.WebGLRenderer[prop] = originalWebGLRenderer[prop];
      }
    }
    
    console.log('🔧 THREE.js Fix: Fixed property deprecations');
  }
  
  function fixRendererCompatibility(THREE) {
    // Fix for WebGL version issues
    if (THREE.WebGLRenderer) {
      const originalParameters = THREE.WebGLRenderer.prototype.setParameters;
      
      // Override parameters to ensure WebGL compatibility
      THREE.WebGLRenderer.prototype.setParameters = function(gl, parameters) {
        // Call original function
        const result = originalParameters.call(this, gl, parameters);
        
        // Always force powerPreference to 'high-performance'
        this.context.powerPreference = 'high-performance';
        
        // Return original result
        return result;
      };
      
      console.log('🔧 THREE.js Fix: Enhanced WebGL compatibility settings');
    }
  }
  
  // Start checking for Three.js
  waitForThree();
})();
