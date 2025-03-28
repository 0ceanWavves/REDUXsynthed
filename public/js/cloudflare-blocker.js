// Enhanced Cloudflare analytics blocker to prevent CORS errors
(function() {
  // Prevent Cloudflare analytics from loading
  window._cf_chl_opt = {
    cvId: "2",
    cType: "non-interactive",
    cNounce: "12345",
    cRay: "00000000000000000",
    cHash: "0000000000000000000000000000000000000000",
    cRq: { ru: "aHR0cHM6Ly9zeW50aGVkLnh5eg==", ra: "", rm: "R0VU", d: "0", t: "MTcwMzExMjc0MQ==", m: "0" }
  };
  
  // Block any cloudflareinsights.com requests
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string' && input.includes('cloudflareinsights.com')) {
      console.log('Blocked Cloudflare analytics fetch request:', input);
      return Promise.resolve(new Response('', { status: 200 })); // Fake success response
    }
    return originalFetch.apply(this, arguments);
  };
  
  // Override XMLHttpRequest to block Cloudflare requests
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string' && url.includes('cloudflareinsights.com')) {
      console.log('Blocked Cloudflare analytics XHR request:', url);
      this.abort(); // Abort the request
      return;
    }
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };
  
  // Remove any existing cloudflare scripts and fix integrity issues
  function handleCloudflareScripts() {
    // First remove any existing scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.src && script.src.includes('cloudflareinsights.com')) {
        console.log('Removing Cloudflare analytics script:', script.src);
        script.remove();
      }
    });
    
    // Add a MutationObserver to catch any scripts that get added dynamically
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'SCRIPT') {
              const script = node;
              if (script.src && script.src.includes('cloudflareinsights.com')) {
                console.log('Removing dynamically added Cloudflare script:', script.src);
                script.remove();
              }
              
              // Remove integrity attributes to prevent hash mismatch errors
              if (script.getAttribute('integrity')) {
                console.log('Removing integrity attribute from script:', script.src);
                script.removeAttribute('integrity');
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.documentElement, { 
      childList: true, 
      subtree: true 
    });
  }
  
  // Run immediately if document is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    handleCloudflareScripts();
  } else {
    // Otherwise wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', handleCloudflareScripts);
  }
  
  // Handle integrity issues by patching createElement
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    if (tagName.toLowerCase() === 'script') {
      // Override setAttribute to intercept integrity attributes
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name.toLowerCase() === 'integrity' && this.src && this.src.includes('cloudflareinsights.com')) {
          console.log('Blocked setting integrity attribute on Cloudflare script');
          return;
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    return element;
  };
})(); 