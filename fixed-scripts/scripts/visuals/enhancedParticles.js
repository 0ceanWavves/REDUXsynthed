/**
 * Enhanced Galaxy Particle System
 * Creates a larger, swirly galaxy-like particle effect
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';
import * as C from '../constants.js';

/**
 * Creates a high-quality circular texture for particles with a soft glow
 * @param {Object} THREE - The Three.js library instance
 * @param {Number} size - Size of the texture
 * @returns {THREE.Texture} The created texture
 */
function createGalaxyParticleTexture(THREE, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return new THREE.Texture();

  // Clear canvas
  ctx.clearRect(0, 0, size, size);
  
  // Create a more sophisticated gradient for a better glow effect
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(0.6, 'rgba(180,180,255,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;
  
  return texture;
}

/**
 * Creates an enhanced galaxy-like particle system with swirling motion
 * @param {THREE.Scene} scene - The scene to add particles to
 * @param {Object} THREE - The Three.js library instance
 * @returns {Object} The created particle system and update function
 */
export function createGalaxyParticles(scene, THREEInstance) {
  const LocalTHREE = THREEInstance || THREE;
  
  if (!LocalTHREE || !scene) {
    console.error("THREE instance and scene are required for galaxy particles.");
    return null;
  }
  
  try {
    // Use constants for particle count
    const particleCount = window.innerWidth < 768 ? 
      C.GALAXY_PARTICLE_COUNT_MOBILE : 
      C.GALAXY_PARTICLE_COUNT_DESKTOP;
    
    // Create particle geometry
    const particleGeometry = new LocalTHREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);
    const radiusArray = new Float32Array(particleCount);
    const randomValues = new Float32Array(particleCount);
    
    // Set color palette for galaxy particles from constants
    const galaxyColors = C.GALAXY_PARTICLE_COLORS.map(color => new LocalTHREE.Color(color));
    
    // Use constants for galaxy parameters
    const diskThickness = C.GALAXY_DISK_THICKNESS;
    const galaxyRadius = window.innerWidth < 768 ? 
      C.GALAXY_RADIUS_MOBILE : 
      C.GALAXY_RADIUS_DESKTOP;
    const armCount = C.GALAXY_ARM_COUNT;
    const armWidth = 0.8; // Keep this as a local parameter for fine-tuning
    const revolutions = C.GALAXY_REVOLUTIONS;
    
    const tempColor = new LocalTHREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Create a spiral galaxy distribution
      // Random radius with higher concentration toward center
      const radius = Math.pow(Math.random(), 0.5) * galaxyRadius;
      radiusArray[i] = radius;
      
      // Random angle for position on the disk plus spiral arm offset
      const armAngle = (Math.floor(Math.random() * armCount) * Math.PI * 2) / armCount;
      const spiralOffset = (radius / galaxyRadius) * revolutions * Math.PI * 2;
      const theta = armAngle + spiralOffset;
      angles[i] = theta;
      
      // Add random variation in arm width
      const randomAngleOffset = (Math.random() * 2 - 1) * armWidth * (1 - radius / galaxyRadius);
      const finalAngle = theta + randomAngleOffset;
      
      // Set position using cylindrical coordinates (with slight z-variation for thickness)
      positions[i3] = Math.cos(finalAngle) * radius;
      positions[i3 + 1] = (Math.random() * 2 - 1) * diskThickness * (1 - radius / galaxyRadius * 0.5);
      positions[i3 + 2] = Math.sin(finalAngle) * radius;
      
      // Vary particle size based on radius (larger towards center)
      const sizeScale = 1 - (radius / galaxyRadius * 0.6);
      const particleSize = window.innerWidth < 768 ? 
        (C.PARTICLE_SIZE_MIN_MOBILE + Math.random() * (C.PARTICLE_SIZE_MAX_MOBILE - C.PARTICLE_SIZE_MIN_MOBILE)) * sizeScale * 2 : 
        (C.PARTICLE_SIZE_MIN_DESKTOP + Math.random() * (C.PARTICLE_SIZE_MAX_DESKTOP - C.PARTICLE_SIZE_MIN_DESKTOP)) * sizeScale * 2;
      sizes[i] = particleSize;
      
      // Color variation based on radius and angle
      const colorIndex = Math.floor(Math.random() * galaxyColors.length);
      const nextColorIndex = (colorIndex + 1) % galaxyColors.length;
      const colorMix = Math.random();
      tempColor.lerpColors(galaxyColors[colorIndex], galaxyColors[nextColorIndex], colorMix);
      
      // Apply color
      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;
      
      // Store random values for animation
      randomValues[i] = Math.random();
    }
    
    // Set buffer attributes
    particleGeometry.setAttribute('position', new LocalTHREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('size', new LocalTHREE.BufferAttribute(sizes, 1));
    // IMPORTANT: Use 'customColor' instead of 'color' to avoid attribute redefinition in shader
    particleGeometry.setAttribute('customColor', new LocalTHREE.BufferAttribute(colors, 3));
    
    // Store additional attributes in userData for animation
    particleGeometry.userData = {
      angles,
      radiusArray,
      randomValues
    };
    
    // Create particle texture
    const particleTexture = createGalaxyParticleTexture(LocalTHREE, 128);
    
    // Create shader material for more advanced rendering
    const particleMaterial = new LocalTHREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointTexture: { value: particleTexture }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        
        uniform float time;
        
        void main() {
          vColor = customColor;
          
          // Calculate point size based on distance from camera
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        
        void main() {
          float alpha = texture2D(pointTexture, gl_PointCoord).a;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      blending: LocalTHREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true
    });

    // Add shader fix for reliable GL extensions
    particleMaterial.onBeforeCompile = function(shader) {
      // Ensure any shader extensions are properly placed at the beginning
      if (shader.fragmentShader.includes('GL_OES_standard_derivatives')) {
        // Clean up any existing extensions
        shader.fragmentShader = shader.fragmentShader.replace(
          /#extension\s+GL_OES_standard_derivatives\s*:\s*enable/g, 
          ''
        );
        // Add it at the very beginning
        shader.fragmentShader = '#extension GL_OES_standard_derivatives : enable\n' + shader.fragmentShader;
      }
    };
    
    // Create particle system
    const particleSystem = new LocalTHREE.Points(particleGeometry, particleMaterial);
    particleSystem.name = "galaxyParticleSystem";
    particleSystem.renderOrder = -2; // Render behind other objects
    scene.add(particleSystem);
    
    console.log(`✨ Enhanced galaxy particle system created with ${particleCount} particles.`);
    
    // Animation function to update particle positions
    const updateParticles = (deltaTime) => {
      if (!particleSystem) return;
      
      // Update time uniform for shader
      particleMaterial.uniforms.time.value += deltaTime;
      
      // Get position attribute for updating
      const positions = particleGeometry.getAttribute('position');
      
      // Get stored animation data
      const { angles, radiusArray, randomValues } = particleGeometry.userData;
      
      // Different rotation speeds based on radius - inner particles move faster
      const baseRotationSpeed = C.GALAXY_ROTATION_SPEED * deltaTime;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Calculate rotation speed - inner particles rotate faster
        const radiusFactor = 1 - radiusArray[i] / galaxyRadius;
        const rotationSpeed = baseRotationSpeed * (1 + radiusFactor * 4);
        
        // Update angle
        angles[i] += rotationSpeed * (0.5 + randomValues[i] * 0.5);
        
        // Update position based on new angle
        positions.array[i3] = Math.cos(angles[i]) * radiusArray[i];
        positions.array[i3 + 2] = Math.sin(angles[i]) * radiusArray[i];
        
        // Add some subtle vertical movement
        positions.array[i3 + 1] += Math.sin(angles[i] * 2 + randomValues[i] * 10) * 0.001;
      }
      
      // Mark position attribute as needing update
      positions.needsUpdate = true;
    };
    
    return { particleSystem, updateParticles };
    
  } catch (error) {
    console.error("Error creating galaxy particles:", error);
    return null;
  }
} 