/**
 * CSP Relaxer
 * This script adds a meta tag to relax Content Security Policy for Three.js and fonts
 */
(function() {
  // Only run once
  if (window.__CSP_RELAXED) return;
  window.__CSP_RELAXED = true;
  
  console.log("🛡️ CSP Relaxer: Adding relaxed Content Security Policy for Three.js application");
  
  // Create meta tag for CSP
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.cdnfonts.com; " +
    "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net " +
    "https://db.onlinewebfonts.com https://fonts.cdnfonts.com; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com; " +
    "worker-src 'self' blob:; " +
    "frame-src 'self'";
  
  // Add to document head
  document.head.appendChild(cspMeta);
  
  // Fix module MIME types
  const moduleScript = document.createElement('script');
  moduleScript.textContent = `
    // Fix for blocked module imports
    (function() {
      const origFetch = window.fetch;
      window.fetch = async function(url, options) {
        // If fetching a module, add proper headers for modules
        if (url && typeof url === 'string' && (
            url.includes('/components/three/') || 
            url.includes('/src/components/three/') ||
            url.includes('.astro?astro&type=script'))) {
          options = options || {};
          options.headers = options.headers || {};
          // Force JavaScript MIME type
          options.headers['Accept'] = 'application/javascript';
        }
        return origFetch(url, options);
      };
      
      // Fix XMLHttpRequest for modules
      const origXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function() {
        const result = origXHROpen.apply(this, arguments);
        const url = arguments[1];
        
        if (url && typeof url === 'string' && (
            url.includes('/components/three/') || 
            url.includes('/src/components/three/') ||
            url.includes('.astro?astro&type=script'))) {
          this.setRequestHeader('Accept', 'application/javascript');
        }
        
        return result;
      };
      
      console.log("🛡️ CSP Relaxer: Added fetch and XHR overrides for module loading");
    })();
  `;
  
  // Add to document
  document.head.appendChild(moduleScript);
  
  // Fix paths by adding base path where needed
  const basePathFixScript = document.createElement('script');
  basePathFixScript.textContent = `
    // Fix module import paths
    (function() {
      // Intercept dynamic imports to fix paths
      const originalImport = window.import || (() => Promise.reject(new Error("Import not available")));
      
      window.import = function(url) {
        // Fix paths that don't include src/ prefix
        if (url.startsWith('/components/three/')) {
          url = '/src' + url;
          console.log("🛡️ CSP Relaxer: Fixed import path to: " + url);
        }
        
        return originalImport.call(this, url).catch(err => {
          console.error("Import error for: " + url, err);
          
          // Fallback for persistent errors
          if (url.includes('/three/')) {
            // Create a message for the user
            const errorMessage = document.createElement('div');
            errorMessage.style.position = 'fixed';
            errorMessage.style.bottom = '10px';
            errorMessage.style.right = '10px';
            errorMessage.style.padding = '10px';
            errorMessage.style.background = 'rgba(0,0,0,0.7)';
            errorMessage.style.color = 'white';
            errorMessage.style.borderRadius = '5px';
            errorMessage.style.zIndex = '10000';
            errorMessage.textContent = "Module loading error. Try refreshing the page.";
            document.body.appendChild(errorMessage);
            
            // Remove after 5 seconds
            setTimeout(() => {
              document.body.removeChild(errorMessage);
            }, 5000);
          }
          
          throw err;
        });
      };
      
      console.log("🛡️ CSP Relaxer: Added import path fixer");
    })();
  `;
  
  // Add to document
  document.head.appendChild(basePathFixScript);
  
  console.log("🛡️ CSP Relaxer: CSP configuration applied");
})();
