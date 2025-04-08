/**
 * ThreeJSLoader.js
 * 
 * A compatibility layer for the centralized Three.js module.
 * This file exists to maintain backward compatibility with code that imports from this path.
 */

import ThreeModule from '../../../utils/three.js';

// Export the centralized module's methods and properties for backward compatibility
export const loadThreeJS = ThreeModule.init;
export const createCircleTexture = ThreeModule.createCircleTexture;
export const addBarycentricCoordinates = ThreeModule.addBarycentricCoordinates;
export const onInitialized = ThreeModule.onInitialized;

// Legacy config function - now handled inside the centralized module
export function configureThreeJS(THREE) {
  console.warn("configureThreeJS is deprecated. Use the centralized Three.js module instead.");
  
  // For backward compatibility, apply fixes if a THREE instance is passed
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
    }
  }
}

// Default export for convenience
export default loadThreeJS;