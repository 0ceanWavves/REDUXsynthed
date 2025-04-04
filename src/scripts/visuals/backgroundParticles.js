import * as THREE from 'three'; 
import * as C from '../constants.js';
import { createCircleTexture } from '../utils/textureUtils.js';

/**
 * Creates a static background particle system.
 * @param {THREE.Scene} scene - The scene to add the particles to.
 * @param {THREE} THREEInstance - The THREE.js library instance.
 * @returns {THREE.Points | null} The created particle system (Points object) or null on error.
 */
export function createBackgroundParticles(scene, THREEInstance) {
    const LocalTHREE = THREEInstance || THREE;
    if (!LocalTHREE || !scene) {
        console.error("THREE instance and scene are required for background particles (src).");
        return null;
    }

    try {
        const particleCount = window.innerWidth < 768 ? (C.PARTICLE_COUNT_MOBILE || 1000) : (C.PARTICLE_COUNT_DESKTOP || 2000); 
        const particleGeometry = new LocalTHREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3); 

        const color1 = new LocalTHREE.Color(C.PARTICLE_COLOR_1 || "#cc00ff");
        const color2 = new LocalTHREE.Color(C.PARTICLE_COLOR_2 || "#00ccff");
        const tempColor = new LocalTHREE.Color();

        const radiusMin = C.PARTICLE_RADIUS_DESKTOP || 15; // Use specific constants if available
        const radiusMax = (C.PARTICLE_RADIUS_DESKTOP || 15) + 10; // Make range based on min
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            particlePositions[i3 + 2] = radius * Math.cos(phi);
            
            tempColor.lerpColors(color1, color2, Math.random());
            particleColors[i3] = tempColor.r;
            particleColors[i3 + 1] = tempColor.g;
            particleColors[i3 + 2] = tempColor.b;
        }
        
        particleGeometry.setAttribute('position', new LocalTHREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('color', new LocalTHREE.BufferAttribute(particleColors, 3));
        
        const particleTexture = createCircleTexture(LocalTHREE);
        if (!particleTexture) return null; // Exit if texture creation failed
        
        const particleMaterial = new LocalTHREE.PointsMaterial({
            size: C.PARTICLE_SIZE_MIN_DESKTOP || 0.12, 
            map: particleTexture,
            blending: LocalTHREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });
        
        const particles = new LocalTHREE.Points(particleGeometry, particleMaterial);
        particles.renderOrder = -1; // Render behind main object
        scene.add(particles);
        console.log(`✨ Background particle system created with ${particleCount} particles (src).`);
        return particles;
    } catch (error) {
        console.error("💥 Error creating background particles (src):", error);
        return null;
    }
} 