/**
 * shaders.ts - WebGL shader utilities and fragment shaders
 * Centralizes shader code for reuse across components
 */

// Common vertex shader for most screen-space effects
export const commonVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Utility functions used across different shaders
export const shaderUtils = {
  // Simplified noise functions
  noise: `
    // Hash function for noise generation
    float hash(float n) { return fract(sin(n) * 1e4); }
    
    float hash(vec2 p) {
      return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
    }
    
    // Basic noise function
    float noise(vec2 x) {
      vec2 i = floor(x);
      vec2 f = fract(x);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    // Fractal Brownian Motion
    float fbm(vec2 x) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 3; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }
  `,
  
  // Star field generation
  stars: `
    // Create a starfield effect
    float stars(vec2 p, float seed, float time) {
      float v = 0.0;
      
      // Varied star sizes
      float size1 = 500.0;
      float size2 = 1000.0;
      float size3 = 2000.0;
      
      float t1 = floor(p.x * size1) + floor(p.y * size1);
      float t2 = floor(p.x * size2) + floor(p.y * size2);
      float t3 = floor(p.x * size3) + floor(p.y * size3);
      
      if(hash(t1 + seed) > 0.996) {
        v += 1.0 * (0.7 + 0.3 * sin(time * 3.0 + t1));
      }
      
      if(hash(t2 + seed) > 0.998) {
        v += 0.6 * (0.7 + 0.3 * sin(time * 2.0 + t2));
      }
      
      if(hash(t3 + seed) > 0.999) {
        v += 0.4 * (0.7 + 0.3 * sin(time * 1.0 + t3));
      }
      
      return v * v * v;
    }
  `,
  
  // Nebula effect
  nebula: `
    // Create a nebula-like cloudy effect
    vec3 nebula(vec2 uv, float seed, float time, vec3 color1, vec3 color2, vec3 color3) {
      vec2 p = uv * 4.0;
      
      // Create swirling patterns
      float speed = time * 0.05;
      vec2 turbulence = vec2(
        fbm(p + vec2(speed, speed * 0.5)),
        fbm(p + vec2(-speed * 0.7, speed * 0.3))
      );
      
      // Layer different FBM patterns with turbulence
      float n1 = fbm(p + turbulence + seed);
      float n2 = fbm(p + turbulence * 2.0 - seed);
      float n3 = fbm(p * 0.5 + turbulence * 0.5 + time * 0.1);
      
      // Combine patterns with varying intensities
      float nebulaPattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
      
      // Create color gradient based on the pattern
      vec3 nebulaColor = mix(
        color3,
        mix(color2, color1, n2),
        nebulaPattern
      );
      
      // Make areas darker
      nebulaColor *= nebulaPattern * 0.8;
      
      return nebulaColor;
    }
  `
};

// Flow background shader
export const flowBackgroundShader = {
  fragmentShader: `
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform float colorBlend;
    varying vec2 vUv;
    
    // Include utility functions
    ${shaderUtils.noise}
    
    // Include stars function
    ${shaderUtils.stars}
    
    // Include nebula function
    ${shaderUtils.nebula}
    
    void main() {
      vec2 uv = vUv;
      
      // Center coordinate for radial effect
      vec2 center = vec2(0.5);
      float dist = length(uv - center);
      
      // Time-based animation with multiple frequencies for pulsing
      float t = time * 0.2;
      
      // Create pulsing wave effect that radiates from center
      float pulseSpeed1 = 0.3;
      float pulseSpeed2 = 0.5;
      float pulseSpeed3 = 0.7;
      
      // Multiple pulse waves with different frequencies
      float pulse1 = sin(dist * 10.0 - t * pulseSpeed1 * 2.0) * 0.5 + 0.5;
      float pulse2 = sin(dist * 15.0 - t * pulseSpeed2 * 3.0) * 0.5 + 0.5;
      float pulse3 = sin(dist * 5.0 - t * pulseSpeed3) * 0.5 + 0.5;
      
      // Generate noise for organic feel
      vec2 noiseCoord = uv * 3.0 + vec2(t * 0.1, t * 0.05);
      float noisePattern = fbm(noiseCoord);
      
      // Add directional flow
      vec2 flowDir = vec2(cos(t*0.1), sin(t*0.1)) * 0.02;
      vec2 distortedUV = uv + flowDir * noisePattern;
      float flowNoise = fbm(distortedUV * 4.0 + t * 0.2);
      
      // Combine pulses and noise for final effect
      float finalPattern = pulse1 * 0.3 + pulse2 * 0.3 + pulse3 * 0.2 + flowNoise * 0.4;
      finalPattern = smoothstep(0.2, 0.8, finalPattern);
      
      // Create color gradient based on the pattern
      vec3 color;
      if (finalPattern < 0.4) {
        float t = finalPattern / 0.4;
        color = mix(color3, color2, t * colorBlend);
      } else if (finalPattern < 0.7) {
        float t = (finalPattern - 0.4) / 0.3;
        color = mix(color2, color1, t * colorBlend);
      } else {
        float t = (finalPattern - 0.7) / 0.3;
        color = mix(color1, vec3(1.0), t * 0.7 * colorBlend);
      }
      
      // Add subtle pulsing glow to entire page
      float globalPulse = sin(t * 0.5) * 0.5 + 0.5;
      color = mix(color, mix(color1, color2, sin(t * 0.3) * 0.5 + 0.5), globalPulse * 0.15);
      
      // Generate star field that covers the entire area
      float starsValue = stars(uv, 1.0, time);
      
      // Generate nebula-like texture for the background areas
      vec3 nebulaColor = nebula(uv, 5.0, time, color1, color2, color3);
      
      // Add focus effect in center (for prism visibility)
      float centerHole = smoothstep(0.0, 0.4, dist); 
      
      // Add vignette effect
      float vignette = 1.0 - smoothstep(0.4, 1.1, dist * 1.8);
      color *= vignette;
      
      // Transition between main effect and nebula based on distance
      float nebulaFactor = smoothstep(0.3, 0.8, dist);
      vec3 finalColor = mix(color, nebulaColor, nebulaFactor * 0.8);
      
      // Add stars consistently across the entire background
      finalColor += starsValue * vec3(0.9, 0.95, 1.0);
      
      // Vary alpha based on pattern and distance
      float alpha = mix(centerHole * (0.5 + finalPattern * 0.4), 0.7, nebulaFactor * 0.3) * 0.8;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
  vertexShader: commonVertexShader
};

// Particle effect shader for the prism atmosphere
export const particleShader = {
  vertexShader: `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    uniform float time;
    
    void main() {
      vColor = color;
      vec3 pos = position;
      
      // Simple oscillation effect
      float noise = sin(position.x * 5.0 + time) * 0.05 + cos(position.y * 5.0 + time * 0.8) * 0.05;
      pos.x += sin(position.y * 0.8 + time * 0.6) * 0.08;
      pos.y += cos(position.z * 0.8 + time * 0.5) * 0.08;
      pos.z += noise;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D pointTexture;
    varying vec3 vColor;
    
    void main() {
      gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
      if (gl_FragColor.a < 0.3) discard;
    }
  `
};

// Export a function to create a circular texture for particles
export const createCircleTexture = (size = 64) => {
  return `
  // Create a simple circular texture for particles
  function createCircleTexture(size = 64) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Return a blank texture if context is null
    if (!ctx) {
      console.warn('Failed to get 2D context for particle texture');
      return new THREE.Texture();
    }
    
    // Create a radial gradient (white in center, transparent at edges)
    const gradient = ctx.createRadialGradient(
      size/2, size/2, 0,
      size/2, size/2, size/2
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    // Draw the gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
  `;
}; 