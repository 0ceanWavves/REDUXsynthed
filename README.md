# Synthed - Interactive Web Experience

A modern, visually stunning web platform built with cutting-edge web technologies, featuring interactive 3D graphics, morphing animations, and responsive design.

## Technology Stack

### Core Framework
- **[Astro](https://astro.build/)** - The main web framework, providing high-performance static site generation with zero JavaScript by default
- **TypeScript** - For type-safe JavaScript development

### 3D Graphics & Animation
- **[Three.js](https://threejs.org/)** - Powerful 3D library for creating and displaying 3D computer graphics in a web browser
- **Simplex Noise** (`simplex-noise`) - Procedural noise generation for organic motion effects
- **Custom Morphing System** - Advanced implementation of Three.js morph targets for smooth shape transitions

### UI Components & Icons
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI development
- **[Astro Icon](https://github.com/natemoo-re/astro-icon)** - Icon integration for Astro

### Performance Optimizations
- Browser-specific rendering optimizations (Chrome, Firefox)
- Device-specific adjustments (mobile, desktop)
- Efficient memory management with proper resource disposal
- Visibility-based rendering pausing
- Intersection Observer API for efficient animations

## Key Features

### Interactive 3D Elements
- **Morphing Prism** - Advanced implementation that transitions between all five Platonic solids
- **Wireframe Edges** - Dynamic edge highlighting for better shape definition
- **User Interaction** - Fully interactive 3D elements that respond to user input
- **Optimized Rendering** - Efficient rendering pipeline with multiple visual enhancements

### Visual Effects
- **Glow Effects** - Subtle backlighting for 3D elements
- **Gradient Text** - Beautiful text gradients with browser-specific optimizations
- **Animation Sequences** - Choreographed element entrance animations
- **Parallax Scrolling** - Subtle depth effects on scroll

### UI/UX Design
- **Responsive Layout** - Fully responsive design that adapts to all screen sizes
- **Performance-First Approach** - Optimized for smooth performance even on lower-end devices
- **Accessibility Considerations** - Including reduced motion support

## Project Structure

```
src/
├── components/
│   ├── AmorphousPrism.astro   # 3D morphing prism implementation
│   ├── FlowBackground.astro   # Flowing liquid background effect
│   ├── Splash.astro           # Hero section component
│   └── ...                    # Other components
├── styles/
│   └── global.css             # Global styles and utilities
├── pages/
│   └── index.astro            # Main entry point
└── ...                        # Other project files
```

## Setting Up the Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/synthed.git
   cd synthed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Deployment

The project is optimized for deployment on modern hosting platforms:

- **GitHub Pages**: Easily deploy directly from your repository
- **Cloudflare Pages**: High-performance hosting with global CDN
- **Netlify/Vercel**: One-click deployments with preview functionality

## Technical Notes

### 3D Implementation Details

The 3D graphics implementation leverages several advanced Three.js techniques:

1. **Morph Target Animation** - Rather than directly manipulating vertices, we use Three.js morph targets for smoother transitions between shapes.

2. **Vertex Mapping Algorithm** - Custom algorithm that maps vertices between different geometries with varying vertex counts.

3. **Browser-Specific Optimizations** - Different rendering paths for Chrome, Firefox, and mobile devices to ensure optimal performance.

4. **Edge Enhancement** - Custom implementation of `EdgesGeometry` with optimized thresholds for better visibility of geometric forms.

5. **Memory Management** - Careful cleanup and disposal of Three.js resources to prevent memory leaks during navigation.

## License

[MIT License](LICENSE)

## Acknowledgments

- Three.js community for their excellent documentation and examples
- Astro team for creating a stellar web framework
- All the open-source contributors whose work makes modern web development possible

# Database Index Migration for Unindexed Foreign Keys

This repository contains SQL scripts to address Supabase database linter warnings about unindexed foreign keys. Adding proper indexes to foreign key columns improves query performance, especially for join operations.

## Files

- **add_missing_indexes.sql**: Simple SQL script with CREATE INDEX statements for each unindexed foreign key. Use this for direct execution in development environments or for reference.

- **migration_add_missing_indexes.sql**: Transaction-based migration script with error handling and idempotency (safe to run multiple times). This is the recommended script for production environments.

## Performance Impact

Adding indexes to foreign key columns can significantly improve query performance, especially for:

- JOIN operations using these foreign keys
- WHERE clauses that filter on foreign key columns
- Referential integrity checks

The performance benefit is most noticeable on tables with many rows or frequently queried tables.

## How to Apply

### Option 1: Using Supabase Migration

If you're using Supabase migrations:

1. Copy the migration script to your migrations folder
2. Rename it with the appropriate timestamp prefix (e.g., `000123_add_missing_indexes.sql`)
3. Run the migration using your normal migration process:
   ```
   supabase db push
   ```

### Option 2: Direct Database Execution

1. Connect to your Supabase database using psql or another PostgreSQL client
2. Execute the migration script:
   ```
   \i migration_add_missing_indexes.sql
   ```

### Option 3: Supabase Dashboard SQL Editor

1. Open your Supabase project
2. Navigate to the SQL Editor
3. Copy the contents of `migration_add_missing_indexes.sql`
4. Execute the script

## Verification

After applying the indexes, you can verify they were created by running:

```sql
-- For phi_data schema
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'phi_data' AND indexname LIKE 'idx_%';

-- For public schema
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
```

## Monitoring

After adding the indexes, monitor your database performance to ensure the changes have a positive impact. If you notice any issues, you can remove specific indexes using:

```sql
DROP INDEX IF EXISTS schema_name.index_name;
```

## Notes

- Index creation might take some time on large tables
- Creating indexes acquires a lock on the table, which might block other operations during creation
- For very large tables in a production environment, consider using `CREATE INDEX CONCURRENTLY` directly in a maintenance window to minimize blocking
