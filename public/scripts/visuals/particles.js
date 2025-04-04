// public/scripts/visuals/particles.js
// import * as THREE from 'three'; // Assuming THREE is globally available
import * as C from '../constants.js';

// Internal helper function
function createCircleTexture(THREE, size = 128) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
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
  texture.format = THREE.RGBAFormat; // Use RGBA for alpha gradient
  texture.needsUpdate = true;
  return texture;
}

export function createParticleSystem(isMobile) {
  if (!window.THREE) throw new Error("THREE not available for particle system.");
  const THREE = window.THREE;

  const particleCount = isMobile ? C.PARTICLE_COUNT_MOBILE : C.PARTICLE_COUNT_DESKTOP;
  const atmosphereRadius = isMobile ? C.PARTICLE_RADIUS_MOBILE : C.PARTICLE_RADIUS_DESKTOP;
  const particleTexture = createCircleTexture(THREE);
  if (!particleTexture) {
      console.warn("Could not create particle texture.");
      return null; // Or handle error appropriately
  }

  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const colorAttributes = new Float32Array(particleCount * 3);
  const initialRadii = new Float32Array(particleCount);

  const color1 = new THREE.Color(C.PARTICLE_COLOR_1);
  const color2 = new THREE.Color(C.PARTICLE_COLOR_2);
  const sizeMin = isMobile ? C.PARTICLE_SIZE_MIN_MOBILE : C.PARTICLE_SIZE_MIN_DESKTOP;
  const sizeRange = (isMobile ? C.PARTICLE_SIZE_MAX_MOBILE : C.PARTICLE_SIZE_MAX_DESKTOP) - sizeMin;


  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Fibonacci sphere distribution
     const y = 1 - (i / (particleCount - 1)) * 2;
     const baseRadius = Math.sqrt(1 - y * y);
     const randomFactor = (0.8 + Math.random() * 0.4);
     const particleInitialRadius = baseRadius * atmosphereRadius * randomFactor;
     initialRadii[i] = particleInitialRadius;

     const theta = (Math.PI * (3 - Math.sqrt(5))) * i;
     positions[i3] = particleInitialRadius * Math.cos(theta) / (baseRadius || 1);
     positions[i3 + 1] = y * atmosphereRadius * randomFactor;
     positions[i3 + 2] = particleInitialRadius * Math.sin(theta) / (baseRadius || 1);

    sizes[i] = sizeMin + Math.random() * sizeRange;

    // Interpolate color
    const lerpFactor = Math.random();
    const color = new THREE.Color().lerpColors(color1, color2, lerpFactor);
    colorAttributes[i3] = color.r;
    colorAttributes[i3 + 1] = color.g;
    colorAttributes[i3 + 2] = color.b;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  particleGeometry.setAttribute('customColor', new THREE.BufferAttribute(colorAttributes, 3));

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0.0 },
        pointTexture: { value: particleTexture },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      uniform float uTime;

      void main() {
        vColor = customColor;
        vec3 pos = position;

        float angle = atan(pos.x, pos.z) + uTime * 0.2;
        float radius = length(pos.xz);
        vec3 animatedPos = pos;
        animatedPos.x = cos(angle) * radius + sin(pos.y * 1.5 + uTime * 0.6) * 0.1;
        animatedPos.z = sin(angle) * radius + cos(pos.x * 1.5 + uTime * 0.5) * 0.1;
        animatedPos.y += sin(length(pos) * 0.5 + uTime * 0.7) * 0.15;

        vec4 mvPosition = modelViewMatrix * vec4(animatedPos, 1.0);
        gl_PointSize = size * (400.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      void main() {
        float alpha = texture2D(pointTexture, gl_PointCoord).a;
        if (alpha < 0.05) discard;
        gl_FragColor = vec4(vColor, alpha * 0.9);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    vertexColors: true
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  particleSystem.name = "particleSystem";

  console.log("✨ Particle system created");
  return { system: particleSystem, material: particleMaterial, geometry: particleGeometry, initialRadii: initialRadii };
} 