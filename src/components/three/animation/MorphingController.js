/**
 * MorphingController.js
 * Manages the morphing animation between different shapes
 */

/**
 * Creates a controller to manage morphing between shapes
 * @param {Object} options - Configuration options
 * @returns {Object} Morphing controller with update method
 */
export function createMorphingController(options) {
  const { mesh, config, clock } = options;
  
  // Initialize animation state
  const state = {
    currentTargetIndex: 0,
    nextTargetIndex: 1,
    morphProgress: 0,
    rotationX: 0,
    rotationY: 0,
    velocityX: 0,
    velocityY: 0,
    isUserInteracting: false,
    isAutoRotating: true,
    lastTime: 0,
    morphTime: 0,
    holdTime: 0,
    isHolding: false
  };
  
  /**
   * Updates morphing and rotation state
   * @param {Object} params - Update parameters
   */
  function update(params) {
    const {
      isMobile,
      mesh,
      material,
      particleMaterial,
      particleSystem,
      dampingFactor,
      minVelocityThreshold,
      autoRotateSpeed
    } = params;
    
    // Get elapsed time
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();
    
    // Update material time uniform
    if (material && material.uniforms) {
      material.uniforms.uTime.value = time;
    }
    
    if (particleMaterial && particleMaterial.uniforms) {
      particleMaterial.uniforms.uTime.value = time;
    }
    
    // Handle morphing animation timing
    state.morphTime += delta;
    if (state.isHolding) {
      state.holdTime += delta;
      if (state.holdTime >= config.holdDuration / 1000) {
        // End holding period, continue morphing
        state.isHolding = false;
        state.holdTime = 0;
      }
    } else {
      // Calculate morph progress
      state.morphProgress = Math.min(state.morphTime / (config.morphInterval / 1000), 1.0);
      
      // Apply morphing influence
      if (mesh && mesh.morphTargetInfluences) {
        // Reset all influences
        for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
          mesh.morphTargetInfluences[i] = 0;
        }
        
        // Set influences for current and next target
        if (state.currentTargetIndex >= 0) {
          mesh.morphTargetInfluences[state.currentTargetIndex] = 1 - state.morphProgress;
        }
        
        if (state.nextTargetIndex >= 0) {
          mesh.morphTargetInfluences[state.nextTargetIndex] = state.morphProgress;
        }
      }
      
      // Check if morph is complete
      if (state.morphProgress >= 1.0) {
        // Move to next shape and start holding
        state.currentTargetIndex = state.nextTargetIndex;
        state.nextTargetIndex = (state.nextTargetIndex + 1) % (mesh.morphTargetInfluences?.length || 4);
        state.morphTime = 0;
        state.morphProgress = 0;
        state.isHolding = true;
      }
    }
    
    // Apply rotation
    if (!state.isUserInteracting && state.isAutoRotating) {
      // Apply auto rotation
      state.rotationY += autoRotateSpeed;
    } else {
      // Apply damping to rotation velocity
      state.velocityX *= dampingFactor;
      state.velocityY *= dampingFactor;
      
      // Apply velocity to rotation
      state.rotationX += state.velocityX;
      state.rotationY += state.velocityY;
      
      // Check if rotation has effectively stopped
      if (Math.abs(state.velocityX) < minVelocityThreshold && 
          Math.abs(state.velocityY) < minVelocityThreshold) {
        if (!state.isUserInteracting) {
          // Return to auto rotation when user interaction stops
          state.isAutoRotating = true;
        }
      }
    }
    
    // Apply rotation to mesh
    if (mesh) {
      mesh.rotation.x = state.rotationX;
      mesh.rotation.y = state.rotationY;
    }
    
    // Make particle system follow mesh rotation with slight lag
    if (particleSystem) {
      particleSystem.rotation.x = state.rotationX * 0.8;
      particleSystem.rotation.y = state.rotationY * 0.8;
    }
  }
  
  /**
   * Sets the user interaction state
   * @param {Boolean} isInteracting - Whether user is currently interacting
   */
  function setUserInteracting(isInteracting) {
    state.isUserInteracting = isInteracting;
    if (isInteracting) {
      state.isAutoRotating = false;
    }
  }
  
  /**
   * Applies a rotation delta from user input
   * @param {Number} deltaX - X rotation delta
   * @param {Number} deltaY - Y rotation delta
   */
  function applyRotation(deltaX, deltaY) {
    state.velocityX = deltaY * (config.isMobileDevice ? config.mobileRotationSpeed : config.userRotationSpeed);
    state.velocityY = deltaX * (config.isMobileDevice ? config.mobileRotationSpeed : config.userRotationSpeed);
    return true;
  }
  
  /**
   * Applies a rotation delta quaternion to the mesh
   * @param {THREE.Quaternion} deltaQ - The quaternion representing the rotation delta
   */
  function applyQuaternionDelta(deltaQ) {
    if (mesh) {
      // Apply the delta to the mesh's current quaternion
      mesh.quaternion.multiplyQuaternions(deltaQ, mesh.quaternion);
      
      // Update Euler angles from quaternion for potential use elsewhere (like auto-rotate)
      // Be cautious as Euler angles can have gimbal lock issues
      const euler = new THREE.Euler().setFromQuaternion(mesh.quaternion, 'YXZ'); // Use an appropriate order
      state.rotationX = euler.x;
      state.rotationY = euler.y;
      // Note: state.rotationZ might also need updating if used
      
      // Reset velocity if applying direct quaternion rotation?
      // Or integrate this into the momentum system?
      // For now, let's assume this overrides momentum temporarily
      state.velocityX = 0;
      state.velocityY = 0;
    }
  }
  
  // Return controller interface
  return {
    update,
    setUserInteracting,
    applyRotation,
    applyQuaternionDelta,
    getState: () => ({ ...state }) // Return copy of state for monitoring
  };
}
