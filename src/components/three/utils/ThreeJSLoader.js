/**
 * ThreeJSLoader.js
 * 
 * A centralized utility for importing and configuring Three.js across the application.
 * This ensures consistent Three.js loading and prevents duplicate imports.
 */

// Flag to prevent multiple initialization
let threeInstance = null;
let noise4DInstance = null;

/**
 * Loads Three.js and noise generator and returns a configured instance
 * @returns {Promise<Object>} Promise that resolves to the THREE object and noise generator
 */
export async function loadThreeJS() {
  // Return cached instance if already loaded
  if (threeInstance) {
    return threeInstance;
  }
  
  try {
    console.log("Loading Three.js - first attempt...");
    
    // Check if THREE is already properly loaded in window
    if (typeof window !== 'undefined' && window.THREE && !window.THREE.__isPlaceholder) {
      console.log("Using existing THREE instance - avoiding duplicate import");
      threeInstance = window.THREE;
      
      // Dispatch event for compatibility with existing code
      window.dispatchEvent(new CustomEvent('threeReady', { detail: { THREE: threeInstance } }));
      
      return threeInstance;
    }
    
    // Otherwise try to load from CDNs with fallbacks
    try {
      const THREE = await import('three');
      console.log("Three.js loaded successfully from node_modules");
      
      // Make THREE globally available
      if (typeof window !== 'undefined') {
        window.THREE = THREE;
        if (window.THREE.__isPlaceholder) {
          delete window.THREE.__isPlaceholder;
        }
        
        // Dispatch event for compatibility with existing code
        window.dispatchEvent(new CustomEvent('threeReady', { detail: { THREE } }));
      }
      
      // Configure Three.js
      configureThreeJS(THREE);
      
      // Cache the instance
      threeInstance = THREE;
      return THREE;
      
    } catch (localError) {
      console.warn("Failed to load Three.js from node_modules, trying CDN fallback:", localError);
      
      // Try CDN
      try {
        const threeModule = await import('https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js');
        const THREE = threeModule.default || threeModule;
        console.log("Three.js loaded successfully from CDN");
        
        // Make THREE globally available
        if (typeof window !== 'undefined') {
          window.THREE = THREE;
          if (window.THREE.__isPlaceholder) {
            delete window.THREE.__isPlaceholder;
          }
          
          // Dispatch event for compatibility with existing code
          window.dispatchEvent(new CustomEvent('threeReady', { detail: { THREE } }));
        }
        
        // Configure Three.js
        configureThreeJS(THREE);
        
        // Cache the instance
        threeInstance = THREE;
        return THREE;
      } catch (cdnError) {
        console.warn("Failed to load from primary CDN, trying unpkg fallback:", cdnError);
        
        // Try unpkg as fallback
        const threeModule = await import('https://unpkg.com/three@0.154.0/build/three.module.js');
        const THREE = threeModule.default || threeModule;
        console.log("Three.js loaded from unpkg fallback");
        
        // Make THREE globally available
        if (typeof window !== 'undefined') {
          window.THREE = THREE;
          if (window.THREE.__isPlaceholder) {
            delete window.THREE.__isPlaceholder;
          }
          
          // Dispatch event for compatibility with existing code
          window.dispatchEvent(new CustomEvent('threeReady', { detail: { THREE } }));
        }
        
        // Configure Three.js
        configureThreeJS(THREE);
        
        // Cache the instance
        threeInstance = THREE;
        return THREE;
      }
    }
  } catch (error) {
    console.error("❌ All Three.js loading attempts failed:", error);
    throw error;
  }
}

/**
 * Creates a circular texture for particles
 * @param {Object} THREE - The Three.js instance
 * @param {number} size - Size of the texture
 * @returns {Object} A Three.js texture
 */
export function createCircleTexture(THREE, size = 128) {
  if (typeof document === 'undefined') return null;
  
  const canvas = document.createElement('canvas');
  canvas.width = size; 
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture(); // Return blank if no context

  ctx.clearRect(0, 0, size, size);
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Add barycentric coordinates to geometry for wireframe shader effects
 * @param {Object} geometry - THREE.js geometry to modify
 * @param {Object} THREE - The Three.js instance
 */
export function addBarycentricCoordinates(geometry, THREE) {
  const count = geometry.attributes.position.count;
  const barycentric = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const indexInTriangle = i % 3; // 0, 1, or 2

    if (indexInTriangle === 0) { // First vertex of triangle
      barycentric[i3 + 0] = 1.0;
      barycentric[i3 + 1] = 0.0;
      barycentric[i3 + 2] = 0.0;
    } else if (indexInTriangle === 1) { // Second vertex
      barycentric[i3 + 0] = 0.0;
      barycentric[i3 + 1] = 1.0;
      barycentric[i3 + 2] = 0.0;
    } else { // Third vertex
      barycentric[i3 + 0] = 0.0;
      barycentric[i3 + 1] = 0.0;
      barycentric[i3 + 2] = 1.0;
    }
  }
  geometry.setAttribute('a_barycentric', new THREE.BufferAttribute(barycentric, 3));
  console.log("Barycentric coordinates added to geometry");
}

/**
 * Apply any necessary configurations or fixes to Three.js
 * @param {Object} THREE - The Three.js instance
 */
function configureThreeJS(THREE) {
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

// Default export for convenience
export default loadThreeJS; 