// Block Cloudflare analytics to prevent CORS errors
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
      return new Promise(() => {}); // Never resolves
    }
    return originalFetch.apply(this, arguments);
  };
  
  // Remove any existing cloudflare scripts
  function removeCloudflareScripts() {
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.src && script.src.includes('cloudflareinsights.com')) {
        script.remove();
      }
    });
  }
  
  // Run immediately if document is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    removeCloudflareScripts();
  } else {
    // Otherwise wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', removeCloudflareScripts);
  }
})(); 