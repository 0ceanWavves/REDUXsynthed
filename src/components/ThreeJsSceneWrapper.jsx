// src/components/ThreeJsSceneWrapper.jsx
// A Preact component for Three.js rendering that correctly supports client-side hydration

import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

// Import Three.js directly but also use the centralized loader as a fallback
import * as THREE from 'three';
// Also import the centralized loader
import { loadThreeJS } from './three/utils/ThreeJSLoader.js';

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
  
  // References to Three.js objects that need to be tracked
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  
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
        
        // Try to get Three.js from the centralized loader if needed
        let THREE_INSTANCE = THREE;
        if (!THREE_INSTANCE || Object.keys(THREE_INSTANCE).length === 0) {
          console.log("Regular THREE import not available, using centralized loader");
          THREE_INSTANCE = await loadThreeJS();
        }
        
        if (!THREE_INSTANCE) {
          throw new Error("Failed to load Three.js");
        }
        
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
    };
    
    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      // Request next frame
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      // Example animation logic - can be replaced with actual animation
      // if (cubeRef.current) {
      //   cubeRef.current.rotation.x += 0.01;
      //   cubeRef.current.rotation.y += 0.01;
      // }
      
      // Render
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    // Start animation
    const startAnimation = () => {
      if (animationFrameIdRef.current === null) {
        animate();
      }
    };
    
    // Initialize
    initThree();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      console.log("Cleaning up Three.js resources");
      
      // Stop animation
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      
      // Remove event listeners
      window.removeEventListener('resize', handleResize);
      
      // Dispose Three.js resources
      if (rendererRef.current) {
        const container = containerRef.current;
        
        if (container && rendererRef.current.domElement) {
          container.removeChild(rendererRef.current.domElement);
        }
        
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // Clear references
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, []); // Empty dependency array means this effect runs once on mount
  
  return (
    <>
      {/* Loading overlay */}
      {isLoading && (
        <div id="loading-overlay" className="loading-overlay">
          <div className="solid-background"></div>
          <div className="loading-content">
            <div className="loading-branding">SYNTHED</div>
            <div className="loading-spinner">
              <canvas id="loading-canvas" width="200" height="200"></canvas>
            </div>
            <div className="loading-message">Loading Experience...</div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {loadingError && (
        <div className="loading-error">
          <p>Error loading 3D visualization: {loadingError}</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      )}
      
      {/* Three.js container */}
      <div 
        id="three-container" 
        ref={containerRef} 
        className={isLoading ? '' : 'visible'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          visibility: isLoading ? 'hidden' : 'visible',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out',
          backgroundColor: 'transparent',
        }}
      />
    </>
  );
}