/**
 * PrismConfig.js
 * Centralized configuration for the morphing prism
 */

// Global configuration parameters
export const prismConfig = {
  // Animation timing
  morphInterval: 3000,       // 3 seconds per morph
  holdDuration: 1000,        // Hold shape for 1 second
  
  // Rotation parameters
  autoRotateSpeed: 0.0015,   // Auto-rotation speed
  userRotationSpeed: 0.005,  // User-controlled rotation speed
  mobileRotationSpeed: 0.007,// Mobile rotation speed (faster for touch)
  
  // Physics parameters
  dampingFactor: 0.94,       // Rotation damping (smoothing)
  minVelocityThreshold: 0.00005, // Minimum velocity before stopping
  
  // Geometry parameters
  prismRadius: 1.3,          // Radius of the prism shapes
  prismDepth: 0.4,           // Depth/height of the prism
  
  // Interaction settings
  dragResistance: 0.85,      // Resistance while dragging (1.0 = no resistance)
  
  // Visual settings
  wireframeThickness: 0.018, // Wireframe thickness - increased for better visibility
  mobileWireframeThickness: 0.025, // Mobile wireframe thickness (thicker for visibility)
  faceOpacity: 0.65,         // Opacity of prism faces - increased for better visibility
  
  // Particle settings
  particleCount: 600,        // Number of particles - increased
  mobileParticleCount: 300,  // Reduced particles for mobile - still more than before
  particleSpreadFactor: 4.0, // How far particles spread from center - increased
  particleSizeBase: 8,       // Base particle size - increased
  particleSizeVariation: 12, // Maximum additional random size
  mobileParticleSizeBase: 5, // Smaller base for mobile
  mobileParticleSizeVariation: 8 // Smaller variation for mobile
};

/**
 * Creates the color objects used in the scene
 * @param {Object} THREE - The Three.js library instance
 * @returns {Object} Object containing color instances
 */
export function createColorObjects(THREE) {
  return {
    background: new THREE.Color("#05030d"), // Very dark blue/purple
    shape1: new THREE.Color("#ff00ff"),     // Magenta / Fuchsia
    shape2: new THREE.Color("#00ffff"),     // Cyan / Aqua
    wireframe: new THREE.Color("#ffffff"),  // Bright white wireframe
    particle1: new THREE.Color("#cc00ff"),  // Vivid purple particle
    particle2: new THREE.Color("#00ccff")   // Vivid blue particle
  };
}
