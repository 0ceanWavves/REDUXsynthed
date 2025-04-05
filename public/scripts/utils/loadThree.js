// public/scripts/utils/loadThree.js

// Placeholder for THREE global (if needed before load)
if (typeof window !== 'undefined' && !window.THREE) {
    console.log("Setting up THREE placeholder until library loads");
    window.THREE = {
      Vector3: function() { return {x: 0, y: 0, z: 0}; },
      Color: function() { return {r: 0, g: 0, b: 0}; },
      Texture: function() { return {}; },
      __isPlaceholder: true
    };
}

/**
 * Apply any necessary configurations or fixes to Three.js
 * @param {Object} THREE - The Three.js instance
 */
function configureThreeJS(THREE) {
  console.log("Configuring THREE.js instance");
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
      console.log("🛠️ Applied fix: Added missing colorspace_fragment shader chunk");
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
      console.log("🛠️ Applied fix: Added missing colorspace_pars_fragment shader chunk");
    }
  }
}

/**
 * Function to safely load THREE.js using CDN
 * @returns {Promise<Object|null>} Resolves with the THREE object or null on failure.
 */
export default async function loadThree() {
  console.log("🔍 Attempting to load THREE.js");
  try {
    // Check if THREE is already properly loaded
    if (typeof window !== 'undefined' && window.THREE && !window.THREE.__isPlaceholder) {
      console.log("Using existing THREE instance");
      configureThreeJS(window.THREE); // Ensure config runs even if pre-loaded
      return window.THREE;
    }

    // Load THREE.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.min.js'; // Make sure version is compatible
    script.async = true;

    const loadPromise = new Promise((resolve, reject) => {
      script.onload = () => {
        console.log("Three.js loaded successfully from CDN");
        if (window.THREE?.__isPlaceholder) delete window.THREE.__isPlaceholder;
        // Make THREE global if not already (essential for modules that don't import it)
        if (!window.THREE){
             console.error("THREE object not found on window after script load!");
             reject(new Error("THREE failed to attach to window"));
             return;
        }
        configureThreeJS(window.THREE);
        resolve(window.THREE);
      };
      script.onerror = (error) => {
        console.error("Failed to load Three.js from CDN:", error);
        reject(error); // Reject the promise on error
      };
    });

    document.head.appendChild(script);
    return loadPromise;

  } catch (error) {
    console.error("❌ THREE.js loading failed:", error);
    return null; // Return null or throw, depending on desired handling
  }
} 