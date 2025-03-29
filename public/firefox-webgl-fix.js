/**
 * Firefox WebGL Compatibility Fix
 * 
 * This script applies Firefox-specific workarounds to enable WebGL rendering
 * in cases where the standard approach might fail.
 */
(function() {
  console.log("🦊 Firefox WebGL Fix: Initializing...");
  
  // Only run in Firefox
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  if (!isFirefox) {
    console.log("🦊 Firefox WebGL Fix: Not Firefox, skipping");
    return;
  }
  
  console.log("🦊 Firefox WebGL Fix: Firefox detected, applying fixes");
  
  // Force hardware acceleration hint for Firefox
  const forceMeta = document.createElement('meta');
  forceMeta.setAttribute('name', 'force-rendering');
  forceMeta.setAttribute('content', 'webkit|ie-comp|ie-stand');
  document.head.appendChild(forceMeta);
  
  // Apply acceleration CSS
  const style = document.createElement('style');
  style.textContent = `
    /* Firefox WebGL acceleration fixes */
    @-moz-document url-prefix() {
      canvas#morphing-poly-canvas, 
      canvas#morphing-poly-canvas-fallback {
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
      }
      
      /* Force hardware acceleration */
      .force-gpu, canvas {
        transform: translate3d(0, 0, 0);
        backface-visibility: hidden;
        perspective: 1000;
        will-change: transform;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Function to create a WebGL test canvas to help initialize the GPU
  function createWebGLTestCanvas() {
    console.log("🦊 Creating WebGL test canvas to initialize GPU");
    const testCanvas = document.createElement('canvas');
    testCanvas.id = "firefox-webgl-test"; // Using a unique ID that won't conflict
    testCanvas.width = 128;
    testCanvas.height = 128;
    testCanvas.style.cssText = "position: absolute; left: -9999px; top: -9999px; width: 128px; height: 128px;";
    document.body.appendChild(testCanvas);
    
    try {
      // Try to initialize WebGL2 first (needed for THREE.js r163+)
      const contextAttributes = {
        alpha: true,
        antialias: false,
        depth: true,
        failIfMajorPerformanceCaveat: false,
        powerPreference: "high-performance",
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        stencil: false
      };
      
      // Always try WebGL2 first (required for THREE.js r163+)
      let gl = testCanvas.getContext('webgl2', contextAttributes);
      
      // Fall back to WebGL1 if necessary
      if (!gl) {
        console.log("🦊 WebGL2 not supported, trying WebGL1");
        gl = testCanvas.getContext('webgl', contextAttributes) || 
             testCanvas.getContext('experimental-webgl', contextAttributes);
      } else {
        console.log("🦊 WebGL2 context created successfully!");
      }
      
      if (gl) {
        console.log("🦊 Successfully created WebGL test context");
        
        // Draw a simple triangle to initialize the GPU
        // This helps "warm up" the GPU for later WebGL usage
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Create a simple shader program
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }');
        gl.compileShader(vs);
        
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, 'precision mediump float; void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }');
        gl.compileShader(fs);
        
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);
        
        // Draw a triangle
        const positionLocation = gl.getAttribLocation(program, 'p');
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 1, 1, -1]), gl.STATIC_DRAW);
        
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        
        // Keep the context and remove after a delay
        window.setTimeout(() => {
          try {
            if (gl.getExtension('WEBGL_lose_context')) {
              gl.getExtension('WEBGL_lose_context').loseContext();
            }
            document.body.removeChild(testCanvas);
            console.log("🦊 WebGL test canvas removed");
          } catch (e) {
            console.log("🦊 Error while cleaning up test canvas", e);
          }
        }, 2000);
        
        return true;
      } else {
        console.error("🦊 Failed to create test WebGL context");
        return false;
      }
    } catch (e) {
      console.error("🦊 Error in WebGL test initialization", e);
      return false;
    }
  }
  
  // Apply global WebGL improvements without modifying the actual canvas
  // This avoids conflicting with the canvas used in AmorphousPrism.astro
  function applyGlobalWebGLFixes() {
    console.log("🦊 Applying global WebGL fixes for Firefox");
    
    // Add extra global styles to optimize WebGL performance in Firefox
    const extraStyles = document.createElement('style');
    extraStyles.textContent = `
      @-moz-document url-prefix() {
        /* General Firefox WebGL optimizations */
        canvas {
          image-rendering: optimizeSpeed;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        
        /* Hint to use hardware acceleration */
        body {
          transform: translate3d(0,0,0);
        }
        
        /* Fix for WebGL2 in THREE.js r163+ */
        canvas {
          /* Force the browser to use WebGL2 if available */
          webgl2: auto !important;
        }
      }
    `;
    document.head.appendChild(extraStyles);
    
    // Register a helper function for THREE.js to properly choose WebGL2 in Firefox
    window.__FIREFOX_WEBGL2_HELPER = function(canvas) {
      try {
        // Try WebGL2 first with optimal attributes
        const gl2 = canvas.getContext('webgl2', {
          alpha: true,
          antialias: false, // Often faster in Firefox
          depth: true,
          failIfMajorPerformanceCaveat: false,
          powerPreference: "high-performance",
          premultipliedAlpha: false,
          preserveDrawingBuffer: false,
          stencil: false
        });
        
        if (gl2) {
          console.log("🦊 Firefox helper: Using WebGL2 context");
          return gl2;
        }
        
        // Fall back to regular WebGL
        console.log("🦊 Firefox helper: WebGL2 not available, falling back");
        return null; // Let THREE.js handle the fallback
      } catch (e) {
        console.error("🦊 Firefox WebGL2 helper error:", e);
        return null;
      }
    };
  }
  
  // Apply fixes when the document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createWebGLTestCanvas();
      applyGlobalWebGLFixes();
    });
  } else {
    // Document already loaded
    createWebGLTestCanvas();
    applyGlobalWebGLFixes();
  }
  
  console.log("🦊 Firefox WebGL Fix: Setup complete");
})(); 