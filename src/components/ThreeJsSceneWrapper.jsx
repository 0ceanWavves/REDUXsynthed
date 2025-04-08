// src/components/ThreeJsSceneWrapper.jsx
// A Preact component for Three.js rendering that correctly supports client-side hydration

import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

// Import from the centralized Three.js module
import ThreeModule from '../utils/three.js';

// Import the Cloudflare detection utility
import { isCloudflareEnvironment, applyCloudflareFixesIfNeeded } from '../utils/detectCloudflare.js';

// Initialize the prism when loaded
const initPrism = async () => {
  // Dynamically import the amorphous prism initialization module
  if (typeof window !== 'undefined' && !window._prismInitialized) {
    try {
      // Set flag to prevent multiple initializations
      window._prismInitialized = true;
      
      // Import and initialize the amorphous prism
      await import('../scripts/amorphous-prism-init.js');
      console.log("Prism initialization module loaded in Preact component");
    } catch (error) {
      console.error("Error loading prism module:", error);
    }
  } else {
    console.log("Prism already initialized, skipping duplicate initialization");
  }
};

export default function ThreeJsSceneWrapper() {
  // Reference to container div
  const containerRef = useRef(null);
  
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [isCloudflare, setIsCloudflare] = useState(false);
  
  // References to Three.js objects that need to be tracked
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  
  // Check if we're in Cloudflare environment on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cfEnv = isCloudflareEnvironment();
      setIsCloudflare(cfEnv);
      
      if (cfEnv) {
        console.log("Detected Cloudflare environment in ThreeJsSceneWrapper");
        applyCloudflareFixesIfNeeded();
      }
    }
  }, []);
  
  // Setup loading spinner
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoading) return;
    
    // Initialize loading spinner animation
    const canvas = document.getElementById('loading-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Variables for the spiral
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;
    let rotation = 0;
    let animationFrameId = null;
    
    // Color palette
    const bladeColors = [
      '#4a9de9',  // Bright Blue
      '#8a65e2',  // Rich Purple
      '#00e2d7',  // Bright Cyan
      '#c552e3',  // Vibrant Purple
      '#4666cc'   // Deep Blue
    ];
    
    // Animation function
    function animate() {
      if (!ctx) return;
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Number of blades
      const bladeCount = 18;
      
      // Save the current state
      ctx.save();
      
      // Translate to center
      ctx.translate(centerX, centerY);
      
      // Apply rotation
      ctx.rotate(rotation);
      
      // Draw each blade
      for (let i = 0; i < bladeCount; i++) {
        // Calculate angle for this blade
        const angle = (i / bladeCount) * Math.PI * 2;
        
        // Get color for this blade
        const colorIndex = i % bladeColors.length;
        const bladeColor = bladeColors[colorIndex];
        
        // Save state before blade rotation
        ctx.save();
        
        // Rotate to blade position
        ctx.rotate(angle);
        
        // Draw the blade
        createBlade(radius, bladeColor);
        
        // Restore state
        ctx.restore();
      }
      
      // Restore state
      ctx.restore();
      
      // Update rotation
      rotation += 0.012;
      if (rotation >= Math.PI * 2) {
        rotation = 0;
      }
      
      // Request next frame
      animationFrameId = requestAnimationFrame(animate);
    }
    
    // Function to create a single blade
    function createBlade(maxRadius, color) {
      if (!ctx) return;
      // Define blade shape
      const innerRadius = maxRadius * 0.25;
      const outerRadius = maxRadius * 0.95;
      
      ctx.beginPath();
      ctx.moveTo(innerRadius, 0);
      
      // Create curved blade path
      const cp1x = maxRadius * 0.4;
      const cp1y = maxRadius * 0.09;
      ctx.quadraticCurveTo(cp1x, cp1y, maxRadius * 0.6, maxRadius * 0.12);
      
      const cp2x = maxRadius * 0.8;
      const cp2y = maxRadius * 0.08;
      ctx.quadraticCurveTo(cp2x, cp2y, outerRadius, 0);
      
      // Set style
      ctx.lineWidth = Math.max(3, maxRadius * 0.08);
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      
      // Draw the blade
      ctx.stroke();
    }
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isLoading]);
  
  // Initialize Three.js scene when component mounts
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;
    
    // Initialize Three.js
    const initThree = async () => {
      try {
        console.log("Initializing Three.js scene in Preact component");
        
        // Try to get Three.js instance from version guard first
        let THREE_INSTANCE = typeof window !== 'undefined' && window.getThreeJS ? window.getThreeJS() : null;
        
        // If version guard doesn't have an instance yet, use centralized module
        if (!THREE_INSTANCE) {
          await ThreeModule.init();
          THREE_INSTANCE = ThreeModule.THREE;
        }
        
        if (!THREE_INSTANCE) {
          throw new Error("Failed to load Three.js");
        }
        
        console.log(`Using Three.js v${THREE_INSTANCE.REVISION} in Preact component`);
        
        // Get reference to the container
        const container = containerRef.current;
        if (!container) {
          throw new Error("Container element not found!");
        }
        
        // --- Scene Setup ---
        const scene = new THREE_INSTANCE.Scene();
        sceneRef.current = scene;
        
        // --- Camera ---
        const camera = new THREE_INSTANCE.PerspectiveCamera(
          75, 
          window.innerWidth / window.innerHeight, 
          0.1, 
          1000
        );
        camera.position.z = 5;
        cameraRef.current = camera;
        
        // --- Renderer ---
        const renderer = new THREE_INSTANCE.WebGLRenderer({
          antialias: true,
          alpha: true, // Transparent background
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        
        // Clear any existing canvas
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        
        // Add renderer canvas to container
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;
        
        // Apply special positioning for Cloudflare environment
        if (isCloudflare) {
          console.log("Applying Cloudflare-specific canvas positioning");
          renderer.domElement.style.position = 'absolute';
          renderer.domElement.style.top = '50%';
          renderer.domElement.style.left = '50%';
          renderer.domElement.style.transform = 'translate(-50%, -50%)';
          renderer.domElement.style.maxWidth = '100vw';
          renderer.domElement.style.maxHeight = '100vh';
          renderer.domElement.style.margin = '0';
          renderer.domElement.style.willChange = 'transform';
          
          // Force camera to look at center
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld(true);
        }
        
        // Initialize the prism effects after the basic Three.js setup
        await initPrism();
        
        // Loading is complete
        setIsLoading(false);
        
        // Start animation loop
        startAnimation();
      } catch (error) {
        console.error("Failed to initialize Three.js:", error);
        setLoadingError(error.message);
        setIsLoading(false);
      }
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      
      // Update camera aspect ratio
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      
      // Update renderer size
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      // Apply special positioning for Cloudflare environment
      if (isCloudflare) {
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '50%';
        renderer.domElement.style.left = '50%';
        renderer.domElement.style.transform = 'translate(-50%, -50%)';
        
        // Force camera to look at center
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld(true);
      }
    };
    
    // Animation loop
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      
      // Use the global animation loop if prism is initialized
      if (window._prismInitialized && window._prismAnimationRunning) {
        // The amorphous-prism-init.js script is already handling animation
        // We just need to keep our reference alive
        animationFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Request next frame
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    const startAnimation = () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      animate();
    };
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    
    // Initialize Three.js
    initThree();
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      
      if (rendererRef.current) {
        const container = containerRef.current;
        if (container) {
          container.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [isCloudflare]);
  
  return (
    <div>
      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(20, 20, 30, 0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 1000;">
          <div className="loading-content" style="text-align: center;">
            <canvas id="loading-canvas" width="150" height="150" style="margin-bottom: 20px;"></canvas>
            <div className="loading-text" style="font-family: 'Orbitron', sans-serif; color: #00e2d7; font-size: 1.5rem; text-shadow: 0 0 10px rgba(0, 226, 215, 0.7);">
              LOADING
            </div>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {loadingError && (
        <div className="error-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(30, 10, 10, 0.9); display: flex; justify-content: center; align-items: center; z-index: 1000;">
          <div className="error-box" style="background-color: #301515; border: 1px solid #ff4444; padding: 20px; border-radius: 8px; max-width: 80%;">
            <h3 style="color: #ff4444; margin-top: 0;">Error Loading 3D Environment</h3>
            <p style="color: #ffcccc;">{loadingError}</p>
            <p style="color: #ffcccc;">Please try refreshing the page or using a different browser.</p>
          </div>
        </div>
      )}
      
      {/* Three.js container with special class for Cloudflare environment */}
      <div 
        ref={containerRef} 
        className={`three-container ${isCloudflare ? 'cloudflare-environment' : ''}`}
        style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;"
      />
    </div>
  );
}