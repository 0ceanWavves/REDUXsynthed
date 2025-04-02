# Interaction System

This document details how user interactions with the 3D visualization are handled in the Synthed website.

## Table of Contents

1. [Overview](#overview)
2. [Interaction Manager](#interaction-manager)
3. [Mouse Interaction](#mouse-interaction)
4. [Touch Interaction](#touch-interaction)
5. [Momentum and Damping](#momentum-and-damping)
6. [Mobile Optimizations](#mobile-optimizations)
7. [Visual Feedback](#visual-feedback)

## Overview

The interaction system provides a seamless way for users to interact with the 3D visualization by:

1. **Rotating the object** through dragging (mouse or touch)
2. **Applying momentum** for smooth animations after interaction
3. **Providing visual feedback** during interaction
4. **Optimizing for mobile devices** with touch-specific handling

The system is implemented in the `InteractionManager.js` module, which handles all user inputs and translates them into 3D object transformations.

## Interaction Manager

The core of the interaction system is the `createInteractionManager` function:

```javascript
// src/components/three/interaction/InteractionManager.js
export function createInteractionManager({ canvas, morphingController, config }) {
  // State variables
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let rotationVelocity = { x: 0, y: 0 };
  let momentumId = null;
  let isUserInteracting = false;
  
  // Register event handlers for mouse and touch
  function initialize() {
    // Mouse events
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    // Mouse cursor styling
    canvas.addEventListener('mouseover', () => {
      canvas.style.cursor = 'grab';
    });
    
    // Cleanup function for removing event listeners
    return function cleanup() {
      // Remove all event listeners
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      
      // Cancel any ongoing animations
      if (momentumId) {
        cancelAnimationFrame(momentumId);
      }
    };
  }
  
  // Implementation of handlers...
  
  return { initialize };
}
```

## Mouse Interaction

Mouse interactions are handled through three main event handlers:

### Mouse Down

```javascript
function handleMouseDown(event) {
  event.preventDefault();
  isDragging = true;
  isUserInteracting = true;
  canvas.style.cursor = 'grabbing';
  
  // Store initial position
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
  
  // Stop any ongoing momentum animation
  if (momentumId) {
    cancelAnimationFrame(momentumId);
    momentumId = null;
  }
  
  // If controlling morphing, pause the automatic transitions
  if (morphingController && typeof morphingController.pauseMorphing === 'function') {
    morphingController.pauseMorphing(true);
  }
  
  // Show cursor glow effect
  updateCursorGlow(event.clientX, event.clientY, true);
}
```

### Mouse Move

```javascript
function handleMouseMove(event) {
  if (!isDragging) return;
  
  // Calculate deltas from previous position
  const deltaX = event.clientX - previousMousePosition.x;
  const deltaY = event.clientY - previousMousePosition.y;
  
  // Update rotation velocity for momentum
  rotationVelocity = {
    x: deltaX * config.rotationSensitivity,
    y: deltaY * config.rotationSensitivity
  };
  
  // Apply rotation directly or through global handler
  if (window.applyPrismRotation) {
    window.applyPrismRotation(rotationVelocity.x, rotationVelocity.y);
  } else {
    // Custom rotation logic
    applyRotation(rotationVelocity.x, rotationVelocity.y);
  }
  
  // Update previous position
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
  
  // Update cursor glow position
  updateCursorGlow(event.clientX, event.clientY, true);
}
```

### Mouse Up

```javascript
function handleMouseUp() {
  if (!isDragging) return;
  
  isDragging = false;
  canvas.style.cursor = 'grab';
  
  // Start momentum animation if velocity is significant
  if (Math.abs(rotationVelocity.x) > 0.05 || Math.abs(rotationVelocity.y) > 0.05) {
    applyMomentum();
  } else {
    isUserInteracting = false;
    
    // Resume morphing after a delay
    if (morphingController && typeof morphingController.pauseMorphing === 'function') {
      setTimeout(() => {
        if (!isUserInteracting) {
          morphingController.pauseMorphing(false);
        }
      }, 1000);
    }
  }
  
  // Hide cursor glow effect
  updateCursorGlow(0, 0, false);
}
```

## Touch Interaction

Touch interactions are handled with specific events optimized for mobile devices:

### Touch Start

```javascript
function handleTouchStart(event) {
  event.preventDefault();
  
  if (event.touches.length === 1) {
    isDragging = true;
    isUserInteracting = true;
    
    // Store initial position
    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
    
    // Stop any ongoing momentum animation
    if (momentumId) {
      cancelAnimationFrame(momentumId);
      momentumId = null;
    }
    
    // Pause morphing
    if (morphingController && typeof morphingController.pauseMorphing === 'function') {
      morphingController.pauseMorphing(true);
    }
  }
}
```

### Touch Move

```javascript
function handleTouchMove(event) {
  event.preventDefault();
  
  if (!isDragging || event.touches.length !== 1) return;
  
  // Calculate deltas from previous position
  const deltaX = event.touches[0].clientX - previousMousePosition.x;
  const deltaY = event.touches[0].clientY - previousMousePosition.y;
  
  // Use different sensitivity for touch (typically higher)
  rotationVelocity = {
    x: deltaX * config.touchRotationSensitivity,
    y: deltaY * config.touchRotationSensitivity
  };
  
  // Apply rotation
  if (window.applyPrismRotation) {
    window.applyPrismRotation(rotationVelocity.x, rotationVelocity.y);
  } else {
    applyRotation(rotationVelocity.x, rotationVelocity.y);
  }
  
  // Update previous position
  previousMousePosition = {
    x: event.touches[0].clientX,
    y: event.touches[0].clientY
  };
}
```

### Touch End

```javascript
function handleTouchEnd() {
  if (!isDragging) return;
  
  isDragging = false;
  
  // Apply momentum with touch-specific damping
  if (Math.abs(rotationVelocity.x) > 0.05 || Math.abs(rotationVelocity.y) > 0.05) {
    applyMomentum(config.touchMomentumDamping);
  } else {
    isUserInteracting = false;
    
    // Resume morphing after a delay
    if (morphingController && typeof morphingController.pauseMorphing === 'function') {
      setTimeout(() => {
        if (!isUserInteracting) {
          morphingController.pauseMorphing(false);
        }
      }, 1000);
    }
  }
}
```

## Momentum and Damping

The momentum system creates natural-feeling inertia after user interaction ends:

```javascript
function applyMomentum(customDamping) {
  // Use custom damping if provided, otherwise default
  const damping = customDamping || config.momentumDamping || 0.95;
  
  function animate() {
    // Reduce velocity by applying damping
    rotationVelocity.x *= damping;
    rotationVelocity.y *= damping;
    
    // Apply the rotation
    if (window.applyPrismRotation) {
      window.applyPrismRotation(rotationVelocity.x, rotationVelocity.y);
    } else {
      applyRotation(rotationVelocity.x, rotationVelocity.y);
    }
    
    // Continue animation if velocity is still significant
    if (Math.abs(rotationVelocity.x) > 0.01 || Math.abs(rotationVelocity.y) > 0.01) {
      momentumId = requestAnimationFrame(animate);
    } else {
      // Stop momentum and resume morphing
      momentumId = null;
      isUserInteracting = false;
      
      if (morphingController && typeof morphingController.pauseMorphing === 'function') {
        morphingController.pauseMorphing(false);
      }
    }
  }
  
  // Start momentum animation
  momentumId = requestAnimationFrame(animate);
}
```

## Mobile Optimizations

Several optimizations are implemented for mobile devices:

### Touch Action Management

```javascript
// In canvas setup
canvas.style.touchAction = 'none'; // Prevent default touch actions
```

### Device-Specific Settings

```javascript
const config = {
  // Base configuration
  rotationSensitivity: 0.01,
  momentumDamping: 0.95,
  
  // Mobile-specific settings
  touchRotationSensitivity: 0.015, // Higher sensitivity for touch
  touchMomentumDamping: 0.9, // Lower damping for faster deceleration
  
  // Apply mobile settings if detected
  ...(window.innerWidth < 768 ? {
    rotationSensitivity: 0.015,
    momentumDamping: 0.9
  } : {})
};
```

### Passive Event Listeners

```javascript
// Use passive: false to allow preventDefault() on mobile browsers
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
```

## Visual Feedback

The interaction system provides visual feedback to enhance user experience:

### Cursor Styles

```javascript
// Change cursor appearance based on state
canvas.addEventListener('mouseover', () => {
  canvas.style.cursor = 'grab';
});

function handleMouseDown() {
  canvas.style.cursor = 'grabbing';
  // ...
}

function handleMouseUp() {
  canvas.style.cursor = 'grab';
  // ...
}
```

### Cursor Glow Effect

```javascript
function updateCursorGlow(x, y, visible) {
  const cursorGlow = document.getElementById('cursor-glow');
  if (!cursorGlow) return;
  
  if (visible) {
    cursorGlow.style.opacity = '0.7';
    cursorGlow.style.left = `${x}px`;
    cursorGlow.style.top = `${y}px`;
  } else {
    cursorGlow.style.opacity = '0';
  }
}
```

### Object Rotation Feedback

The rotation of the 3D object provides immediate visual feedback to user interactions:

```javascript
function applyRotation(deltaX, deltaY) {
  // Access the mesh or scene via global reference or parameter
  const mesh = window.currentMesh || mesh3D;
  
  if (mesh) {
    // Apply rotation around world axes
    mesh.rotation.y += deltaX * 0.01;
    mesh.rotation.x += deltaY * 0.01;
    
    // Clamp rotation on X axis to prevent flipping
    mesh.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, mesh.rotation.x));
  }
}
```

### Implementing the Rotation Function

For better cross-file functionality, the rotation function is often exposed as a global method:

```javascript
// Make the rotation function globally available
window.applyPrismRotation = (deltaX, deltaY) => {
  if (mesh) {
    // Simple rotation
    mesh.rotation.y += deltaX * 0.01;
    mesh.rotation.x += deltaY * 0.01;
    
    // Clamp rotation on X axis
    mesh.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, mesh.rotation.x));
    
    // Return true to indicate successful application
    return true;
  }
  return false;
};
``` 