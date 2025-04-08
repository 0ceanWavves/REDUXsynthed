/**
 * Cloudflare Environment Detection Utility
 * 
 * This module provides functions to determine if the current environment is Cloudflare
 * and apply appropriate fixes.
 */

/**
 * Detects if the application is running in a Cloudflare deployment environment
 * 
 * @returns {boolean} True if running in Cloudflare, false otherwise
 */
export function isCloudflareEnvironment() {
  if (typeof window === 'undefined') return false;
  
  // Check domain patterns specific to Cloudflare
  const isCloudflareHost = window.location.hostname?.includes('pages.dev');
  const isCloudflareWorkerHost = window.location.hostname?.includes('workers.dev');
  
  // Check URL patterns
  const isCloudflareURL = window.location.href?.includes('pages.dev') || 
                          window.location.href?.includes('workers.dev');
  
  // Check for Cloudflare-specific meta tags
  const hasCloudflareHeaders = !!document.querySelector('meta[name="cf-pages"]');
  
  // Check for other Cloudflare indicators
  const hasCloudflareCookies = document.cookie.includes('__cf');
  
  // User agent might contain Cloudflare references in some cases
  const userAgent = navigator.userAgent || '';
  const hasCloudflareUserAgent = userAgent.includes('CloudFront') || 
                                 userAgent.includes('CloudFlare');
  
  // Return true if any of the conditions are met
  return isCloudflareHost || 
         isCloudflareWorkerHost || 
         isCloudflareURL || 
         hasCloudflareHeaders || 
         hasCloudflareCookies || 
         hasCloudflareUserAgent;
}

/**
 * Apply Cloudflare-specific fixes to the DOM if in Cloudflare environment
 * 
 * @returns {boolean} True if fixes were applied, false otherwise
 */
export function applyCloudflareFixesIfNeeded() {
  // Only apply fixes if in Cloudflare environment
  if (!isCloudflareEnvironment()) return false;
  
  console.log("🌩️ Detected Cloudflare environment, applying fixes...");
  
  try {
    // Load Cloudflare-specific CSS if not already loaded
    if (!document.querySelector('link[href*="cloudflare-center-fix.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/cloudflare-center-fix.css';
      document.head.appendChild(link);
      console.log("🌩️ Added Cloudflare CSS fixes");
    }
    
    // Add position fixes script if not already added
    if (!document.querySelector('script[src*="cloudflare-position-fix.js"]')) {
      const script = document.createElement('script');
      script.src = '/cloudflare-position-fix.js';
      document.body.appendChild(script);
      console.log("🌩️ Added Cloudflare JS fixes");
    }
    
    // Apply inline style fixes to ensure proper centering
    const applyToCanvas = (canvas) => {
      if (!canvas) return;
      
      canvas.style.position = 'absolute';
      canvas.style.top = '50%';
      canvas.style.left = '50%';
      canvas.style.transform = 'translate(-50%, -50%)';
      canvas.style.maxWidth = '100vw';
      canvas.style.maxHeight = '100vh';
      canvas.style.margin = '0';
      canvas.style.willChange = 'transform';
      canvas.style.backfaceVisibility = 'hidden';
      canvas.style.transformStyle = 'preserve-3d';
      
      // Add data attribute to mark as fixed
      canvas.setAttribute('data-cloudflare-fixed', 'true');
      
      console.log("🌩️ Applied inline fixes to canvas:", canvas.id || 'unnamed canvas');
    };
    
    // Find all canvas elements and apply fixes
    document.querySelectorAll('canvas').forEach(applyToCanvas);
    
    // Set up observer to catch dynamically added canvas elements
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach(node => {
            // Check if node is a canvas
            if (node.nodeName === 'CANVAS' && !node.hasAttribute('data-cloudflare-fixed')) {
              applyToCanvas(node);
            }
            
            // Check for canvas elements inside the added node
            if (node.querySelectorAll) {
              node.querySelectorAll('canvas:not([data-cloudflare-fixed])').forEach(applyToCanvas);
            }
          });
        }
      });
    });
    
    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("🌩️ Cloudflare fixes successfully applied");
    return true;
  } catch (error) {
    console.error("🌩️ Error applying Cloudflare fixes:", error);
    return false;
  }
}

// Export an object with both functions
export default {
  isCloudflareEnvironment,
  applyCloudflareFixesIfNeeded
};
