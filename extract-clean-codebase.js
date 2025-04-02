// Script to extract a clean codebase based on coverage results
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

// Root directories
const sourceDir = __dirname;
const targetDir = path.join(__dirname, 'clean-project');

// Ensure target directory exists
ensureDirectoryExists(targetDir);

// Try to load coverage data
let coverageData;
try {
    coverageData = JSON.parse(fs.readFileSync(path.join(__dirname, 'coverage', 'coverage.json'), 'utf8'));
    console.log('Coverage data loaded successfully');
} catch (err) {
    console.error('Error loading coverage data:', err.message);
    console.log('Using predefined list of known files instead');
    
    // Define a list of files we know are being used
    coverageData = {};
    
    // Add your core files to this list
    const knownUsedFiles = [
        'src/scripts/amorphous-prism-init.js',
        'public/js/lockdown-fix.js',
        'public/js/emergency-shader-fix.js',
        'public/js/module-loader.js',
        'public/js/fix-hero-layout.js',
        'public/js/shader-extension-fix.js',
        'public/js/optimize-will-change.js'
    ];
    
    // Mark all known files as "used"
    knownUsedFiles.forEach(file => {
        const fullPath = path.join(sourceDir, file);
        coverageData[fullPath] = { s: { 0: 1 } }; // Fake coverage data (line 0 was executed)
    });
}

// List of files/directories to always include
const alwaysInclude = [
    'src/components/three',  // All THREE.js components
    'package.json',
    'package-lock.json',
    'astro.config.mjs',
    'tsconfig.json',
    'tailwind.config.js',
    'src/layouts',
    'src/pages',
    'src/components',
    'public/css',
    'public/images',
    'public/fonts',
    'README.md'
];

// Function to copy a file, creating any necessary directories
function copyFile(source, target) {
    const targetDir = path.dirname(target);
    ensureDirectoryExists(targetDir);
    
    fs.copyFileSync(source, target);
    console.log(`Copied ${source} to ${target}`);
}

// Function to copy a directory recursively
function copyDirectory(source, target, skipFiltered = false) {
    ensureDirectoryExists(target);
    
    const items = fs.readdirSync(source);
    
    items.forEach(item => {
        const sourcePath = path.join(source, item);
        const targetPath = path.join(target, item);
        
        const stats = fs.statSync(sourcePath);
        
        if (stats.isDirectory()) {
            copyDirectory(sourcePath, targetPath, skipFiltered);
        } else if (stats.isFile()) {
            // Skip .bak files
            if (item.endsWith('.bak')) {
                console.log(`Skipping backup file: ${sourcePath}`);
                return;
            }
            
            // If skipFiltered is true, only copy files that have coverage data
            if (!skipFiltered || Object.keys(coverageData).some(file => file === sourcePath || file.includes(item))) {
                copyFile(sourcePath, targetPath);
            } else {
                console.log(`Skipping unused file: ${sourcePath}`);
            }
        }
    });
}

// First, copy all files with coverage data
Object.keys(coverageData).forEach(file => {
    // Skip files outside the project directory
    if (!file.startsWith(sourceDir)) {
        return;
    }
    
    // Calculate relative path
    const relPath = path.relative(sourceDir, file);
    const targetPath = path.join(targetDir, relPath);
    
    // Copy the file
    copyFile(file, targetPath);
});

// Then include the always-include directories and files
alwaysInclude.forEach(item => {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);
    
    if (fs.existsSync(sourcePath)) {
        const stats = fs.statSync(sourcePath);
        
        if (stats.isDirectory()) {
            copyDirectory(sourcePath, targetPath);
        } else if (stats.isFile()) {
            copyFile(sourcePath, targetPath);
        }
    } else {
        console.warn(`Item not found: ${sourcePath}`);
    }
});

// Handle special case for THREE.js components
// These are dynamically imported so may not show up in coverage
const threeComponentsDir = path.join(sourceDir, 'src/components/three');
if (fs.existsSync(threeComponentsDir)) {
    copyDirectory(threeComponentsDir, path.join(targetDir, 'src/components/three'));
}

console.log('\nExtraction complete!');
console.log(`Clean project created at: ${targetDir}`);
console.log('\nNext steps:');
console.log('1. Review the clean project directory');
console.log('2. Verify all necessary files are included');
console.log('3. Test the clean project to ensure everything works correctly');
console.log('4. If everything looks good, you can replace your original project with this clean version'); 