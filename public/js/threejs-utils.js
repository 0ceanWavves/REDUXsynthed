/**
 * Three.js Utilities
 * 
 * A collection of helper functions for Three.js projects
 * to simplify common tasks and handle cross-browser issues.
 */

window.ThreeJSUtils = (function() {
  const utils = {};
  
  /**
   * Check if WebGL is available
   * @returns {Object} Object containing isSupported (boolean) and details (message)
   */
  utils.checkWebGLSupport = function() {
    const canvas = document.createElement('canvas');
    let gl = null;
    let details = '';
    
    try {
      gl = canvas.getContext('webgl2');
      if (gl) {
        return { 
          isSupported: true, 
          level: 2, 
          details: 'WebGL 2.0 is supported'
        };
      }
      
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        return { 
          isSupported: true, 
          level: 1, 
          details: 'WebGL 1.0 is supported'
        };
      }
      
      return {
        isSupported: false,
        level: 0,
        details: 'WebGL is not supported in this browser'
      };
    } catch (e) {
      return {
        isSupported: false, 
        level: 0,
        details: 'Error checking WebGL support: ' + e.message
      };
    }
  };
  
  /**
   * Create a responsive canvas that fills its container
   * @param {HTMLElement|string} container - Container element or selector
   * @returns {HTMLCanvasElement} The created canvas
   */
  utils.createResponsiveCanvas = function(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) {
      console.error('Container not found');
      return null;
    }
    
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Make canvas fill container
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    
    // Function to resize canvas
    const resizeCanvas = function() {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (canvas.onResize) canvas.onResize();
    };
    
    // Apply initial size
    resizeCanvas();
    
    // Update on resize
    window.addEventListener('resize', resizeCanvas);
    
    // Add method to manually trigger resize
    canvas.updateSize = resizeCanvas;
    
    return canvas;
  };
  
  /**
   * Create a full-screen renderer
   * @param {Object} options - Renderer options
   * @returns {THREE.WebGLRenderer} The created renderer
   */
  utils.createRenderer = function(options = {}) {
    if (!THREE) {
      console.error('THREE is not defined. Make sure Three.js is loaded.');
      return null;
    }
    
    const defaults = {
      antialias: true,
      alpha: true,
      precision: 'mediump',
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    };
    
    const rendererOptions = { ...defaults, ...options };
    const renderer = new THREE.WebGLRenderer(rendererOptions);
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(options.clearColor || 0x000000, options.clearAlpha || 0);
    
    if (options.shadows !== false) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    // Auto-resize function
    const handleResize = function() {
      if (renderer.domElement.parentElement) {
        const parent = renderer.domElement.parentElement;
        renderer.setSize(parent.offsetWidth, parent.offsetHeight);
      } else {
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    // Set initial size
    handleResize();
    
    // Update on resize
    window.addEventListener('resize', handleResize);
    
    return renderer;
  };
  
  /**
   * Create a default scene with camera and basic lighting
   * @param {Object} options - Scene setup options
   * @returns {Object} Object containing scene, camera, and optionally light
   */
  utils.createDefaultScene = function(options = {}) {
    if (!THREE) {
      console.error('THREE is not defined. Make sure Three.js is loaded.');
      return null;
    }
    
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const fov = options.fov || 75;
    const aspect = options.aspect || window.innerWidth / window.innerHeight;
    const near = options.near || 0.1;
    const far = options.far || 1000;
    
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = options.cameraZ || 5;
    
    if (options.cameraPosition) {
      camera.position.copy(options.cameraPosition);
    }
    
    // Add lighting if requested
    let light = null;
    if (options.lighting !== false) {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
      
      // Directional light
      light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1);
      
      if (options.shadows) {
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;
      }
      
      scene.add(light);
    }
    
    // Handle window resize
    const handleResize = function() {
      if (camera.isPerspectiveCamera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return { scene, camera, light };
  };
  
  /**
   * Add orbit controls to a camera
   * @param {THREE.Camera} camera - The camera to control
   * @param {HTMLElement} domElement - The DOM element for event listeners
   * @param {Object} options - Control options
   * @returns {THREE.OrbitControls} The orbit controls
   */
  utils.addOrbitControls = function(camera, domElement, options = {}) {
    if (!THREE || !THREE.OrbitControls) {
      console.error('THREE.OrbitControls not found. Make sure it is loaded.');
      return null;
    }
    
    const controls = new THREE.OrbitControls(camera, domElement);
    
    // Apply options
    if (options.target) controls.target.copy(options.target);
    if (options.enableZoom !== undefined) controls.enableZoom = options.enableZoom;
    if (options.enableRotate !== undefined) controls.enableRotate = options.enableRotate;
    if (options.enablePan !== undefined) controls.enablePan = options.enablePan;
    if (options.minDistance !== undefined) controls.minDistance = options.minDistance;
    if (options.maxDistance !== undefined) controls.maxDistance = options.maxDistance;
    if (options.dampingFactor !== undefined) controls.dampingFactor = options.dampingFactor;
    
    controls.enableDamping = options.enableDamping !== undefined ? options.enableDamping : true;
    controls.update();
    
    return controls;
  };
  
  /**
   * Create a simple animation loop
   * @param {Function} callback - Function to call each frame
   * @returns {Object} Object with start and stop methods
   */
  utils.createAnimationLoop = function(callback) {
    let animationId = null;
    let running = false;
    const clock = new THREE.Clock();
    
    const animate = function() {
      if (!running) return;
      
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      
      callback(delta, elapsed);
    };
    
    return {
      start: function() {
        if (!running) {
          running = true;
          clock.start();
          animate();
        }
        return this;
      },
      stop: function() {
        running = false;
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        return this;
      },
      isRunning: function() {
        return running;
      }
    };
  };
  
  /**
   * Create a reusable texture loader with cache
   * @returns {Object} Enhanced texture loader
   */
  utils.createTextureLoader = function() {
    const loader = new THREE.TextureLoader();
    const cache = {};
    
    return {
      load: function(url, onLoad, onProgress, onError) {
        // Return from cache if available
        if (cache[url]) {
          if (onLoad) onLoad(cache[url].clone());
          return cache[url].clone();
        }
        
        // Wrap onLoad to cache the texture
        const wrappedOnLoad = function(texture) {
          cache[url] = texture;
          if (onLoad) onLoad(texture);
        };
        
        return loader.load(url, wrappedOnLoad, onProgress, onError);
      },
      clearCache: function() {
        for (const url in cache) {
          cache[url].dispose();
        }
        return Object.keys(cache).length;
      }
    };
  };
  
  /**
   * Dispose of Three.js objects properly to prevent memory leaks
   * @param {Object} object - Three.js object to dispose
   * @param {boolean} recursive - Whether to dispose recursively
   */
  utils.dispose = function(object, recursive = true) {
    if (!object) return;
    
    // Dispose geometry
    if (object.geometry) {
      object.geometry.dispose();
    }
    
    // Dispose material(s)
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => disposeMaterial(material));
      } else {
        disposeMaterial(object.material);
      }
    }
    
    // Dispose textures
    function disposeMaterial(material) {
      if (!material) return;
      
      // Dispose textures
      const properties = [
        'map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap',
        'displacementMap', 'roughnessMap', 'metalnessMap', 'alphaMap',
        'envMap', 'matcap'
      ];
      
      properties.forEach(prop => {
        if (material[prop]) {
          material[prop].dispose();
        }
      });
      
      material.dispose();
    }
    
    // Recursive disposal
    if (recursive && object.children) {
      for (let i = object.children.length - 1; i >= 0; i--) {
        utils.dispose(object.children[i], true);
      }
    }
  };
  
  /**
   * Create a simple debugging overlay
   * @param {Object} options - Configuration options
   * @returns {Object} Debug object with methods
   */
  utils.createDebugOverlay = function(options = {}) {
    const container = document.createElement('div');
    container.className = 'three-debug-overlay';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.right = '0';
    container.style.padding = '10px';
    container.style.background = 'rgba(0, 0, 0, 0.5)';
    container.style.color = '#fff';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '12px';
    container.style.zIndex = '1000';
    container.style.pointerEvents = 'none';
    container.style.userSelect = 'none';
    container.style.display = options.visible === false ? 'none' : 'block';
    
    document.body.appendChild(container);
    
    let fps = 0;
    let frameCount = 0;
    let lastTime = performance.now();
    const fpsElement = document.createElement('div');
    container.appendChild(fpsElement);
    
    const dataElements = {};
    
    // Update FPS
    function updateFPS() {
      const now = performance.now();
      const delta = now - lastTime;
      
      frameCount++;
      
      if (delta >= 1000) {
        fps = Math.round((frameCount * 1000) / delta);
        fpsElement.textContent = `FPS: ${fps}`;
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(updateFPS);
    }
    
    updateFPS();
    
    return {
      set: function(key, value) {
        if (!dataElements[key]) {
          dataElements[key] = document.createElement('div');
          container.appendChild(dataElements[key]);
        }
        dataElements[key].textContent = `${key}: ${value}`;
        return this;
      },
      remove: function(key) {
        if (dataElements[key]) {
          container.removeChild(dataElements[key]);
          delete dataElements[key];
        }
        return this;
      },
      clear: function() {
        for (const key in dataElements) {
          container.removeChild(dataElements[key]);
        }
        return this;
      },
      show: function() {
        container.style.display = 'block';
        return this;
      },
      hide: function() {
        container.style.display = 'none';
        return this;
      },
      toggle: function() {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
        return this;
      },
      getFPS: function() {
        return fps;
      },
      destroy: function() {
        document.body.removeChild(container);
      }
    };
  };
  
  return utils;
})(); 