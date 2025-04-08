/**
 * motion.ts - Animation utilities and constants
 * Centralizes animation parameters for consistency across components
 */

// Animation timing configurations
export const timings = {
  fast: 0.3,    // 300ms - Quick transitions
  medium: 0.5,  // 500ms - Standard transitions
  slow: 0.8,    // 800ms - Slower, more pronounced transitions
  extraSlow: 1.2 // 1.2s - Very noticeable transitions
};

// Easing functions
export const easings = {
  // Standard CSS easing functions
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Custom easings
  bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
};

// Animation configuration for the flow background
export const flowAnimationConfig = {
  // Flow speeds
  speeds: {
    default: 0.02,
    firefox: 0.01,
    mobile: 0.015
  },
  
  // Pattern scales
  scales: {
    flowScale: 3.0,
    noiseScale1: 0.5,
    noiseScale2: 0.8
  },
  
  // Color blending
  colorBlend: 0.95,
  
  // Animation adjustment based on device/browser
  getBrowserAdjustments: (isFirefox: boolean, isMobile: boolean) => {
    return {
      flowSpeed: isFirefox ? 0.01 : (isMobile ? 0.015 : 0.02),
      animationDetail: isFirefox ? 'low' : (isMobile ? 'medium' : 'high')
    };
  }
};

// Animation configuration for the prism
export const prismAnimationConfig = {
  // Morph speeds and intervals
  morphSpeed: 0.03,
  morphSpeedFirefox: 0.02,
  morphSpeedMobile: 0.015,
  
  morphInterval: 6000, // ms
  morphIntervalMobile: 4000, // ms
  
  // Wobble effects
  wobbleSpeed: 0.5,
  wobbleIntensity: 0.05,
  
  // Auto rotation speeds
  rotationY: 0.0002,
  rotationYMobile: 0.0003,
  rotationXFactor: 0.0001,
  
  // Hold duration for shapes
  holdDuration: 1500, // ms
  
  // User interaction physics
  userRotationSpeed: 0.005,
  userRotationSpeedMobile: 0.007,
  dampingFactor: 0.95,
  minVelocityThreshold: 0.00005,
  
  // Get configuration adjusted for device
  getConfig: (isFirefox: boolean, isMobile: boolean) => {
    return {
      morphSpeed: isFirefox ? 0.02 : (isMobile ? 0.015 : 0.03),
      morphInterval: isMobile ? 4000 : 6000,
      userRotationSpeed: isMobile ? 0.007 : 0.005
    };
  }
};

// Animation presets for different elements
export const animationPresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: timings.medium,
    easing: easings.easeOut
  },
  
  fadeInUp: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: timings.medium,
    easing: easings.easeOut
  },
  
  fadeInDown: {
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: timings.medium,
    easing: easings.easeOut
  },
  
  // Scale animation for buttons and interactive elements
  scaleOnHover: {
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.05)' },
    duration: timings.fast,
    easing: easings.easeOut
  }
}; 