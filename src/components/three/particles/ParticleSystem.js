/**
 * ParticleSystem.js
 * Creates and manages particle effects for the prism visualization
 */

/**
 * Creates a circle texture for particles
 * @param {Object} THREE - The Three.js library instance
 * @param {Number} size - Size of the texture
 * @returns {THREE.Texture} The created texture
 */
function createCircleTexture(THREE, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return new THREE.Texture(); // Return blank if no context

  ctx.clearRect(0, 0, size, size);
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a particle system with glowing particles
 * @param {Object} THREE - The Three.js library instance
 * @param {Object} options - Configuration options
 * @returns {THREE.Points} The created particle system
 */
export function createParticleSystem(THREE, options) {
  const { colors, isMobile, config } = options;
  
  // Increase particle count
  const particleCount = isMobile ? 300 : 600;
  
  // Create particle geometry
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const colorAttributes = new Float32Array(particleCount * 3);
  
  // Create the particle texture
  const particleTexture = createCircleTexture(THREE);
  
  // Create particle distribution using Fibonacci sphere for more even distribution
  const atmosphereRadius = isMobile ? 3.0 : 3.5;
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Fibonacci sphere distribution for more even particle placement
    const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
    const radius = Math.sqrt(1 - y * y) * atmosphereRadius * (0.8 + Math.random() * 0.4);
    const theta = (Math.PI * (3 - Math.sqrt(5))) * i; // Golden angle increment
    
    positions[i3] = radius * Math.cos(theta);
    positions[i3 + 1] = y * atmosphereRadius * (0.8 + Math.random() * 0.4); // Add randomness to Y radius too
    positions[i3 + 2] = radius * Math.sin(theta);
    
    // Random size with mobile optimization, but larger overall
    sizes[i] = isMobile ? 
      (0.08 + Math.random() * 0.18) : 
      (0.05 + Math.random() * 0.15);
    
    // Interpolate between two colors
    const lerpFactor = Math.random();
    const color = new THREE.Color().lerpColors(colors.particle1, colors.particle2, lerpFactor);
    colorAttributes[i3] = color.r;
    colorAttributes[i3 + 1] = color.g;
    colorAttributes[i3 + 2] = color.b;
  }
  
  // Set geometry attributes
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  particleGeometry.setAttribute('customColor', new THREE.BufferAttribute(colorAttributes, 3));
  
  // Create enhanced particle shader material
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      pointTexture: { value: particleTexture }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 customColor;
      
      varying vec3 vColor;
      
      uniform float uTime;
      
      void main() {
        vColor = customColor;
        
        vec3 pos = position;
        
        // More dynamic movement - swirl + pulse
        float angle = atan(pos.x, pos.z) + uTime * 0.2;
        float radius = length(pos.xz);
        pos.x = cos(angle) * radius + sin(pos.y * 1.5 + uTime * 0.6) * 0.1;
        pos.z = sin(angle) * radius + cos(pos.x * 1.5 + uTime * 0.5) * 0.1;
        pos.y += sin(length(position) * 0.5 + uTime * 0.7) * 0.15; // Pulse in/out slightly
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (400.0 / -mvPosition.z); // Adjust sizing
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      
      void main() {
        float alpha = texture2D(pointTexture, gl_PointCoord).a;
        if (alpha < 0.05) discard; // Harder edge discard
        gl_FragColor = vec4(vColor, alpha * 0.9); // Slightly less intense alpha
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    vertexColors: true
  });
  
  // Add onBeforeCompile for reliable shader fixes
  particleMaterial.onBeforeCompile = function(shader) {
    // Check if fragment shader has derivatives extension
    if (shader.fragmentShader.includes('GL_OES_standard_derivatives')) {
      // Remove the existing extension directive
      shader.fragmentShader = shader.fragmentShader.replace(
        /#extension\s+GL_OES_standard_derivatives\s*:\s*enable/g, 
        ''
      );
      
      // Add it at the very beginning
      shader.fragmentShader = '#extension GL_OES_standard_derivatives : enable\n' + shader.fragmentShader;
    }
    
    // Store reference to modified shader
    particleMaterial.userData.shader = shader;
  };
  
  // Create and return the particle system
  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  particleSystem.name = "particleSystem";
  
  return particleSystem;
}
