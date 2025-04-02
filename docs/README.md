# Synthed Website Documentation

Welcome to the documentation for the Synthed website. This repository contains comprehensive explanations of various aspects of the website's functionality and structure.

## Documentation Categories

### Rendering System

The [rendering documentation](rendering/README.md) explains how the 3D visualization and content overlay system works:

- [Rendering System Overview](rendering/RENDERING-OVERVIEW.md)
- [3D Rendering System](rendering/3D-RENDERING-SYSTEM.md)
- [Content Overlay System](rendering/CONTENT-OVERLAY-SYSTEM.md)
- [Interaction System](rendering/INTERACTION-SYSTEM.md)

### Development Guidelines

- [How to Fix Three.js Issues](HOW_TO_FIX_THREEJS.md)
- [Three.js Fixes Implementation](THREEJS_FIXES_IMPLEMENTATION.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

### Deployment

- [Cloudflare Deployment Guide](CLOUDFLARE_DEPLOY.md)

## Website Architecture

The Synthed website is built using:

- **Astro**: Main framework providing component structure and rendering
- **Three.js**: 3D visualization for interactive elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **JavaScript Modules**: Organized modular code structure

### Project Structure

```
synthedxyz/
├── src/
│   ├── components/    # UI components
│   │   ├── three/     # Three.js modules and utilities
│   │   └── ...
│   ├── layouts/       # Page layouts
│   ├── pages/         # Astro pages
│   ├── scripts/       # JavaScript utilities
│   └── styles/        # Global CSS files
│
├── public/            # Static assets
│   ├── fonts/         # Font files
│   ├── images/        # Image assets
│   ├── js/            # Client-side scripts
│   └── ...
│
├── docs/              # Documentation
│   ├── rendering/     # Rendering system docs
│   └── ...
│
└── ...                # Configuration files
```

## Key Features

1. **Interactive 3D Visualization**: Morphing geometric shapes with custom shaders
2. **Responsive Design**: Adapts to different screen sizes and devices
3. **Modular Architecture**: Well-organized component-based structure
4. **Performance Optimizations**: Mobile-specific optimizations and fallbacks
5. **Cross-Browser Compatibility**: Works across modern browsers with fallbacks

## Contributing

When contributing to the project, please refer to the documentation to understand the system architecture and follow the established patterns.

## License

This project is released under the terms specified in the [LICENSE](../LICENSE) file. 