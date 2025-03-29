/**
 * WebGL Test & Diagnostics
 * This script runs before any 3D content to test WebGL availability
 * and provide detailed diagnostics for debugging.
 */
(function() {
  console.log("🔍 WebGL-TEST: Running WebGL diagnostics...");
  
  // Function to test for WebGL support
  function testWebGL() {
    const results = {
      webglSupport: false,
      contextCreated: false,
      vendor: null,
      renderer: null,
      version: null,
      shadingLanguageVersion: null,
      errors: [],
      extensions: [],
      maxParams: {},
    };
    
    try {
      // Check if WebGL is basically supported in the browser
      if (!window.WebGLRenderingContext) {
        results.errors.push("No WebGLRenderingContext found - WebGL not supported by this browser");
        return results;
      }
      
      results.webglSupport = true;
      
      // Create a test canvas with a unique ID to avoid conflicts
      const canvas = document.createElement('canvas');
      canvas.id = 'webgl-test-canvas-temporary'; // Unique ID to avoid conflicts
      canvas.width = 128;
      canvas.height = 128;
      canvas.style.position = 'absolute';
      canvas.style.left = '-9999px';
      canvas.style.top = '-9999px';
      document.body.appendChild(canvas);
      
      // Try to get WebGL context
      let gl;
      try {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      } catch (e) {
        results.errors.push(`Error creating WebGL context: ${e.message}`);
        document.body.removeChild(canvas); // Clean up
        return results;
      }
      
      if (!gl) {
        results.errors.push("Failed to create WebGL context");
        document.body.removeChild(canvas); // Clean up
        return results;
      }
      
      results.contextCreated = true;
      
      // Get WebGL info
      try {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          results.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          results.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        } else {
          results.vendor = gl.getParameter(gl.VENDOR);
          results.renderer = gl.getParameter(gl.RENDERER);
        }
        
        results.version = gl.getParameter(gl.VERSION);
        results.shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
        
        // Get extension list
        const extensions = gl.getSupportedExtensions();
        results.extensions = extensions || [];
        
        // Get maximum parameters
        results.maxParams = {
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
          maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
          maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
          maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
          maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)
        };
      } catch (e) {
        results.errors.push(`Error getting WebGL parameters: ${e.message}`);
      }
      
      // Test actual drawing capability
      try {
        // Clear the canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Create a simple shader program
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, 'attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }');
        gl.compileShader(vertexShader);
        
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, 'precision mediump float; void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }');
        gl.compileShader(fragmentShader);
        
        // Check for shader compile errors
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
          results.errors.push(`Vertex shader compile error: ${gl.getShaderInfoLog(vertexShader)}`);
        }
        
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
          results.errors.push(`Fragment shader compile error: ${gl.getShaderInfoLog(fragmentShader)}`);
        }
        
        // Create program and link shaders
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          results.errors.push(`Program link error: ${gl.getProgramInfoLog(program)}`);
        }
        
        gl.useProgram(program);
        
        // Set up a simple triangle
        const positionLocation = gl.getAttribLocation(program, 'position');
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          -0.5, -0.5,
           0.5, -0.5,
           0.0,  0.5
        ]), gl.STATIC_DRAW);
        
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Draw the triangle
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        
        // Clean up
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      } catch (e) {
        results.errors.push(`Error during drawing test: ${e.message}`);
      }
      
      // Force context loss to see if we get an error
      if (gl.getExtension('WEBGL_lose_context')) {
        try {
          gl.getExtension('WEBGL_lose_context').loseContext();
        } catch (e) {
          results.errors.push(`Context loss test error: ${e.message}`);
        }
      }
      
      // Clean up by removing the temporary canvas
      try {
        document.body.removeChild(canvas);
      } catch (e) {
        console.warn("Could not remove temporary WebGL test canvas:", e);
      }
      
    } catch (e) {
      results.errors.push(`Unexpected error in WebGL testing: ${e.message}`);
    }
    
    return results;
  }
  
  // Run the test
  const results = testWebGL();
  
  // Log the results
  console.log("🔍 WebGL Test Results:", {
    supported: results.webglSupport ? "✅ YES" : "❌ NO",
    contextCreation: results.contextCreated ? "✅ SUCCESS" : "❌ FAILED",
    renderer: results.renderer,
    vendor: results.vendor,
    version: results.version,
    shadingLanguage: results.shadingLanguageVersion,
    maxTextureSize: results.maxParams.maxTextureSize,
    errors: results.errors.length > 0 ? results.errors : "None"
  });
  
  // More detailed logging
  if (results.extensions && results.extensions.length > 0) {
    console.log("🔍 WebGL Extensions:", results.extensions.length, "available");
    
    // Log critical extensions for THREE.js
    const criticalExtensions = [
      'OES_texture_float',
      'OES_texture_half_float',
      'WEBGL_depth_texture', 
      'OES_standard_derivatives',
      'OES_element_index_uint'
    ];
    
    console.log("🔍 Critical extensions for THREE.js:");
    criticalExtensions.forEach(ext => {
      const supported = results.extensions.includes(ext);
      console.log(`   ${supported ? '✓' : '✗'} ${ext}`);
    });
  }
  
  // Check for software rendering
  if (results.renderer && (
      results.renderer.toLowerCase().includes('swiftshader') || 
      results.renderer.toLowerCase().includes('llvmpipe') ||
      results.renderer.toLowerCase().includes('software') ||
      results.renderer.toLowerCase().includes('mesa')
    )) {
    console.warn("⚠️ WARNING: WebGL is using software rendering!");
    
    // Add a notification to the page
    window.addEventListener('DOMContentLoaded', () => {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 5px;
        left: 5px;
        background: rgba(255,255,0,0.8);
        color: black;
        padding: 5px 10px;
        border-radius: 5px;
        font-family: sans-serif;
        font-size: 12px;
        z-index: 10000;
        pointer-events: none;
      `;
      notification.textContent = "⚠️ WebGL using software renderer. Enable hardware acceleration for better performance.";
      notification.setAttribute('data-webgl-warning', 'true');
      document.body.appendChild(notification);
    });
  }
  
  // Handle complete failures with visible error if needed
  let webglErrorElement = null;
  if (!results.contextCreated) {
    window.addEventListener('DOMContentLoaded', () => {
      // Are there already any WebGL error messages on the page?
      if (!document.querySelector('[data-webgl-error="true"]')) {
        webglErrorElement = document.createElement('div');
        webglErrorElement.setAttribute('data-webgl-error', 'true');
        webglErrorElement.setAttribute('id', 'webgl-error-message');
        webglErrorElement.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.9);
          color: #ff5555;
          padding: 20px;
          border-radius: 5px;
          font-family: sans-serif;
          max-width: 80%;
          text-align: center;
          z-index: 10000;
        `;
        webglErrorElement.innerHTML = `
          <h3>WebGL Not Available</h3>
          <p>Your browser doesn't support WebGL, which is required for 3D graphics.</p>
          <p>Try these fixes:</p>
          <ul style="text-align: left; margin: 10px 0; padding-left: 20px;">
            <li style="margin: 5px 0;"><a href="https://get.webgl.org/" target="_blank" style="color: #ff8888;">Use Chrome or Firefox (latest version)</a></li>
            <li style="margin: 5px 0;">Update your graphics drivers</li>
            <li style="margin: 5px 0;">Enable hardware acceleration in your browser settings</li>
            <li style="margin: 5px 0;">Disable tracking protection or content blockers</li>
          </ul>
          <p style="font-size: 0.8em; color: #888;">Details: ${results.errors[0] || "Unexpected error in WebGL testing"}</p>
        `;
        document.body.appendChild(webglErrorElement);
      }
    });
  }
  
  // Add a function to remove any error messages when WebGL becomes available
  // This helps when WebGL fails at first but works after fallback
  window.removeWebGLErrorMessage = function() {
    const errorMessage = document.querySelector('[data-webgl-error="true"]');
    if (errorMessage) {
      console.log("🔍 WebGL became available, removing error message");
      errorMessage.style.display = 'none';
      setTimeout(() => {
        try {
          errorMessage.parentNode.removeChild(errorMessage);
        } catch (e) {
          // Element already removed, ignore
        }
      }, 1000);
    }
  };
  
  // Listen for successful WebGL initialization from THREE.js
  window.addEventListener('threeReady', () => {
    // Wait a bit to make sure THREE is fully initialized
    setTimeout(() => {
      const hasFallbackCanvas = !!document.getElementById('morphing-poly-canvas-fallback');
      const canvasWorking = !!document.querySelector('canvas[data-engine="three.js r174"]');
      
      if (hasFallbackCanvas || canvasWorking) {
        console.log("🔍 WebGL is working through THREE.js, removing error message");
        window.removeWebGLErrorMessage();
      }
    }, 1000);
  });
  
  // Also listen for successful renderer creation 
  window.addEventListener('webglRendererCreated', () => {
    console.log("🔍 WebGL renderer created event received, removing error message");
    window.removeWebGLErrorMessage();
  });
  
  // Store the results for other scripts to access
  window.__WEBGL_TEST_RESULTS = results;
})(); 