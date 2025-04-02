
// Script to restore original layout files after coverage testing
const fs = require('fs');
const path = require('path');

const layoutFiles = [
    'src/layouts/MainLayout.astro',
    'src/components/AmorphousPrism.astro'
];

layoutFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    const backupPath = `${fullPath}.bak`;
    
    if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, fullPath);
        console.log(`Restored ${filePath} from backup`);
    } else {
        console.warn(`No backup found for ${filePath}`);
    }
});

console.log('All files restored to original state');
