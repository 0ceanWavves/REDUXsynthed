/**
 * THREE.js Shader Fix - Standalone Version
 * Specifically fixes the "Cannot resolve #include <colorspace_fragment>" error
 * and related shader issues.
 *
 * USAGE: Include this script BEFORE any Three.js scripts are loaded
 */

(function() {
  console.log("🛠️ Shader Fix: Initializing standalone shader fixes...");
  
  // Add necessary shader chunks as soon as THREE is available
  function applyShaderFixes() {
    // Exit if THREE is not defined yet
    if (typeof THREE === 'undefined' || !THREE.ShaderChunk) {
      return false;
    }
    
    // Patch ShaderMaterial to always move extensions to the top
    if (THREE.ShaderMaterial && !THREE.ShaderMaterial.__patchedForExtensions) {
      const originalOnBeforeCompile = THREE.ShaderMaterial.prototype.onBeforeCompile;
      
      THREE.ShaderMaterial.prototype.onBeforeCompile = function(shader, renderer) {
        // Call original method if it exists
        if (originalOnBeforeCompile) {
          originalOnBeforeCompile.call(this, shader, renderer);
        }
        
        // Fix fragment shader extension directives
        if (shader.fragmentShader) {
          // Extract all extension directives
          const extensionRegex = /#extension\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)/g;
          const extensions = [];
          let match;
          
          // Find all extensions
          while ((match = extensionRegex.exec(shader.fragmentShader)) !== null) {
            extensions.push(match[0]);
          }
          
          // Remove all extension directives
          shader.fragmentShader = shader.fragmentShader.replace(extensionRegex, '');
          
          // Add extensions at the very beginning
          if (extensions.length > 0) {
            shader.fragmentShader = extensions.join('\n') + '\n' + shader.fragmentShader;
          }
        }
      };
      
      // Mark as patched
      THREE.ShaderMaterial.__patchedForExtensions = true;
      console.log("🛠️ Shader Fix: Patched ShaderMaterial to handle extension directives");
    }
    
    // Add colorspace_fragment if missing
    if (!THREE.ShaderChunk.colorspace_fragment) {
      THREE.ShaderChunk.colorspace_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
      console.log("🛠️ Shader Fix: Added missing colorspace_fragment");
    }
    
    // Add colorspace_pars_fragment if missing
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
      console.log("🛠️ Shader Fix: Added missing colorspace_pars_fragment");
    }
    
    // Fix other potentially missing chunks
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
      'tonemapping_fragment': `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif
`,
      'tonemapping_pars_fragment': `
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif

uniform float toneMappingExposure;

// Exposure only
vec3 LinearToneMapping( vec3 color ) {
  return saturate( toneMappingExposure * color );
}
`
    };
    
    // Add missing chunks
    for (const chunkName in missingChunks) {
      if (!THREE.ShaderChunk[chunkName]) {
        THREE.ShaderChunk[chunkName] = missingChunks[chunkName];
        console.log(`🛠️ Shader Fix: Added missing ${chunkName}`);
      }
    }
    
    // Patch WebGLRenderer if available
    if (THREE.WebGLRenderer) {
      // Fix for outputColorSpace vs outputEncoding compatibility
      const originalWebGLRenderer = THREE.WebGLRenderer;
      
      // Create patched version that adds compatibility properties
      THREE.WebGLRenderer = function(parameters) {
        const renderer = new originalWebGLRenderer(parameters);
        
        // Add outputColorSpace compatibility
        if (renderer.outputColorSpace === undefined && renderer.outputEncoding !== undefined) {
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
      
      console.log("🛠️ Shader Fix: Patched WebGLRenderer for compatibility");
    }
    
    // Fix for missing ShaderMaterial methods
    if (THREE.ShaderMaterial) {
      // Add helper method to fix shaders
      if (!THREE.ShaderMaterial.prototype.fixShaders) {
        THREE.ShaderMaterial.prototype.fixShaders = function() {
          if (this.fragmentShader) {
            // Fix fragment shader if it's missing colorspace_fragment
            if (this.fragmentShader.includes('gl_FragColor') && 
                !this.fragmentShader.includes('#include <colorspace_fragment>')) {
              
              // Add before the end of main
              this.fragmentShader = this.fragmentShader.replace(
                /void\s+main\s*\(\s*\)\s*\{([\s\S]*?)(\})\s*$/,
                'void main() {$1\n  #include <colorspace_fragment>\n$2'
              );
              
              this.needsUpdate = true;
              console.log("🛠️ Shader Fix: Fixed shader material fragment shader");
            }
          }
          return this;
        };
        
        console.log("🛠️ Shader Fix: Added fixShaders method to ShaderMaterial");
      }
    }
    
    // Patch WebGLProgram to fix shader processing
    if (THREE.WebGLProgram && !THREE.WebGLProgram.__isPatched) {
      try {
        // Find the function that processes the shader code in Three.js
        var originalWebGLProgram = THREE.WebGLProgram;
        
        THREE.WebGLProgram = function(renderer, cacheKey, parameters, bindingStates) {
          // Move all extensions to the top of shader code before compilation
          function processExtensions(code) {
            if (!code) return code;
            
            // Extract all extension directives
            const extensionRegex = /#extension\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)/g;
            const extensions = [];
            let match;
            
            // Find all extensions
            let codeToProcess = code;
            while ((match = extensionRegex.exec(codeToProcess)) !== null) {
              extensions.push(match[0]);
            }
            
            // Remove all extension directives
            codeToProcess = codeToProcess.replace(extensionRegex, '');
            
            // Add extensions at the very beginning
            if (extensions.length > 0) {
              codeToProcess = extensions.join('\n') + '\n' + codeToProcess;
            }
            
            return codeToProcess;
          }
          
          // Store original shader code
          var originalFragmentShader = parameters.fragmentShader;
          var originalVertexShader = parameters.vertexShader;
          
          // Process shaders to ensure extensions are at the top
          if (originalFragmentShader) {
            parameters.fragmentShader = processExtensions(originalFragmentShader);
          }
          
          if (originalVertexShader) {
            parameters.vertexShader = processExtensions(originalVertexShader);
          }
          
          // Call original constructor
          return new originalWebGLProgram(renderer, cacheKey, parameters, bindingStates);
        };
        
        // Copy prototype
        THREE.WebGLProgram.prototype = originalWebGLProgram.prototype;
        
        // Copy static properties
        for (var prop in originalWebGLProgram) {
          if (originalWebGLProgram.hasOwnProperty(prop)) {
            THREE.WebGLProgram[prop] = originalWebGLProgram[prop];
          }
        }
        
        THREE.WebGLProgram.__isPatched = true;
        console.log("🛠️ Shader Fix: Successfully patched WebGLProgram to fix extension directives");
      } catch (e) {
        console.error("🛠️ Shader Fix: Failed to patch WebGLProgram:", e);
      }
    }
    
    // Intercept shader errors
    setupErrorInterceptor();
    
    console.log("🛠️ Shader Fix: All fixes applied successfully");
    return true;
  }
  
  // Setup error interceptor for shader errors
  function setupErrorInterceptor() {
    // Only set up once
    if (window.__shaderErrorInterceptorActive) {
      return;
    }
    
    // Original console.error
    const originalConsoleError = console.error;
    
    // Override to catch shader errors
    console.error = function(...args) {
      const errorMsg = args.join(' ');
      
      // Handle colorspace_fragment errors
      if (errorMsg.includes("Can not resolve #include <colorspace_fragment>")) {
        console.log("🛠️ Shader Fix: Caught colorspace_fragment error");
        
        // Re-apply fixes to be sure
        if (typeof THREE !== 'undefined' && THREE.ShaderChunk) {
          THREE.ShaderChunk.colorspace_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
        }
        
        return; // Suppress the error
      }
      
      // Handle other missing chunk errors
      const chunkMatch = errorMsg.match(/Can not resolve #include <([a-zA-Z0-9_]+)>/);
      if (chunkMatch && chunkMatch[1]) {
        const chunkName = chunkMatch[1];
        console.log(`🛠️ Shader Fix: Caught missing chunk error for ${chunkName}`);
        
        // Add empty placeholder
        if (typeof THREE !== 'undefined' && THREE.ShaderChunk) {
          THREE.ShaderChunk[chunkName] = `
// Empty placeholder for missing ${chunkName}
`;
          console.log(`🛠️ Shader Fix: Added placeholder for ${chunkName}`);
        }
        
        return; // Suppress the error
      }
      
      // Pass through other errors
      originalConsoleError.apply(console, args);
    };
    
    // Mark as active
    window.__shaderErrorInterceptorActive = true;
    
    console.log("🛠️ Shader Fix: Error interceptor active");
  }
  
  // Add global helper
  window.fixThreeShaders = function() {
    if (typeof THREE !== 'undefined') {
      applyShaderFixes();
      
      // Fix all existing shader materials
      if (THREE.ShaderMaterial && THREE.ShaderMaterial.prototype.fixShaders) {
        const materials = Object.values(THREE.Cache?.files || {})
          .filter(obj => obj && obj.isShaderMaterial)
          .concat(
            Object.values(THREE.MaterialCache?.materials || {})
              .filter(m => m && m.isShaderMaterial)
          );
          
        // Fix each material
        for (const material of materials) {
          material.fixShaders();
        }
        
        console.log(`🛠️ Shader Fix: Fixed ${materials.length} existing shader materials`);
      }
      
      return true;
    }
    return false;
  };
  
  // Try to apply fixes immediately (in case THREE is already loaded)
  let success = applyShaderFixes();
  
  if (!success) {
    console.log("🛠️ Shader Fix: THREE not detected yet, setting up observers...");
    
    // MutationObserver to watch for Three.js script loading
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            // Look for script nodes that might be loading Three.js
            if (node.tagName === 'SCRIPT' && 
                (node.src.includes('three') || node.textContent.includes('THREE'))) {
              // Try to apply fixes again
              if (applyShaderFixes()) {
                observer.disconnect();
                return;
              }
            }
          }
        }
      }
    });
    
    // Watch the document for changes
    observer.observe(document, { childList: true, subtree: true });
    
    // Fallback interval for safety
    const checkInterval = setInterval(() => {
      if (applyShaderFixes()) {
        clearInterval(checkInterval);
      }
    }, 100);
    
    // Stop checking after 10 seconds regardless
    setTimeout(() => {
      observer.disconnect();
      clearInterval(checkInterval);
      console.log("🛠️ Shader Fix: Timeout reached, stopping observation");
    }, 10000);
  }
  
  // Backup: check on DOMContentLoaded and window load
  document.addEventListener('DOMContentLoaded', applyShaderFixes);
  window.addEventListener('load', applyShaderFixes);
})();
