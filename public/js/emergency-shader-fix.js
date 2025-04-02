/**
 * Emergency Shader Fix for Three.js
 * 
 * This script patches Three.js shader chunks that might be missing in some versions,
 * ensuring compatibility across different environments.
 */

(function() {
  // Wait for THREE to be available
  window.addEventListener('threeReady', function(event) {
    const THREE = event.detail.THREE;
    
    // Apply fixes to shader chunks
    if (THREE && THREE.ShaderChunk) {
      // Add colorspace_fragment chunk if missing
      if (!THREE.ShaderChunk.colorspace_fragment) {
        THREE.ShaderChunk.colorspace_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
        console.log("🛠️ Emergency fix: Added missing colorspace_fragment shader chunk");
      }
      
      // Add colorspace_pars_fragment chunk if missing
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
        console.log("🛠️ Emergency fix: Added missing colorspace_pars_fragment shader chunk");
      }
      
      console.log("✅ Emergency shader fixes applied");
    }
  });
  
  // Firefox specific WebGL2 helper
  window.__FIREFOX_WEBGL2_HELPER = function(canvas) {
    try {
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        return canvas.getContext('webgl2', {
          alpha: true,
          antialias: false,
          depth: true,
          failIfMajorPerformanceCaveat: false,
          powerPreference: 'high-performance'
        });
      }
    } catch (e) {
      console.warn("Firefox WebGL2 helper failed:", e);
    }
    return null;
  };
  
  console.log("🛠️ Emergency shader fix ready");
})(); 