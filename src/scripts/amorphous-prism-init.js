/**
 * Amorphous Prism Initialization
 * Separated from the main component to reduce file size and improve maintainability
 */

// Import our ThreeJS loader utilities
import loadThreeJS, {
  createCircleTexture,
  addBarycentricCoordinates
} from '../components/three/utils/ThreeJSLoader.js';

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
  
  // Function to safely load THREE.js using our loader utility
  async function getTHREE() {
    console.log("🔍 Attempting to get THREE.js via loader utility");
    
    try {
      const THREE = await loadThreeJS();
      console.log("🔍 THREE.js loaded successfully:", THREE.REVISION);
      return THREE;
    } catch (err) {
      console.error("🔍 Failed to load THREE.js:", err);
      return null;
    }
  }
  
  // Create a safe dynamic import function for module components
  async function safeImport(relativeUrl) {
    try {
      // Fix path - convert relative path to absolute
      const baseUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('/'));
      const absUrl = new URL(relativeUrl, baseUrl).href;
      
      console.log(`🔍 Importing module from: ${absUrl}`);
      return await import(absUrl);
    } catch (firstErr) {
      console.warn(`🔍 Error importing ${relativeUrl}:`, firstErr);
      
      // Try alternate path formats
      try {
        // Try with /src/ prefix as a fallback
        const srcUrl = relativeUrl.startsWith('/src/') ? relativeUrl : `/src${relativeUrl}`;
        console.log(`🔍 Retrying import with: ${srcUrl}`);
        return await import(srcUrl);
      } catch (secondErr) {
        console.error(`🔍 All import attempts failed for ${relativeUrl}:`, secondErr);
        throw new Error(`Failed to import ${relativeUrl}: ${secondErr.message}`);
      }
    }
  }
  
  // Main initialization function
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      console.log("🚀 AmorphousPrism initialization started");
      
      // Get DOM elements
      const canvas = document.getElementById('morphing-poly-canvas');

      if (!canvas) {
        console.error("❌ Canvas element #morphing-poly-canvas not found!");
        return;
      }

      console.log("✅ Canvas element found, initializing THREE.js");
      
      // Get THREE.js via ES module import
      const THREE = await getTHREE();
      
      if (!THREE) {
        console.error("❌ THREE.js not available - falling back to basic visualization");
        return;
      }

      console.log("✅ Using THREE.js version:", THREE.REVISION || "unknown");
      
      // Initialize with basic fallback in case of shader error
      let fallbackActive = false;
      let fallbackTimeout = setTimeout(() => {
        // If initialization takes too long, create fallback
        fallbackActive = true;
        console.log("⚠️ Initialization timeout - falling back to basic visualization");
        
        // Create a very basic scene with a rotating cube as fallback
        if (canvas && THREE) {
          try {
            // Create scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0f172a);
            
            // Create camera
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;
            
            // Create renderer
            const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
            renderer.setSize(window.innerWidth, window.innerHeight);
            
            // Create a simple cube
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const material = new THREE.MeshBasicMaterial({ 
              color: 0x06b6d4,
              wireframe: true
            });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            
            // Add some ambient light
            const light = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(light);
            
            // Animation function
            function animateFallback() {
              requestAnimationFrame(animateFallback);
              cube.rotation.x += 0.01;
              cube.rotation.y += 0.01;
              renderer.render(scene, camera);
            }
            
            // Handle window resize
            window.addEventListener('resize', () => {
              camera.aspect = window.innerWidth / window.innerHeight;
              camera.updateProjectionMatrix();
              renderer.setSize(window.innerWidth, window.innerHeight);
            });
            
            // Start animation
            animateFallback();
            console.log("✅ Fallback visualization activated");
          } catch (fallbackErr) {
            console.error("❌ Even fallback visualization failed:", fallbackErr);
          }
        }
      }, 5000);
      
      // Now load our modular components with safe import
      try {
        console.log("🔄 Loading modular components...");
        
        // Define module paths using relative paths from this file
        const rendererModulePath = '../components/three/renderer/RendererManager.js';
        const geometriesModulePath = '../components/three/geometries/PrismGeometries.js';
        const shadersModulePath = '../components/three/shaders/MorphingShaders.js';
        const particlesModulePath = '../components/three/particles/ParticleSystem.js';
        const animationModulePath = '../components/three/animation/MorphingController.js';
        const interactionModulePath = '../components/three/interaction/InteractionManager.js';
        const configModulePath = '../components/three/config/PrismConfig.js';
        
        // Load all modules
        const rendererModule = await safeImport(rendererModulePath);
        console.log("✅ RendererManager loaded:", !!rendererModule);
        
        const geometriesModule = await safeImport(geometriesModulePath);
        console.log("✅ PrismGeometries loaded:", !!geometriesModule);
        
        const shadersModule = await safeImport(shadersModulePath);
        console.log("✅ MorphingShaders loaded:", !!shadersModule);
        
        const particlesModule = await safeImport(particlesModulePath);
        console.log("✅ ParticleSystem loaded:", !!particlesModule);
        
        const animationModule = await safeImport(animationModulePath);
        console.log("✅ MorphingController loaded:", !!animationModule);
        
        const interactionModule = await safeImport(interactionModulePath);
        console.log("✅ InteractionManager loaded:", !!interactionModule);
        
        const configModule = await safeImport(configModulePath);
        console.log("✅ PrismConfig loaded:", !!configModule);
        
        // Extract function references
        const { createRenderer } = rendererModule;
        const { getPrismTargetGeometries, addBarycentricCoordinates: moduleAddBarycentricCoordinates } = geometriesModule;
        const { createMorphingShaderMaterial } = shadersModule;
        const { createParticleSystem } = particlesModule;
        const { createMorphingController } = animationModule;
        const { createInteractionManager } = interactionModule;
        const { prismConfig, createColorObjects } = configModule;

        console.log("✅ Functions extracted from modules"); // Confirm extraction
        
        // Clear the timeout since we loaded the modules successfully
        clearTimeout(fallbackTimeout);
        if (fallbackActive) {
          console.log("Modules loaded but fallback already active - proceed with caution");
        }
        
        console.log("Modular components loaded");
        
        // Define device type
        const isMobile = window.isMobileDevice || window.innerWidth < 768;
        
        // Create color objects
        const colors = createColorObjects(THREE);
        
        // Create renderer, scene, camera
        const { 
          scene, 
          camera, 
          renderer, 
          clock,
          canvas: canvasRef,
          cleanup: cleanupRenderer,
          setAnimationFrameId
        } = await createRenderer({ 
          THREE, 
          canvas, 
          isMobile, 
          colors
        });
        
        // Get prism geometries
        const { targetGeometries, shapeNames } = getPrismTargetGeometries(THREE, {
          radius: prismConfig.prismRadius * 2, // Make the prism larger for better visibility
          depth: prismConfig.prismDepth * 1.5  // Make the prism thicker for better visibility
        });
        
        // Create base geometry for morphing
        const baseGeometry = new THREE.CylinderGeometry(2.2, 2.2, 0.6, 64, 1);
        baseGeometry.morphAttributes.position = [];
        const basePositionAttribute = baseGeometry.attributes.position;
        
        // Add barycentric coordinates for wireframe effect
        // Use our imported function or the module one as fallback
        try {
          addBarycentricCoordinates(baseGeometry, THREE);
        } catch (err) {
          console.warn("Using module barycentric function as fallback:", err);
          moduleAddBarycentricCoordinates(baseGeometry, THREE);
        }
        
        // Process target geometries for morphing
        console.log(`Base geometry has ${basePositionAttribute.count} vertices.`);
        const baseVertex = new THREE.Vector3();
        const targetVertex = new THREE.Vector3();

        for (let i = 0; i < targetGeometries.length; i++) {
          const targetGeo = targetGeometries[i];
          const targetPositionAttribute = targetGeo.attributes.position;
          
          console.log(`Processing target ${shapeNames[i]} with ${targetPositionAttribute.count} vertices.`);
          
          if (!targetPositionAttribute) { 
            console.error(`Target geo ${shapeNames[i]} lacks position!`); 
            continue; 
          }

          const morphPositions = new Float32Array(basePositionAttribute.count * 3);
          
          for (let j = 0; j < basePositionAttribute.count; j++) {
            baseVertex.fromBufferAttribute(basePositionAttribute, j);
            let closestDistSq = Infinity; 
            let closestVertexIndex = -1;
            
            for (let k = 0; k < targetPositionAttribute.count; k++) {
              targetVertex.fromBufferAttribute(targetPositionAttribute, k);
              const distSq = baseVertex.distanceToSquared(targetVertex);
              if (distSq < closestDistSq) { 
                closestDistSq = distSq; 
                closestVertexIndex = k; 
              }
            }
            
            if (closestVertexIndex !== -1) {
              targetVertex.fromBufferAttribute(targetPositionAttribute, closestVertexIndex);
            } else {
              targetVertex.copy(baseVertex); // Fallback
            }
            
            morphPositions[j * 3] = targetVertex.x;
            morphPositions[j * 3 + 1] = targetVertex.y;
            morphPositions[j * 3 + 2] = targetVertex.z;
          }
          
          baseGeometry.morphAttributes.position.push(
            new THREE.Float32BufferAttribute(morphPositions, 3)
          );
          
          // Dispose target geometry after use
          targetGeo.dispose();
        }
        
        // Try to create the shader material, with fallback
        let material = null;
        
        try {
          // Create shader material
          material = createMorphingShaderMaterial(THREE, {
            colors,
            isMobile,
            wireframeThickness: isMobile ? 0.08 : 0.05,
            faceOpacity: 0.8
          });
          
          // Setup shader error detection
          material.onError = () => {
            // Will be called if shader compilation fails
            console.log("Shader error detected, using fallback material");
            
            if (!material.userData.usedFallback) {
              material.userData.usedFallback = true;
              
              // Create a basic material as fallback
              const fallbackMaterial = new THREE.MeshPhongMaterial({
                color: colors.shape1,
                wireframe: true,
                transparent: true,
                opacity: 0.9,
                shininess: 100
              });
              
              // Update the mesh with fallback material
              if (mesh) {
                mesh.material = fallbackMaterial;
              }
            }
          };
        } catch (err) {
          console.error("Error creating shader material:", err);
          
          // Create a fallback material
          material = new THREE.MeshPhongMaterial({
            color: colors.shape1,
            wireframe: true,
            transparent: true,
            opacity: 0.9,
            shininess: 100
          });
        }
        
        // Create mesh with morphing capabilities
        const mesh = new THREE.Mesh(baseGeometry, material);
        mesh.name = "sacredGeometryMesh";
        mesh.morphTargetInfluences = new Array(baseGeometry.morphAttributes.position.length).fill(0);
        scene.add(mesh);
        
        // Set up error detection for shader after rendering starts
        const shaderErrorTimeout = setTimeout(() => {
          // Check if our mesh is visible
          const testRender = new THREE.WebGLRenderer({ alpha: true });
          testRender.setSize(1, 1);
          const testScene = new THREE.Scene();
          testScene.add(mesh.clone());
          const testCamera = new THREE.PerspectiveCamera();
          
          try {
            testRender.render(testScene, testCamera);
          } catch (e) {
            console.error("Render test failed, using fallback:", e);
            
            // Use fallback material
            mesh.material = new THREE.MeshPhongMaterial({
              color: colors.shape1,
              wireframe: true,
              transparent: true,
              opacity: 0.9
            });
          } finally {
            // Clean up test resources
            testRender.dispose();
          }
        }, 2000);
        
        // Store reference for fallback material switch
        window.currentMesh = mesh;
        
        // Create particle system with increased visibility
        const particleSystem = createParticleSystem(THREE, {
          colors,
          isMobile,
          config: {
            ...prismConfig,
            particleCount: isMobile ? 300 : 500, // Increase particle count
            particleSpreadFactor: 4.0, // Increase particle spread
            particleSizeBase: 8, // Increase particle size
            particleSizeVariation: 12,
            mobileParticleSizeBase: 5, // Increase mobile particle size
            mobileParticleSizeVariation: 8
          }
        });
        scene.add(particleSystem);
        
        // Add ambient and directional light to improve visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Create morphing controller
        const morphingController = createMorphingController({
          mesh,
          config: prismConfig,
          clock
        });
        
        // Create interaction manager
        const interactionManager = createInteractionManager({
          canvas: canvasRef,
          morphingController,
          config: {...prismConfig, isMobileDevice: isMobile}
        });
        
        // Animation loop
        function animate() {
          const time = performance.now() * 0.001;
          
          if (material && material.uniforms) {
            try {
              // Check if uTime uniform exists before accessing its value
              if (material.uniforms.uTime) {
                  material.uniforms.uTime.value = time;
              } else {
                  // console.warn("uTime uniform missing"); // Optional: log if missing
              }
              
              // Animate morph influence with a sine wave
              // Check if uMorphInfluence uniform exists before accessing its value
              if (material.uniforms.uMorphInfluence) {
                material.uniforms.uMorphInfluence.value = Math.sin(time * 0.5) * 0.5 + 0.5;
              } else {
                  // console.warn("uMorphInfluence uniform missing"); // Optional: log if missing
              }
            } catch (e) {
              console.warn("Error updating shader uniforms:", e);
            }
          }
          
          if (mesh) {
            mesh.rotation.y = time * 0.15;
            mesh.rotation.x = time * 0.1;
          }
          
          try {
            renderer.render(scene, camera);
          } catch (e) {
            console.error("Render error:", e);
            
            // Only switch to fallback if not already done
            if (mesh && mesh.material.type === "ShaderMaterial") {
              console.log("Switching to fallback material due to render error");
              mesh.material = new THREE.MeshBasicMaterial({
                color: colors.shape1,
                wireframe: true,
                transparent: true,
                opacity: 0.8
              });
            }
          }
          
          requestAnimationFrame(animate);
        }
        
        // Start animation
        console.log("Starting animation loop");
        animate();
        
        // Clear the shader error timeout
        clearTimeout(shaderErrorTimeout);
        
        // Let the original loading screen handle hiding itself
        console.log("AmorphousPrism initialization completed successfully");
        
        // Set up cleanup on page navigation
        document.addEventListener('astro:before-swap', () => {
          console.log("Cleaning up AmorphousPrism...");
          
          // Cancel animation frame
          const animationId = setAnimationFrameId(null);
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          
          // Clean up event listeners
          interactionManager.cleanup();
          
          // Clean up renderer resources
          cleanupRenderer();
          
          // Dispose THREE.js objects
          scene.traverse(object => {
            if (object.geometry) {
              object.geometry.dispose();
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(mat => {
                  // Dispose textures in uniforms if they exist
                  Object.values(mat.uniforms || {}).forEach(uniform => {
                    if (uniform && uniform.value instanceof THREE.Texture) {
                      uniform.value.dispose();
                    }
                  });
                  mat.dispose();
                });
              } else {
                // Dispose textures in uniforms
                Object.values(object.material.uniforms || {}).forEach(uniform => {
                  if (uniform && uniform.value instanceof THREE.Texture) {
                    uniform.value.dispose();
                  }
                });
                object.material.dispose(); // Dispose the material itself
              }
            }
          });
          
          console.log("AmorphousPrism cleanup complete.");
        }, { once: true });
      } catch (error) {
        console.error("Error in modular component loading:", error);
      }
    } catch (error) {
      console.error("Error in AmorphousPrism initialization:", error);
    }
  });
}
