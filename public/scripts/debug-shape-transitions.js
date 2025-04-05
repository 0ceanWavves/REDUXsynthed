/**
 * Debug helper for shape transitions
 * This script adds keyboard controls to manually trigger shape transitions
 * for testing and debugging purposes.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 Shape transition debug helper loaded');
  
  // Shape names that match the morph targets
  const shapeNames = [
    'Tetrahedron',
    'Cube',
    'Octahedron',
    'Icosahedron',
    'Dodecahedron'
  ];
  
  // Wait for THREE and the main mesh to be available
  const checkInterval = setInterval(() => {
    if (window.THREE && window._prismInitialized) {
      clearInterval(checkInterval);
      setupDebugControls();
    }
  }, 500);
  
  function setupDebugControls() {
    console.log('🎮 Setting up shape transition debug controls');
    console.log('Press keys 1-5 to switch between shapes:');
    shapeNames.forEach((name, index) => {
      console.log(`${index + 1}: ${name}`);
    });
    
    // Add keyboard event listener
    document.addEventListener('keydown', (event) => {
      const key = parseInt(event.key);
      
      // Check if key is 1-5
      if (key >= 1 && key <= 5) {
        const shapeIndex = key - 1;
        const shapeName = shapeNames[shapeIndex];
        
        console.log(`🔄 Manually switching to shape: ${shapeName}`);
        
        // Try to access the main mesh and apply the shape
        try {
          // Find the main mesh in the scene
          const scene = window.threeScene;
          if (!scene) {
            console.warn('⚠️ THREE.js scene not accessible for debug controls');
            return;
          }
          
          // Find the main mesh (first mesh with morphTargetInfluences)
          const mainMesh = scene.children.find(child => 
            child.isMesh && child.morphTargetInfluences && 
            child.morphTargetInfluences.length > 0
          );
          
          if (!mainMesh) {
            console.warn('⚠️ Main mesh not found for debug controls');
            return;
          }
          
          // Reset all influences to 0
          mainMesh.morphTargetInfluences.fill(0);
          
          // Set the selected shape influence to 1
          mainMesh.morphTargetInfluences[shapeIndex] = 1;
          
          // Apply shape-specific styles
          if (typeof window.applyShapeSpecificStyles === 'function') {
            window.applyShapeSpecificStyles(shapeName);
          } else {
            console.warn('⚠️ applyShapeSpecificStyles function not found');
            
            // Fallback: manually apply the class
            const overlay = document.getElementById('content-overlay');
            if (overlay) {
              // Remove all shape classes
              overlay.className = overlay.className.replace(/\b\w+-shape\b/g, '');
              // Add the new shape class
              overlay.classList.add(`${shapeName.toLowerCase()}-shape`);
              console.log(`Applied class: ${shapeName.toLowerCase()}-shape`);
            }
          }
        } catch (error) {
          console.error('Error in shape transition debug controls:', error);
        }
      }
    });
    
    console.log('✅ Shape transition debug controls ready');
  }
});