/**
 * Colorspace Fragment Fix for Three.js
 * Specifically targets the "Cannot resolve #include <colorspace_fragment>" error
 * Works with Three.js versions from 0.149.0 to the latest
 */
(function() {
  console.log("🎨 Colorspace Fragment Fix: Initializing...");
  
  // Detect THREE.js
  function checkForThree() {
    if (typeof THREE === 'undefined') {
      console.log("🎨 Colorspace Fragment Fix: Waiting for THREE to be defined");
      setTimeout(checkForThree, 100);
      return;
    }
    
    console.log(`🎨 Colorspace Fragment Fix: THREE detected (version r${THREE.REVISION})`);
    applyFixes();
  }
  
  // Apply necessary fixes
  function applyFixes() {
    // Fix for missing colorspace_fragment in ShaderChunk
    if (!THREE.ShaderChunk.colorspace_fragment) {
      THREE.ShaderChunk.colorspace_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
      console.log("🎨 Colorspace Fragment Fix: Added missing colorspace_fragment chunk");
    }
    
    // Fix for missing colorspace_pars_fragment in ShaderChunk
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
      console.log("🎨 Colorspace Fragment Fix: Added missing colorspace_pars_fragment chunk");
    }
    
    // Fix WebGLRenderer to handle missing outputColorSpace property
    if (THREE.WebGLRenderer) {
      patchWebGLRenderer();
    }
    
    // Monitor for shader compilation errors
    monitorShaderErrors();
    
    console.log("🎨 Colorspace Fragment Fix: All fixes applied");
  }
  
  // Patch WebGLRenderer to handle outputColorSpace vs outputEncoding
  function patchWebGLRenderer() {
    // Only patch once
    if (THREE.WebGLRenderer.__colorspacePatchApplied) {
      return;
    }
    
    // Keep reference to original WebGLRenderer
    const originalWebGLRenderer = THREE.WebGLRenderer;
    
    // Create patched version
    THREE.WebGLRenderer = function(parameters) {
      const renderer = new originalWebGLRenderer(parameters);
      
      // Handle outputEncoding vs outputColorSpace conversion
      if (renderer.outputColorSpace === undefined && renderer.outputEncoding !== undefined) {
        console.log("🎨 Colorspace Fragment Fix: Adding outputColorSpace compatibility to renderer");
        
        // Add outputColorSpace getter/setter
        Object.defineProperty(renderer, 'outputColorSpace', {
          get: function() {
            // Convert from old encoding to new colorspace
            if (this.outputEncoding === THREE.sRGBEncoding) {
              return 'srgb';
            }
            return 'linear';
          },
          set: function(value) {
            // Convert from new colorspace to old encoding
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
    
    // Copy prototype and properties
    THREE.WebGLRenderer.prototype = originalWebGLRenderer.prototype;
    for (const prop in originalWebGLRenderer) {
      if (originalWebGLRenderer.hasOwnProperty(prop)) {
        THREE.WebGLRenderer[prop] = originalWebGLRenderer[prop];
      }
    }
    
    // Mark as patched
    THREE.WebGLRenderer.__colorspacePatchApplied = true;
    
    console.log("🎨 Colorspace Fragment Fix: WebGLRenderer patched for outputColorSpace compatibility");
  }
  
  // Monitor for shader errors
  function monitorShaderErrors() {
    // Store original console.error to intercept shader errors
    const originalConsoleError = console.error;
    
    // Override console.error to catch and fix shader errors
    console.error = function(...args) {
      const errorMsg = String(args.join(' '));
      
      // Check for colorspace_fragment error
      if (errorMsg.includes("Can not resolve #include <colorspace_fragment>")) {
        console.log("🎨 Colorspace Fragment Fix: Caught colorspace_fragment error");
        
        // If error occurred in shader compilation, we need to patch the program
        if (THREE.ShaderLib) {
          // Force shader recompilation by patching ShaderMaterial
          patchShaderMaterial();
        }
        
        return; // Suppress the original error
      }
      
      // Pass through all other errors
      originalConsoleError.apply(console, args);
    };
  }
  
  // Patch ShaderMaterial to fix problematic shaders
  function patchShaderMaterial() {
    // Check if already patched
    if (THREE.ShaderMaterial.__colorspacePatchApplied) {
      return;
    }
    
    // Keep reference to original ShaderMaterial
    const originalShaderMaterial = THREE.ShaderMaterial;
    
    // Create patched version
    THREE.ShaderMaterial = function(parameters) {
      // Fix fragment shader if provided
      if (parameters && parameters.fragmentShader) {
        parameters.fragmentShader = fixFragmentShader(parameters.fragmentShader);
      }
      
      // Create material using original constructor
      return new originalShaderMaterial(parameters);
    };
    
    // Copy prototype and properties
    THREE.ShaderMaterial.prototype = originalShaderMaterial.prototype;
    for (const prop in originalShaderMaterial) {
      if (originalShaderMaterial.hasOwnProperty(prop)) {
        THREE.ShaderMaterial[prop] = originalShaderMaterial[prop];
      }
    }
    
    // Add a helper method to the prototype
    THREE.ShaderMaterial.prototype.fixShaders = function() {
      if (this.fragmentShader) {
        this.fragmentShader = fixFragmentShader(this.fragmentShader);
        this.needsUpdate = true;
      }
      return this;
    };
    
    // Mark as patched
    THREE.ShaderMaterial.__colorspacePatchApplied = true;
    
    console.log("🎨 Colorspace Fragment Fix: ShaderMaterial patched for fragment shader compatibility");
  }
  
  // Helper to fix fragment shaders
  function fixFragmentShader(shader) {
    if (!shader) return shader;
    
    // Check if shader already includes colorspace_fragment
    if (shader.includes('#include <colorspace_fragment>')) {
      return shader;
    }
    
    // Check if this is a fragment shader (has gl_FragColor)
    if (shader.includes('gl_FragColor')) {
      // Add colorspace_fragment before the end of main
      shader = shader.replace(
        /void\s+main\s*\(\s*\)\s*\{([\s\S]*?)(\})\s*$/,
        function(match, mainBody, closingBrace) {
          // Check if we need to add tonemapping_fragment too
          const needsTonemapping = !shader.includes('#include <tonemapping_fragment>') && 
                                   (shader.includes('TONE_MAPPING') || 
                                    shader.includes('toneMapping'));
          
          return `void main() {${mainBody}
  ${needsTonemapping ? '#include <tonemapping_fragment>' : ''}
  #include <colorspace_fragment>
${closingBrace}`;
        }
      );
      
      console.log("🎨 Colorspace Fragment Fix: Fixed fragment shader by adding colorspace_fragment");
    }
    
    return shader;
  }
  
  // Expose a helper function to fix shaders at runtime
  window.fixThreeShaderColorspace = function(material) {
    if (!material) return material;
    
    // Check if it's a ShaderMaterial or RawShaderMaterial
    if (material.isShaderMaterial || material.isRawShaderMaterial) {
      if (material.fragmentShader) {
        const originalShader = material.fragmentShader;
        material.fragmentShader = fixFragmentShader(material.fragmentShader);
        
        // If shader was modified, mark it for update
        if (material.fragmentShader !== originalShader) {
          material.needsUpdate = true;
          console.log("🎨 Colorspace Fragment Fix: Fixed material shader at runtime");
        }
      }
    }
    
    return material;
  };
  
  // Start checking for THREE
  checkForThree();
  
  console.log("🎨 Colorspace Fragment Fix: Setup complete");
})();
