/**
 * Creates a simple circular texture for particles.
 * @param {THREE} THREE - The THREE.js library instance.
 * @returns {THREE.Texture} - The created canvas texture.
 */
export function createCircleTexture(THREE) {
    if (!THREE) {
        console.error("THREE instance needed for createCircleTexture");
        return null;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (!context) {
        console.error("Could not get 2D context for particle texture");
        return null;
    }
    const gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(200,200,200,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    console.log("⚪ Circle texture created for particles (src).")
    return texture;
} 