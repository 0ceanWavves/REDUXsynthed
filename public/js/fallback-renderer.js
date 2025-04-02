/**
 * Fallback Renderer for WebGL
 * 
 * This script provides a basic visualization fallback when shader compilation fails
 */

window.createFallbackRenderer = function(options) {
  const { THREE, canvas, colors } = options;
  
  if (!THREE || !canvas) {
    console.error("Fallback renderer needs THREE and canvas");
    return null;
  }
  
  console.log("Creating fallback renderer with basic materials");
  
  // Create the renderer
  const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  
  // Configure renderer
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  
  // Create scene
  const scene = new THREE.Scene();
  
  // Create camera
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  
  // Create a simple shape - no fancy shader materials
  const geometry = new THREE.IcosahedronGeometry(2, 0);
  const material = new THREE.MeshBasicMaterial({
    color: colors?.shape1 || 0x3366cc,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });
  
  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
  // Add some simple shapes in the background
  const shapes = [];
  const shapeGeos = [
    new THREE.TetrahedronGeometry(0.5),
    new THREE.BoxGeometry(0.4, 0.4, 0.4),
    new THREE.OctahedronGeometry(0.4)
  ];
  
  // Add particles
  const particleCount = 100;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 10;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 10;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 10;
  }
  
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: colors?.particle1 || 0x88aaff,
    size: 0.05,
    transparent: true,
    opacity: 0.7
  });
  
  const particles = new THREE.Points(particleGeo, particleMaterial);
  scene.add(particles);
  
  // Add background shapes
  for (let i = 0; i < 5; i++) {
    const geo = shapeGeos[Math.floor(Math.random() * shapeGeos.length)];
    const mat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? colors?.shape1 : colors?.shape2 || 0x5588ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    const shape = new THREE.Mesh(geo, mat);
    shape.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 4 - 2
    );
    shape.scale.setScalar(0.5 + Math.random() * 1.5);
    scene.add(shape);
    shapes.push(shape);
  }
  
  // Add ambient light
  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);
  
  // Animation function
  function animate() {
    const time = performance.now() * 0.001;
    
    // Rotate main shape
    mesh.rotation.x = time * 0.2;
    mesh.rotation.y = time * 0.4;
    
    // Animate background shapes
    shapes.forEach((shape, i) => {
      shape.rotation.x = time * 0.1 * (i % 2 + 1);
      shape.rotation.y = time * 0.2 * ((i % 3) + 1);
    });
    
    // Rotate particles
    particles.rotation.x = time * 0.05;
    particles.rotation.y = time * 0.02;
    
    // Render
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
  
  // Return the created objects
  return {
    scene,
    camera, 
    renderer,
    mesh,
    shapes,
    animate
  };
};

// Create a simple fallback when called directly
window.createSimpleFallback = function() {
  console.log("Creating simple fallback visualization");
  
  // Try to get THREE from global scope
  const THREE = window.THREE || window.GLOBAL_THREE;
  
  if (!THREE) {
    console.error("THREE.js not available for fallback renderer");
    return;
  }
  
  // Get canvas 
  const canvas = document.getElementById('morphing-poly-canvas');
  if (!canvas) {
    console.error("Canvas not found for fallback renderer");
    return;
  }
  
  // Default colors
  const colors = {
    shape1: new THREE.Color(0x3366cc),
    shape2: new THREE.Color(0x6633cc),
    wireframe: new THREE.Color(0xffffff),
    particle1: new THREE.Color(0x88aaff)
  };
  
  // Create fallback
  window.createFallbackRenderer({
    THREE,
    canvas,
    colors
  });
}; 