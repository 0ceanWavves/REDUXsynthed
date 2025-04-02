// three-shader-fix-improved.js - Comprehensive compatibility fix for Three.js shaders
// Handles the "Cannot resolve #include <colorspace_fragment>" error and other shader issues

(function() {
  console.log("🔧 THREE.js Shader Fix: Initializing...");
  
  // Wait for Three.js to be available
  function waitForThree() {
    if (typeof THREE === 'undefined') {
      console.log('🔧 THREE.js Shader Fix: Waiting for THREE to be defined...');
      setTimeout(waitForThree, 100);
      return;
    }
    
    // Apply fixes once Three.js is loaded
    applyThreeFixes();
  }
  
  function applyThreeFixes() {
    console.log('🔧 THREE.js Shader Fix: Applying shader compatibility fixes');
    
    // Check THREE version
    console.log(`🔧 THREE.js version detected: ${THREE.REVISION}`);
    
    // Fix for missing shader chunks
    fixShaderChunks();
    
    // Patch ShaderMaterial to handle missing chunks
    patchShaderMaterial();
    
    // Fix for property deprecations
    fixPropertyDeprecations();
    
    console.log('🔧 THREE.js Shader Fix: All fixes applied successfully');
  }
  
  function fixShaderChunks() {
    // Check if ShaderChunk is available
    if (!THREE.ShaderChunk) {
      console.warn('THREE.ShaderChunk not available, shader fixes cannot be applied');
      return;
    }
    
    // Common missing shader chunks in Three.js version differences
    const missingChunks = {
      // colorspace_fragment is missing in older versions but required in newer shaders
      'colorspace_fragment': `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef GAMMA_OUTPUT
  gl_FragColor.rgb = pow( gl_FragColor.rgb, vec3( 1.0 / gamma ) );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`,
      // colorspace_pars_fragment contains necessary defines for color space conversions
      'colorspace_pars_fragment': `
#ifdef USE_SRGB_ENCODING
  uniform float gamma;
#endif

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
      // More modern encoding functions needed in some shaders
      'encodings_pars_fragment': `
#ifdef LINEAR_TO_SRGB
  vec4 LinearToSRGB(vec4 value) {
    return vec4(mix(
      pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055),
      value.rgb * 12.92,
      vec3(lessThanEqual(value.rgb, vec3(0.0031308)))
    ), value.a);
  }
#endif

#ifdef SRGB_TO_LINEAR
  vec4 SRGBToLinear(vec4 value) {
    return vec4(mix(
      pow((value.rgb + vec3(0.055)) / vec3(1.055), vec3(2.4)),
      value.rgb / vec3(12.92),
      vec3(lessThanEqual(value.rgb, vec3(0.04045)))
    ), value.a);
  }
#endif
`,
      // Tonemapping fragment used in newer versions
      'tonemapping_fragment': `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif
`
    };
    
    // Apply missing chunks
    let appliedCount = 0;
    Object.keys(missingChunks).forEach(chunkName => {
      if (!THREE.ShaderChunk[chunkName]) {
        THREE.ShaderChunk[chunkName] = missingChunks[chunkName];
        console.log(`🔧 THREE.js Shader Fix: Added missing ${chunkName} shader chunk`);
        appliedCount++;
      }
    });
    
    console.log(`🔧 THREE.js Shader Fix: Added ${appliedCount} missing shader chunks`);
  }
  
  function patchShaderMaterial() {
    // Save reference to original ShaderMaterial constructor
    const originalShaderMaterial = THREE.ShaderMaterial;
    
    // Create a patched version that handles missing #include directives
    THREE.ShaderMaterial = function(parameters) {
      // Process shaders to fix missing includes
      if (parameters) {
        if (parameters.vertexShader) {
          parameters.vertexShader = fixShaderIncludes(parameters.vertexShader);
        }
        if (parameters.fragmentShader) {
          parameters.fragmentShader = fixShaderIncludes(parameters.fragmentShader);
        }
      }
      
      // Call original constructor with fixed parameters
      return new originalShaderMaterial(parameters);
    };
    
    // Copy prototype and properties
    THREE.ShaderMaterial.prototype = originalShaderMaterial.prototype;
    for (const prop in originalShaderMaterial) {
      if (originalShaderMaterial.hasOwnProperty(prop)) {
        THREE.ShaderMaterial[prop] = originalShaderMaterial[prop];
      }
    }
    
    // Helper function to fix #include directives
    function fixShaderIncludes(shaderSource) {
      if (!shaderSource) return shaderSource;
      
      // Find all #include directives
      const includePattern = /#include\\s+<([\\w_]+)>/g;
      let match;
      let modifiedShader = shaderSource;
      
      // Process each include
      while ((match = includePattern.exec(shaderSource)) !== null) {
        const includeName = match[1];
        
        // Check if this chunk exists
        if (!THREE.ShaderChunk[includeName]) {
          console.warn(`🔧 THREE.js Shader Fix: Missing shader chunk "${includeName}" referenced in shader`);
          
          // Add an empty placeholder for the missing chunk to prevent errors
          THREE.ShaderChunk[includeName] = `// Empty placeholder for missing chunk: ${includeName}`;
          console.log(`🔧 THREE.js Shader Fix: Added empty placeholder for "${includeName}"`);
        }
      }
      
      return modifiedShader;
    }
    
    console.log('🔧 THREE.js Shader Fix: Patched ShaderMaterial to handle missing includes');
  }
  
  function fixPropertyDeprecations() {
    // Only apply to older THREE versions where needed
    if (!THREE.WebGLRenderer) return;
    
    // Keep track of original WebGLRenderer
    const originalWebGLRenderer = THREE.WebGLRenderer;
    
    // Create a wrapper for WebGLRenderer to fix deprecated properties
    THREE.WebGLRenderer = function(parameters) {
      const renderer = new originalWebGLRenderer(parameters);
      
      // Handle outputEncoding vs outputColorSpace
      if (renderer.outputColorSpace === undefined && renderer.outputEncoding !== undefined) {
        console.log('🔧 THREE.js Fix: Adding outputColorSpace compatibility');
        
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
      
      // Handle toneMapping changes if needed
      if (renderer.toneMapping !== undefined) {
        // Ensure basic tone mapping compatibility
        if (!renderer.toneMappingExposure && renderer.toneMappingExposure !== 0) {
          renderer.toneMappingExposure = 1.0;
        }
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
    
    console.log('🔧 THREE.js Fix: Applied property deprecation fixes');
  }
  
  // Add a global helper function to fix shader errors at runtime
  window.fixThreeShader = function(shaderSource) {
    if (!shaderSource) return shaderSource;
    
    // Replace missing includes with empty definitions
    const includeRegex = /#include\s+<([a-zA-Z0-9_]+)>/g;
    return shaderSource.replace(includeRegex, (match, chunkName) => {
      if (THREE.ShaderChunk[chunkName]) {
        return `#include <${chunkName}>`;
      }
      console.warn(`🔧 THREE.js Shader Fix: Runtime fix for missing chunk "${chunkName}"`);
      return `// Empty replacement for missing chunk: ${chunkName}`;
    });
  };
  
  // Start checking for Three.js
  if (typeof THREE !== 'undefined') {
    applyThreeFixes();
  } else {
    waitForThree();
  }
})();
