// Fix EISDIR error - direct approach
import fs from 'fs';
import path from 'path';

function scanForIncorrectImports(dir) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        // Recursively scan subdirectories
        scanForIncorrectImports(fullPath);
      } else if (file.name.endsWith('.js')) {
        // Check JS files for import statements
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const importLines = content.match(/import.*from.*['"].*['"]/g) || [];
          
          importLines.forEach(importLine => {
            // Extract the path from the import statement
            const importMatch = importLine.match(/from\s+['"]([^'"]+)['"]/);
            if (importMatch && importMatch[1]) {
              const importPath = importMatch[1];
              
              // Skip absolute URLs and node_modules
              if (importPath.startsWith('http') || !importPath.startsWith('.')) {
                return;
              }
              
              // Resolve the imported path relative to the current file
              const resolvedPath = path.resolve(path.dirname(fullPath), importPath);
              
              try {
                const stats = fs.statSync(resolvedPath);
                
                // Check if importing a directory that has no index.js
                if (stats.isDirectory()) {
                  const hasIndexJs = fs.existsSync(path.join(resolvedPath, 'index.js'));
                  if (!hasIndexJs) {
                    console.log(`[EISDIR RISK] ${fullPath} imports directory ${importPath} without index.js`);
                  }
                }
              } catch (err) {
                // If the import path doesn't exist (no extension specified)
                if (err.code === 'ENOENT') {
                  // Try with .js extension
                  const withJsExt = `${resolvedPath}.js`;
                  if (fs.existsSync(withJsExt)) {
                    // File exists with .js extension
                  } else {
                    console.log(`[MISSING IMPORT] ${fullPath} imports non-existent path ${importPath}`);
                  }
                }
              }
            }
          });
        } catch (err) {
          console.error(`Error reading file ${fullPath}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dir}:`, err.message);
  }
}

// Scan both src and public directories
console.log("Scanning src/scripts for incorrect imports...");
scanForIncorrectImports(path.join(process.cwd(), 'src', 'scripts'));

console.log("\nScanning public/scripts for incorrect imports...");
scanForIncorrectImports(path.join(process.cwd(), 'public', 'scripts'));

console.log("\nDone scanning for incorrect imports.");