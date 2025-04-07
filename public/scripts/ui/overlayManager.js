// public/scripts/ui/overlayManager.js

// Get a reference to the overlay element ONCE
const contentOverlay = document.getElementById('content-overlay');

// Define all possible shape classes based on your morphTargetNames
const ALL_SHAPE_CLASSES = [
    'tetrahedron-shape',
    'cube-shape',
    'octahedron-shape',
    'icosahedron-shape',
    'dodecahedron-shape'
    // Add any other shape names (lowercase) + "-shape"
];

// Function to apply the correct class based on the shape name
export function applyShapeSpecificStyles(shapeName) {
  // --- DEBUG LOG ---
  console.log(`applyShapeSpecificStyles called with shapeName: "${shapeName}" (Type: ${typeof shapeName})`);
  // --- END DEBUG LOG ---

  if (!contentOverlay) {
    console.warn("Content overlay element not found for style update.");
    return;
  }

  // Convert shapeName (e.g., "Tetrahedron") to class name (e.g., "tetrahedron-shape")
  const shapeClassName = shapeName ? `${shapeName.toLowerCase()}-shape` : '';

  // Remove any existing shape classes efficiently
  contentOverlay.classList.remove(...ALL_SHAPE_CLASSES);

  // Add the new class if shapeClassName is valid and exists in our list
  if (shapeClassName && ALL_SHAPE_CLASSES.includes(shapeClassName)) {
    contentOverlay.classList.add(shapeClassName);
    console.log(`Applied overlay style: ${shapeClassName}`);
  } else if (shapeClassName) {
    // --- DEBUG LOG ---
    console.warn(`Shape class name "${shapeClassName}" (from input "${shapeName}") is not defined in ALL_SHAPE_CLASSES: [${ALL_SHAPE_CLASSES.join(', ')}]`);
    // --- END DEBUG LOG ---
  } else {
      // --- DEBUG LOG ---
      console.log("applyShapeSpecificStyles: No valid shapeName provided, clearing classes.");
      // --- END DEBUG LOG ---
  }
} 