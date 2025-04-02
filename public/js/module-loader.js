/**
 * module-loader.js - Fix module paths and ensure imports work correctly
 */

(function() {
  // Track if we've already fixed import paths
  if (window.__MODULE_PATHS_FIXED) {
    console.log('Module paths already fixed, skipping');
    return;
  }

  console.log('Initializing module path fixer');

  // Fix for modulepreload polyfill if needed
  if (!('modulepreload' in document.createElement('link'))) {
    console.log('Adding modulepreload polyfill');
    const preloadLinks = document.querySelectorAll('link[rel="modulepreload"]');
    if (preloadLinks.length > 0) {
      preloadLinks.forEach(link => {
        // Convert to regular preload
        link.setAttribute('rel', 'preload');
        link.setAttribute('as', 'script');
      });
    }
  }
  
  // Create MIME type fix for module scripts
  function patchFetch() {
    // Only patch fetch if running on localhost (development)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.log('Not running on localhost, skipping fetch patch');
      return;
    }
    
    console.log('Patching fetch for module loading on localhost');
    
    // Store original fetch
    const originalFetch = window.fetch;
    
    // Override fetch to fix MIME type issues
    window.fetch = function(input, init) {
      // Only modify requests for JavaScript modules
      if (typeof input === 'string' && 
          (input.endsWith('.js') || input.endsWith('.mjs')) && 
          !input.includes('://')) {
        
        console.log(`Applying MIME type fix for module: ${input}`);
        
        // Create a modified init object with MIME type override
        const modifiedInit = init || {};
        modifiedInit.headers = new Headers(modifiedInit.headers || {});
        
        // Add headers that allow JavaScript modules
        modifiedInit.headers.set('Accept', 'application/javascript');
        
        // Return customized fetch
        return originalFetch(input, modifiedInit)
          .then(response => {
            if (!response.ok && response.status === 404) {
              console.warn(`Module not found: ${input}`);
              
              // Try alternate paths
              const alternativePaths = [
                `/src${input.startsWith('/') ? input : '/' + input}`,
                `/components${input.startsWith('/') ? input : '/' + input}`
              ];
              
              console.log(`Trying alternate paths: ${alternativePaths.join(', ')}`);
              
              // Return a promise that tries alternate paths
              return Promise.all(
                alternativePaths.map(path => 
                  originalFetch(path, modifiedInit)
                    .then(altResponse => {
                      if (altResponse.ok) {
                        console.log(`Found module at alternate path: ${path}`);
                        return new Response(altResponse.body, {
                          status: 200,
                          statusText: 'OK',
                          headers: new Headers({
                            'Content-Type': 'application/javascript',
                            ...Object.fromEntries(altResponse.headers.entries())
                          })
                        });
                      }
                      return Promise.reject(`Not found at ${path}`);
                    })
                    .catch(e => Promise.reject(e))
                )
              )
              .then(responses => responses[0]) // Return first successful response
              .catch(e => {
                console.error(`All alternate paths failed: ${e}`);
                return response; // Return original 404 response if all alternates fail
              });
            }
            
            // For successful responses, ensure correct MIME type
            if (response.ok) {
              return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: new Headers({
                  'Content-Type': 'application/javascript',
                  ...Object.fromEntries(response.headers.entries())
                })
              });
            }
            
            return response;
          });
      }
      
      // Pass through unmodified for non-JS requests
      return originalFetch(input, init);
    };
  }
  
  // Apply fetch patch
  patchFetch();

  // Cannot directly override the import function as it's not a regular function
  // Instead, we'll provide a helper function for dynamic imports
  
  // Map of common module path patterns that might need fixing
  const pathMappings = {
    // Convert relative paths to absolute
    '../components/': '/src/components/',
    './components/': '/src/components/',
    '../': '/',
    './': '/',
    
    // Convert relative module imports to include leading slash
    'components/': '/src/components/',
    'src/': '/src/'
  };

  // Define import path fixer
  window.__fixImportPath = function(path) {
    // Skip URLs that already have a protocol or are from CDN
    if (path.includes('://') || path.includes('cdn.') || path.includes('unpkg.') || path.includes('jsdelivr.')) {
      return path;
    }
    
    // Apply path mappings
    let fixedPath = path;
    for (const [pattern, replacement] of Object.entries(pathMappings)) {
      if (fixedPath.startsWith(pattern)) {
        fixedPath = fixedPath.replace(pattern, replacement);
        break;
      }
    }
    
    // Ensure paths always have a leading slash for absolute URL resolution
    if (!fixedPath.startsWith('/') && !fixedPath.startsWith('http')) {
      fixedPath = '/' + fixedPath;
    }
    
    // Ensure .js extension is present
    if (!fixedPath.includes('.') && !fixedPath.endsWith('/')) {
      fixedPath += '.js';
    }
    
    // Log if we've changed the path
    if (fixedPath !== path) {
      console.log(`Fixed module path: ${path} -> ${fixedPath}`);
    }
    
    return fixedPath;
  };

  // Create a proxy for dynamic imports
  window.__dynamicImport = function(path) {
    const fixedPath = window.__fixImportPath(path);
    
    // For localhost development, ensure we can fetch the module with correct MIME type
    if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
        !fixedPath.includes('://')) {
      
      return fetch(fixedPath, {
        headers: {
          'Accept': 'application/javascript'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch module: ${fixedPath}`);
        }
        return response.text();
      })
      .then(moduleSource => {
        // Create a Blob with the correct MIME type
        const blob = new Blob([moduleSource], { type: 'application/javascript' });
        const objectUrl = URL.createObjectURL(blob);
        
        // Import the module from the object URL
        return import(objectUrl).finally(() => {
          // Clean up the object URL after import
          URL.revokeObjectURL(objectUrl);
        });
      })
      .catch(error => {
        console.error(`Failed to import module '${fixedPath}' (original: '${path}')`, error);
        
        // Try with fallback paths if initial import fails
        if (!fixedPath.startsWith('/src/components/')) {
          console.log(`Trying fallback path for ${fixedPath}`);
          return window.__dynamicImport('/src/components/' + path.replace(/^[\.\/]*components\//, ''));
        }
        
        throw error;
      });
    }
    
    // Normal import for non-localhost or CDN resources
    return import(fixedPath).catch(error => {
      console.error(`Failed to import module '${fixedPath}' (original: '${path}')`, error);
      
      // Try with fallback paths if initial import fails
      if (!fixedPath.startsWith('/src/components/')) {
        console.log(`Trying fallback path for ${fixedPath}`);
        return import('/src/components/' + path.replace(/^[\.\/]*components\//, ''))
          .catch(fallbackError => {
            console.error(`Fallback import also failed:`, fallbackError);
            throw error; // Throw original error if fallback also fails
          });
      }
      
      throw error;
    });
  };

  // Add a console helper for debugging
  console.moduleDebug = function(path) {
    console.log(`Original path: ${path}`);
    console.log(`Fixed path: ${window.__fixImportPath(path)}`);
    fetch(window.__fixImportPath(path))
      .then(res => {
        console.log(`Status: ${res.status}`);
        return res.text();
      })
      .then(text => {
        console.log(`Content (first 100 chars): ${text.substring(0, 100)}...`);
      })
      .catch(err => {
        console.error(`Error fetching: ${err}`);
      });
  };

  // Create the proper THREE reference if it exists
  if (window.THREE) {
    console.log('THREE is defined, ensuring proper exports');
    // Make sure THREE is available globally
    window.THREE = window.THREE;
  } else {
    console.warn('THREE is not defined in the global scope - this may cause issues');
  }

  // Flag that we've fixed module paths
  window.__MODULE_PATHS_FIXED = true;
  console.log('Module path fixer initialized');
})(); 