// public/scripts/controls/interaction.js
// import * as THREE from 'three'; // Assuming THREE is globally available
import * as C from '../constants.js';

// --- Shared State ---
// Exporting the state object allows the animation loop to read it directly
export const interactionState = {
    isDragging: false,
    autoRotate: true,
    // Store target rotation as quaternion for smooth interpolation by animation loop
    targetRotation: new THREE.Quaternion(),
    // --- NEW: Add velocity and damping --- 
    rotationVelocity: new THREE.Vector2(0, 0), // Store velocity (x, y axes)
    dampingFactor: 0.95, // How quickly velocity decays (closer to 1 = slower decay)
};

// --- Internal variables ---
let previousPointerPosition = { x: 0, y: 0 }; // Renamed for clarity
let autoRotateTimeoutId = null;
let boundPointerUp = null; // To store bound listener for removal
let boundTouchEnd = null; // To store bound listener for removal
let boundTouchCancel = null;
let animationFrameId = null; // For the velocity update loop

function resumeAutoRotate() {
    clearTimeout(autoRotateTimeoutId); // Clear any pending timeout
    autoRotateTimeoutId = setTimeout(() => {
        // Check dragging state again before resuming, user might have started again
        if (!interactionState.isDragging) {
           interactionState.autoRotate = true;
           console.log("⏱️ Auto-rotation resumed");
        }
    }, C.ROTATION_RESUME_DELAY);
}

// --- Event Handlers ---
function handlePointerDown(x, y, canvas) {
    interactionState.isDragging = true;
    interactionState.autoRotate = false; // Pause rotation
    clearTimeout(autoRotateTimeoutId); // Stop pending resume
    previousPointerPosition = { x, y };
    interactionState.rotationVelocity.set(0, 0); // Reset velocity on new drag
    if (canvas) canvas.style.cursor = 'grabbing';
    startVelocityUpdateLoop(); // Start applying velocity if not already running
}

function handlePointerMove(x, y) {
    if (!interactionState.isDragging) return;
    const deltaMove = {
        x: x - previousPointerPosition.x,
        y: y - previousPointerPosition.y
    };

    // --- NEW: Update velocity instead of directly rotating --- 
    // Apply sensitivity and add to current velocity
    interactionState.rotationVelocity.x += deltaMove.y * C.ROTATION_DRAG_SENSITIVITY * 0.1; // Adjust sensitivity multiplier as needed
    interactionState.rotationVelocity.y += deltaMove.x * C.ROTATION_DRAG_SENSITIVITY * 0.1;

    previousPointerPosition = { x, y };
}

function handlePointerUp(canvas) {
    if (!interactionState.isDragging) return; // Only act if we were dragging
    interactionState.isDragging = false;
    if (canvas) canvas.style.cursor = 'grab';
    resumeAutoRotate(); // Start timer to resume auto-rotation
    // NOTE: Velocity update loop continues until velocity decays
}

// --- NEW: Velocity Update Loop ---
function updateRotationFromVelocity() {
    if (!interactionState.isDragging) {
        // Apply damping only when not dragging
        interactionState.rotationVelocity.multiplyScalar(interactionState.dampingFactor);
    }

    // Stop update loop if velocity is negligible
    if (Math.abs(interactionState.rotationVelocity.x) < 0.0001 && 
        Math.abs(interactionState.rotationVelocity.y) < 0.0001 &&
        !interactionState.isDragging) // Ensure we stop only if not dragging
    { 
        stopVelocityUpdateLoop();
        return;
    }

    // Calculate rotation delta from velocity for this frame
    const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
            interactionState.rotationVelocity.x, // Apply velocity directly (already includes sensitivity)
            interactionState.rotationVelocity.y,
            0,
            'XYZ'
        )
    );

    // Apply the delta to the target rotation quaternion
    interactionState.targetRotation.multiplyQuaternions(deltaRotationQuaternion, interactionState.targetRotation);
    interactionState.targetRotation.normalize();

    // Request next frame
    animationFrameId = requestAnimationFrame(updateRotationFromVelocity);
}

function startVelocityUpdateLoop() {
    if (animationFrameId === null) { // Only start if not already running
        console.log("Starting velocity update loop");
        animationFrameId = requestAnimationFrame(updateRotationFromVelocity);
    }
}

function stopVelocityUpdateLoop() {
    if (animationFrameId !== null) {
        console.log("Stopping velocity update loop");
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// --- Setup Function ---
export function setupInteractionListeners(canvas, initialQuaternion) {
    if (!window.THREE) throw new Error("THREE not available for interaction setup.");
    const THREE = window.THREE;

    // Initialize target rotation with the mesh's starting rotation
    interactionState.targetRotation.copy(initialQuaternion);

    // --- Mouse Listeners ---
    const onMouseDown = (e) => handlePointerDown(e.clientX, e.clientY, canvas);
    const onMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
    // Use bound function for listeners attached to window/document for easy removal
    boundPointerUp = () => handlePointerUp(canvas);
    const onMouseLeave = () => handlePointerUp(canvas); // Stop drag if mouse leaves canvas

    canvas.addEventListener('mousedown', onMouseDown);
    // Attach mousemove and mouseup to window to capture drag outside canvas
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', boundPointerUp);
    canvas.addEventListener('mouseleave', onMouseLeave); // Handle leaving canvas element

    // --- Touch Listeners ---
    const onTouchStart = (e) => {
        if (e.touches.length === 1) {
            // e.preventDefault(); // Prevent default only if needed (can prevent scroll)
            handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, canvas);
        }
    };
    const onTouchMove = (e) => {
        if (e.touches.length === 1) {
             e.preventDefault(); // Usually prevent default on touchmove to avoid scroll during drag
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    };
     // Use bound function for listeners attached to window/document for easy removal
    boundTouchEnd = (e) => {
         // Check if the interaction is ending (no touches left) and we were dragging
         if (e.touches.length === 0 && interactionState.isDragging) {
            handlePointerUp(canvas);
         }
    };
    boundTouchCancel = () => handlePointerUp(canvas); // Handle interruption

    canvas.addEventListener('touchstart', onTouchStart /*, { passive: true } */); // Consider passive: false if preventDefault is needed
    canvas.addEventListener('touchmove', onTouchMove, { passive: false }); // Need passive: false to use preventDefault
    window.addEventListener('touchend', boundTouchEnd);
    window.addEventListener('touchcancel', boundTouchCancel);

    // Set initial cursor
    canvas.style.cursor = 'grab';
    console.log("🕹️ Interaction listeners setup");

    // Return a cleanup function
    return () => {
        console.log("🧹 Cleaning up interaction listeners...");
        canvas.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', boundPointerUp);
        canvas.removeEventListener('mouseleave', onMouseLeave);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', boundTouchEnd);
        window.removeEventListener('touchcancel', boundTouchCancel);
        stopVelocityUpdateLoop(); // Stop the velocity loop on cleanup
        clearTimeout(autoRotateTimeoutId); // Clear any pending auto-rotate resume
        canvas.style.cursor = 'default'; // Reset cursor
        console.log("🕹️ Interaction listeners cleaned up.");
    };
} 