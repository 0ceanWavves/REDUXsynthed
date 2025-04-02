# Codebase Cleanup Tools

This directory contains tools to help identify which JavaScript files are actually used in the application and create a clean project with only the necessary files.

## Overview

The toolset consists of:

1. **Coverage Instrumentation**: Instruments JavaScript files with Istanbul to track code execution
2. **Coverage Collection**: Collects coverage data while you interact with the site
3. **Clean Project Extraction**: Creates a new directory with only the files that are actually used

## Files in this Toolset

- `coverage-setup.js`: Instruments JavaScript files and starts a server to collect coverage data
- `public/js/coverage-client.js`: Client-side script to send coverage data to the server
- `update-for-coverage.js`: Updates layout files to use the instrumented scripts
- `restore-layouts.cjs`: Restores original layout files after testing
- `extract-clean-codebase.js`: Creates a clean project with only the necessary files
- `run-cleanup.js`: Automated script to run the entire process

## How to Use

### Option 1: Automated Process

Simply run the automated cleanup script:

```bash
node run-cleanup.js
```

This will guide you through the entire process with step-by-step instructions.

### Option 2: Manual Process

#### Step 1: Set Up Coverage Tracking

1. Install Istanbul:
   ```bash
   npm install --save-dev istanbul express
   ```

2. Run the coverage setup script:
   ```bash
   node coverage-setup.js
   ```

3. Update the layout files to use instrumented scripts:
   ```bash
   node update-for-coverage.js
   ```

#### Step 2: Collect Coverage Data

1. Start your development server in a separate terminal:
   ```bash
   npm run dev
   ```

2. Visit your site with `?coverage=true` appended to the URL:
   ```
   http://localhost:3000/?coverage=true
   ```

3. Interact with the site to trigger all functionality:
   - Visit all pages
   - Interact with the 3D visualization
   - Trigger any animations
   - Test across different device sizes (responsive design)

4. Coverage data is automatically sent to the server

#### Step 3: Extract the Clean Project

1. Generate the coverage report:
   ```
   http://localhost:3001/coverage/report
   ```

2. Run the extraction script:
   ```bash
   node extract-clean-codebase.js
   ```

3. Review the clean project:
   ```bash
   ls -la clean-project/
   ```

4. Test the clean project to ensure everything works correctly:
   ```bash
   cd clean-project
   npm install
   npm run dev
   ```

#### Step 4: Restore Original Files

1. Restore the original layout files:
   ```bash
   node restore-layouts.cjs
   ```

## ES Modules Compatibility

All scripts use ES Module syntax as required by your project's `"type": "module"` setting in package.json, with the exception of:

- `restore-layouts.cjs`: Uses CommonJS syntax (hence the .cjs extension) for compatibility when run separately

## Known Limitations

1. **Dynamic Imports**: Files loaded via dynamic imports might not show up in coverage data
2. **Code Paths**: Some code paths might not be executed during testing
3. **CSS and Images**: The tool only tracks JavaScript execution, not CSS or image usage

## Fallback Mode

If coverage data isn't available, the `extract-clean-codebase.js` script will fall back to a predefined list of known used files:

- `src/scripts/amorphous-prism-init.js`
- `public/js/lockdown-fix.js`
- `public/js/emergency-shader-fix.js`
- `public/js/module-loader.js`
- `public/js/fix-hero-layout.js`
- `public/js/shader-extension-fix.js`
- `public/js/optimize-will-change.js`

## Files Always Included

Regardless of coverage data, the following files/directories are always included:

- `src/components/three/` (All THREE.js components)
- `package.json`
- `package-lock.json`
- `astro.config.mjs`
- `tsconfig.json`
- `tailwind.config.js`
- `src/layouts/`
- `src/pages/`
- `src/components/`
- `public/css/`
- `public/images/`
- `public/fonts/`
- `README.md`

## Understanding the Clean Project

The clean project maintains the same structure as the original but only includes:

1. Files that were actually executed during testing
2. Essential files for the project to function
3. THREE.js component files that might be dynamically imported

All `.bak` files and duplicates are automatically excluded.

## Troubleshooting

- **Missing Coverage Data**: If you don't see coverage data, check the browser console for errors
- **Instrumentation Errors**: Some files might not be properly instrumented; check the console output
- **Missing Files in Clean Project**: Add any missing files to the `alwaysInclude` array in `extract-clean-codebase.js`
- **ES Module Errors**: If you see "require is not defined" errors, make sure all scripts use ES Module syntax (import/export) instead of CommonJS (require/module.exports) 