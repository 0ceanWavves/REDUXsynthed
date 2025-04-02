// Script to run the entire cleanup process in sequence
import { spawn } from 'child_process';
import readline from 'readline';
import { createServer } from 'net';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to run a command and wait for it to complete
function runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`\n> ${command} ${args.join(' ')}`);
        
        // Use npx for npm commands if on Windows
        const isWindows = process.platform === 'win32';
        const finalCommand = (isWindows && command === 'npm') ? 'npx' : command;
        
        // If using npx, adjust the arguments
        const finalArgs = (isWindows && command === 'npm') 
            ? ['--yes', 'npm', ...args] 
            : args;
        
        const childProcess = spawn(finalCommand, finalArgs, {
            ...options,
            stdio: 'inherit',
            shell: isWindows // Use shell on Windows
        });
        
        childProcess.on('close', code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
        
        childProcess.on('error', err => {
            console.error(`Command execution error: ${err.message}`);
            reject(err);
        });
    });
}

// Function to ask a yes/no question
function askYesNo(question) {
    return new Promise(resolve => {
        rl.question(`${question} (y/n) `, answer => {
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}

// Function to check if a port is in use
function isPortInUse(port) {
    return new Promise((resolve) => {
        const server = createServer();
        
        server.once('error', err => {
            if (err.code === 'EADDRINUSE') {
                resolve(true);
            } else {
                resolve(false);
            }
        });
        
        server.once('listening', () => {
            server.close();
            resolve(false);
        });
        
        server.listen(port);
    });
}

// Function to manually restore files if restore script doesn't exist yet
async function manualRestore() {
    console.log('Attempting manual restore of layout files...');
    
    const layoutFiles = [
        'src/layouts/MainLayout.astro',
        'src/components/AmorphousPrism.astro'
    ];
    
    for (const filePath of layoutFiles) {
        const fullPath = join(__dirname, filePath);
        const backupPath = `${fullPath}.bak`;
        
        if (fs.existsSync(backupPath)) {
            try {
                fs.copyFileSync(backupPath, fullPath);
                console.log(`Restored ${filePath} from backup`);
            } catch (err) {
                console.error(`Failed to restore ${filePath}: ${err.message}`);
            }
        } else {
            console.warn(`No backup found for ${filePath}`);
        }
    }
}

// Main process function
async function runCleanupProcess() {
    let coverageServer = null;
    
    try {
        console.log('=== Synthed Codebase Cleanup Process ===');
        console.log('This script will help identify which files are actually used in your project');
        console.log('and create a clean project with only the necessary files.');
        
        // Install dependencies if needed
        console.log('\nStep 1: Installing required dependencies...');
        try {
            await runCommand('npm', ['install', '--save-dev', 'istanbul', 'express']);
        } catch (installError) {
            console.error(`Error installing dependencies: ${installError.message}`);
            console.log('Trying to continue anyway...');
        }
        
        // Check if port 3001 is already in use
        const portInUse = await isPortInUse(3001);
        if (portInUse) {
            console.error('\nError: Port 3001 is already in use. Please free up this port and try again.');
            process.exit(1);
        }
        
        // Update layout files
        console.log('\nStep 2: Updating layout files for coverage tracking...');
        try {
            await runCommand('node', ['update-for-coverage.js']);
        } catch (updateError) {
            console.error(`Error updating layout files: ${updateError.message}`);
            console.log('Please check if the update-for-coverage.js file exists and is valid.');
            await manualRestore();
            process.exit(1);
        }
        
        // Start coverage server in background
        console.log('\nStep 3: Starting coverage server...');
        try {
            coverageServer = spawn('node', ['coverage-setup.js'], {
                detached: true,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: process.platform === 'win32' // Use shell on Windows
            });
            
            // Print output from the server
            coverageServer.stdout.on('data', data => {
                process.stdout.write(data);
            });
            
            coverageServer.stderr.on('data', data => {
                process.stderr.write(data);
            });
            
            // Give the server time to start
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (serverError) {
            console.error(`Error starting coverage server: ${serverError.message}`);
            console.log('Please check if the coverage-setup.js file exists and is valid.');
            await manualRestore();
            process.exit(1);
        }
        
        // Ask user to start the dev server
        console.log('\nStep 4: Please start your development server in a new terminal:');
        console.log('  npm run dev');
        
        const devServerStarted = await askYesNo('\nHave you started the development server?');
        if (!devServerStarted) {
            console.log('Please start the development server before continuing.');
            if (coverageServer) {
                process.kill(-coverageServer.pid, 'SIGINT');
            }
            await manualRestore();
            process.exit(1);
        }
        
        // Instructions for manual testing
        console.log('\nStep 5: Open your browser and visit your site with ?coverage=true');
        console.log('  Example: http://localhost:3000/?coverage=true');
        console.log('\nPlease interact with your site to trigger all functionality:');
        console.log('- Visit all pages');
        console.log('- Interact with the 3D visualization');
        console.log('- Trigger any animations');
        console.log('- Test different device sizes');
        
        const testingComplete = await askYesNo('\nHave you completed testing the site?');
        if (!testingComplete) {
            console.log('Please complete testing before continuing.');
            if (coverageServer) {
                process.kill(-coverageServer.pid, 'SIGINT');
            }
            await manualRestore();
            process.exit(1);
        }
        
        // Generate coverage report
        console.log('\nStep 6: Generating coverage report...');
        console.log('Visit http://localhost:3001/coverage/report to see the report');
        
        const reportReviewed = await askYesNo('\nHave you reviewed the coverage report?');
        
        // Extract clean project
        console.log('\nStep 7: Extracting clean project...');
        try {
            await runCommand('node', ['extract-clean-codebase.js']);
        } catch (extractError) {
            console.error(`Error extracting clean project: ${extractError.message}`);
            console.log('Please check if the extract-clean-codebase.js file exists and is valid.');
        }
        
        // Restore original files
        console.log('\nStep 8: Restoring original layout files...');
        
        // Check if restore script exists, otherwise do manual restore
        if (fs.existsSync(join(__dirname, 'restore-layouts.cjs'))) {
            try {
                await runCommand('node', ['restore-layouts.cjs']);
            } catch (restoreError) {
                console.error(`Error running restore script: ${restoreError.message}`);
                await manualRestore();
            }
        } else {
            console.log('Restore script not found, performing manual restore...');
            await manualRestore();
        }
        
        // Kill the coverage server
        console.log('\nStep 9: Shutting down coverage server...');
        if (coverageServer) {
            try {
                process.kill(-coverageServer.pid, 'SIGINT');
            } catch (killError) {
                console.error(`Error shutting down coverage server: ${killError.message}`);
                console.log('You may need to manually terminate the Node.js process.');
            }
        }
        
        console.log('\n=== Cleanup Process Complete ===');
        console.log('The clean project has been created in the "clean-project" directory.');
        console.log('\nTo test the clean project:');
        console.log('  cd clean-project');
        console.log('  npm install');
        console.log('  npm run dev');
        
        rl.close();
    } catch (error) {
        console.error(`\nError: ${error.message}`);
        
        // Clean up resources
        if (coverageServer) {
            try {
                process.kill(-coverageServer.pid, 'SIGINT');
            } catch (killError) {
                // Ignore any errors when trying to kill the server
            }
        }
        
        // Attempt to restore original files
        if (fs.existsSync(join(__dirname, 'restore-layouts.cjs'))) {
            try {
                await runCommand('node', ['restore-layouts.cjs']);
            } catch (restoreError) {
                console.error(`\nFailed to restore original files using script: ${restoreError.message}`);
                await manualRestore();
            }
        } else {
            console.log('Restore script not found, performing manual restore...');
            await manualRestore();
        }
        
        process.exit(1);
    }
}

// Run the process
runCleanupProcess(); 