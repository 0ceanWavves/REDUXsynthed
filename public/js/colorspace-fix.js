/**
 * Minimal Three.js colorspace_fragment fix
 * Fixes the "Cannot resolve #include <colorspace_fragment>" error
 * CSP-friendly implementation with no inline styles
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
    
    console.log("🎨 Applying colorspace_fragment fix for Three.js");
    
    // Add the missing shader chunks
    if (THREE.ShaderChunk) {
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
        console.log("🎨 Added missing colorspace_fragment shader chunk");
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
        console.log("🎨 Added missing colorspace_pars_fragment shader chunk");
      }
      
      // Add tonemapping_fragment if missing
      if (!THREE.ShaderChunk.tonemapping_fragment) {
        THREE.ShaderChunk.tonemapping_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif
`;
        console.log("🎨 Added missing tonemapping_fragment shader chunk");
      }
    } else {
      console.warn("🎨 THREE.ShaderChunk not available, cannot apply fix");
    }
    
    console.log("🎨 colorspace_fragment fix applied successfully");
  }
})();
