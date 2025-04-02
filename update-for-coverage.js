// Script to update layout files to use instrumented scripts for coverage testing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to layout files
const layoutFiles = [
    'src/layouts/MainLayout.astro',
    'src/components/AmorphousPrism.astro'
];

// Function to backup a file
function backupFile(filePath) {
    const backupPath = `${filePath}.bak`;
    if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filePath, backupPath);
        console.log(`Backup created: ${backupPath}`);
    }
}

// Function to modify MainLayout.astro
function updateMainLayout(filePath) {
    backupFile(filePath);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add coverage client as the first script
    if (!content.includes('coverage-client.js')) {
        content = content.replace(
            '<head>',
            '<head>\n    <!-- Coverage tracking script -->\n    <script is:inline src="/js/coverage-client.js"></script>'
        );
    }
    
    // Replace script paths with instrumented versions
    content = content.replace(
        /<script is:inline src="\/js\/([^"]+)"><\/script>/g,
        '<script is:inline src="http://localhost:3001/instrumented/public/js/$1"></script>'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath} for coverage tracking`);
}

// Function to modify AmorphousPrism.astro
function updateAmorphousPrism(filePath) {
    backupFile(filePath);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace script paths with instrumented versions
    content = content.replace(
        /<script src="\/js\/([^"]+)" is:inline><\/script>/g,
        '<script src="http://localhost:3001/instrumented/public/js/$1" is:inline></script>'
    );
    
    // Replace the main initialization script
    content = content.replace(
        /<script src="\/src\/scripts\/amorphous-prism-init.js"><\/script>/,
        '<script src="http://localhost:3001/instrumented/src/scripts/amorphous-prism-init.js"></script>'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath} for coverage tracking`);
}

// Update coverage client script to use correct port
function updateCoverageClient() {
    const clientPath = path.join(__dirname, 'public/js/coverage-client.js');
    
    if (fs.existsSync(clientPath)) {
        let content = fs.readFileSync(clientPath, 'utf8');
        
        // Ensure we're using the correct dev server port
        content = content.replace(
            'http://localhost:3000/?coverage=true',
            'http://localhost:4322/?coverage=true'
        );
        
        // Make sure XHR requests have the correct content type and CORS headers
        content = content.replace(
            /fetch\('http:\/\/localhost:3001\/coverage\/client'/,
            `fetch('http://localhost:3001/coverage/client', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': 'http://localhost:4322'
                    },`
        );
        
        fs.writeFileSync(clientPath, content);
        console.log(`Updated coverage client to use correct port`);
    } else {
        console.warn(`Coverage client file not found at ${clientPath}`);
    }
}

// Process each layout file
layoutFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
        if (filePath.endsWith('MainLayout.astro')) {
            updateMainLayout(fullPath);
        } else if (filePath.endsWith('AmorphousPrism.astro')) {
            updateAmorphousPrism(fullPath);
        }
    } else {
        console.error(`File not found: ${fullPath}`);
    }
});

// Update coverage client
updateCoverageClient();

// Create a script to restore original files - use CommonJS syntax for this file
// since we'll run it separately
const restoreScript = `
// Script to restore original layout files after coverage testing
const fs = require('fs');
const path = require('path');

const layoutFiles = [
    'src/layouts/MainLayout.astro',
    'src/components/AmorphousPrism.astro'
];

layoutFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    const backupPath = \`\${fullPath}.bak\`;
    
    if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, fullPath);
        console.log(\`Restored \${filePath} from backup\`);
    } else {
        console.warn(\`No backup found for \${filePath}\`);
    }
});

console.log('All files restored to original state');
`;

fs.writeFileSync(path.join(__dirname, 'restore-layouts.cjs'), restoreScript);
console.log('Created restore script: restore-layouts.cjs');

console.log('\nSetup complete! To run coverage analysis:');
console.log('1. Start the coverage server: node coverage-setup.js');
console.log('2. Start your development server: npm run dev');
console.log('3. Visit your site with ?coverage=true in the URL');
console.log('4. Interact with your site to generate coverage data');
console.log('5. View coverage report at http://localhost:3001/coverage/report');
console.log('6. Restore original files when done: node restore-layouts.cjs'); 