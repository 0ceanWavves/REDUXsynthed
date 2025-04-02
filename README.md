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

## Development

To run the site locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

To build for production:

```bash
npm run build
```

## File Structure

```
src/
├── assets/        # Static assets like images
├── components/    # UI components
│   ├── CommonHead.astro        # Meta tags and head scripts
│   ├── Navigation.astro        # Main navigation
│   ├── BackgroundDecorations.astro  # Background elements
│   ├── HeroSection.astro       # Hero section
│   ├── Features.astro          # Features section
│   ├── Process.astro           # Process section
│   ├── Projects.astro          # Projects section
│   └── ...                     # Other components
├── layouts/       # Layout templates
│   └── MainLayout.astro        # Main site layout
├── pages/         # Page templates
│   └── index.astro             # Main landing page
├── scripts/       # Client-side JavaScript
│   └── index-page.js           # Index page script
└── styles/        # Stylesheets
    ├── index.css               # Base styles
    ├── mobile-fixes.css        # Mobile-specific styles
    └── index-page.css          # Index page styles
```

## Interactive Elements

The site includes several interactive elements:

- **3D Prism**: Interactive 3D element in the hero section
- **Flow Background**: Animated background with customizable settings
- **Section Highlighting**: Visual indicators for active sections
- **Cursor Effect**: Custom cursor glow effect on desktop

## Browser Support

The site is optimized for:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari/iOS Safari (latest)
- Mobile Chrome and Firefox

## Recent Updates and Fixes

The site has undergone several important updates to fix various issues:

1. **Improved Scrolling**: Fixed scrolling issues that prevented users from seeing content beyond the hero section.
2. **Content Security Policy (CSP)**: Implemented a comprehensive CSP system to allow necessary resources.
3. **Build Process**: Resolved build errors related to script imports and directives.
4. **3D Rendering**: Enhanced the 3D morphing object with better fallbacks and interaction.
5. **Cross-Browser Compatibility**: Added fixes for various browsers, especially Firefox and mobile browsers.
6. **THREE.js Loading**: Fixed issues with THREE.js loading by implementing a robust loader system with CDN fallbacks
7. **Module Import Fixes**: Added a module path fixer to ensure proper import paths for dynamic imports
8. **Fallback Rendering**: Added a simple fallback rendering system when the main 3D object fails to load
9. **Font Loading**: Enhanced font loader with CDN fallbacks and error handling

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed information about these fixes and solutions to common issues.

## Troubleshooting

If you encounter any issues while running or building the site, please refer to the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) document, which contains detailed information about:

- Content Security Policy (CSP) issues
- Scrolling problems
- Build errors
- Rendering issues
- 3D morphing object customization

The troubleshooting guide provides specific solutions and code examples for each type of issue.

## Customization

The 3D morphing object can be customized by modifying the shapes, colors, and animation settings. See [3D-MORPHING.md](./docs/3D-MORPHING.md) for detailed instructions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Three.js](https://threejs.org/) - 3D graphics library
- [Astro](https://astro.build/) - Static site generator
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
