/**
 * Font Loading Fix
 * This script fixes issues with font loading by switching to system fonts
 * and handling sanitizer rejections
 */

(function() {
  console.log("Font Fix: Initializing font loading fixes...");
  
  // Function to disable all web font loading
  function disableWebFonts() {
    // Remove web font stylesheets
    document.querySelectorAll('link[href*="fonts"]').forEach(link => {
      if (link.href.includes('fonts.googleapis.com') || 
          link.href.includes('fonts.gstatic.com') ||
          link.href.includes('woff') ||
          link.href.includes('woff2')) {
        console.log(`Font Fix: Removing font link: ${link.href}`);
        link.remove();
      }
    });
    
    // Remove font-face rules from stylesheets
    try {
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          if (sheet.cssRules) {
            const rulesToRemove = [];
            for (let i = 0; i < sheet.cssRules.length; i++) {
              const rule = sheet.cssRules[i];
              if (rule.type === CSSRule.FONT_FACE_RULE) {
                rulesToRemove.push(i);
              }
            }
            // Remove rules in reverse order to avoid index issues
            for (let i = rulesToRemove.length - 1; i >= 0; i--) {
              sheet.deleteRule(rulesToRemove[i]);
            }
          }
        } catch (e) {
          // Cross-origin stylesheet - can't access rules
          console.log("Font Fix: Couldn't access stylesheet rules (CORS)");
        }
      });
    } catch (e) {
      console.error("Font Fix: Error processing stylesheets:", e);
    }
  }
  
  // Apply system font styles
  function applySystemFonts() {
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
      /* System font fallbacks */
      body, h1, h2, h3, h4, h5, h6, p, span, div, button, input, select, textarea {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
                     Helvetica, Arial, sans-serif, "Apple Color Emoji", 
                     "Segoe UI Emoji" !important;
      }
      
      /* Fix for specific classes */
      .splash-title, .title-word, .title-shadow {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 
                     "Segoe UI", Roboto, "Helvetica Neue", sans-serif !important;
        font-weight: 700 !important;
      }
    `;
    document.head.appendChild(style);
    console.log("Font Fix: Applied system font styles");
  }
  
  // Fix font loading errors
  function fixFontErrors() {
    // Replace original console.error to catch font loading errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const errorMsg = args.join(' ');
      
      // Check if it's a font loading error
      if (errorMsg.includes("downloadable font") && 
          errorMsg.includes("rejected by sanitizer")) {
        console.log("Font Fix: Caught font sanitizer rejection");
        
        // Only apply fixes once
        if (!window.__fontFixApplied) {
          disableWebFonts();
          applySystemFonts();
          window.__fontFixApplied = true;
        }
        
        // Don't show the original error
        return;
      }
      
      // Pass through other errors
      originalConsoleError.apply(console, args);
    };
  }
  
  // Run fixes on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    fixFontErrors();
    
    // Preemptively apply system fonts
    setTimeout(function() {
      if (!window.__fontFixApplied) {
        console.log("Font Fix: Preemptively applying system fonts");
        disableWebFonts();
        applySystemFonts();
        window.__fontFixApplied = true;
      }
    }, 1000);
  });
  
  // Run immediately if document is already loaded
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    fixFontErrors();
  }
  
  console.log("Font Fix: Initialization complete");
})();
