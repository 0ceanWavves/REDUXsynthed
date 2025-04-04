import * as THREE from 'three';
import { getSacredGeometryTitle } from '../utils/sacredGeometryLabels.js';
import * as C from '../constants.js';

// Store the current label mesh
let currentLabel = null;

/**
 * Creates and updates text labels for each sacred geometry shape
 * @param {THREE.Scene} scene - The scene to add the label to
 * @param {THREE} THREE - The THREE.js instance
 * @param {string} shapeName - The name of the current shape
 */
export function updateShapeLabel(scene, THREE, shapeName) {
    console.warn("updateShapeLabel is deprecated and should not be used. UI is handled by HTML overlay.");
    /* // REMOVED LOGIC - Handled by HTML Overlay
    // Remove any existing label
    if (currentLabel && scene.children.includes(currentLabel)) {
        scene.remove(currentLabel);
        if (currentLabel.geometry) currentLabel.geometry.dispose();
        if (currentLabel.material) currentLabel.material.dispose();
        currentLabel = null;
    }
    
    // Skip if no shape name provided
    if (!shapeName || shapeName === 'Base') return;
    
    // Get the full title with element name
    const labelText = getSacredGeometryTitle(shapeName);
    
    try {
        // FontLoader was instantiated here but not used, removing it.
        // const loader = new THREE.FontLoader(); 
        
        // We'll use a callback approach since loading fonts is usually async
        // For a real implementation, you would load a font file
        // This is a simplified version using the default font
        const createText = () => {
            // Create material for the text
            const textMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            
            // Create a simple plane with canvas texture instead of 3D text
            // This is more performance friendly
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            
            // Draw text on canvas
            context.fillStyle = 'rgba(0, 0, 0, 0)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.font = 'Bold 24px Arial';
            context.textAlign = 'center';
            context.fillStyle = 'white';
            context.fillText(labelText, canvas.width / 2, canvas.height / 2);
            
            // Create texture from canvas
            const texture = new THREE.CanvasTexture(canvas);
            
            // Create material with this texture
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });
            
            // Create plane geometry for the label
            const geometry = new THREE.PlaneGeometry(2, 0.5);
            
            // Create the mesh
            const labelMesh = new THREE.Mesh(geometry, material);
            
            // Position below the shape
            labelMesh.position.set(0, -2.2, 0);
            
            // Add to scene
            scene.add(labelMesh);
            currentLabel = labelMesh;
            
            // Log the label creation
            console.log(`📝 Sacred geometry label created for ${labelText} (src)`);
        };
        
        // Create the text directly (in a real implementation, this would happen after font load)
        createText();
        
    } catch (error) {
        console.error('Error creating shape label:', error);
    }
    */ // END REMOVED LOGIC
}

/**
 * Removes all shape labels from the scene
 * @param {THREE.Scene} scene - The scene containing the labels
 */
export function removeAllLabels(scene) {
    console.warn("removeAllLabels is deprecated and should not be used. UI is handled by HTML overlay.");
    /* // REMOVED LOGIC
    if (currentLabel && scene.children.includes(currentLabel)) {
        scene.remove(currentLabel);
        if (currentLabel.geometry) currentLabel.geometry.dispose();
        if (currentLabel.material) currentLabel.material.dispose();
        currentLabel = null;
    }
    */ // END REMOVED LOGIC
}