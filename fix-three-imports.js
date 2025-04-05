import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory to search
const srcDir = path.join(__dirname, 'src', 'scripts');

// New import statement
const newImport = "import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';";

// Function to recursively find all .js files
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update imports in a file
function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file imports Three.js
  if (content.includes("import * as THREE from 'three'")) {
    // Replace the import statement
    content = content.replace(/import \* as THREE from ['"]three['"][^;]*;/, newImport);
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
    return true;
  }
  
  return false;
}

// Find all .js files
const jsFiles = findJsFiles(srcDir);

// Update imports in all files
let updatedCount = 0;
jsFiles.forEach(file => {
  if (updateImports(file)) {
    updatedCount++;
  }
});

console.log(`Updated imports in ${updatedCount} files.`);