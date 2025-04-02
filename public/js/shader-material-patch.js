/**
 * ShaderMaterial patch for Three.js
 * Ensures shaders properly include necessary colorspace fragments
 * Prevents "Cannot resolve #include <colorspace_fragment>" errors
 */
(function() {
  // Keep track if we've applied the fix
  let fixApplied = false;

  // Apply fix immediately if THREE is already defined
  if (typeof THREE !== 'undefined') {
    applyFix();
  }
  
  // Check for THREE periodically until we find it
  const checkInterval = setInterval(function() {
    if (typeof THREE !== 'undefined') {
      clearInterval(checkInterval);
      applyFix();
    }
  }, 50);

  function applyFix() {
    // Only apply once
    if (fixApplied) return;
    fixApplied = true;
    
    console.log("🔧 Applying ShaderMaterial patch");
    
    // Save reference to original ShaderMaterial
    if (!THREE.ShaderMaterial) {
      console.warn("🔧 THREE.ShaderMaterial not available, cannot apply patch");
      return;
    }
    
    const originalShaderMaterial = THREE.ShaderMaterial;
    
    // Create patched version that fixes fragment shaders
    THREE.ShaderMaterial = function(parameters) {
      // Process fragment shader before creating material
      if (parameters && parameters.fragmentShader) {
        parameters.fragmentShader = fixFragmentShader(parameters.fragmentShader);
      }
      
      // Create material using original constructor
      return new originalShaderMaterial(parameters);
    };
    
    // Copy prototype and static properties
    THREE.ShaderMaterial.prototype = originalShaderMaterial.prototype;
    Object.getOwnPropertyNames(originalShaderMaterial).forEach(function(prop) {
      if (prop !== 'prototype') {
        THREE.ShaderMaterial[prop] = originalShaderMaterial[prop];
      }
    });
    
    // Fix existing materials
    if (typeof window !== 'undefined') {
      // Add a global helper for fixing existing materials
      window.fixThreeMaterial = function(material) {
        if (!material) return material;
        
        if (material.isShaderMaterial && material.fragmentShader) {
          const originalShader = material.fragmentShader;
          material.fragmentShader = fixFragmentShader(material.fragmentShader);
          
          // Only update if shader was modified
          if (material.fragmentShader !== originalShader) {
            material.needsUpdate = true;
          }
        }
        
        return material;
      };
    }
    
    console.log("🔧 ShaderMaterial patch applied");
  }
  
  // Function to fix fragment shaders
  function fixFragmentShader(shader) {
    if (!shader) return shader;
    
    // Skip if already includes colorspace_fragment
    if (shader.includes('#include <colorspace_fragment>')) {
      return shader;
    }
    
    // Only apply to fragment shaders (checks for gl_FragColor)
    if (shader.includes('gl_FragColor')) {
      // Add colorspace_fragment before the end of main
      shader = shader.replace(
        /void\s+main\s*\(\s*\)\s*\{([\s\S]*?)(\})\s*$/,
        function(match, mainBody, closingBrace) {
          // Add tonemapping_fragment too if needed
          const needsTonemapping = !shader.includes('#include <tonemapping_fragment>');
          
          return `void main() {${mainBody}
  ${needsTonemapping ? '#include <tonemapping_fragment>' : ''}
  #include <colorspace_fragment>
${closingBrace}`;
        }
      );
    }
    
    return shader;
  }
})();
