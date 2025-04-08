// src/scripts/constants.js

// --- Core Setup ---
export const WEBGL_REQ_LEVEL = 1; 
export const FALLBACK_BG_COLOR = 0x05030a; 

// --- Camera & View ---
export const CAMERA_FOV = 50; 
export const NEAR_PLANE = 0.1;
export const FAR_PLANE = 1000;
export const CAMERA_Z = 6; 

// --- Geometry - Sacred Geometry Platonic Solids ---
export const BASE_RADIUS = 1.0;
export const BASE_DETAIL = 0; // Base detail for Icosahedron
export const EDGES_THRESHOLD = 1; 
export const TETRA_SCALE = 1.0;
export const CUBE_SCALE = 0.8;
export const OCTA_SCALE = 1.0;
export const ICOSA_SCALE = 1.0;
export const DODECA_SCALE = 1.0;

// --- Materials ---
export const SOLID_COLOR = 0x00cccc; // Teal/Cyan color
export const SOLID_SPECULAR = 0x555555;
export const SOLID_SHININESS = 50;
export const SOLID_METALNESS = 0.3; // Added for MeshStandardMaterial
export const SOLID_ROUGHNESS = 0.6; // Added for MeshStandardMaterial
export const SOLID_OPACITY = 0.85; 

// Wireframe settings
export const WIREFRAME_COLOR = 0xBF00FF; // Neon Purple
export const WIREFRAME_OPACITY = 0.9; 
export const WIREFRAME_LINEWIDTH = 1.5; 

// --- Particle Settings ---
// Original particle sizes (used by both systems)
export const PARTICLE_SIZE_MIN_DESKTOP = 0.05;
export const PARTICLE_SIZE_MAX_DESKTOP = 0.15;
export const PARTICLE_SIZE_MIN_MOBILE = 0.08;
export const PARTICLE_SIZE_MAX_MOBILE = 0.18;

// Original particle settings (legacy)
export const PARTICLE_COLOR_1 = "#cc00ff"; 
export const PARTICLE_COLOR_2 = "#00ccff"; 
export const PARTICLE_COUNT_DESKTOP = 600;
export const PARTICLE_COUNT_MOBILE = 300;
export const PARTICLE_RADIUS_DESKTOP = 3.5; 
export const PARTICLE_RADIUS_MOBILE = 3.0;  
export const PARTICLE_RADIUS_FACTOR_BASE = 1.0; 
export const PARTICLE_RADIUS_FACTOR_CUBE = 1.6; 
export const PARTICLE_RADIUS_FACTOR_OCTA = 1.1; 
export const PARTICLE_RADIUS_FACTOR_DODECA = 1.0; 
export const PARTICLE_RADIUS_FACTOR_TETRA = 0.9; 

// --- Enhanced Galaxy Particles ---
export const GALAXY_PARTICLE_COUNT_DESKTOP = 7000; // Much more particles for desktop
export const GALAXY_PARTICLE_COUNT_MOBILE = 3000; // More particles for mobile too
export const GALAXY_PARTICLE_COLORS = ["#cc00ff", "#00ccff", "#ff66ff", "#6633ff"]; // Purple, Cyan, Pink, Indigo
export const GALAXY_RADIUS_DESKTOP = 15; // Larger galaxy radius for desktop
export const GALAXY_RADIUS_MOBILE = 10; // Larger galaxy radius for mobile
export const GALAXY_DISK_THICKNESS = 1.5; // Thickness of the galaxy disk
export const GALAXY_ARM_COUNT = 5; // Changed to 5 arms to match the 5 platonic solids
export const GALAXY_REVOLUTIONS = 2.5; // Number of revolutions for each arm
export const GALAXY_ROTATION_SPEED = 0.0425; // Reduced by 15% from 0.05

// --- Lighting ---
export const AMBIENT_COLOR = 0x404040;
export const AMBIENT_INTENSITY = 0.6;
export const DIR_LIGHT_COLOR = 0xffffff;
export const DIR_LIGHT_INTENSITY = 0.9;
export const DIR_LIGHT_POS = { x: 5, y: 10, z: 7.5 };
export const POINT_LIGHT_COLOR = 0x87ceeb; 
export const POINT_LIGHT_INTENSITY = 0.5;
export const POINT_LIGHT_POS = { x: -5, y: -3, z: 5 };

// --- Animation & Interaction ---
export const AUTO_ROTATE_SPEED_X = 0.0008;
export const AUTO_ROTATE_SPEED_Y = 0.0005;
export const MORPH_DURATION = 3.0; // seconds - increased for smoother transition
export const HOLD_DURATION = 4.0;  // seconds - increased to give more time between morphs
export const DAMPING_FACTOR = 0.95; 
export const ROTATION_LERP_FACTOR = 0.1; // Interpolation speed (0-1), ORIGINAL: 0.05
export const ROTATION_DRAG_SENSITIVITY = 0.005; 
export const ROTATION_RESUME_DELAY = 2000; // ms
export const COLOR_TRANSITION_DURATION = 2.5; // seconds - for smooth color transitions

// --- Performance ---
export const MAX_DELTA_TIME = 0.05; // Prevent large jumps on lag

// --- Element IDs ---
export const CANVAS_ID = 'morphing-poly-canvas';
export const LOADING_ID = 'morphing-poly-loading';

// --- Fallback ---
export const FALLBACK_TIMEOUT = 8000; // ms
export const FALLBACK_BG_COLOR_CSS = '#0f172a';
export const FALLBACK_GRAD_1 = '#06b6d4';
export const FALLBACK_GRAD_2 = '#818cf8';
export const FALLBACK_LINE_COLOR_1 = 'rgba(255, 255, 255, 0.5)';
export const FALLBACK_LINE_COLOR_2 = 'rgba(255, 255, 255, 0.7)';