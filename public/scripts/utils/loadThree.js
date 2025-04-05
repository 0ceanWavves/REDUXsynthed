// src/scripts/utils/loadThree.js

/**
 * Apply any necessary configurations or fixes to Three.js
 * @param {Object} THREE - The Three.js instance
 */
function configureThreeJS(THREE) {
  console.log("Configuring THREE.js instance (src)");
  // Apply critical shader chunk fixes if needed
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
      console.log("🛠️ Applied fix: Added missing colorspace_fragment shader chunk (src)");
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
      console.log("🛠️ Applied fix: Added missing colorspace_pars_fragment shader chunk (src)");
    }
  }
}

/**
 * Function to safely load THREE.js using CDN
 * @returns {Promise<Object|null>} Resolves with the THREE object if found and configured, or null.
 */
export default async function loadThree() {
  console.log("🔍 Checking for existing THREE.js instance (src)");
  try {
    // Check if THREE is already properly loaded (likely via import)
    if (typeof window !== 'undefined' && window.THREE && !window.THREE.__isPlaceholder) {
      console.log("👍 Found existing THREE instance. Configuring... (src)");
      configureThreeJS(window.THREE);
      return window.THREE;
    } else if (typeof window !== 'undefined' && window.THREE?.__isPlaceholder) {
        console.warn("⚠️ THREE placeholder found, but full library not loaded yet. Import THREE.js directly. (src)");
        return null;
    } else {
      console.error("❌ THREE instance not found. Ensure THREE.js is imported via ES Modules. (src)");
      return null;
    }
  } catch (error) {
    console.error("❌ Error during THREE.js configuration check (src):", error);
    return null;
  }
} 