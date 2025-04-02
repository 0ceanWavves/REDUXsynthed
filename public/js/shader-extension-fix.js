/**
 * Shader Extension Fix for Three.js
 * Fixes the error: "ERROR: 0:33: '#' : extension directive must occur before any non-preprocessor tokens"
 */
(function() {
  console.log("🛠️ Shader Extension Fix: Initializing...");
  
  // Run once Three.js is loaded
  function checkForThree() {
    if (typeof THREE === 'undefined') {
      console.log("🛠️ Shader Extension Fix: Waiting for THREE to be defined");
      setTimeout(checkForThree, 100);
      return;
    }
    
    console.log("🛠️ Shader Extension Fix: THREE detected, applying fixes");
    applyShaderFixes();
  }
  
  // Apply shader fixes
  function applyShaderFixes() {
    if (!THREE.ShaderMaterial) {
      console.warn("🛠️ Shader Extension Fix: THREE.ShaderMaterial not available");
      return;
    }
    
    // Patch ShaderMaterial.prototype.onBeforeCompile to fix extension directives
    const originalOnBeforeCompile = THREE.ShaderMaterial.prototype.onBeforeCompile;
    
    THREE.ShaderMaterial.prototype.onBeforeCompile = function(shader, renderer) {
      // Call original method if it exists
      if (originalOnBeforeCompile) {
        originalOnBeforeCompile.call(this, shader, renderer);
      }
      
      // Fix shader extension directives by moving them to the top
      if (shader.fragmentShader) {
        // Extract all extension directives
        const extensionRegex = /#extension\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)/g;
        const extensions = [];
        let match;
        
        // Find all extensions and collect them
        while ((match = extensionRegex.exec(shader.fragmentShader)) !== null) {
          extensions.push(match[0]);
        }
        
        // Only proceed if we found extension directives
        if (extensions.length > 0) {
          // Remove all extension directives from the original shader
          shader.fragmentShader = shader.fragmentShader.replace(extensionRegex, '');
          
          // Add them at the beginning, immediately after any #version directive
          if (shader.fragmentShader.includes('#version')) {
            // Add after the #version line and a newline
            shader.fragmentShader = shader.fragmentShader.replace(
              /(#version[^\n]*\n)/,
              '$1' + extensions.join('\n') + '\n'
            );
          } else {
            // Add at the very beginning
            shader.fragmentShader = extensions.join('\n') + '\n' + shader.fragmentShader;
          }
          
          console.log("🛠️ Shader Extension Fix: Fixed extension directives in shader");
        }
      }
    };
    
    // Patch RawShaderMaterial too (similar process)
    if (THREE.RawShaderMaterial) {
      const originalRawOnBeforeCompile = THREE.RawShaderMaterial.prototype.onBeforeCompile;
      
      THREE.RawShaderMaterial.prototype.onBeforeCompile = THREE.ShaderMaterial.prototype.onBeforeCompile;
      
      console.log("🛠️ Shader Extension Fix: Also patched RawShaderMaterial");
    }
    
    // Helper function to fix shaders manually
    window.fixShaderExtensions = function(material) {
      if (!material || !material.fragmentShader) return material;
      
      // Same logic as above for manual fixes
      const extensionRegex = /#extension\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)/g;
      const extensions = [];
      let match;
      
      while ((match = extensionRegex.exec(material.fragmentShader)) !== null) {
        extensions.push(match[0]);
      }
      
      if (extensions.length > 0) {
        material.fragmentShader = material.fragmentShader.replace(extensionRegex, '');
        
        if (material.fragmentShader.includes('#version')) {
          material.fragmentShader = material.fragmentShader.replace(
            /(#version[^\n]*\n)/,
            '$1' + extensions.join('\n') + '\n'
          );
        } else {
          material.fragmentShader = extensions.join('\n') + '\n' + material.fragmentShader;
        }
        
        material.needsUpdate = true;
        console.log("🛠️ Shader Extension Fix: Manually fixed material");
      }
      
      return material;
    };
    
    console.log("🛠️ Shader Extension Fix: All shader fixes applied");
  }
  
  // Start the process
  checkForThree();
})(); 