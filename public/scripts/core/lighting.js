// public/scripts/core/lighting.js
// import * as THREE from 'three'; // Assuming THREE is globally available
import * as C from '../constants.js';

export function setupLighting(scene) {
  if (!window.THREE) throw new Error("THREE not available for lighting setup.");
  const THREE = window.THREE;

  // Clear existing lights first for safety
  const lightsToRemove = scene.children.filter(c => c.isLight);
  lightsToRemove.forEach(light => scene.remove(light));
  if (lightsToRemove.length > 0) {
      console.log(`Removed ${lightsToRemove.length} existing lights.`);
  }

  const ambientLight = new THREE.AmbientLight(C.AMBIENT_COLOR, C.AMBIENT_INTENSITY);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(C.DIR_LIGHT_COLOR, C.DIR_LIGHT_INTENSITY);
  directionalLight.position.set(C.DIR_LIGHT_POS.x, C.DIR_LIGHT_POS.y, C.DIR_LIGHT_POS.z);
  directionalLight.castShadow = true;
  // Configure shadow properties for directional light
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(C.POINT_LIGHT_COLOR, C.POINT_LIGHT_INTENSITY, 50); // Added distance limit
  pointLight.position.set(C.POINT_LIGHT_POS.x, C.POINT_LIGHT_POS.y, C.POINT_LIGHT_POS.z);
  scene.add(pointLight);

  console.log("💡 Lighting setup complete");
} 