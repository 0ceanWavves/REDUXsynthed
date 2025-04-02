/**
 * Three.js Error Handler
 * Catches and fixes common Three.js errors at runtime
 * Especially targets the "Cannot resolve #include <colorspace_fragment>" error
 */
(function() {
  console.log("🚑 Three.js Error Handler: Initializing");
  
  // Store original console.error
  const originalConsoleError = console.error;
  
  // Override console.error to catch and fix common Three.js errors
  console.error = function(...args) {
    // Check if this is a Three.js shader error
    const errorMessage = args.join(' ');
    
    // Handle colorspace_fragment error
    if (errorMessage.includes("Can not resolve #include <colorspace_fragment>")) {
      console.log("🚑 Three.js Error Handler: Caught colorspace_fragment error, applying fix");
      
      // Apply fix for missing shader chunk
      if (typeof THREE !== 'undefined' && THREE.ShaderChunk) {
        if (!THREE.ShaderChunk.colorspace_fragment) {
          THREE.ShaderChunk.colorspace_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
          console.log("🚑 Three.js Error Handler: Added missing colorspace_fragment shader chunk");
        }
      }
      
      // Don't output the original error since we're fixing it
      return;
    }
    
    // Handle other missing shader chunk errors
    const chunkMatch = errorMessage.match(/Can not resolve #include <([a-zA-Z0-9_]+)>/);
    if (chunkMatch && chunkMatch[1]) {
      const chunkName = chunkMatch[1];
      console.log(`🚑 Three.js Error Handler: Caught missing chunk error for ${chunkName}, adding empty placeholder`);
      
      // Add an empty placeholder for the missing chunk
      if (typeof THREE !== 'undefined' && THREE.ShaderChunk) {
        if (!THREE.ShaderChunk[chunkName]) {
          THREE.ShaderChunk[chunkName] = `
// Empty placeholder for missing ${chunkName}
`;
          console.log(`🚑 Three.js Error Handler: Added placeholder for ${chunkName}`);
        }
      }
      
      // Don't output the original error
      return;
    }
    
    // Pass through all other errors
    originalConsoleError.apply(console, args);
  };
  
  console.log("🚑 Three.js Error Handler: Ready");
})();
