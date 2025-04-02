/**
 * Font Loader Script
 * 
 * Handles font loading with proper failure detection and fallbacks
 */

(function() {
  console.log('Font loader: Starting');

  // Font loading detection with timeout
  function checkFontLoading() {
    // Use FontFace API if available
    if ('FontFace' in window) {
      try {
        // Use only local fonts - we verified these exist in public/fonts/
        const fontSources = {
          medium: [
            `url(${window.location.origin}/fonts/Axiforma-Medium.woff2) format("woff2")`
          ],
          bold: [
            `url(${window.location.origin}/fonts/Axiforma-Bold.woff2) format("woff2")`
          ]
        };
        
        // Check for Medium weight
        const fontMedium = new FontFace('Axiforma', fontSources.medium.join(', '), {
          weight: '500',
          style: 'normal'
        });
        
        // Check for Bold weight
        const fontBold = new FontFace('Axiforma', fontSources.bold.join(', '), {
          weight: '700',
          style: 'normal'
        });
        
        // Set a timeout to detect font loading failures
        const fontTimeout = setTimeout(() => {
          console.log('Font loader: Timeout - using fallbacks');
          document.documentElement.classList.add('fonts-failed');
          
          // Add font failure handling - inject system fonts as fallback
          injectFallbackFonts();
        }, 2000); // 2 second timeout
        
        // Load the fonts
        Promise.all([fontMedium.load(), fontBold.load()])
          .then(fonts => {
            fonts.forEach(font => {
              document.fonts.add(font);
            });
            
            clearTimeout(fontTimeout);
            console.log('Font loader: Fonts loaded successfully');
            document.documentElement.classList.add('font-loaded');
          })
          .catch(error => {
            console.error('Font loader: Error loading fonts:', error);
            document.documentElement.classList.add('fonts-failed');
            
            // Use system fonts instead
            injectFallbackFonts();
          });
      } catch (error) {
        console.error('Font loader: FontFace API error:', error);
        document.documentElement.classList.add('fonts-failed');
        
        // Use system fonts as fallback
        injectFallbackFonts();
      }
    } else {
      // Fallback for browsers without FontFace API
      // Use CSS font loading detection
      document.documentElement.classList.add('no-fontface-api');
      
      // Add inline CSS for font fallbacks
      injectFallbackFonts();
      
      // Set a timeout for CSS-based font loading
      setTimeout(() => {
        console.log('Font loader: Using CSS-based detection');
        const isFontLoaded = doesFontExist('Axiforma');
        
        if (isFontLoaded) {
          document.documentElement.classList.add('font-loaded');
        } else {
          document.documentElement.classList.add('fonts-failed');
        }
      }, 1000);
    }
  }
  
  // Helper function to inject fallback fonts directly
  function injectFallbackFonts() {
    const style = document.createElement('style');
    style.textContent = `
      body, h1, h2, h3, h4, h5, h6, p, button, input, select, textarea {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      }
    `;
    document.head.appendChild(style);
    console.log('Font loader: Injected system font fallbacks');
  }
  
  // Helper function to check if a font exists using CSS
  function doesFontExist(fontName) {
    // Try to detect if the font is available
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const h = document.getElementsByTagName('body')[0];
    
    const s = document.createElement('span');
    s.style.fontSize = testSize;
    s.innerHTML = testString;
    
    const defaultWidth = {};
    const defaultHeight = {};
    
    for (const font of baseFonts) {
      s.style.fontFamily = font;
      h.appendChild(s);
      defaultWidth[font] = s.offsetWidth;
      defaultHeight[font] = s.offsetHeight;
      h.removeChild(s);
    }
    
    let matched = false;
    
    for (const font of baseFonts) {
      s.style.fontFamily = `${fontName}, ${font}`;
      h.appendChild(s);
      const match = (s.offsetWidth !== defaultWidth[font] || s.offsetHeight !== defaultHeight[font]);
      h.removeChild(s);
      
      if (match) {
        matched = true;
        break;
      }
    }
    
    return matched;
  }
  
  // Run the font loading check
  checkFontLoading();
  
  // Add special handling for font preload links
  function updateFontPreloadLinks() {
    const preloadLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
    preloadLinks.forEach(link => {
      if (!link.hasAttribute('crossorigin')) {
        link.setAttribute('crossorigin', 'anonymous');
        console.log('Font loader: Added crossorigin to font preload:', link.href);
      }
    });
  }
  
  // Update existing preload links
  updateFontPreloadLinks();
})(); 