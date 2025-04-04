import { ServiceTiles } from './ServiceTiles.js'; // <-- Change '.astro' to '.js'
import * as THREE from 'three'; // Also import THREE here

export function initializeServiceTiles() {
  // No need to check window.THREE here if using modules properly
  try {
    console.log('Attempting to create ServiceTiles instance...');
    const serviceTiles = new ServiceTiles(); // Class should import THREE itself
    serviceTiles.init(); // init method uses THREE internally via import
    window.serviceTiles = serviceTiles; // For debugging
    console.log('ServiceTiles initialized successfully.');
    return serviceTiles; // Return instance if needed
  } catch (error) {
    console.error('Error initializing ServiceTiles:', error);
    // Optionally dispatch an event or update UI to indicate failure
    // document.dispatchEvent(new CustomEvent('servicetiles-init-failed'));
  }
} 