/**
 * InteractionManager.js
 * Handles user interaction with the prism via mouse/touch events
 */

/**
 * Creates a manager for user interactions
 * @param {Object} options - Configuration options
 * @returns {Object} Interaction manager with cleanup method
 */
export function createInteractionManager(options) {
  const { canvas, morphingController, config, THREE } = options;
  
  // State tracking for Arcball
  let isPointerDown = false;
  const startPointerNDC = new THREE.Vector2(); // Normalized device coordinates (-1 to +1)
  const currentPointerNDC = new THREE.Vector2();
  const startSphereVec = new THREE.Vector3(); // Vector on virtual sphere
  const currentSphereVec = new THREE.Vector3();
  const rotationQuaternion = new THREE.Quaternion();
  const deltaQuaternion = new THREE.Quaternion();
  const center = new THREE.Vector3(0, 0, 0); // Assuming object is centered

  // State for momentum
  let previousQuaternion = new THREE.Quaternion();
  let currentQuaternion = new THREE.Quaternion();
  let lastTimestamp = 0;
  let angularVelocity = new THREE.Quaternion();
  const identityQuaternion = new THREE.Quaternion();

  // Define the radius of the virtual sphere (can be adjusted)
  const sphereRadius = 1.0;

  // Helper function to project screen coordinates to a unit sphere vector
  function projectToSphere(ndcX, ndcY, outVector) {
    const x = ndcX;
    const y = ndcY;
    const zSquared = sphereRadius * sphereRadius - x * x - y * y;

    if (zSquared > 0) {
      // Point is inside the sphere radius on screen
      outVector.set(x, y, Math.sqrt(zSquared));
    } else {
      // Point is outside the sphere radius, project onto the edge
      outVector.set(x, y, 0).normalize();
    }
    return outVector;
  }

  // Helper function to get Normalized Device Coordinates from event
  function getNDC(event, outVector) {
      const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
      const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : 0);
      const rect = canvas.getBoundingClientRect();
      outVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      outVector.y = -((clientY - rect.top) / rect.height) * 2 + 1; // Y is inverted in NDC
      return outVector;
  }

  // Apply momentum based on angular velocity
  function applyMomentum() {
    if (!isPointerDown && !angularVelocity.equals(identityQuaternion)) {
      // Apply damping
      angularVelocity.slerp(identityQuaternion, 1.0 - config.dampingFactor); // Use slerp for quaternion damping

      // Apply rotation from momentum
      morphingController.applyQuaternionDelta(angularVelocity);

      // Stop when velocity is very small (using angle to identity)
      if (angularVelocity.angleTo(identityQuaternion) < 0.001) {
        angularVelocity.copy(identityQuaternion);
        morphingController.setUserInteracting(false); // Also signal end of interaction
      } else {
        // Continue momentum
        requestAnimationFrame(applyMomentum);
      }
    }
  }
  
  // Mouse and touch event handlers
  function onPointerDown(event) {
    if (event.target !== canvas) return;
    
    // Prevent default behavior for mouse but not touch
    if (event.type === 'mousedown') {
      event.preventDefault();
    }
    
    isPointerDown = true;
    getNDC(event, startPointerNDC);
    projectToSphere(startPointerNDC.x, startPointerNDC.y, startSphereVec);

    // Reset momentum state
    angularVelocity.copy(identityQuaternion);
    previousQuaternion.copy(identityQuaternion); // Assuming rotation starts from identity relative to this drag
    currentQuaternion.copy(identityQuaternion);
    lastTimestamp = performance.now();
    
    morphingController.setUserInteracting(true);
    
    // Change cursor
    canvas.style.cursor = 'grabbing';
    document.body.style.cursor = 'grabbing'; // Also set body cursor for better UX
    
    // Ensure canvas has focus for keyboard events
    if (canvas.tabIndex >= 0) {
      canvas.focus();
    }
    
    // Try to use pointer capture for better tracking outside the element
    if (event.pointerId !== undefined) {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (err) {
        console.warn("Pointer capture failed:", err);
      }
    }
  }
  
  function onPointerMove(event) {
    if (!isPointerDown) return;
    
    getNDC(event, currentPointerNDC);
    projectToSphere(currentPointerNDC.x, currentPointerNDC.y, currentSphereVec);

    // Calculate the rotation quaternion needed to move from startSphereVec to currentSphereVec
    deltaQuaternion.setFromUnitVectors(startSphereVec, currentSphereVec);
    
    // Apply the rotation delta
    morphingController.applyQuaternionDelta(deltaQuaternion);

    // Update start vector for the next move delta calculation
    startSphereVec.copy(currentSphereVec);

    // --- Momentum Calculation ---
    const timestamp = performance.now();
    const deltaTime = (timestamp - lastTimestamp) / 1000.0; // Time in seconds
    lastTimestamp = timestamp;

    if (deltaTime > 0.001) { // Avoid division by zero or instability
        currentQuaternion.copy(deltaQuaternion); // The delta applied this frame

        // Calculate angular velocity: the rotation needed to get from previous to current orientation in deltaTime
        const invPrevious = previousQuaternion.clone().invert();
        const rotationChange = currentQuaternion.clone().multiply(invPrevious);

        // Estimate axis-angle from the rotation change quaternion
        const angle = 2 * Math.acos(THREE.MathUtils.clamp(rotationChange.w, -1, 1));
        let axis = new THREE.Vector3();
        if (angle > 0.0001) { // Avoid issues near identity
            const sinHalfAngle = Math.sqrt(1.0 - rotationChange.w * rotationChange.w);
            axis.set(rotationChange.x / sinHalfAngle, rotationChange.y / sinHalfAngle, rotationChange.z / sinHalfAngle);
        }

        const angularSpeed = angle / deltaTime;
        
        // Apply to angularVelocity (Quaternion representation)
        // Convert axis-angle speed back to a quaternion representing velocity over one frame (approx)
        // This part is tricky; often simplified. Let's use the delta directly for simplicity in momentum for now.
        // A more accurate approach involves integrating angular velocity, but can be complex.
        // Smoothing the deltaQuaternion might be a simpler approach for momentum feel.
         angularVelocity.slerp(deltaQuaternion, 0.1); // Simple smoothing for momentum calculation

        previousQuaternion.copy(currentQuaternion);
    }
    // --- End Momentum Calculation ---
  }
  
  function onPointerUp(event) {
    if (!isPointerDown) return;
    
    isPointerDown = false;
    
    // Reset cursors
    canvas.style.cursor = 'grab';
    document.body.style.cursor = '';
    
    // Apply momentum if velocity is significant
    if (angularVelocity.angleTo(identityQuaternion) > 0.01) { // Threshold based on angle
        // Ensure interaction state is false *before* starting momentum
        morphingController.setUserInteracting(false);
        requestAnimationFrame(applyMomentum);
    } else {
        angularVelocity.copy(identityQuaternion); // Ensure it's reset
        morphingController.setUserInteracting(false);
    }
    
    // Release pointer capture if it was used
    if (event.pointerId !== undefined) {
      try {
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      } catch (err) {
        console.warn("Pointer release failed:", err);
      }
    }
  }
  
  // Handle keyboard controls
  let hasFocus = false; // Keep track of focus for keyboard
  function onKeyDown(event) {
    if (!hasFocus) return;
    
    // Arrow keys for rotation
    switch (event.key) {
      case 'ArrowLeft':
        morphingController.applyRotation(-10, 0);
        morphingController.setUserInteracting(true);
        break;
      case 'ArrowRight':
        morphingController.applyRotation(10, 0);
        morphingController.setUserInteracting(true);
        break;
      case 'ArrowUp':
        morphingController.applyRotation(0, -10);
        morphingController.setUserInteracting(true);
        break;
      case 'ArrowDown':
        morphingController.applyRotation(0, 10);
        morphingController.setUserInteracting(true);
        break;
    }
    
    // We might want to disable momentum if keyboard is used
    angularVelocity.copy(identityQuaternion);
    morphingController.setUserInteracting(true); // Signal interaction
    // Apply rotation using applyQuaternionDelta with a small fixed quaternion based on key
    const axis = new THREE.Vector3();
    const angle = 0.1; // Small rotation angle
    if (event.key === 'ArrowLeft') axis.set(0, 1, 0);
    else if (event.key === 'ArrowRight') axis.set(0, -1, 0);
    else if (event.key === 'ArrowUp') axis.set(1, 0, 0);
    else if (event.key === 'ArrowDown') axis.set(-1, 0, 0);
    else return; // Ignore other keys

    deltaQuaternion.setFromAxisAngle(axis, angle);
    morphingController.applyQuaternionDelta(deltaQuaternion);
  }
  
  function onKeyUp() {
    if(hasFocus) morphingController.setUserInteracting(false);
  }
  
  function onFocus() {
    hasFocus = true;
  }
  
  function onBlur() {
    hasFocus = false;
    morphingController.setUserInteracting(false);
  }
  
  // Setup event listeners based on device capabilities
  if (window.PointerEvent) {
    // Modern pointer events (handles both touch and mouse)
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  } else {
    // Fallback to separate mouse and touch events
    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove', onPointerMove, { passive: true }); // Allow default scroll behavior
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);
  }
  
  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('focus', onFocus);
  canvas.addEventListener('blur', onBlur);
  
  // Prevent context menu on right-click
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Ensure the canvas can receive keyboard focus
  if (canvas.tabIndex < 0) {
    canvas.tabIndex = 0;
  }
  
  // Public API
  return {
    // Clean up event listeners
    cleanup: () => {
      if (window.PointerEvent) {
        canvas.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      } else {
        canvas.removeEventListener('mousedown', onPointerDown);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        
        canvas.removeEventListener('touchstart', onPointerDown);
        canvas.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
        window.removeEventListener('touchcancel', onPointerUp);
      }
      
      canvas.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('focus', onFocus);
      canvas.removeEventListener('blur', onBlur);
      
      canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
      
      console.log("Interaction event listeners removed");
    }
  };
}
