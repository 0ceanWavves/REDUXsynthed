/**
 * AmorphousPrism Loader
 * This script helps load the modular components needed for AmorphousPrism
 * and coordinates with the main loading screen
 */
(function() {
  console.log("🔄 AmorphousPrism Loader: Initializing...");
  
  // Create global flags early to prevent redeclaration issues
  window.isMobileDevice = window.innerWidth < 768;
  window.__AMORPHOUS_PRISM_LOADING = false;
  
  // Add MIME type fixes for ESM imports
  document.addEventListener('DOMContentLoaded', function() {
    console.log("🔄 AmorphousPrism Loader: Setting up...");
    
    // Fix shader issues first (if THREE is already loaded)
    if (window.THREE && window.THREE.ShaderChunk) {
      // Fix for missing colorspace_fragment shader chunk
      if (!window.THREE.ShaderChunk.colorspace_fragment) {
        window.THREE.ShaderChunk.colorspace_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
        console.log("🔄 AmorphousPrism Loader: Added missing colorspace_fragment shader chunk");
      }
      
      // Fix for missing colorspace_pars_fragment shader chunk
      if (!window.THREE.ShaderChunk.colorspace_pars_fragment) {
        window.THREE.ShaderChunk.colorspace_pars_fragment = `
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
        console.log("🔄 AmorphousPrism Loader: Added missing colorspace_pars_fragment shader chunk");
      }
    }
    
    // Fix for MIME type issues - check if we need to preload modules
    function preloadModules() {
      const moduleUrls = [
        '/src/components/three/renderer/RendererManager.js',
        '/src/components/three/geometries/PrismGeometries.js',
        '/src/components/three/shaders/MorphingShaders.js',
        '/src/components/three/particles/ParticleSystem.js',
        '/src/components/three/animation/MorphingController.js',
        '/src/components/three/interaction/InteractionManager.js',
        '/src/components/three/config/PrismConfig.js'
      ];
      
      moduleUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = url;
        link.as = 'script';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        console.log(`🔄 AmorphousPrism Loader: Preloaded module ${url}`);
      });
    }
    
    // Attempt to preload our modules
    try {
      preloadModules();
    } catch (err) {
      console.warn("🔄 AmorphousPrism Loader: Module preloading failed, will try direct import", err);
    }
    
    // Fix layout and positioning
    const morphCanvas = document.getElementById('morphing-poly-canvas');
    if (morphCanvas) {
      morphCanvas.style.zIndex = '5';
      console.log("🔄 AmorphousPrism Loader: Fixed canvas z-index");
    }
    
    // Fix text positioning in relation to the 3D object
    setTimeout(function() {
      // Get title elements
      const titleContainer = document.querySelector('.splash-title');
      const contentContainer = document.querySelector('.splash-content');
      
      if (titleContainer) {
        titleContainer.style.position = 'relative';
        titleContainer.style.zIndex = '100';
        titleContainer.style.paddingTop = '15vh';
        console.log("🔄 AmorphousPrism Loader: Fixed title positioning");
      }
      
      if (contentContainer) {
        contentContainer.style.position = 'relative';
        contentContainer.style.zIndex = '100';
        contentContainer.style.marginTop = '0.5rem';
        console.log("🔄 AmorphousPrism Loader: Fixed content positioning");
      }
    }, 500);
    
    // Listen for when the loading screen is removed
    document.addEventListener('loadingScreenRemoved', function() {
      console.log("🔄 AmorphousPrism Loader: Loading screen removed, ensuring 3D objects are visible");
      
      // Ensure the 3D canvas is visible
      const morphCanvas = document.getElementById('morphing-poly-canvas');
      if (morphCanvas) {
        morphCanvas.style.opacity = '1';
        morphCanvas.style.visibility = 'visible';
      }
    });
    
    console.log("🔄 AmorphousPrism Loader: Setup complete");
  });
})();
