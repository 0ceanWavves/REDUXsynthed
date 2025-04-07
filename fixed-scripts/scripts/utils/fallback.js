// src/scripts/utils/fallback.js
import * as C from '../constants.js'; // Import constants

/**
 * Checks WebGL support and optionally initiates a fallback visualization.
 * @param {number} requiredLevel - 0: none, 1: webgl, 2: webgl2
 * @returns {boolean} - True if requirements are met, false otherwise.
 */
export function fallbackCheck(requiredLevel = 1) {
    const canvas = document.createElement('canvas');
    let gl = null;
    let message = "";
    let meetsRequirements = false;

    try {
        if (requiredLevel >= 1) {
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                message = "WebGL is not supported or disabled.";
            } else {
                meetsRequirements = true;
                if (requiredLevel === 2) {
                    gl = canvas.getContext('webgl2');
                    if (!gl) {
                        message = "WebGL 2 is required but not supported.";
                        meetsRequirements = false;
                    } else {
                         console.log("✅ WebGL 2 supported.");
                    }
                } else {
                    console.log("✅ WebGL supported.");
                }
            }
        } else {
            meetsRequirements = true; // No WebGL required
        }
    } catch (e) {
        message = "Error checking WebGL support: " + e.message;
    }

    if (!meetsRequirements) {
        console.warn("❌ WebGL requirements not met: " + message);
        const targetCanvas = document.getElementById(C.CANVAS_ID);
        if (targetCanvas) {
             // Remove existing fallback if present
             clearFallbackVisualization(targetCanvas);
             // Create new fallback
             createFallbackVisualization(targetCanvas);
        } else {
            console.error(`Fallback canvas #${C.CANVAS_ID} not found!`);
        }
    }

    return meetsRequirements;
}


function createFallbackVisualization(canvas) {
  console.log("Creating simple fallback visualization (src)");
  if (canvas.dataset.fallbackActive === 'true') return;
  canvas.dataset.fallbackActive = 'true';

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let angle = 0;
  let rafId = null; 

  function drawFallback() {
    if (canvas.dataset.fallbackActive !== 'true') {
        cancelAnimationFrame(rafId);
        return;
    }
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = C.FALLBACK_BG_COLOR_CSS; // Use CSS color string
    ctx.fillRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.3;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -size); ctx.lineTo(size, 0); ctx.lineTo(0, size); ctx.lineTo(-size, 0);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(-size, -size, size, size);
    gradient.addColorStop(0, C.FALLBACK_GRAD_1);
    gradient.addColorStop(1, C.FALLBACK_GRAD_2);
    ctx.fillStyle = gradient; ctx.fill();
    ctx.strokeStyle = C.FALLBACK_LINE_COLOR_1; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = C.FALLBACK_BG_COLOR_CSS; ctx.fill(); // Use CSS color string
    ctx.strokeStyle = C.FALLBACK_LINE_COLOR_2; ctx.stroke();
    ctx.restore();
    angle += 0.02;
    rafId = requestAnimationFrame(drawFallback);
  }
  // Set initial canvas size based on current window dimensions
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawFallback();
}

function clearFallbackVisualization(canvas) {
    if (canvas.dataset.fallbackActive === 'true') {
        console.log("Clearing fallback visualization (src).");
        delete canvas.dataset.fallbackActive; 
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = C.FALLBACK_BG_COLOR_CSS; // Use CSS color string
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
} 