// src/scripts/index-page.js
// Client-side Javascript specific to the index page.
// Handles cursor effects, section observation, and initialization.

// --- Browser Detection Info (already handled in CommonHead.astro for initial class setting) ---
const isMobile = window.innerWidth < 768;
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
const isChrome = navigator.userAgent.toLowerCase().includes('chrome') && !navigator.userAgent.toLowerCase().includes('edge');
const isIOS = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase()) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

console.log("Browser detection (JS):", { isFirefox, isChrome, isIOS, isMobile });

// --- Cursor Glow Effect (Desktop Only) ---
function initCursorGlow() {
  if (isMobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('Cursor glow disabled for mobile or reduced motion.');
    return; // Don't run on mobile or if reduced motion is preferred
  }

  const cursorGlow = document.getElementById('cursor-glow');
  if (!cursorGlow) {
    console.warn('#cursor-glow element not found.');
    return;
  }

  // Make it visible
  cursorGlow.style.opacity = '1';

  let animationFrameId = null;

  document.addEventListener('mousemove', (e) => {
    // Cancel previous frame to avoid layout thrashing
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    // Request animation frame for smooth updates
    animationFrameId = requestAnimationFrame(() => {
      // Position the glow element centered on the cursor
      cursorGlow.style.transform = `translate(${e.clientX - 25}px, ${e.clientY - 25}px)`;
    });
  }, { passive: true }); // Use passive listener for performance

  console.log('Cursor glow effect initialized.');
}

// --- Section Scroll Tracking ---
function setupSectionScrollTracking() {
  const sections = Array.from(document.querySelectorAll('.section-wrapper'));
  if (sections.length === 0) {
    console.warn('No sections found for scroll tracking.');
    return;
  }

  let navUpdateFunction = null;
  let initialActiveId = null; // Store the active ID if found before nav is ready
  let lastActiveSectionId = null;

  // Listen for the Navigation component to be ready
  document.addEventListener('navigationReady', (event) => {
    console.log('Navigation ready event received.');
    if (event.detail && typeof event.detail.updateNavHighlight === 'function') {
      navUpdateFunction = event.detail.updateNavHighlight;
      // If there was an active section identified before nav was ready, update it now
      if (initialActiveId) {
        console.log('Applying initial highlight for:', initialActiveId);
        navUpdateFunction(initialActiveId);
        initialActiveId = null; // Clear initial ID
      }
    } else {
      console.error("'navigationReady' event received, but updateNavHighlight function is missing or invalid.", event.detail);
    }
  }, { once: true }); // Listen only once

  const observerOptions = {
    root: null, // Use the viewport as the root
    rootMargin: '-15% 0px -15% 0px', // Check intersection slightly inset from viewport edges
    threshold: [0, 0.4, 0.6, 1.0], // Trigger callback at different visibility levels
  };

  const observer = new IntersectionObserver((entries) => {
    let currentActiveSection = null;

    entries.forEach(entry => {
      // Find the most visible section that meets the threshold
      if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
         // Prioritize sections that are more visible if multiple are intersecting
         if (!currentActiveSection || entry.intersectionRatio > currentActiveSection.intersectionRatio) {
             currentActiveSection = entry;
         }
      }

      // Also remove 'active' class immediately if it goes out of view
      // This prevents multiple sections being highlighted briefly during fast scrolls
      if (!entry.isIntersecting) {
           entry.target.classList.remove('active');
      }
    });

     // Update classes and nav highlight based on the single most visible section
     if (currentActiveSection) {
          const activeId = currentActiveSection.target.id;
          if (activeId !== lastActiveSectionId) {
              // Remove 'active' from previously active section
              if (lastActiveSectionId) {
                  const lastActiveElement = document.getElementById(lastActiveSectionId);
                  if (lastActiveElement) lastActiveElement.classList.remove('active');
              }

              // Add 'active' to the current section
              currentActiveSection.target.classList.add('active');

              // Update navigation highlight
              if (navUpdateFunction) {
                  navUpdateFunction(activeId);
              } else {
                  console.log('Nav not ready, storing initial ID:', activeId);
                  initialActiveId = activeId; // Store ID if nav isn't ready yet
              }
              lastActiveSectionId = activeId;
              console.log(`Active section changed to: ${activeId}`);
          }
     } else {
         // If no section is sufficiently visible, potentially clear the highlight
         // Or keep the last known highlight (current behavior)
         // if (lastActiveSectionId) {
         //     // Optionally clear highlight if nothing is active
         //     if (window.updateNavHighlight) window.updateNavHighlight(null);
         //     lastActiveSectionId = null;
         // }
     }

  }, observerOptions);

  // Observe all section wrappers
  sections.forEach(section => {
    observer.observe(section);
    console.log(`Observing section: #${section.id}`);
  });

  // Start observing sections
  sections.forEach(section => {
    observer.observe(section);
  });
  
  // Clean up observer on page unload (optional but good practice)
  window.addEventListener('beforeunload', () => {
    if (observer) { // Check if observer exists before disconnecting
        observer.disconnect();
    }
  });

  console.log('Section scroll tracking initialized.');
}

// --- Initialization on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing index page scripts...');

  // Initialize Cursor Effect
  initCursorGlow();

  // Setup Section Scroll Tracking
  setupSectionScrollTracking();

  // --- Interaction Fixes & Enhancements ---

  // Ensure 3D elements can be interacted with (Double-check styles applied in head)
  const canvas = document.getElementById('prism-bg-canvas');
  if (canvas) {
    // Check if pointer events need adjustment (especially for Chrome mobile override)
    if (isChrome && isMobile) {
        canvas.style.pointerEvents = 'none';
        canvas.style.touchAction = 'pan-y'; // Allow scrolling
        console.log('Applied Chrome mobile pointer-events fix to canvas.');
    } else if (isMobile) {
        canvas.style.touchAction = 'pan-y'; // Allow scrolling on all mobile browsers
        console.log('Applied mobile touch-action: pan-y to canvas');
    } else {
        canvas.style.pointerEvents = 'auto'; // Ensure it's auto otherwise
        console.log('Canvas interaction styles verified.');
    }
  }

  const prismBg = document.getElementById('prism-background');
  if (prismBg) {
     if (isChrome && isMobile) {
        prismBg.style.pointerEvents = 'none';
        prismBg.style.touchAction = 'pan-y';
        console.log('Applied Chrome mobile pointer-events fix to prism background.');
    } else if (isMobile) {
        prismBg.style.touchAction = 'pan-y';
        console.log('Applied mobile touch-action: pan-y to prism background');
    } else {
        prismBg.style.pointerEvents = 'auto';
        console.log('Prism background interaction styles verified.');
    }
  }

  // Special fix for Chrome mobile scrolling performance/behavior
  if (isMobile) {
    // Apply passive listeners to potentially improve scroll performance
    ['touchstart', 'touchmove'].forEach(evt => {
        window.addEventListener(evt, () => {}, { passive: true });
    });
    console.log('Applied passive scroll listeners for mobile browsers.');

    // Check all canvas elements and ensure they allow scrolling
    document.querySelectorAll('canvas').forEach(canvasEl => {
        canvasEl.style.touchAction = 'pan-y';
        console.log(`Applied pan-y touch-action to canvas: ${canvasEl.id || 'unnamed canvas'}`);
    });
    
    // Re-check pointer events on flow background as well
     const flowCanvas = document.getElementById('flow-bg-canvas');
     if (flowCanvas) {
         flowCanvas.style.pointerEvents = 'none';
         flowCanvas.style.touchAction = 'pan-y';
         console.log('Applied mobile pointer-events fix to flow background.');
     }
  }

  console.log('Index page scripts initialization complete.');
}); 