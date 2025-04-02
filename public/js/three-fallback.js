/**
 * THREE.js Fallback Loader
 * This script ensures THREE.js is properly loaded and globally available
 */

// (function() { // <<< COMMENT OUT START
  console.log("THREE.js Fallback: Checking if THREE is available...");
  
  // Check if THREE is globally available
  if (typeof THREE === 'undefined') {
    console.warn("THREE.js not found, loading from CDN...");
    
    // Create a script element to load THREE.js
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.150.1/three.min.js";
    script.async = false; // Load synchronously
    
    // When the script loads, make THREE globally available
    script.onload = function() {
      console.log("THREE.js loaded from fallback, version:", THREE.REVISION);
      window.THREE = THREE;
      
      // Dispatch an event to notify other scripts
      window.dispatchEvent(new CustomEvent('three-loaded', {
        detail: { version: THREE.REVISION }
      }));
    };
    
    // Handle errors
    script.onerror = function() {
      console.error("Failed to load THREE.js from CDN");
    };
    
    // Add the script to the document
    document.head.appendChild(script);
  } else {
    console.log("THREE.js already loaded, version:", THREE.REVISION);
    
    // Ensure THREE is globally available
    window.THREE = THREE;
  }
  
  // Helper function to check if THREE has necessary features
  function validateTHREE() {
    if (typeof THREE === 'undefined') return false;
    
    // Check for key THREE components
    const hasSceneAPI = typeof THREE.Scene === 'function';
    const hasMeshAPI = typeof THREE.Mesh === 'function';
    const hasWebGLRenderer = typeof THREE.WebGLRenderer === 'function';
    
    return hasSceneAPI && hasMeshAPI && hasWebGLRenderer;
  }
  
  // Periodically check that THREE is properly loaded
  let checkCount = 0;
  const maxChecks = 10;
  
  function checkTHREE() {
    if (validateTHREE()) {
      console.log("THREE.js validation successful");
      return;
    }
    
    checkCount++;
    if (checkCount < maxChecks) {
      console.warn(`THREE.js not fully initialized, retrying... (${checkCount}/${maxChecks})`);
      setTimeout(checkTHREE, 500);
    } else {
      console.error("THREE.js validation failed after multiple attempts");
    }
  }
  
  // Start validation after a short delay
  setTimeout(checkTHREE, 1000);
  
  // Create a backup global THREEJS variable just in case
  window.THREEJS = window.THREE;
// })(); // <<< COMMENT OUT END
