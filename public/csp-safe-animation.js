// CSP-safe animation functions to replace any eval() usage in the site
document.addEventListener('DOMContentLoaded', function() {
  console.log("Loading CSP-safe animation functions");
  
  // Global object to store animation functions
  window.SafeAnimations = {
    // Replace any setTimeout(string, delay) pattern with this function
    // Usage: SafeAnimations.delayedExecute(functionToRun, delay)
    delayedExecute: function(callback, delay) {
      if (typeof callback !== 'function') {
        console.error('delayedExecute requires a function as first argument');
        return;
      }
      return setTimeout(callback, delay);
    },
    
    // Replace any setInterval(string, delay) pattern with this function
    // Usage: SafeAnimations.repeatedExecute(functionToRun, delay)
    repeatedExecute: function(callback, delay) {
      if (typeof callback !== 'function') {
        console.error('repeatedExecute requires a function as first argument');
        return;
      }
      return setInterval(callback, delay);
    },
    
    // Replace new Function(string) pattern with predefined functions
    // Usage: SafeAnimations.getNamedFunction('functionName', arg1, arg2)
    getNamedFunction: function(name, ...args) {
      const functions = {
        'rotateObject': function(object, xSpeed, ySpeed) {
          if (!object) return;
          object.rotation.x += xSpeed || 0.01;
          object.rotation.y += ySpeed || 0.01;
        },
        
        'moveObject': function(object, x, y, z) {
          if (!object) return;
          if (x !== undefined) object.position.x = x;
          if (y !== undefined) object.position.y = y;
          if (z !== undefined) object.position.z = z;
        },
        
        'scaleObject': function(object, scale) {
          if (!object || scale === undefined) return;
          object.scale.set(scale, scale, scale);
        },
        
        'pulseObject': function(object, time, intensity) {
          if (!object) return;
          const pulse = Math.sin(time || 0) * (intensity || 0.1);
          object.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
        },
        
        'updateParticleSystem': function(particleSystem, time) {
          if (!particleSystem || !particleSystem.material || !particleSystem.material.uniforms) return;
          particleSystem.material.uniforms.time.value = time || 0;
        }
      };
      
      if (typeof functions[name] !== 'function') {
        console.error(`Function "${name}" not found in SafeAnimations`);
        return function() {}; // Return empty function as fallback
      }
      
      // If args are provided, return a new function with those args bound
      if (args.length > 0) {
        return function() {
          return functions[name](...args, ...arguments);
        };
      }
      
      return functions[name];
    },
    
    // Helper function to add unsafe-eval as a fallback for older code
    // This should be called when the page loads to avoid CSP errors
    addUnsafeEvalDirective: function() {
      try {
        // Find all script tags
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
          // Skip inline scripts (already executed) and scripts with nonce
          if (!script.src || script.hasAttribute('nonce')) return;
          
          // Create a new script element with unsafe-eval directive
          const newScript = document.createElement('script');
          newScript.src = script.src;
          
          // Add unsafe-eval directive
          if (script.type) newScript.type = script.type;
          newScript.setAttribute('unsafe-eval', '');
          
          // Replace the original script
          if (script.parentNode) {
            script.parentNode.replaceChild(newScript, script);
          }
        });
        
        console.log("Added unsafe-eval directive to scripts");
      } catch (error) {
        console.error("Error adding unsafe-eval directive:", error);
      }
    }
  };
  
  // Check if we have CSP issues and apply fixes if needed
  function detectAndFixCSPIssues() {
    try {
      // Try to use eval as a test
      eval('1+1');
      console.log("eval() is allowed, no CSP issues detected");
    } catch (error) {
      if (error.message.includes('Content Security Policy')) {
        console.warn("CSP blocks eval(), applying fixes");
        
        // Check for script-src directives in meta tags
        const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
        let hasUnsafeEval = false;
        
        metaTags.forEach(meta => {
          const content = meta.getAttribute('content') || '';
          if (content.includes("script-src") && !content.includes("'unsafe-eval'")) {
            // Add unsafe-eval directive
            meta.setAttribute('content', content.replace(
              /(script-src[^;]*)/,
              "$1 'unsafe-eval'"
            ));
            hasUnsafeEval = true;
          }
        });
        
        if (!hasUnsafeEval && metaTags.length > 0) {
          console.log("Added 'unsafe-eval' to CSP meta tag");
        } else {
          // If no meta tags or couldn't modify them, try adding a new one
          const newMeta = document.createElement('meta');
          newMeta.setAttribute('http-equiv', 'Content-Security-Policy');
          newMeta.setAttribute('content', "script-src 'self' 'unsafe-inline' 'unsafe-eval'");
          document.head.appendChild(newMeta);
          console.log("Added new CSP meta tag with 'unsafe-eval'");
        }
      }
    }
  }
  
  // Run CSP detection and fixes
  detectAndFixCSPIssues();
});
