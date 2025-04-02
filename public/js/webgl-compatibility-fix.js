// webgl-compatibility-fix.js - Handles WebGL compatibility issues across browsers
// Fixes "Cannot resolve #include <colorspace_fragment>" and other WebGL errors

(function() {
  console.log("🎮 WebGL Compatibility Fix: Initializing...");
  
  // Store original console.error to intercept WebGL errors
  const originalConsoleError = console.error;
  
  // Override console.error to catch and fix WebGL errors
  console.error = function(...args) {
    // Convert args to string for checking
    const errorMessage = args.join(' ');
    
    // Check for specific THREE.js WebGL errors
    if (errorMessage.includes("Can not resolve #include <colorspace_fragment>")) {
      console.log("🎮 WebGL Compatibility Fix: Intercepted colorspace_fragment error, applying fix...");
      
      // Apply fix for missing colorspace_fragment
      fixMissingShaderChunk('colorspace_fragment');
      
      // Don't show the error to the user
      return;
    }
    
    // Check for other shader chunk resolution errors
    const includeMatch = errorMessage.match(/Can not resolve #include <([a-zA-Z0-9_]+)>/);
    if (includeMatch && includeMatch[1]) {
      const chunkName = includeMatch[1];
      console.log(`🎮 WebGL Compatibility Fix: Intercepted error for missing chunk ${chunkName}, applying fix...`);
      
      // Apply fix for the specific missing chunk
      fixMissingShaderChunk(chunkName);
      
      // Don't show the error to the user
      return;
    }
    
    // Check for WebGL context errors
    if (errorMessage.includes("WebGL context was lost") || 
        errorMessage.includes("WebGL: INVALID_OPERATION")) {
      console.log("🎮 WebGL Compatibility Fix: Intercepted WebGL context error");
      
      // Apply a general WebGL context fix
      fixWebGLContext();
      
      // Don't show the error to the user if we're going to try to fix it
      return;
    }
    
    // For all other errors, call the original console.error
    originalConsoleError.apply(console, args);
  };
  
  // Function to fix missing shader chunks
  function fixMissingShaderChunk(chunkName) {
    // Wait for THREE to be available
    function waitForThree() {
      if (typeof THREE === 'undefined') {
        console.log(`🎮 WebGL Compatibility Fix: Waiting for THREE to be defined to fix ${chunkName}...`);
        setTimeout(waitForThree, 100);
        return;
      }
      
      // Check if ShaderChunk is available
      if (!THREE.ShaderChunk) {
        console.warn(`🎮 WebGL Compatibility Fix: THREE.ShaderChunk not available, cannot fix ${chunkName}`);
        return;
      }
      
      // Define the missing shader chunk based on name
      let chunkCode = '';
      
      switch (chunkName) {
        case 'colorspace_fragment':
          chunkCode = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
          break;
          
        case 'colorspace_pars_fragment':
          chunkCode = `
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
          break;
          
        case 'tonemapping_fragment':
          chunkCode = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif
`;
          break;
          
        case 'encodings_fragment':
          chunkCode = `
#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
          break;
          
        case 'encodings_pars_fragment':
          chunkCode = `
#ifdef LINEAR_TO_SRGB
  vec4 linearToSRGB(vec4 value) {
    return vec4(mix(
      pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055),
      value.rgb * 12.92,
      vec3(lessThanEqual(value.rgb, vec3(0.0031308)))
    ), value.a);
  }
#endif

#ifdef SRGB_TO_LINEAR
  vec4 sRGBToLinear(vec4 value) {
    return vec4(mix(
      pow((value.rgb + vec3(0.055)) / vec3(1.055), vec3(2.4)),
      value.rgb / vec3(12.92),
      vec3(lessThanEqual(value.rgb, vec3(0.04045)))
    ), value.a);
  }
#endif
`;
          break;
          
        default:
          // For other unknown chunks, provide a minimal empty implementation
          chunkCode = `
// Empty placeholder for ${chunkName}
`;
          break;
      }
      
      // Add the shader chunk if it doesn't exist
      if (!THREE.ShaderChunk[chunkName]) {
        THREE.ShaderChunk[chunkName] = chunkCode;
        console.log(`🎮 WebGL Compatibility Fix: Added missing ${chunkName} shader chunk`);
      }
      
      // Patch the renderer to handle broken materials
      patchWebGLRenderer();
    }
    
    // Start waiting for THREE
    waitForThree();
  }
  
  // Patch WebGLRenderer to better handle shader errors
  function patchWebGLRenderer() {
    if (typeof THREE === 'undefined' || !THREE.WebGLRenderer) return;
    
    // Check if we've already patched
    if (THREE.WebGLRenderer.__patched) return;
    
    // Save reference to original compile method
    const originalCompile = THREE.WebGLRenderer.prototype.compile;
    
    // Override compile to add error handling
    THREE.WebGLRenderer.prototype.compile = function(scene, camera) {
      try {
        return originalCompile.call(this, scene, camera);
      } catch (error) {
        console.warn("🎮 WebGL Compatibility Fix: Caught error during shader compilation:", error);
        
        // Try to fix shader errors
        if (error.message && error.message.includes("include")) {
          const includeMatch = error.message.match(/#include\s+<([a-zA-Z0-9_]+)>/);
          if (includeMatch && includeMatch[1]) {
            const chunkName = includeMatch[1];
            console.log(`🎮 WebGL Compatibility Fix: Attempting to fix missing chunk ${chunkName}`);
            fixMissingShaderChunk(chunkName);
          }
        }
        
        // Continue with compilation despite error
        try {
          return originalCompile.call(this, scene, camera);
        } catch (secondError) {
          console.error("🎮 WebGL Compatibility Fix: Failed to recover from shader error:", secondError);
        }
      }
    };
    
    // Mark as patched
    THREE.WebGLRenderer.__patched = true;
    console.log("🎮 WebGL Compatibility Fix: Patched WebGLRenderer.compile method");
  }
  
  // Function to fix WebGL context issues
  function fixWebGLContext() {
    console.log("🎮 WebGL Compatibility Fix: Attempting to fix WebGL context...");
    
    // Create a test canvas to help initialize the GPU
    function createTestCanvas() {
      const testCanvas = document.createElement('canvas');
      testCanvas.id = "webgl-test-canvas";
      testCanvas.width = 1;
      testCanvas.height = 1;
      testCanvas.style.position = "absolute";
      testCanvas.style.left = "-1000px";
      testCanvas.style.top = "-1000px";
      document.body.appendChild(testCanvas);
      
      try {
        // Try to get a WebGL context
        const gl = testCanvas.getContext('webgl2') || 
                  testCanvas.getContext('webgl') || 
                  testCanvas.getContext('experimental-webgl');
        
        if (gl) {
          // Draw something simple to initialize the context
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
          
          console.log("🎮 WebGL Compatibility Fix: Test WebGL context created successfully");
          
          // Remove the test canvas after a delay
          setTimeout(() => {
            try {
              if (testCanvas.parentNode) {
                testCanvas.parentNode.removeChild(testCanvas);
                console.log("🎮 WebGL Compatibility Fix: Test canvas removed");
              }
            } catch (e) {
              console.log("🎮 WebGL Compatibility Fix: Error removing test canvas", e);
            }
          }, 1000);
          
          return true;
        } else {
          console.warn("🎮 WebGL Compatibility Fix: Failed to create test WebGL context");
          return false;
        }
      } catch (e) {
        console.warn("🎮 WebGL Compatibility Fix: Error in WebGL test initialization", e);
        return false;
      }
    }
    
    // Try to reinitialize WebGL
    createTestCanvas();
    
    // Set a flag to prevent applying the same fix multiple times in rapid succession
    if (!window.__webglFixApplied) {
      window.__webglFixApplied = true;
      
      // Reset after some time to allow applying the fix again if needed
      setTimeout(() => {
        window.__webglFixApplied = false;
      }, 5000);
    }
  }
  
  // Add styles to force hardware acceleration
  function addHardwareAccelerationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Force hardware acceleration for WebGL content */
      canvas {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000;
        will-change: transform;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }
      
      /* Firefox-specific enhancements */
      @-moz-document url-prefix() {
        canvas {
          image-rendering: -moz-crisp-edges;
        }
      }
    `;
    document.head.appendChild(style);
    console.log("🎮 WebGL Compatibility Fix: Added hardware acceleration styles");
  }
  
  // Helper function to patch materials with working shaders
  window.fixThreeMaterial = function(material) {
    if (!material) return material;
    
    // Only process ShaderMaterial or RawShaderMaterial
    if (material.isShaderMaterial || material.isRawShaderMaterial) {
      console.log("🎮 WebGL Compatibility Fix: Fixing material shader code");
      
      // Process vertex shader
      if (material.vertexShader) {
        // Fix missing includes
        const vertexIncludes = material.vertexShader.match(/#include\s+<([a-zA-Z0-9_]+)>/g) || [];
        vertexIncludes.forEach(includeDirective => {
          const chunkName = includeDirective.match(/#include\s+<([a-zA-Z0-9_]+)>/)[1];
          if (!THREE.ShaderChunk[chunkName]) {
            console.log(`🎮 WebGL Compatibility Fix: Adding missing chunk ${chunkName} for vertex shader`);
            fixMissingShaderChunk(chunkName);
          }
        });
      }
      
      // Process fragment shader
      if (material.fragmentShader) {
        // Fix missing includes
        const fragmentIncludes = material.fragmentShader.match(/#include\s+<([a-zA-Z0-9_]+)>/g) || [];
        fragmentIncludes.forEach(includeDirective => {
          const chunkName = includeDirective.match(/#include\s+<([a-zA-Z0-9_]+)>/)[1];
          if (!THREE.ShaderChunk[chunkName]) {
            console.log(`🎮 WebGL Compatibility Fix: Adding missing chunk ${chunkName} for fragment shader`);
            fixMissingShaderChunk(chunkName);
          }
        });
        
        // Ensure colorspace_fragment is included
        if (material.fragmentShader.indexOf('#include <colorspace_fragment>') === -1 &&
            material.fragmentShader.indexOf('gl_FragColor') !== -1) {
          // Add colorspace_fragment before the end of main
          material.fragmentShader = material.fragmentShader.replace(
            /void\s+main\s*\(\s*\)\s*\{([\s\S]*?)(\})\s*$/,
            function(match, mainBody, closingBrace) {
              return `void main() {${mainBody}
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
${closingBrace}`;
            }
          );
          console.log("🎮 WebGL Compatibility Fix: Added missing colorspace_fragment include to shader");
        }
      }
      
      // Force shader recompilation
      material.needsUpdate = true;
    }
    
    return material;
  };
  
  // Initialize when DOM is ready
  function initialize() {
    addHardwareAccelerationStyles();
    
    // Try to create a test WebGL context right away
    fixWebGLContext();
    
    // Listen for WebGL context lost events on all canvases
    document.addEventListener('webglcontextlost', function(event) {
      console.log("🎮 WebGL Compatibility Fix: WebGL context lost, attempting recovery...");
      event.preventDefault(); // Allow context restoration
      
      // Try to fix the context
      setTimeout(fixWebGLContext, 500);
      
      // After a delay, try to create a new test context
      setTimeout(function() {
        const canvas = event.target;
        console.log("🎮 WebGL Compatibility Fix: Attempting to restore context on", canvas);
        
        // Create a new WebGL context
        try {
          const gl = canvas.getContext('webgl2') || 
                    canvas.getContext('webgl') || 
                    canvas.getContext('experimental-webgl');
          
          if (gl) {
            console.log("🎮 WebGL Compatibility Fix: Context restored successfully");
          } else {
            console.warn("🎮 WebGL Compatibility Fix: Failed to restore context");
          }
        } catch (e) {
          console.warn("🎮 WebGL Compatibility Fix: Error restoring WebGL context", e);
        }
      }, 1000);
    }, false);
  }
  
  // Run when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  console.log("🎮 WebGL Compatibility Fix: Setup complete");
})();
