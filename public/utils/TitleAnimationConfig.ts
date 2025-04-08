// TitleAnimationConfig.ts - Configuration for title animations

export const TitleAnimationConfig = {
  // Timing settings
  baseDelay: 800, // ms between each word animation
  animationDuration: 900, // ms for the main slam animation
  shadowDelay: 300, // ms delay before shadow appears
  rippleDelay: 400, // ms delay before ripple effect
  shakeDelay: 450, // ms delay before shake effect
  shakeIntensity: 3, // px for shake effect intensity
  
  // Easing functions
  slamEasing: 'cubic-bezier(0.175, 0.885, 0.32, 1.475)', // Bounce easing
  rippleEasing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', // Custom easing
  
  // Visual settings
  initialScale: 1.8, // Initial scale for words
  overshootScale: 0.85, // Scale at the bottom of overshoot
  bounceBackScale: 1.08, // Scale during bounce back
  finalBounceScale: 0.95, // Scale during final bounce
  
  // Color settings
  primaryColor: '#00ffaa',
  secondaryColor: '#8162ff',
  glowIntensity: 0.7
};
