// Simplified script to extract used files based on known analysis
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Extracting Used Files to Clean Project ===');

// List of files we know are being used
const knownUsedFiles = [
    // Main Initialization Script
    'src/scripts/amorphous-prism-init.js',
    
    // Fix Scripts from public/js
    'public/js/lockdown-fix.js',
    'public/js/emergency-shader-fix.js',
    'public/js/module-loader.js',
    'public/js/fix-hero-layout.js',
    'public/js/shader-extension-fix.js',
    'public/js/optimize-will-change.js',
    'public/js/shader-fix-standalone.js'
];

// Directories to copy entirely
const directoriesToCopy = [
    'src/components/three',  // All THREE.js components
    'src/layouts',
    'src/pages',
    'src/components',
    'src/scripts',          // Added scripts directory
    'public/css',
    'public/images',
    'public/fonts',
    'public/js'             // Added public/js directory
];

// Individual files to always include
const filesToAlwaysInclude = [
    'package.json',
    'package-lock.json',
    'astro.config.mjs',
    'tsconfig.json',
    'tailwind.config.cjs',  // Changed from tailwind.config.js to tailwind.config.cjs
    'README.md',
    'vite.config.js',
    '_headers',
    '_redirects'
];

// Target directory for clean project
const targetDir = path.join(__dirname, 'clean-project');

// Function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

// Ensure target directory exists
ensureDirectoryExists(targetDir);

// Function to copy a file
function copyFile(source, target) {
    try {
        const targetDir = path.dirname(target);
        ensureDirectoryExists(targetDir);
        
        fs.copyFileSync(source, target);
        console.log(`Copied: ${source}`);
    } catch (err) {
        console.error(`Error copying ${source}: ${err.message}`);
    }
}

// Function to copy a directory recursively
function copyDirectory(source, target) {
    try {
        ensureDirectoryExists(target);
        
        const entries = fs.readdirSync(source, { withFileTypes: true });
        
        for (const entry of entries) {
            const sourcePath = path.join(source, entry.name);
            const targetPath = path.join(target, entry.name);
            
            // Skip .bak files and node_modules
            if (entry.name.endsWith('.bak') || entry.name === 'node_modules') {
                continue;
            }
            
            if (entry.isDirectory()) {
                copyDirectory(sourcePath, targetPath);
            } else {
                copyFile(sourcePath, targetPath);
            }
        }
    } catch (err) {
        console.error(`Error copying directory ${source}: ${err.message}`);
    }
}

// Copy known used files
console.log('\nCopying known used files:');
knownUsedFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const targetPath = path.join(targetDir, file);
    
    if (fs.existsSync(sourcePath)) {
        copyFile(sourcePath, targetPath);
    } else {
        console.warn(`Warning: File not found: ${sourcePath}`);
    }
});

// Copy directories
console.log('\nCopying directories:');
directoriesToCopy.forEach(dir => {
    const sourcePath = path.join(__dirname, dir);
    const targetPath = path.join(targetDir, dir);
    
    if (fs.existsSync(sourcePath)) {
        copyDirectory(sourcePath, targetPath);
    } else {
        console.warn(`Warning: Directory not found: ${sourcePath}`);
    }
});

// Copy always-include files
console.log('\nCopying essential project files:');
filesToAlwaysInclude.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const targetPath = path.join(targetDir, file);
    
    if (fs.existsSync(sourcePath)) {
        copyFile(sourcePath, targetPath);
    } else {
        console.warn(`Warning: File not found: ${sourcePath}`);
    }
});

console.log('\n=== Extraction Complete ===');
console.log(`Clean project created at: ${targetDir}`);
console.log('\nNext steps:');
console.log('1. Review the clean project directory');
console.log('2. Test the clean project by running:');
console.log('   cd clean-project');
console.log('   npm install');
console.log('   npm run dev');
console.log('3. If everything works, you can use this as your new project base'); 