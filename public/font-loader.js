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
        // Check for Medium weight
        const fontMedium = new FontFace('Axiforma', 'url(/fonts/Axiforma-Medium.woff2) format("woff2")', {
          weight: '500',
          style: 'normal'
        });
        
        // Check for Bold weight
        const fontBold = new FontFace('Axiforma', 'url(/fonts/Axiforma-Bold.woff2) format("woff2")', {
          weight: '700',
          style: 'normal'
        });
        
        // Set a timeout to detect font loading failures
        const fontTimeout = setTimeout(() => {
          console.log('Font loader: Timeout - using fallbacks');
          document.documentElement.classList.add('fonts-failed');
          
          // Add Font failure handling
          const style = document.createElement('style');
          style.textContent = `
            body, h1, h2, h3, h4, h5, h6, p, button, input, select, textarea {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
          `;
          document.head.appendChild(style);
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
          });
      } catch (error) {
        console.error('Font loader: FontFace API error:', error);
        document.documentElement.classList.add('fonts-failed');
      }
    } else {
      // Fallback for browsers without FontFace API
      // Use CSS font loading detection
      document.documentElement.classList.add('no-fontface-api');
      
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
  
  // Create alternate font files if needed
  function createFontFallbacks() {
    // Fonts to check
    const fonts = [
      { name: 'Axiforma-Medium.woff', format: 'woff' },
      { name: 'Axiforma-Bold.woff', format: 'woff' },
      { name: 'Axiforma-Medium.ttf', format: 'ttf' },
      { name: 'Axiforma-Bold.ttf', format: 'ttf' }
    ];
    
    fonts.forEach(font => {
      fetch(`/fonts/${font.name}`)
        .then(response => {
          if (!response.ok && response.status === 404) {
            console.log(`Font loader: ${font.name} not found, using fallback`);
          }
        })
        .catch(error => {
          console.error(`Font loader: Error checking for ${font.name}:`, error);
        });
    });
  }
  
  // Run fallback check
  createFontFallbacks();
})(); 