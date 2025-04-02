/**
 * Simple Fallback for Browsers with Limited WebGL Support
 * This script creates a basic 3D visualization that works on most devices
 */
(function() {
  // Create basic THREE.js scene when called
  window.createSimpleFallback = function() {
    console.log("Creating simple fallback visualization...");
    
    // Try to get THREE globally or from our loader
    const THREE = window.THREE || window.GLOBAL_THREE || (window.getThreeJS && window.getThreeJS());
    
    if (!THREE) {
      console.error("THREE.js not available for fallback");
      return;
    }
    
    // Get canvas element
    const canvas = document.getElementById('morphing-poly-canvas');
    if (!canvas) {
      console.error("Canvas element not found for fallback");
      return;
    }
    
    // Create basic scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer with minimal settings
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false, // Disable for better performance
      alpha: true,
      powerPreference: 'low-power', // Use less power
      precision: 'lowp' // Use low precision for better compatibility
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Create a simple shape
    const geometry = new THREE.IcosahedronGeometry(2, 0);
    const material = new THREE.MeshBasicMaterial({
      color: 0x3366cc,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Add some particles for background effect
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 10;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x88aaff,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    // Animation function
    function animate() {
      const time = performance.now() * 0.001;
      
      mesh.rotation.x = time * 0.2;
      mesh.rotation.y = time * 0.3;
      
      particles.rotation.x = time * 0.05;
      particles.rotation.y = time * 0.03;
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    
    // Handle window resize
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    }
    
    window.addEventListener('resize', handleResize);
    
    // Start animation
    animate();
    
    console.log("Simple fallback visualization active");
    
    // Hide loading screen if it exists
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }, 1000);
    }
    
    return { scene, camera, renderer, mesh, particles };
  };
  
  // Initialize on load if specific flag is set
  document.addEventListener('DOMContentLoaded', function() {
    // Check for forced fallback flag
    if (window.FORCE_WEBGL_FALLBACK) {
      window.createSimpleFallback();
    }
  });
  
  // Also listen for shader errors to automatically activate
  window.addEventListener('webgl-shader-error', function() {
    console.log("WebGL shader error detected, activating fallback");
    window.createSimpleFallback();
  });
})();
