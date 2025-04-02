/**
 * fallback-morph.js - Simple THREE.js animated object as fallback
 */

(function() {
  // Only run if THREE.js is available
  if (typeof THREE === 'undefined') {
    console.warn('THREE is not defined - fallback morph cannot run');
    return;
  }
  
  // Check if the main visualization is already running
  if (window.__AMORPHOUS_PRISM_RUNNING) {
    console.log('Main AmorphousPrism is running, skipping fallback');
    return;
  }
  
  // Check if canvas exists
  const canvas = document.getElementById('morphing-poly-canvas');
  if (!canvas) {
    console.warn('Canvas not found - fallback morph cannot run');
    return;
  }
  
  console.log('Initializing fallback morphing object');
  
  // Hide loading indicator if present
  const loadingIndicator = document.getElementById('morphing-poly-loading');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  // Set up scene, camera, renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05030d');
  
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 4;
  
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Create simple object (icosahedron)
  const geometry = new THREE.IcosahedronGeometry(1.3, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Create a simple animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the mesh
    mesh.rotation.x += 0.003;
    mesh.rotation.y += 0.004;
    
    // Pulse the wireframe opacity
    material.opacity = 0.5 + Math.sin(Date.now() * 0.001) * 0.3;
    
    // Render the scene
    renderer.render(scene, camera);
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  // Start the animation
  animate();
  
  console.log('Fallback morphing object initialized');
})(); 