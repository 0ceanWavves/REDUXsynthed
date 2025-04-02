/**
 * THREE.js Health Check Script
 * This script diagnoses THREE.js-related issues on the page
 */

(function() {
  console.log("THREE.js Health Check: Starting...");
  
  // Wait for DOMContentLoaded to ensure the page is ready
  window.addEventListener('DOMContentLoaded', function() {
    // Give a bit of time for scripts to initialize
    setTimeout(runHealthCheck, 1000);
  });
  
  function runHealthCheck() {
    console.log("THREE.js Health Check: Running diagnostics...");
    
    // Check 1: Is THREE defined?
    if (typeof THREE === 'undefined') {
      console.error("THREE.js Health Check: THREE is not defined! This is a critical issue.");
      reportIssue("THREE.js is not loaded or not globally available");
      // tryToFixTHREE(); // <<< COMMENT OUT THIS LINE
      return;
    }
    
    console.log("THREE.js Health Check: THREE is defined, version:", THREE.REVISION);
    
    // Check 2: Are key THREE components available?
    const checks = [
      { name: "Scene", prop: "Scene" },
      { name: "WebGLRenderer", prop: "WebGLRenderer" },
      { name: "Mesh", prop: "Mesh" },
      { name: "BoxGeometry", prop: "BoxGeometry" },
      { name: "MeshBasicMaterial", prop: "MeshBasicMaterial" },
      { name: "ShaderMaterial", prop: "ShaderMaterial" },
      { name: "ShaderChunk", prop: "ShaderChunk" }
    ];
    
    let allPassed = true;
    
    checks.forEach(check => {
      if (typeof THREE[check.prop] === 'undefined') {
        console.error(`THREE.js Health Check: ${check.name} is missing!`);
        allPassed = false;
        reportIssue(`${check.name} component is missing from THREE.js`);
      }
    });
    
    if (allPassed) {
      console.log("THREE.js Health Check: All component checks passed!");
    }
    
    // Check 3: Can we create a simple scene?
    try {
      // Create a minimal THREE.js scene
      const scene = new THREE.Scene();
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      console.log("THREE.js Health Check: Successfully created a simple scene");
    } catch (error) {
      console.error("THREE.js Health Check: Failed to create a simple scene:", error);
      reportIssue(`Failed to create a THREE.js scene: ${error.message}`);
    }
    
    // Check 4: Can we create a renderer?
    try {
      // Try to create a renderer (but don't actually render)
      const testRenderer = new THREE.WebGLRenderer({ alpha: true });
      testRenderer.setSize(1, 1); // Tiny size for testing
      console.log("THREE.js Health Check: Successfully created a WebGLRenderer");
      
      // Clean up
      testRenderer.dispose();
    } catch (error) {
      console.error("THREE.js Health Check: Failed to create a WebGLRenderer:", error);
      reportIssue(`Failed to create a WebGLRenderer: ${error.message}`);
    }
    
    // Check 5: Look for specific error patterns in the console
    console.log("THREE.js Health Check: Checking for known error patterns...");
    
    // We can't directly access previous console messages, but we can check if our fix scripts reported issues
    if (window.__shaderErrorsDetected) {
      console.warn("THREE.js Health Check: Shader errors were detected and handled");
    }
    
    // Check 6: Check for specific 3D elements on the page
    console.log("THREE.js Health Check: Checking for 3D elements on the page...");
    
    // Check for empty or hidden canvases
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach((canvas, index) => {
      const width = canvas.width || canvas.clientWidth;
      const height = canvas.height || canvas.clientHeight;
      
      if (width === 0 || height === 0) {
        console.warn(`THREE.js Health Check: Canvas #${index} has zero dimensions`);
        reportIssue(`Canvas element has zero dimensions: ${canvas.id || 'unnamed'}`);
      }
      
      const style = window.getComputedStyle(canvas);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        console.warn(`THREE.js Health Check: Canvas #${index} is hidden via CSS`);
        reportIssue(`Canvas element is hidden by CSS: ${canvas.id || 'unnamed'}`);
      }
    });
    
    // Check AmorphousPrism component
    const morphCanvas = document.getElementById('morphing-poly-canvas');
    if (!morphCanvas) {
      console.error("THREE.js Health Check: morphing-poly-canvas not found!");
      reportIssue("Primary 3D canvas 'morphing-poly-canvas' is missing");
    } else {
      console.log("THREE.js Health Check: morphing-poly-canvas found");
    }
    
    // Check ServiceTiles
    if (window.serviceTiles) {
      console.log("THREE.js Health Check: ServiceTiles component is initialized");
    } else {
      console.warn("THREE.js Health Check: ServiceTiles component is not initialized");
      reportIssue("ServiceTiles component is not initialized");
    }
    
    console.log("THREE.js Health Check: Diagnostic complete");
  }
  
  function reportIssue(message) {
    // Log issue to a consistent format for easier searching
    console.error(`[THREE.js ISSUE]: ${message}`);
    
    // Store issues in a global array for other scripts to access
    window.__threeJsIssues = window.__threeJsIssues || [];
    window.__threeJsIssues.push(message);
  }
  
  function tryToFixTHREE() {
    console.log("THREE.js Health Check: Attempting to fix THREE.js...");
    
    // Load THREE.js if it's not already loaded
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.150.1/three.min.js";
    
    script.onload = function() {
      console.log("THREE.js Health Check: Successfully loaded THREE.js");
      window.THREE = THREE;
      
      // Re-run health check
      setTimeout(runHealthCheck, 500);
    };
    
    script.onerror = function() {
      console.error("THREE.js Health Check: Failed to load THREE.js");
    };
    
    document.head.appendChild(script);
  }
})();
