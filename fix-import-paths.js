// Fix import paths to resolve EISDIR error
import fs from 'fs';
import path from 'path';

// Helper function to ensure a directory exists
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper function to ensure all directories in the import path exist
function ensureImportDirectoriesExist(importPath, baseDir) {
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const resolvedPath = path.resolve(baseDir, importPath);
    
    // Check if it's a directory (no extension)
    if (!path.extname(resolvedPath)) {
      ensureDirectoryExists(resolvedPath);
      
      // If it's a directory, create an index.js file if it doesn't exist
      const indexPath = path.join(resolvedPath, 'index.js');
      if (!fs.existsSync(indexPath)) {
        fs.writeFileSync(indexPath, '// Auto-generated index.js to fix EISDIR error\nexport default {};\n');
        console.log(`Created index.js at ${indexPath}`);
      }
    }
  }
}

// Function to copy scripts with fixed import paths
function copyWithFixedImports(srcDir, destDir) {
  ensureDirectoryExists(destDir);
  
  // Copy files from src to dest with fixed imports
  const files = fs.readdirSync(srcDir, { withFileTypes: true });
  
  for (const file of files) {
    const srcPath = path.join(srcDir, file.name);
    const destPath = path.join(destDir, file.name);
    
    if (file.isDirectory()) {
      // Recursively copy subdirectories
      copyWithFixedImports(srcPath, destPath);
    } else if (file.name.endsWith('.js')) {
      // Copy JS files with fixed imports
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Fix relative imports
      const importLines = content.match(/import.*from\s+['"]\..*['"]/g) || [];
      importLines.forEach(importLine => {
        const importMatch = importLine.match(/from\s+['"]([^'"]+)['"]/);
        if (importMatch && importMatch[1]) {
          const importPath = importMatch[1];
          
          // Ensure the directory structure exists for the import
          ensureImportDirectoriesExist(importPath, path.dirname(destPath));
          
          // If the import is to a directory without extension, add "/index.js"
          if (!path.extname(importPath)) {
            const newImportPath = `${importPath}/index.js`;
            content = content.replace(
              `from '${importPath}'`, 
              `from '${newImportPath}'`
            );
            content = content.replace(
              `from "${importPath}"`, 
              `from "${newImportPath}"`
            );
          }
        }
      });
      
      // Write the fixed file
      fs.writeFileSync(destPath, content);
    } else {
      // Copy other files as-is
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean the fixed directory
const fixedDir = path.join(process.cwd(), 'fixed-scripts');
if (fs.existsSync(fixedDir)) {
  fs.rmSync(fixedDir, { recursive: true, force: true });
}
ensureDirectoryExists(fixedDir);

// Copy scripts with fixed imports
console.log("Copying scripts with fixed imports...");
copyWithFixedImports(
  path.join(process.cwd(), 'src', 'scripts'), 
  path.join(fixedDir, 'scripts')
);

console.log("\nScript complete. Fixed scripts are in the 'fixed-scripts' directory.");
console.log("Try using these fixed scripts instead of the originals.");