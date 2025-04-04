# Synthed.xyz Website

## Project Structure

This site is built with Astro, using a modular component-based architecture. It features interactive 3D/canvas elements, section-based navigation, and responsive design optimizations.

### Project Organization

The codebase has been optimized into a modular structure for better maintainability and code organization:

#### Main Components

- `src/layouts/MainLayout.astro`: Main layout template containing common elements (head, navigation, footer, etc.)
- `src/components/CommonHead.astro`: Contains all meta tags, scripts, and styles for the head section
- `src/components/Navigation.astro`: Navigation bar with adaptive positioning based on scroll
- `src/components/BackgroundDecorations.astro`: Background decorative elements like waves and gradients
- `src/components/HeroSection.astro`: Hero section with 3D prism and splash content
- `src/components/Features.astro`, `Process.astro`, `Projects.astro`: Main content sections

#### Assets

- `src/styles/index-page.css`: Styles specific to the index page
- `src/scripts/index-page.js`: Client-side JavaScript for the index page

### Browser-Specific Optimizations

The site includes several optimizations for different browsers:

- **Firefox-specific fixes**: Ensures 3D elements render correctly in Firefox
- **Chrome mobile fixes**: Implements scroll performance optimizations for Chrome on mobile
- **iOS fixes**: Provides touch interaction improvements for iOS devices

### Cross-Browser Compatibility

The site addresses various cross-browser compatibility issues:

- **Cursor effect**: A custom cursor glow effect for desktop users
- **Canvas interaction**: Ensures 3D elements can be properly interacted with
- **Scroll behavior**: Optimized scrolling with passive event listeners for performance
- **Reduced motion**: Alternative experience for users with prefers-reduced-motion setting

### Key Features

- **Adaptive Navigation**: Navbar that moves between top/bottom based on scroll position
- **Section Tracking**: Active section highlighting with IntersectionObserver
- **Loading Screen**: Initial loading experience with animation
- **Responsive Design**: Mobile-optimized layouts and interactions
- **Performance Optimizations**: Uses requestAnimationFrame for smooth animations

## Interactive Visualization Structure (`src/scripts/`)

The interactive 3D visualization in the hero section is built using Three.js and organized into modular JavaScript files within the `src/scripts/` directory. This allows for better separation of concerns and easier maintenance.

**Key Modules:**

- **`amorphous-prism-init.js`**: The main entry point and orchestrator. It handles:
    - Loading Three.js (`utils/loadThree.js`).
    - Checking WebGL compatibility and initiating fallbacks (`utils/fallback.js`).
    - Setting up the scene, camera, renderer, and lighting (`core/sceneSetup.js`).
    - Creating materials (`visuals/materials.js`).
    - Generating the morphing geometry (`geometry/mainGeometry.js`).
    - Creating the main solid mesh and the wireframe overlay (`visuals/wireframe.js`).
    - Creating the background starfield particles (`visuals/backgroundParticles.js`).
    - Setting up user interaction controls (`controls/interaction.js`).
    - Starting the animation loop (`animation/animationLoop.js`).

- **`constants.js`**: Contains all magic numbers and configuration values (colors, speeds, sizes, etc.) used across the visualization modules.

- **`core/`**:
    - `sceneSetup.js`: Sets up the core THREE.Scene, camera, renderer, and lighting.

- **`geometry/`**:
    - `mainGeometry.js`: Creates the base Icosahedron geometry and defines/calculates the morph targets (Cube, Octahedron, etc.).
    - `shapes.js`: Provides functions to calculate points on the surface of different geometric shapes (used for morph targets).
    - `morphTargetCalculator.js`: Helper module to calculate the vertex positions for morph targets based on the base geometry and shape functions.

- **`visuals/`**:
    - `materials.js`: Creates and exports the materials used for the solid mesh (`solidMaterial`) and the wireframe (`edgesMaterial`).
    - `wireframe.js`: Creates the `EdgesGeometry` and `LineSegments` object for the wireframe overlay and adds it to the scene.
    - `backgroundParticles.js`: Creates the static background particle system (starfield).

- **`animation/`**:
    - `animationLoop.js`: Contains the main `requestAnimationFrame` loop. It handles:
        - Updating morph target influences over time.
        - Applying rotation based on user interaction or auto-rotation.
        - Rotating the background particle system.
        - Rendering the scene.

- **`controls/`**:
    - `interaction.js`: Manages user input (mouse/touch drag) to control the rotation of the main object, including inertia/damping effects and pausing/resuming auto-rotation.

- **`utils/`**:
    - `loadThree.js`: Utility to load the Three.js library, potentially from a CDN.
    - `fallback.js`: Checks for WebGL support and can initiate a 2D canvas fallback visualization.
    - `smoothstep.js`: Standard smoothstep interpolation function.
    - `textureUtils.js`: Utilities related to textures, currently includes `createCircleTexture` for particles.

**Data Flow:**

1.  `AmorphousPrism.astro` includes `<script src="../scripts/amorphous-prism-init.js"></script>`.
2.  `amorphous-prism-init.js` runs, imports necessary modules, and orchestrates the setup.
3.  Constants are imported from `constants.js`.
4.  Geometry and materials are created by their respective modules.
5.  Meshes (solid, wireframe, particles) are created and added to the scene by the init script or specialized modules.
6.  Interaction listeners are set up.
7.  The animation loop is started, receiving references to the scene objects it needs to update.
8.  The animation loop continuously updates object properties (rotation, morphing) and renders the scene.

## Development

To run the site locally:

```