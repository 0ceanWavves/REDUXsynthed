
const fs = require('fs');
const path = require('path');

// Configuration
const projectRoot = 'E:\\projects\\synthedredux';
const logPath = 'E:\\projects\\synthedredux\\linter2-watch.log';
const ignorePatterns = ["node_modules/**",".git/**","dist/**","*.log","*.tmp"];

// Initialize watcher
console.log('Starting Linter2 file watcher...');
console.log('Project root:', projectRoot);
console.log('Logging to:', logPath);

// Function to check if a path should be ignored
function shouldIgnore(filePath) {
  return ignorePatterns.some(pattern => {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/\\\\]*');
      
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(filePath);
  });
}

// Function to log file access
function logFileAccess(filePath, operation) {
  // Skip ignored files
  if (shouldIgnore(filePath)) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp}|${filePath}|${operation}|${process.pid}|node-watcher\n`;
  
  fs.appendFileSync(logPath, logEntry);
}

// Set up file system watchers
const watchers = [];

// Watch the project directory recursively
function watchDirectory(dir) {
  try {
    // Watch this directory
    const watcher = fs.watch(dir, { recursive: false }, (eventType, filename) => {
      if (!filename) return;
      
      const fullPath = path.join(dir, filename);
      logFileAccess(fullPath, eventType);
      
      // If a new directory is created, watch it
      if (eventType === 'rename' && fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        watchDirectory(fullPath);
      }
    });
    
    watchers.push(watcher);
    
    // Watch subdirectories
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subdir = path.join(dir, entry.name);
        // Skip node_modules and other common directories that should be ignored
        if (!shouldIgnore(subdir)) {
          watchDirectory(subdir);
        }
      }
    }
  } catch (error) {
    console.error(`Error watching directory ${dir}:`, error);
  }
}

// Start watching
watchDirectory(projectRoot);

console.log(`Watching ${watchers.length} directories for changes...`);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Closing file watchers...');
  watchers.forEach(watcher => watcher.close());
  process.exit(0);
});

// Keep process running
setInterval(() => {}, 1000);
    