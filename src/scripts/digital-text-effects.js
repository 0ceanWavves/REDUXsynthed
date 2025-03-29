// 3D text effects using Three.js for Digital Solutions text
document.addEventListener('DOMContentLoaded', () => {
  // Wait for the Digital Solutions text to be fully animated
  setTimeout(() => {
    initTextEffects();
  }, 1500); // Wait for letter animation to complete
});

function initTextEffects() {
  // Get the Digital Solutions text element
  const digitalSolutionsElement = document.querySelector('.digital-solutions-text');
  if (!digitalSolutionsElement) return;
  
  // Get element position for placing the canvas
  const rect = digitalSolutionsElement.getBoundingClientRect();
  
  // Create a container for our Three.js canvas
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = `${rect.top}px`;
  container.style.left = `${rect.left}px`;
  container.style.width = `${rect.width}px`;
  container.style.height = `${rect.height}px`;
  container.style.zIndex = '74'; // Below the text
  container.style.pointerEvents = 'none';
  container.id = 'digital-text-3d-container';
  
  // Append container to the body
  document.body.appendChild(container);
  
  // Setup Three.js
  const scene = new THREE.Scene();
  
  // Create a camera
  const camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000);
  camera.position.z = 5;
  
  // Create renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(rect.width, rect.height);
  renderer.setClearColor(0x000000, 0); // Transparent background
  container.appendChild(renderer.domElement);
  
  // Create a particle system for the glowing effect
  const particleCount = 50;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  // Create particle positions distributed around the text area
  for (let i = 0; i < particleCount; i++) {
    // Distribute particles in a curved shape around where the text would be
    const x = (Math.random() - 0.5) * rect.width * 0.01;
    const y = (Math.random() - 0.5) * rect.height * 0.1;
    const z = (Math.random() - 0.5) * 2;
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    // Vary the size of particles
    sizes[i] = Math.random() * 0.05 + 0.02;
  }
  
  // Set particle positions and sizes
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Create shader material for particles
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0x00e599) }, // Matching the text color
    },
    vertexShader: `
      attribute float size;
      uniform float time;
      
      void main() {
        vec3 pos = position;
        
        // Simple sine wave movement
        pos.x += sin(time * 0.5 + position.z * 10.0) * 0.1;
        pos.y += cos(time * 0.3 + position.x * 10.0) * 0.05;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      
      void main() {
        // Create circular particles with smooth edges
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        float alpha = smoothstep(0.5, 0.3, dist);
        
        gl_FragColor = vec4(color, alpha * 0.5); // Semi-transparent
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
  });
  
  // Create the particle system
  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem);
  
  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    
    // Update time uniform for shader animation
    particleMaterial.uniforms.time.value += 0.01;
    
    // Slightly rotate the particle system
    particleSystem.rotation.x += 0.001;
    particleSystem.rotation.y += 0.002;
    
    renderer.render(scene, camera);
  };
  
  // Start animation
  animate();
  
  // Handle window resize and scroll events
  function updatePosition() {
    const updatedRect = digitalSolutionsElement.getBoundingClientRect();
    
    // Update container position
    container.style.top = `${updatedRect.top}px`;
    container.style.left = `${updatedRect.left}px`;
    container.style.width = `${updatedRect.width}px`;
    container.style.height = `${updatedRect.height}px`;
    
    // Update renderer size
    renderer.setSize(updatedRect.width, updatedRect.height);
    
    // Update camera aspect ratio
    camera.aspect = updatedRect.width / updatedRect.height;
    camera.updateProjectionMatrix();
  }
  
  // Add event listeners for resize and scroll
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition);
}
