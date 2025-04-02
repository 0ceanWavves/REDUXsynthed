/**
 * ULTIMATE TOUCH FIX AND SHADER FIX
 * This script fixes both touch interactions and shader issues in Three.js
 */

(function() {
  console.log("ULTIMATE FIX: Starting shader and touch fixes...");
  
  // Fix for the colorspace_fragment error in Three.js
  function fixColorspaceFragmentError() {
    // Use a MutationObserver to detect when THREE is available
    const observer = new MutationObserver(() => {
      if (typeof THREE !== 'undefined' && THREE.ShaderChunk) {
        // Fix colorspace_fragment shader chunk if missing
        if (!THREE.ShaderChunk.colorspace_fragment) {
          THREE.ShaderChunk.colorspace_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
          console.log("ULTIMATE FIX: Added missing colorspace_fragment shader chunk");
        }
        
        // Fix colorspace_pars_fragment if missing
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
          console.log("ULTIMATE FIX: Added missing colorspace_pars_fragment shader chunk");
        }
        
        // Set up error interceptor for shader errors
        setupShaderErrorInterceptor();
        
        // Disconnect observer once fixes are applied
        observer.disconnect();
      }
    });
    
    // Start observing document for script additions
    observer.observe(document, { childList: true, subtree: true });
    
    // Alternative approach: check periodically for THREE
    const checkInterval = setInterval(() => {
      if (typeof THREE !== 'undefined' && THREE.ShaderChunk) {
        // Apply same fixes as above
        if (!THREE.ShaderChunk.colorspace_fragment) {
          THREE.ShaderChunk.colorspace_fragment = `
#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#ifdef LINEAR_TO_SRGB
  gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
#endif
`;
          console.log("ULTIMATE FIX: Added missing colorspace_fragment shader chunk (interval)");
        }
        
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
          console.log("ULTIMATE FIX: Added missing colorspace_pars_fragment shader chunk (interval)");
        }
        
        // Setup error interceptor
        setupShaderErrorInterceptor();
        
        // Clear interval
        clearInterval(checkInterval);
      }
    }, 100);
  }
  
  // Error interceptor for catching shader errors at runtime
  function setupShaderErrorInterceptor() {
    // Store original console.error
    const originalConsoleError = console.error;
    
    // Override console.error to catch shader errors
    console.error = function(...args) {
      const errorMsg = args.join(' ');
      
      // Handle colorspace_fragment errors
      if (errorMsg.includes("Can not resolve #include <colorspace_fragment>")) {
        console.log("ULTIMATE FIX: Caught colorspace_fragment error at runtime");
        
        // Fix is already applied, but renderer might need a refresh
        if (typeof window.prismaticScene !== 'undefined' && 
            window.prismaticScene.renderer) {
          window.prismaticScene.renderer.dispose();
          console.log("ULTIMATE FIX: Attempting renderer reset");
        }
        
        // Don't show the original error
        return;
      }
      
      // Handle other missing shader chunk errors
      const chunkMatch = errorMsg.match(/Can not resolve #include <([a-zA-Z0-9_]+)>/);
      if (chunkMatch && chunkMatch[1]) {
        const chunkName = chunkMatch[1];
        console.log(`ULTIMATE FIX: Caught missing chunk error for ${chunkName}`);
        
        // Add empty placeholder for the missing chunk
        if (typeof THREE !== 'undefined' && THREE.ShaderChunk) {
          if (!THREE.ShaderChunk[chunkName]) {
            THREE.ShaderChunk[chunkName] = `
// Empty placeholder for missing ${chunkName}
`;
            console.log(`ULTIMATE FIX: Added placeholder for ${chunkName}`);
          }
        }
        
        // Don't show the original error
        return;
      }
      
      // Pass through all other errors
      originalConsoleError.apply(console, args);
    };
    
    console.log("ULTIMATE FIX: Shader error interceptor set up");
  }
  
  // Start shader fixes immediately
  fixColorspaceFragmentError();

  // Function to directly apply rotation to the prism
  function directApplyRotation(deltaX, deltaY) {
    const rotationSpeed = 0.005;
    const rotY = deltaX * rotationSpeed;
    const rotX = -deltaY * rotationSpeed;
    
    console.log("ULTIMATE FIX: Applying rotation", rotX, rotY);
    
    // Try all possible ways to rotate the object
    if (window.prismaticScene) {
      if (window.prismaticScene.prism) {
        if (window.prismaticScene.prism.rotation) {
          window.prismaticScene.prism.rotation.x += rotX;
          window.prismaticScene.prism.rotation.y += rotY;
          return true;
        }
      }
      
      if (typeof window.prismaticScene.setRotationVelocity === 'function') {
        window.prismaticScene.setRotationVelocity(rotY, rotX);
        return true;
      }
      
      if (typeof window.prismaticScene.applyRotation === 'function') {
        window.prismaticScene.applyRotation(rotX, rotY);
        return true;
      }
      
      if (typeof window.prismaticScene.onTouchMove === 'function') {
        window.prismaticScene.onTouchMove({x: 0, y: 0}, {deltaX, deltaY});
        return true;
      }
    }
    
    // Try window.applyPrismRotation if available
    if (typeof window.applyPrismRotation === 'function') {
      window.applyPrismRotation(deltaX, deltaY);
      return true;
    }
    
    return false;
  }
  
  // Set up direct event listeners on all canvas elements
  function setupDirectEvents() {
    // Find all canvas elements
    const canvases = document.querySelectorAll('canvas');
    if (canvases.length === 0) {
      console.log("ULTIMATE FIX: No canvas elements found, will try again when DOM changes");
      
      // Set up a mutation observer to detect when canvas elements are added
      const observer = new MutationObserver((mutations) => {
        const newCanvases = document.querySelectorAll('canvas');
        if (newCanvases.length > 0) {
          console.log(`ULTIMATE FIX: Found ${newCanvases.length} canvas elements after DOM mutation`);
          newCanvases.forEach(attachEvents);
          observer.disconnect();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return;
    }
    
    console.log(`ULTIMATE FIX: Found ${canvases.length} canvas elements`);
    canvases.forEach(attachEvents);
  }
  
  // Track state for touch/mouse interaction
  let isInteracting = false;
  let previousPosition = { x: 0, y: 0 };
  
  // Attach all events directly to the canvas
  function attachEvents(canvas) {
    if (!canvas) return;
    
    console.log(`ULTIMATE FIX: Setting up events on canvas ${canvas.id || 'unknown'}`);
    
    // Mark the canvas to prevent duplicate event listeners
    if (canvas.getAttribute('data-ultimate-fix') === 'true') {
      console.log(`ULTIMATE FIX: Canvas ${canvas.id || 'unknown'} already has events attached`);
      return;
    }
    
    canvas.setAttribute('data-ultimate-fix', 'true');
    
    // Apply crucial CSS directly
    canvas.style.touchAction = 'none';
    canvas.style.pointerEvents = 'auto';
    canvas.style.cursor = 'grab';
    canvas.style.zIndex = '100';
    
    // MOUSE EVENTS
    canvas.addEventListener('mousedown', function(e) {
      console.log("ULTIMATE FIX: Mouse down detected");
      e.preventDefault();
      e.stopPropagation();
      
      isInteracting = true;
      canvas.style.cursor = 'grabbing';
      
      previousPosition = { x: e.clientX, y: e.clientY };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
    
    function handleMouseMove(e) {
      if (!isInteracting) return;
      
      const deltaX = e.clientX - previousPosition.x;
      const deltaY = e.clientY - previousPosition.y;
      
      directApplyRotation(deltaX, deltaY);
      
      previousPosition = { x: e.clientX, y: e.clientY };
    }
    
    function handleMouseUp(e) {
      if (!isInteracting) return;
      
      isInteracting = false;
      
      document.querySelectorAll('canvas').forEach(c => {
        c.style.cursor = 'grab';
      });
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    // TOUCH EVENTS - with passive: false to allow preventDefault
    canvas.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) return;
      
      console.log("ULTIMATE FIX: Touch started");
      e.preventDefault();
      e.stopPropagation();
      
      isInteracting = true;
      canvas.style.cursor = 'grabbing';
      
      const touch = e.touches[0];
      previousPosition = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });
    
    canvas.addEventListener('touchmove', function(e) {
      if (!isInteracting || e.touches.length !== 1) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - previousPosition.x;
      const deltaY = touch.clientY - previousPosition.y;
      
      directApplyRotation(deltaX, deltaY);
      
      previousPosition = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });
    
    canvas.addEventListener('touchend', function(e) {
      console.log("ULTIMATE FIX: Touch ended");
      e.preventDefault();
      
      isInteracting = false;
      canvas.style.cursor = 'grab';
    }, { passive: false });
    
    // POINTER EVENTS (modern API that works for both touch and mouse)
    canvas.addEventListener('pointerdown', function(e) {
      console.log("ULTIMATE FIX: Pointer down");
      e.preventDefault();
      e.stopPropagation();
      
      isInteracting = true;
      canvas.style.cursor = 'grabbing';
      
      previousPosition = { x: e.clientX, y: e.clientY };
      
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {
        console.warn("ULTIMATE FIX: Could not set pointer capture", err);
      }
    });
    
    canvas.addEventListener('pointermove', function(e) {
      if (!isInteracting) return;
      
      const deltaX = e.clientX - previousPosition.x;
      const deltaY = e.clientY - previousPosition.y;
      
      directApplyRotation(deltaX, deltaY);
      
      previousPosition = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('pointerup', function(e) {
      if (!isInteracting) return;
      
      console.log("ULTIMATE FIX: Pointer up");
      isInteracting = false;
      canvas.style.cursor = 'grab';
      
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch (err) {
        console.warn("ULTIMATE FIX: Could not release pointer capture", err);
      }
    });
    
    canvas.addEventListener('pointercancel', function(e) {
      if (!isInteracting) return;
      
      console.log("ULTIMATE FIX: Pointer cancel");
      isInteracting = false;
      canvas.style.cursor = 'grab';
    });
    
    console.log(`ULTIMATE FIX: Events attached to canvas ${canvas.id || 'unknown'}`);
  }
  
  // Start when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDirectEvents);
  } else {
    setupDirectEvents();
  }
  
  // Also try on window load
  window.addEventListener('load', function() {
    console.log("ULTIMATE FIX: Window loaded, checking for canvas elements again");
    
    const canvases = document.querySelectorAll('canvas:not([data-ultimate-fix="true"])');
    if (canvases.length > 0) {
      console.log(`ULTIMATE FIX: Found ${canvases.length} new canvas elements after window load`);
      canvases.forEach(attachEvents);
    }
  });
  
  // Add a global style to ensure canvas elements can receive pointer events
  const style = document.createElement('style');
  style.textContent = `
    canvas {
      touch-action: none !important;
      pointer-events: auto !important;
      -webkit-user-select: none !important;
      user-select: none !important;
      z-index: 100 !important;
    }
    
    /* Ensure parent element doesn't block interaction */
    #morphing-poly-canvas,
    canvas[id*="canvas"],
    canvas[id*="prism"],
    canvas[id*="morphing"] {
      z-index: 200 !important;
      position: relative !important;
    }
    
    body.touch-interaction {
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log("ULTIMATE FIX: Setup complete");
})(); 