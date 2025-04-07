// Fix EISDIR error
import fs from 'fs';
import path from 'path';

// Function to recursively check if a directory contains files that might cause EISDIR errors
function checkDirectoryForErrors(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Check if any .js files are trying to import this directory
      const jsFiles = findJsFilesImportingDirectory(dir, item);
      if (jsFiles.length > 0) {
        console.log(`WARNING: Directory ${fullPath} might be causing EISDIR errors when imported by:`);
        jsFiles.forEach(jsFile => console.log(`- ${jsFile}`));
      }
      
      // Recursively check subdirectories
      checkDirectoryForErrors(fullPath);
    }
  });
}

// Function to find JS files that import a specific directory
function findJsFilesImportingDirectory(baseDir, dirName) {
  const jsFiles = [];
  const allJsFiles = findAllJsFiles(baseDir);
  
  allJsFiles.forEach(jsFile => {
    const content = fs.readFileSync(jsFile, 'utf8');
    if (content.includes(`from './${dirName}'`) || 
        content.includes(`from "./${dirName}"`) || 
        content.includes(`from './${dirName}/'`) || 
        content.includes(`from "./${dirName}/"`)) {
      jsFiles.push(jsFile);
    }
  });
  
  return jsFiles;
}

// Function to find all JS files in a directory tree
function findAllJsFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findAllJsFiles(fullPath));
    } else if (item.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  
  return results;
}

// Check both src and public directories for potential issues
console.log("Checking for potential EISDIR errors in src/scripts...");
checkDirectoryForErrors(path.join(process.cwd(), 'src', 'scripts'));

console.log("\nChecking for potential EISDIR errors in public/scripts...");
checkDirectoryForErrors(path.join(process.cwd(), 'public', 'scripts'));

console.log("\nDone checking for potential EISDIR errors.");