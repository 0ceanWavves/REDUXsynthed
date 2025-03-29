// Three.js loader script
// This script creates a global THREE object from the ES module import
// Helps with backwards compatibility for scripts that expect THREE globally

import * as THREE from 'three';
window.THREE = THREE;

console.log('Three.js global object initialized successfully.');
