/**
 * Amorphous Prism Initialization
 * Separated from the main component to reduce file size and improve maintainability
 */

// Ensure we have exclusive ownership of the THREE global
if (window.__AMORPHOUS_PRISM_LOADING) {
  console.log("AmorphousPrism already loading, skipping duplicate initialization");
} else {
  // Mark as loading to prevent duplicate initialization
  window.__AMORPHOUS_PRISM_LOADING = true;
  
  // Debug log - help identify execution
  console.log("🔍 AmorphousPrism init script started");
  
  // Create a temporary THREE placeholder to prevent errors
  if (!window.THREE) {
    console.log("Setting up THREE placeholder until library loads");
    window.THREE = {
      Vector3: function() { return {x: 0, y: 0, z: 0}; },
      Color: function() { return {r: 0, g: 0, b: 0}; },
      Texture: function() { return {}; },
      __isPlaceholder: true
    };
  }
  
  // Function to safely load THREE.js using CDN
  async function loadThreeJS() {
    console.log("🔍 Attempting to load THREE.js");
    
    try {
      // Check if THREE is already properly loaded in window
      if (typeof window !== 'undefined' && window.THREE && !window.THREE.__isPlaceholder) {
        console.log("Using existing THREE instance - avoiding duplicate import");
        
        // Configure Three.js if needed
        configureThreeJS(window.THREE);
        
        return window.THREE;
      }
      
      // Load THREE.js from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.min.js';
      script.async = true;
      
      // Create promise to wait for script load
      const loadPromise = new Promise((resolve, reject) => {
        script.onload = () => {
          console.log("Three.js loaded successfully from CDN");
          
          // Make sure placeholder is removed
          if (window.THREE.__isPlaceholder) {
            delete window.THREE.__isPlaceholder;
          }
          
          // Configure Three.js
          configureThreeJS(window.THREE);
          
          resolve(window.THREE);
        };
        
        script.onerror = (error) => {
          console.error("Failed to load Three.js from CDN:", error);
          reject(error);
        };
      });
      
      // Add script to document
      document.head.appendChild(script);
      
      return loadPromise;
    } catch (error) {
      console.error("❌ THREE.js loading failed:", error);
      throw error;
    }
  }
  
  /**
   * Apply any necessary configurations or fixes to Three.js
   * @param {Object} THREE - The Three.js instance
   */
  function configureThreeJS(THREE) {
    console.log("Configuring THREE.js instance");
    
    // Apply critical shader chunk fixes if needed
    if (THREE && THREE.ShaderChunk) {
      // Add colorspace_fragment chunk if missing
      if (!THREE.ShaderChunk.colorspace_fragment) {
        THREE.ShaderChunk.colorspace_fragment = `
  #if defined( TONE_MAPPING )
    gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
  #endif

  #ifdef LINEAR_TO_SRGB
    gl_FragColor.rgb = linearToSRGB( gl_FragColor.rgb );
  #endif
  `;
        console.log("🛠️ Applied fix: Added missing colorspace_fragment shader chunk");
      }
      
      // Add colorspace_pars_fragment chunk if missing
      if (!THREE.ShaderChunk.colorspace_pars_fragment) {
        THREE.ShaderChunk.colorspace_pars_fragment = `
  #ifdef LINEAR_TO_SRGB
    vec3 linearToSRGB(vec3 value) {
      return mix(
        pow(value, vec3(0.41666)) * 1.055 - vec3(0.055),
        value * 12.92,
        vec3(lessThanEqual(value, vec3(0.0031308)))
      );
    }
  #endif

  #ifdef SRGB_TO_LINEAR
    vec3 sRGBToLinear(vec3 value) {
      return mix(
        pow((value + vec3(0.055)) / vec3(1.055), vec3(2.4)),
        value / vec3(12.92),
        vec3(lessThanEqual(value, vec3(0.04045)))
      );
    }
  #endif
  `;
        console.log("🛠️ Applied fix: Added missing colorspace_pars_fragment shader chunk");
      }
    }
  }
  
  // Function to create a circle texture for particles
  function createCircleTexture(THREE, size = 128) {
    if (typeof document === 'undefined') return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = size; 
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture(); // Return blank if no context

    ctx.clearRect(0, 0, size, size);
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.needsUpdate = true;
    return texture;
  }
  
  // Creates a particle system with glowing particles
  function createParticleSystem(THREE, colors, isMobile) {
    // Particle configuration
    const particleCount = isMobile ? 300 : 600;
    const atmosphereRadius = isMobile ? 3.0 : 3.5;
    
    // Create particle geometry
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colorAttributes = new Float32Array(particleCount * 3);
    
    // Create the particle texture
    const particleTexture = createCircleTexture(THREE);
    
    // Create particle distribution using Fibonacci sphere for more even distribution
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Fibonacci sphere distribution for more even particle placement
      const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y) * atmosphereRadius * (0.8 + Math.random() * 0.4);
      const theta = (Math.PI * (3 - Math.sqrt(5))) * i; // Golden angle increment
      
      positions[i3] = radius * Math.cos(theta);
      positions[i3 + 1] = y * atmosphereRadius * (0.8 + Math.random() * 0.4); // Add randomness to Y radius too
      positions[i3 + 2] = radius * Math.sin(theta);
      
      // Random size with mobile optimization, but larger overall
      sizes[i] = isMobile ? 
        (0.08 + Math.random() * 0.18) : 
        (0.05 + Math.random() * 0.15);
      
      // Interpolate between two colors
      const lerpFactor = Math.random();
      const color = new THREE.Color().lerpColors(
        new THREE.Color("#cc00ff"), // Vivid purple particle
        new THREE.Color("#00ccff"), // Vivid blue particle
        lerpFactor
      );
      colorAttributes[i3] = color.r;
      colorAttributes[i3 + 1] = color.g;
      colorAttributes[i3 + 2] = color.b;
    }
    
    // Set geometry attributes
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute('customColor', new THREE.BufferAttribute(colorAttributes, 3));
    
    // Create enhanced particle shader material
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        pointTexture: { value: particleTexture }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        
        varying vec3 vColor;
        
        uniform float uTime;
        
        void main() {
          vColor = customColor;
          
          vec3 pos = position;
          
          // More dynamic movement - swirl + pulse
          float angle = atan(pos.x, pos.z) + uTime * 0.2;
          float radius = length(pos.xz);
          pos.x = cos(angle) * radius + sin(pos.y * 1.5 + uTime * 0.6) * 0.1;
          pos.z = sin(angle) * radius + cos(pos.x * 1.5 + uTime * 0.5) * 0.1;
          pos.y += sin(length(position) * 0.5 + uTime * 0.7) * 0.15; // Pulse in/out slightly
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (400.0 / -mvPosition.z); // Adjust sizing
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        
        void main() {
          float alpha = texture2D(pointTexture, gl_PointCoord).a;
          if (alpha < 0.05) discard; // Harder edge discard
          gl_FragColor = vec4(vColor, alpha * 0.9); // Slightly less intense alpha
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true
    });
    
    // Create the particle system
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.name = "particleSystem";
    
    return {
      system: particleSystem,
      material: particleMaterial
    };
  }
  
  // Simple fallback visualization if loading fails or takes too long
  function createFallbackVisualization(canvas) {
    console.log("Creating simple fallback visualization");
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Use canvas 2D context to draw a simple spinning animation
    let angle = 0;
    
    function drawFallback() {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      
      // Center of canvas
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Size based on canvas dimensions
      const size = Math.min(width, height) * 0.3;
      
      // Save context state
      ctx.save();
      
      // Translate to center
      ctx.translate(centerX, centerY);
      
      // Rotate
      ctx.rotate(angle);
      
      // Draw rotating diamond
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      
      // Fill with gradient
      const gradient = ctx.createLinearGradient(-size, -size, size, size);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(1, '#818cf8');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add wireframe effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw inner circle
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();
      
      // Restore context state
      ctx.restore();
      
      // Update angle for next frame
      angle += 0.02;
      
      // Continue animation
      requestAnimationFrame(drawFallback);
    }
    
    // Start animation
    drawFallback();
  }
  
  // Main initialization function
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      console.log("🚀 AmorphousPrism initialization started");
      
      // Get DOM elements
      const canvas = document.getElementById('morphing-poly-canvas');
      const loadingIndicator = document.getElementById('morphing-poly-loading');

      if (!canvas) {
        console.error("❌ Canvas element #morphing-poly-canvas not found!");
        return;
      }

      console.log("✅ Canvas element found, initializing THREE.js");
      
      // Handle loading indicator
      const hideLoading = () => {
        if (loadingIndicator) {
          loadingIndicator.style.opacity = '0';
          setTimeout(() => {
            loadingIndicator.style.display = 'none';
          }, 500);
        }
      };
      
      // Initialize with basic fallback in case of shader error or long loading
      let fallbackActive = false;
      let fallbackTimeout = setTimeout(() => {
        // If initialization takes too long, create fallback
        fallbackActive = true;
        console.log("⚠️ Initialization timeout - falling back to basic visualization");
        
        // Create a simple 2D canvas fallback
        createFallbackVisualization(canvas);
        
        // Hide loading indicator
        hideLoading();
      }, 8000);
      
      // Get THREE.js via module import
      const THREE = await loadThreeJS();
      
      if (!THREE) {
        console.error("❌ THREE.js not available - using basic visualization");
        createFallbackVisualization(canvas);
        hideLoading();
        return;
      }

      console.log("✅ Using THREE.js version:", THREE.REVISION || "unknown");
      
      // Create scene with solid Metatron's Cube
      try {
        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);
        
        // Detect if mobile
        const isMobile = window.innerWidth < 768;
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        
        // Create renderer with antialiasing for smoother edges
        const renderer = new THREE.WebGLRenderer({ 
          canvas, 
          antialias: true,
          alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Enable shadow mapping
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Create the solid geometry (dodecahedron for faceted appearance)
        const geometry = new THREE.DodecahedronGeometry(1.5, 0);
        
        // Create material with glowing edges
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x06b6d4, // Cyan color
          specular: 0xaaaaaa,
          shininess: 50,
          transparent: true,
          opacity: 0.9
        });
        
        // Create the main mesh
        const solidCube = new THREE.Mesh(geometry, material);
        scene.add(solidCube);
        
        // Add edge highlighting
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x00e5ff, // Brighter cyan for edges
          transparent: true,
          opacity: 0.8
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        solidCube.add(wireframe);
        
        // Add spheres at vertices
        const vertices = geometry.attributes.position;
        const vertexMap = new Map(); // To store unique vertex positions
        
        // Extract unique vertices
        for (let i = 0; i < vertices.count; i++) {
          const x = vertices.getX(i);
          const y = vertices.getY(i);
          const z = vertices.getZ(i);
          
          // Create a key to identify unique vertices
          const key = `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
          
          if (!vertexMap.has(key)) {
            vertexMap.set(key, { x, y, z });
          }
        }
        
        // Create spheres at unique vertices
        vertexMap.forEach(pos => {
          const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
          const sphereMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4169e1, // Royal blue for spheres
            specular: 0xffffff,
            shininess: 100
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.set(pos.x, pos.y, pos.z);
          scene.add(sphere);
        });
        
        // Create particle system
        const particles = createParticleSystem(THREE, null, isMobile);
        scene.add(particles.system);
        
        // Create lighting for better surface visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0x0088ff, 1, 10);
        pointLight.position.set(-2, 2, 4);
        scene.add(pointLight);
        
        // Add interaction capabilities
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotationSpeed = { x: 0.0005, y: 0.0004 }; // Slower rotation speed
        let autoRotate = true;
        
        // Set up mouse controls
        canvas.addEventListener('mousedown', (e) => {
          isDragging = true;
          previousMousePosition = {
            x: e.clientX,
            y: e.clientY
          };
          autoRotate = false; // Pause auto-rotation when user interacts
          canvas.style.cursor = 'grabbing';
        });
        
        canvas.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          
          const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
          };
          
          // Apply rotation based on mouse movement
          const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
              deltaMove.y * 0.005,
              deltaMove.x * 0.005,
              0,
              'XYZ'
            ));
          
          solidCube.quaternion.multiplyQuaternions(deltaRotationQuaternion, solidCube.quaternion);
          
          previousMousePosition = {
            x: e.clientX,
            y: e.clientY
          };
        });
        
        // Add touch controls for mobile
        canvas.addEventListener('touchstart', (e) => {
          if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY
            };
            autoRotate = false; // Pause auto-rotation when user interacts
          }
        });
        
        canvas.addEventListener('touchmove', (e) => {
          if (!isDragging) return;
          
          if (e.touches.length === 1) {
            const deltaMove = {
              x: e.touches[0].clientX - previousMousePosition.x,
              y: e.touches[0].clientY - previousMousePosition.y
            };
            
            // Apply rotation based on touch movement
            const deltaRotationQuaternion = new THREE.Quaternion()
              .setFromEuler(new THREE.Euler(
                deltaMove.y * 0.005,
                deltaMove.x * 0.005,
                0,
                'XYZ'
              ));
            
            solidCube.quaternion.multiplyQuaternions(deltaRotationQuaternion, solidCube.quaternion);
            
            previousMousePosition = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY
            };
          }
        });
        
        // End drag events
        window.addEventListener('mouseup', () => {
          isDragging = false;
          canvas.style.cursor = 'grab';
          // Resume auto-rotation after a short delay
          setTimeout(() => {
            autoRotate = true;
          }, 2000);
        });
        
        window.addEventListener('touchend', () => {
          isDragging = false;
          // Resume auto-rotation after a short delay
          setTimeout(() => {
            autoRotate = true;
          }, 2000);
        });
        
        // Add cursor styles
        canvas.style.cursor = 'grab';
        
        // Animation state
        let morphValue = 0;
        let morphDirection = 1;
        let time = 0;
        
        // Animation function
        function animateScene() {
          requestAnimationFrame(animateScene);
          
          // Update time
          time += 0.01;
          
          // Update particle shader time
          if (particles.material.uniforms.uTime) {
            particles.material.uniforms.uTime.value = time;
          }
          
          // Auto-rotation (only if not being dragged)
          if (autoRotate) {
            solidCube.rotation.x += rotationSpeed.x;
            solidCube.rotation.y += rotationSpeed.y;
          }
          
          // Subtle "breathing" effect
          if (morphDirection > 0) {
            morphValue += 0.001;
            if (morphValue >= 1) {
              morphValue = 1;
              morphDirection = -1;
            }
          } else {
            morphValue -= 0.001;
            if (morphValue <= 0) {
              morphValue = 0;
              morphDirection = 1;
            }
          }
          
          // Apply subtle scale change for breathing effect
          const scale = 1 + (morphValue * 0.05);
          solidCube.scale.set(scale, scale, scale);
          
          // Render the scene
          renderer.render(scene, camera);
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Start animation
        animateScene();
        console.log("✅ Solid Metatron's Cube visualization with particles activated");
        
        // Hide loading indicator
        hideLoading();
        
        // Clear the fallback timeout
        clearTimeout(fallbackTimeout);
      } catch (err) {
        console.error("❌ Error creating 3D scene:", err);
        
        // Fall back to 2D canvas
        if (!fallbackActive) {
          createFallbackVisualization(canvas);
          hideLoading();
        }
      }
    } catch (error) {
      console.error("Error in AmorphousPrism initialization:", error);
      
      // Get canvas for fallback
      const canvas = document.getElementById('morphing-poly-canvas');
      if (canvas) {
        createFallbackVisualization(canvas);
      }
      
      // Hide loading indicator
      const loadingIndicator = document.getElementById('morphing-poly-loading');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
    }
  });
}
