/**
 * colors.ts - Color token system for the entire application
 * All color values should be defined here and imported where needed
 */

// Main theme colors
export const themeColors = {
  // Background colors
  background: {
    primary: "#0a0a1a",    // Dark blue/purple background
    secondary: "#121225",   // Slightly lighter background
    overlay: "rgba(0, 0, 0, 0.5)"
  },
  
  // Brand colors
  brand: {
    purple: "#8162ff",     // Vibrant purple
    teal: "#00e599",       // Bright teal
    purpleDark: "#7142ff", // Darker purple
    tealDark: "#00c489"    // Darker teal
  },
  
  // UI colors
  ui: {
    white: "#ffffff",
    light: "#e0e0ff",      // Light blueish white
    accent: "#8162ff",     // Same as brand.purple for consistency
    highlight: "#00e599"   // Same as brand.teal for consistency
  },
  
  // Text colors
  text: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.8)",
    accent: "#8162ff"
  },
  
  // Interactive elements colors
  interactive: {
    button: {
      primary: "#8162ff",
      secondary: "transparent",
      hover: {
        primary: "#7152e0",
        secondary: "rgba(129, 98, 255, 0.2)"
      }
    }
  }
};

// Colors specifically for the FlowBackground component
export const flowBackgroundColors = {
  background: "#0a0a1a",  // Dark blue/purple background
  accent1: "#8162ff",     // Vibrant purple
  accent2: "#00e599",     // Teal
  accent3: "#ffffff",     // White for highlights
  edgeColor: "#e0e0ff",   // Light blueish white for edges
  particleColor1: "#7142ff", // Darker purple for particles
  particleColor2: "#00c489"  // Darker teal for particles
};

// Colors specifically for the AmorphousPrism component
export const prismColors = {
  primary: "#8162ff",      // Prism main color
  edge: "#e0e0ff",         // Edge color
  glow: "#7142ff",         // Glow effect color
  particleColor1: "#7142ff", // Particle color 1
  particleColor2: "#00c489"  // Particle color 2
};

// Export a function to convert hex to THREE.js Color
export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : [0, 0, 0];
}; 