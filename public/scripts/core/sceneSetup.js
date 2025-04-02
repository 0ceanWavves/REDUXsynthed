// public/scripts/core/sceneSetup.js
// import * as THREE from 'three'; // Assuming THREE is globally available after loadThreeJS
import * as C from '../constants.js';

export function setupSceneAndCamera(canvas) {
  // Check if THREE is loaded
  if (!window.THREE || window.THREE.__isPlaceholder) {
    throw new Error("THREE is not available for scene setup.");
  }
  const THREE = window.THREE; // Use the global THREE

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.FALLBACK_BG_COLOR); // Use background color from constants

  const camera = new THREE.PerspectiveCamera(
    C.CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    C.NEAR_PLANE,
    C.FAR_PLANE
  );
  camera.position.z = C.CAMERA_Z;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true // Keep alpha for potential background needs
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Handle window resize
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    console.log("Resized renderer and camera.");
  };
  window.addEventListener('resize', handleResize);
  console.log("Setup resize listener.");

  // Return the created objects and a cleanup function for the listener
  return {
    scene,
    camera,
    renderer,
    cleanupResizeListener: () => {
        console.log("Removing resize listener.");
        window.removeEventListener('resize', handleResize);
    }
  };
} 