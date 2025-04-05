/**
 * Scene Exposer - Utility to expose Three.js scene and key functions globally
 * This helps with debugging and allows external scripts to interact with the scene
 */

// Wait for the scene to be initialized
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 Scene exposer initialized');
  
  // Check every 500ms until the scene is available
  const checkInterval = setInterval(() => {
    // Look for the scene in the DOM
    const canvas = document.getElementById('morphing-poly-canvas');
    if (canvas && canvas.__threeScene) {
      clearInterval(checkInterval);
      
      // Expose the scene globally
      window.threeScene = canvas.__threeScene;
      console.log('✅ THREE.js scene exposed globally as window.threeScene');
      
      // Try to find the applyShapeSpecificStyles function
      if (typeof window.applyShapeSpecificStyles !== 'function' && 
          typeof window.amorphousPrismModule?.applyShapeSpecificStyles === 'function') {
        window.applyShapeSpecificStyles = window.amorphousPrismModule.applyShapeSpecificStyles;
        console.log('✅ applyShapeSpecificStyles function exposed globally');
      }
    }
  }, 500);
});