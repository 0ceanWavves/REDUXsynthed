// public/scripts/constants.js

// --- Core Setup ---
export const WEBGL_REQ_LEVEL = 1; // 0 = none, 1 = webgl, 2 = webgl2
export const FALLBACK_BG_COLOR = 0x05030a; // Dark background

// --- Camera & View ---
export const CAMERA_FOV = 75;
export const NEAR_PLANE = 0.1;
export const FAR_PLANE = 1000;
export const CAMERA_Z = 5; // Initial camera distance

// --- Geometry ---
export const BASE_RADIUS = 1.5; // Base size for the icosahedron
export const BASE_DETAIL = 1; // Detail level for the icosahedron (adjust for performance)
export const CUBE_SCALE = 1.1;
export const OCTA_SCALE = 1.2;
export const DODECA_SCALE = 1.3;
export const TETRA_SCALE = 1.0;

// --- Materials ---
export const SOLID_COLOR = 0x156289; // Teal color for the solid part
export const SOLID_SPECULAR = 0xffffff;
export const SOLID_SHININESS = 50;
export const SOLID_OPACITY = 0.6; // Semi-transparent

// Wireframe Color Change
export const WIREFRAME_COLOR = 0xBF00FF; // Neon Purple
export const WIREFRAME_OPACITY = 0.9; // Increased opacity
export const WIREFRAME_LINEWIDTH = 1.5; // Slightly thicker lines (may have limited effect)

// Particle Material
export const PARTICLE_COLOR = 0xffffff; // White particles
export const PARTICLE_SIZE = 0.05;
export const PARTICLE_OPACITY = 0.8;

// --- Lighting ---
export const AMBIENT_LIGHT_COLOR = 0x404040; // Soft white ambient light
export const AMBIENT_LIGHT_INTENSITY = 1.5;
export const POINT_LIGHT_COLOR = 0xffffff;
export const POINT_LIGHT_INTENSITY = 1.5;
export const POINT_LIGHT_DISTANCE = 100;
export const POINT_LIGHT_POS_X = 10;
export const POINT_LIGHT_POS_Y = 10;
export const POINT_LIGHT_POS_Z = 10;

// --- Animation & Interaction ---
export const AUTO_ROTATE_SPEED = 0.002; // Speed of automatic rotation
export const MORPH_SPEED = 0.008; // Speed of morphing between targets
export const DAMPING_FACTOR = 0.95; // For inertia after drag
export const ROTATION_LERP_FACTOR = 0.08; // Smoothness of rotation interpolation
export const ROTATION_DRAG_SENSITIVITY = 0.005; // How much mouse movement affects rotation
export const ROTATION_RESUME_DELAY = 2500; // ms delay before auto-rotate resumes after interaction

// --- Particles Animation ---
export const PARTICLE_COUNT = 500;
export const PARTICLE_RADIUS_MIN = 3;
export const PARTICLE_RADIUS_MAX = 5;
export const PARTICLE_SPEED_MIN = 0.001;
export const PARTICLE_SPEED_MAX = 0.005;

// --- Performance ---
export const MAX_DELTA_TIME = 1 / 30; // Cap delta time to avoid large jumps

// Element IDs
export const CANVAS_ID = 'morphing-poly-canvas';
export const LOADING_ID = 'morphing-poly-loading';

// Geometry
export const EDGES_THRESHOLD = 1;

// Target Shape Scaling (relative to baseRadius)
export const TETRA_SCALE_OLD = 1.0;  // Approx (using sphere projection)

// Materials
export const SOLID_COLOR_OLD = 0x00bcd4; // Cyan
export const SOLID_SPECULAR_OLD = 0xdddddd;
export const SOLID_SHININESS_OLD = 70;
export const SOLID_OPACITY_OLD = 0.85;

export const WIREFRAME_COLOR_OLD = 0x7DF9FF; // Light Aqua
export const WIREFRAME_OPACITY_OLD = 0.7;
export const WIREFRAME_LINEWIDTH_OLD = 1.5; // Note: May not work consistently

// Lighting
export const AMBIENT_COLOR_OLD = 0x404040;
export const AMBIENT_INTENSITY_OLD = 0.6;
export const DIR_LIGHT_COLOR_OLD = 0xffffff;
export const DIR_LIGHT_INTENSITY_OLD = 0.9;
export const DIR_LIGHT_POS_OLD = { x: 5, y: 10, z: 7.5 };
export const POINT_LIGHT_COLOR_OLD = 0x87ceeb; // Sky blue
export const POINT_LIGHT_INTENSITY_OLD = 0.5;
export const POINT_LIGHT_POS_OLD = { x: -5, y: -3, z: 5 };

// Animation
export const MORPH_DURATION_OLD = 1.0; // seconds
export const HOLD_DURATION_OLD = 3.0;  // seconds
export const ROTATION_SPEED_X_OLD = 0.0008;
export const ROTATION_SPEED_Y_OLD = 0.0005;
export const ROTATION_DRAG_SENSITIVITY_OLD = 0.005;
export const ROTATION_RESUME_DELAY_OLD = 2000; // ms

// Particles
export const PARTICLE_COUNT_DESKTOP_OLD = 600;
export const PARTICLE_COUNT_MOBILE_OLD = 300;
export const PARTICLE_RADIUS_DESKTOP_OLD = 3.5; // Base radius (Icosahedron)
export const PARTICLE_RADIUS_MOBILE_OLD = 3.0;  // Base radius (Icosahedron)
// --- NEW: Reactive Shell Radii --- (Relative to baseRadius, adjust visually)
export const PARTICLE_RADIUS_FACTOR_BASE_OLD = 1.0;      // Icosahedron (Base)
export const PARTICLE_RADIUS_FACTOR_CUBE_OLD = 1.6;      // Larger for Cube
export const PARTICLE_RADIUS_FACTOR_OCTA_OLD = 1.1;      // Similar to Octahedron scale
export const PARTICLE_RADIUS_FACTOR_DODECA_OLD = 1.0;    // Similar to Dodecahedron scale
export const PARTICLE_RADIUS_FACTOR_TETRA_OLD = 0.9;     // Smaller for Tetrahedron approx
// --- END NEW ---
export const PARTICLE_COLOR_1_OLD = "#cc00ff"; // Purple
export const PARTICLE_COLOR_2_OLD = "#00ccff"; // Blue
export const PARTICLE_SIZE_MIN_DESKTOP_OLD = 0.05;
export const PARTICLE_SIZE_MAX_DESKTOP_OLD = 0.15;
export const PARTICLE_SIZE_MIN_MOBILE_OLD = 0.08;
export const PARTICLE_SIZE_MAX_MOBILE_OLD = 0.18;

// Fallback
export const FALLBACK_TIMEOUT_OLD = 8000; // ms
export const FALLBACK_GRAD_1_OLD = '#06b6d4';
export const FALLBACK_GRAD_2_OLD = '#818cf8';
export const FALLBACK_LINE_COLOR_1_OLD = 'rgba(255, 255, 255, 0.5)';
export const FALLBACK_LINE_COLOR_2_OLD = 'rgba(255, 255, 255, 0.7)'; 