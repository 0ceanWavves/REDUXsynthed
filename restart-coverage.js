// Script to restart the coverage process with CORS fixes
import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Restarting Coverage Process with CORS Fixes ===');

// Function to run a command and wait for it to complete
function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        console.log(`> ${command} ${args.join(' ')}`);
        
        const isWindows = process.platform === 'win32';
        const childProcess = spawn(command, args, {
            stdio: 'inherit',
            shell: isWindows
        });
        
        childProcess.on('close', code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
    });
}

// Function to check if a process is running on a specific port
function isProcessRunningOnPort(port) {
    return new Promise((resolve) => {
        const command = process.platform === 'win32' 
            ? `netstat -ano | findstr :${port}` 
            : `lsof -i:${port}`;
        
        exec(command, (error, stdout) => {
            resolve(!error && stdout.length > 0);
        });
    });
}

// Function to kill process on a specific port
async function killProcessOnPort(port) {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
        // Windows approach
        const findPidCommand = `netstat -ano | findstr :${port}`;
        exec(findPidCommand, (error, stdout) => {
            if (!error && stdout) {
                // Extract PID from the output
                const lines = stdout.split('\n');
                for (const line of lines) {
                    const match = line.match(/(\d+)$/);
                    if (match && match[1]) {
                        const pid = match[1].trim();
                        console.log(`Killing process with PID ${pid} on port ${port}`);
                        exec(`taskkill /F /PID ${pid}`, (err) => {
                            if (err) {
                                console.error(`Failed to kill process: ${err.message}`);
                            } else {
                                console.log(`Process on port ${port} killed successfully`);
                            }
                        });
                        break;
                    }
                }
            }
        });
    } else {
        // Unix approach
        const findPidCommand = `lsof -i:${port} -t`;
        exec(findPidCommand, (error, stdout) => {
            if (!error && stdout) {
                const pid = stdout.trim();
                console.log(`Killing process with PID ${pid} on port ${port}`);
                exec(`kill -9 ${pid}`, (err) => {
                    if (err) {
                        console.error(`Failed to kill process: ${err.message}`);
                    } else {
                        console.log(`Process on port ${port} killed successfully`);
                    }
                });
            }
        });
    }
    
    // Give it a moment to shut down
    await new Promise(resolve => setTimeout(resolve, 2000));
}

// Main function to restart the coverage process
async function restartCoverage() {
    try {
        // Step 1: Check if coverage server is running
        const isServerRunning = await isProcessRunningOnPort(3001);
        if (isServerRunning) {
            console.log('Coverage server is running, shutting it down...');
            await killProcessOnPort(3001);
        }
        
        // Step 2: Restore the original layout files
        console.log('\nRestoring original layout files...');
        const restoreScript = path.join(__dirname, 'restore-layouts.cjs');
        if (fs.existsSync(restoreScript)) {
            await runCommand('node', [restoreScript]);
        } else {
            // Manual restore
            console.log('Restore script not found, attempting manual restore...');
            const layoutFiles = [
                'src/layouts/MainLayout.astro',
                'src/components/AmorphousPrism.astro'
            ];
            
            for (const filePath of layoutFiles) {
                const fullPath = path.join(__dirname, filePath);
                const backupPath = `${fullPath}.bak`;
                
                if (fs.existsSync(backupPath)) {
                    fs.copyFileSync(backupPath, fullPath);
                    console.log(`Restored ${filePath} from backup`);
                } else {
                    console.warn(`No backup found for ${filePath}`);
                }
            }
        }
        
        // Step 3: Re-apply the instrumentation with the correct port
        console.log('\nUpdating layout files with the correct port...');
        await runCommand('node', ['update-for-coverage.js']);
        
        // Step 4: Start the coverage server
        console.log('\nStarting coverage server with CORS support...');
        const coverageServer = spawn('node', ['coverage-setup.js'], {
            detached: true,
            stdio: 'inherit',
            shell: process.platform === 'win32'
        });
        
        coverageServer.unref();
        
        console.log('\n=== Coverage Process Restarted ===');
        console.log('Now you need to:');
        console.log('1. Refresh your browser with http://localhost:4322/?coverage=true');
        console.log('2. Interact with the site to generate coverage data');
        console.log('3. View the coverage report at http://localhost:3001/coverage/report');
    } catch (error) {
        console.error(`Error restarting coverage: ${error.message}`);
    }
}

// Run the restart process
restartCoverage(); 