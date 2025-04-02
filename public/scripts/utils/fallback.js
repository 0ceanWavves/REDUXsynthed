// public/scripts/utils/fallback.js
import * as C from '../constants.js'; // Import constants

export function createFallbackVisualization(canvas) {
  console.log("Creating simple fallback visualization");
  // Check if canvas already has our fallback to prevent duplicates
  if (canvas.dataset.fallbackActive === 'true') {
      console.log("Fallback already active on this canvas.");
      return;
  }
  canvas.dataset.fallbackActive = 'true'; // Mark as active

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let angle = 0;
  let rafId = null; // To stop animation if needed

  function drawFallback() {
    // Stop if canvas is no longer marked for fallback
    if (canvas.dataset.fallbackActive !== 'true') {
        cancelAnimationFrame(rafId);
        console.log("Stopping fallback animation.");
        return;
    }

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = C.FALLBACK_BG_COLOR;
    ctx.fillRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.3;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    // Draw diamond
    ctx.beginPath();
    ctx.moveTo(0, -size); ctx.lineTo(size, 0); ctx.lineTo(0, size); ctx.lineTo(-size, 0);
    ctx.closePath();
    // Fill
    const gradient = ctx.createLinearGradient(-size, -size, size, size);
    gradient.addColorStop(0, C.FALLBACK_GRAD_1);
    gradient.addColorStop(1, C.FALLBACK_GRAD_2);
    ctx.fillStyle = gradient; ctx.fill();
    // Stroke diamond
    ctx.strokeStyle = C.FALLBACK_LINE_COLOR_1; ctx.lineWidth = 2; ctx.stroke();
    // Draw inner circle
    ctx.beginPath(); ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = C.FALLBACK_BG_COLOR; ctx.fill();
    // Stroke circle
    ctx.strokeStyle = C.FALLBACK_LINE_COLOR_2; ctx.stroke();
    ctx.restore();

    angle += 0.02;
    rafId = requestAnimationFrame(drawFallback);
  }
  drawFallback();
}

// Function to potentially clear the fallback if THREE loads later
export function clearFallbackVisualization(canvas) {
    if (canvas.dataset.fallbackActive === 'true') {
        console.log("Clearing fallback visualization.");
        delete canvas.dataset.fallbackActive; // Allow fallback animation to stop
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Clear one last time
            ctx.fillStyle = C.FALLBACK_BG_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
} 