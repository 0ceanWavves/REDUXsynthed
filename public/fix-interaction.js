// Script to fix 3D interaction issues
document.addEventListener('DOMContentLoaded', function() {
  console.log("Running interaction fix script");
  
  // IMPORTANT: Only apply this fix if AmorphousPrismFix.js is not available
  if (window.__prismTouchFixApplied) {
    console.log("AmorphousPrismFix detected - skipping old interaction fix");
    return;
  }
  
  // Check if AmorphousPrism is already active
  const amorphousPrismActive = document.getElementById('prism-controller') !== null || 
                               (window.prismaticScene && window.prismaticScene.setInteraction);
  
  if (amorphousPrismActive) {
    console.log("AmorphousPrism already active - skipping interaction fix");
    return;
  }
  
  // Force the canvas to receive pointer events
  const canvas = document.getElementById('prism-bg-canvas');
  if (canvas) {
    canvas.style.pointerEvents = 'auto';
    canvas.style.zIndex = '5';
    console.log("Canvas enabled for interaction");
  }
  
  // Force prism-background to receive pointer events
  const prismBg = document.getElementById('prism-background');
  if (prismBg) {
    prismBg.style.pointerEvents = 'auto';
    prismBg.style.zIndex = '6';
    console.log("Prism background enabled for interaction");
  }
  
  // Make splash content non-interactive to let clicks pass through
  document.querySelectorAll('.splash-title, .title-word, .gradient-text, .splash-content, .content-item, .check-circle').forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.pointerEvents = 'none'; 
    }
  });
  
  // Make buttons interactive
  document.querySelectorAll('.buttons-container a').forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.pointerEvents = 'auto';
    }
  });
  
  console.log("Interaction fix basic styles applied. Event handling bypassed due to conflict concerns.");
});