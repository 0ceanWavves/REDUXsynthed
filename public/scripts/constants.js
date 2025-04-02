// public/scripts/constants.js

// Element IDs
export const CANVAS_ID = 'morphing-poly-canvas';
export const LOADING_ID = 'morphing-poly-loading';

// Scene & Camera
export const CAMERA_Z = 6;
export const CAMERA_FOV = 50;
export const NEAR_PLANE = 0.1;
export const FAR_PLANE = 1000;

// Geometry
export const BASE_RADIUS = 1.5;
export const BASE_DETAIL = 1; // Sharp features
export const EDGES_THRESHOLD = 1;

// Target Shape Scaling (relative to baseRadius)
export const CUBE_SCALE = 1.8;
export const OCTA_SCALE = 1.1;
export const DODECA_SCALE = 1.0; // Approx
export const TETRA_SCALE = 1.0;  // Approx (using sphere projection)

// Materials
export const SOLID_COLOR = 0x00bcd4; // Cyan
export const SOLID_SPECULAR = 0xdddddd;
export const SOLID_SHININESS = 70;
export const SOLID_OPACITY = 0.85;

export const WIREFRAME_COLOR = 0x7DF9FF; // Light Aqua
export const WIREFRAME_OPACITY = 0.7;
export const WIREFRAME_LINEWIDTH = 1.5; // Note: May not work consistently

// Lighting
export const AMBIENT_COLOR = 0x404040;
export const AMBIENT_INTENSITY = 0.6;
export const DIR_LIGHT_COLOR = 0xffffff;
export const DIR_LIGHT_INTENSITY = 0.9;
export const DIR_LIGHT_POS = { x: 5, y: 10, z: 7.5 };
export const POINT_LIGHT_COLOR = 0x87ceeb; // Sky blue
export const POINT_LIGHT_INTENSITY = 0.5;
export const POINT_LIGHT_POS = { x: -5, y: -3, z: 5 };

// Animation
export const MORPH_DURATION = 1.0; // seconds
export const HOLD_DURATION = 3.0;  // seconds
export const ROTATION_SPEED_X = 0.0008;
export const ROTATION_SPEED_Y = 0.0005;
export const ROTATION_DRAG_SENSITIVITY = 0.005;
export const ROTATION_RESUME_DELAY = 2000; // ms

// Particles
export const PARTICLE_COUNT_DESKTOP = 600;
export const PARTICLE_COUNT_MOBILE = 300;
export const PARTICLE_RADIUS_DESKTOP = 3.5; // Base radius (Icosahedron)
export const PARTICLE_RADIUS_MOBILE = 3.0;  // Base radius (Icosahedron)
// --- NEW: Reactive Shell Radii --- (Relative to baseRadius, adjust visually)
export const PARTICLE_RADIUS_FACTOR_BASE = 1.0;      // Icosahedron (Base)
export const PARTICLE_RADIUS_FACTOR_CUBE = 1.6;      // Larger for Cube
export const PARTICLE_RADIUS_FACTOR_OCTA = 1.1;      // Similar to Octahedron scale
export const PARTICLE_RADIUS_FACTOR_DODECA = 1.0;    // Similar to Dodecahedron scale
export const PARTICLE_RADIUS_FACTOR_TETRA = 0.9;     // Smaller for Tetrahedron approx
// --- END NEW ---
export const PARTICLE_COLOR_1 = "#cc00ff"; // Purple
export const PARTICLE_COLOR_2 = "#00ccff"; // Blue
export const PARTICLE_SIZE_MIN_DESKTOP = 0.05;
export const PARTICLE_SIZE_MAX_DESKTOP = 0.15;
export const PARTICLE_SIZE_MIN_MOBILE = 0.08;
export const PARTICLE_SIZE_MAX_MOBILE = 0.18;

// Fallback
export const FALLBACK_TIMEOUT = 8000; // ms
export const FALLBACK_BG_COLOR = '#0f172a';
export const FALLBACK_GRAD_1 = '#06b6d4';
export const FALLBACK_GRAD_2 = '#818cf8';
export const FALLBACK_LINE_COLOR_1 = 'rgba(255, 255, 255, 0.5)';
export const FALLBACK_LINE_COLOR_2 = 'rgba(255, 255, 255, 0.7)'; 