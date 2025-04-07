import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js'; // Import directly
import * as C from '../constants.js';

// --- Shared State ---
export const interactionState = {
    isDragging: false,
    autoRotate: true,
    targetRotation: new THREE.Quaternion(),
    rotationVelocity: new THREE.Vector2(0, 0),
    // Use damping factor from constants if available, otherwise default
    dampingFactor: C.DAMPING_FACTOR || 0.95, 
};

// --- Internal variables ---
let previousPointerPosition = { x: 0, y: 0 };
let autoRotateTimeoutId = null;
let animationFrameId = null;
// let dragThreshold = 5; // Optional: pixels threshold to start drag
// let pointerDownPos = { x: 0, y: 0 }; // Optional: for threshold check

function resumeAutoRotate() {
    clearTimeout(autoRotateTimeoutId);
    autoRotateTimeoutId = setTimeout(() => {
        if (!interactionState.isDragging) {
           interactionState.autoRotate = true;
           console.log("⏱️ Auto-rotation resumed (src)");
        }
    }, C.ROTATION_RESUME_DELAY || 2500);
}

// --- Core Interaction Handlers (Called directly) ---
// These functions contain the logic for updating the interaction state
function handleCanvasPointerDown(event, canvasElement) {
    console.log("Canvas Pointer Down Handled (via Overlay Check)");
    // pointerDownPos = { x: event.clientX, y: event.clientY }; // Optional: Store for threshold
    previousPointerPosition = { x: event.clientX, y: event.clientY }; // Always store previous
    // Do not set isDragging = true immediately if using threshold
    // interactionState.isDragging = true; 
    interactionState.autoRotate = false;
    clearTimeout(autoRotateTimeoutId);
    interactionState.rotationVelocity.set(0, 0);
    // Don't start velocity loop immediately if using threshold
    // startVelocityUpdateLoop();
}

function handleCanvasPointerMove(event) {
    // --- Optional Threshold Check --- 
    // if (!interactionState.isDragging) {
    //     const dx = event.clientX - pointerDownPos.x;
    //     const dy = event.clientY - pointerDownPos.y;
    //     if (Math.sqrt(dx*dx + dy*dy) >= dragThreshold) {
    //         interactionState.isDragging = true; // Start dragging!
    //         if (canvasElement) canvasElement.style.cursor = 'grabbing'; // Need canvasElement passed here
    //         startVelocityUpdateLoop();
    //     } else {
    //          return; // Not dragging yet
    //     }
    // }
    // --- End Optional Threshold Check --- 
    
    // If not using threshold, isDragging was set on down
    if (!interactionState.isDragging) return; 

    const deltaMove = {
        x: event.clientX - previousPointerPosition.x,
        y: event.clientY - previousPointerPosition.y
    };
    const sensitivity = (C.ROTATION_DRAG_SENSITIVITY || 0.005) * 1.5; // Slightly increased sensitivity
    // Update velocity based on drag
    interactionState.rotationVelocity.x += deltaMove.y * sensitivity * 0.1; // Apply sensitivity here
    interactionState.rotationVelocity.y += deltaMove.x * sensitivity * 0.1; // Apply sensitivity here
    previousPointerPosition = { x: event.clientX, y: event.clientY };
}

function handleCanvasPointerUp(event, canvasElement) {
    // Always reset dragging state on pointer up, regardless of previous state
    if (interactionState.isDragging) {
        console.log("Canvas Pointer Up Handled (Was Dragging)");
        if (canvasElement) canvasElement.style.cursor = 'grab';
        resumeAutoRotate();
        // Velocity loop will stop itself based on isDragging=false being set below
    } else {
        console.log("Canvas Pointer Up Handled (Was Not Dragging)");
    }
    interactionState.isDragging = false; // <<< Ensure this is always set
}

// --- Velocity Update Loop (Updates targetRotation based on velocity) ---
function updateRotationFromVelocity() {
    if (!interactionState.isDragging) {
        interactionState.rotationVelocity.multiplyScalar(interactionState.dampingFactor);
    }
    if (Math.abs(interactionState.rotationVelocity.x) < 0.0001 &&
        Math.abs(interactionState.rotationVelocity.y) < 0.0001 &&
        !interactionState.isDragging) {
        stopVelocityUpdateLoop();
        return;
    }
    const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
            interactionState.rotationVelocity.x,
            interactionState.rotationVelocity.y,
            0,
            'XYZ'
        )
    );
    interactionState.targetRotation.multiplyQuaternions(deltaRotationQuaternion, interactionState.targetRotation);
    interactionState.targetRotation.normalize();
    animationFrameId = requestAnimationFrame(updateRotationFromVelocity);
}

function startVelocityUpdateLoop() {
    if (animationFrameId === null) {
        // console.log("Starting velocity update loop (src)");
        animationFrameId = requestAnimationFrame(updateRotationFromVelocity);
    }
}

function stopVelocityUpdateLoop() {
    if (animationFrameId !== null) {
        // console.log("Stopping velocity update loop (src)");
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// --- Setup Function (Modified for Overlay Direct Calls) ---
export function setupOverlayInteractionListeners(canvas, initialQuaternion) { // Renamed for clarity
    if (!THREE) throw new Error("THREE not available for interaction setup (src).");

    const contentOverlay = document.getElementById('content-overlay');
    const contentWrapper = contentOverlay?.querySelector('.content-wrapper');

    if (!canvas || !contentOverlay || !contentWrapper) {
        console.error("Cannot setup interaction: Missing canvas, content-overlay, or content-wrapper.");
        return () => {}; // Return no-op cleanup
    }

    if (!initialQuaternion) {
        console.warn("Initial quaternion not provided to interaction setup (src).");
        initialQuaternion = new THREE.Quaternion();
    }

    // Reset state on setup
    interactionState.targetRotation.copy(initialQuaternion);
    interactionState.isDragging = false;
    interactionState.autoRotate = true;
    interactionState.rotationVelocity.set(0, 0);
    stopVelocityUpdateLoop();
    clearTimeout(autoRotateTimeoutId);

    // --- Event Listeners on Overlay (for Down) and Window (for Move/Up) --- 
    const onOverlayPointerDown = (event) => {
        const targetIsInteractiveUI = contentWrapper.contains(event.target) && event.target.closest('button, a');

        if (!targetIsInteractiveUI) {
            handleCanvasPointerDown(event, canvas); 
            event.preventDefault(); 
            // Set dragging immediately if not using threshold
            interactionState.isDragging = true;
            if (canvas) canvas.style.cursor = 'grabbing';
            startVelocityUpdateLoop();
        } else {
            console.log("Pointer down on interactive UI, not calling canvas handler.");
        }
    };

    const onWindowPointerMove = (event) => {
        if (interactionState.isDragging) {
            handleCanvasPointerMove(event); // Pass event to use clientX/Y
            event.preventDefault(); 
        }
    };

    const onWindowPointerUp = (event) => {
        // Call the core up handler regardless of where the up happens
        handleCanvasPointerUp(event, canvas);
        // isDragging is reset inside handleCanvasPointerUp now
    };

    // Attach listeners
    contentOverlay.addEventListener('pointerdown', onOverlayPointerDown, { passive: false }); 
    window.addEventListener('pointermove', onWindowPointerMove, { passive: false }); // Need preventDefault
    window.addEventListener('pointerup', onWindowPointerUp); // No preventDefault usually needed

    // --- NO Listeners Directly on Canvas needed for this logic ---
    // Remove these if they exist from previous attempts:
    // canvas.removeEventListener('pointerdown', ...);
    // canvas.removeEventListener('pointermove', ...);
    // canvas.removeEventListener('pointerup', ...);
    // canvas.removeEventListener('pointerleave', ...);

    canvas.style.cursor = 'grab';
    console.log("🕹️ Interaction listeners setup with overlay direct calls (src)");

    // Return a cleanup function
    return () => {
        console.log("🧹 Cleaning up interaction listeners (overlay direct calls) (src)...");
        // Remove overlay/window listeners
        contentOverlay.removeEventListener('pointerdown', onOverlayPointerDown);
        window.removeEventListener('pointermove', onWindowPointerMove);
        window.removeEventListener('pointerup', onWindowPointerUp);
        
        stopVelocityUpdateLoop();
        clearTimeout(autoRotateTimeoutId);
        if(canvas) canvas.style.cursor = 'default'; // Check if canvas still exists
        console.log("🕹️ Interaction listeners cleaned up (overlay direct calls) (src).");
    };
} 