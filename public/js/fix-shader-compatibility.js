/**
 * Fix Shader Compatibility
 * 
 * This script addresses common shader compatibility issues in Three.js,
 * especially for WebGL 1.0 and problematic browser implementations.
 */

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Check if THREE is available
    if (typeof THREE === 'undefined') {
      console.warn('THREE.js not loaded yet. Shader compatibility fix will wait.');
      
      // Wait for THREE to be defined
      const checkInterval = setInterval(() => {
        if (typeof THREE !== 'undefined') {
          clearInterval(checkInterval);
          applyShaderFixes();
        }
      }, 100);
      
      // Give up after 5 seconds
      setTimeout(() => clearInterval(checkInterval), 5000);
      return;
    }
    
    applyShaderFixes();
  });
  
  function applyShaderFixes() {
    console.log('Applying shader compatibility fixes');
    
    // Fix for missing shader chunks in some implementations
    if (THREE.ShaderChunk) {
      // Add common missing chunks
      const missingChunks = [
        'transmission_pars_fragment',
        'transmission_fragment',
        'iridescence_pars_fragment',
        'iridescence_fragment',
        'anisotropy_pars_fragment',
        'anisotropy_fragment'
      ];
      
      missingChunks.forEach(chunkName => {
        if (!THREE.ShaderChunk[chunkName]) {
          // Add empty shader chunk to prevent errors
          THREE.ShaderChunk[chunkName] = '// Compatibility fix - empty chunk for ' + chunkName;
        }
      });
    }
    
    // Fix for precision issues in older browsers
    if (THREE.ShaderLib) {
      // Helper to modify shader
      function fixShaderPrecision(shader) {
        if (!shader) return shader;
        
        // For vertex shaders
        if (shader.vertexShader) {
          shader.vertexShader = shader.vertexShader
            .replace(/precision highp float;/, 'precision mediump float;')
            .replace(/^\s*precision\s+highp\s+int\s*;/m, 'precision mediump int;');
        }
        
        // For fragment shaders
        if (shader.fragmentShader) {
          shader.fragmentShader = shader.fragmentShader
            .replace(/precision highp float;/, 'precision mediump float;')
            .replace(/^\s*precision\s+highp\s+int\s*;/m, 'precision mediump int;');
        }
        
        return shader;
      }
      
      // Apply to all standard shaders
      const shaderLibKeys = Object.keys(THREE.ShaderLib);
      shaderLibKeys.forEach(key => {
        if (THREE.ShaderLib[key]) {
          THREE.ShaderLib[key] = fixShaderPrecision(THREE.ShaderLib[key]);
        }
      });
    }
    
    // Fix for WebGL context creation issues
    const originalWebGLRenderer = THREE.WebGLRenderer;
    if (originalWebGLRenderer) {
      THREE.WebGLRenderer = function(parameters) {
        // Ensure parameters exist
        parameters = parameters || {};
        
        // Force valid precision settings for mobile
        parameters.precision = parameters.precision || 'mediump';
        
        // Try to get context with power preference setting
        parameters.powerPreference = parameters.powerPreference || 'high-performance';
        
        // Fix for Firefox - force WebGL 1 on problematic systems
        const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
        if (isFirefox && !parameters.forceWebGL1) {
          const canvas = document.createElement('canvas');
          try {
            // Test if WebGL2 works properly
            const testContext = canvas.getContext('webgl2');
            if (!testContext || 
                !testContext.getExtension('EXT_color_buffer_float') ||
                !testContext.getExtension('OES_texture_float_linear')) {
              console.warn('WebGL2 support incomplete in Firefox. Forcing WebGL1.');
              parameters.context = canvas.getContext('webgl', { 
                alpha: parameters.alpha !== undefined ? parameters.alpha : true,
                antialias: parameters.antialias !== undefined ? parameters.antialias : true,
                depth: true,
                stencil: true,
                premultipliedAlpha: true,
                preserveDrawingBuffer: parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false
              });
            }
          } catch (e) {
            console.error('Error testing WebGL capabilities:', e);
          }
        }
        
        return new originalWebGLRenderer(parameters);
      };
      
      // Copy prototype and properties
      THREE.WebGLRenderer.prototype = originalWebGLRenderer.prototype;
      Object.assign(THREE.WebGLRenderer, originalWebGLRenderer);
    }
    
    console.log('Shader compatibility fixes applied');
  }
})(); 