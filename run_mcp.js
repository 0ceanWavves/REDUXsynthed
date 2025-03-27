const { spawn } = require('child_process');

console.log('Starting Supabase MCP Server...');

// Using Python directly from Windows
const pythonProcess = spawn('python', ['-m', 'supabase_mcp.main'], {
  cwd: 'C:\\MCP\\supabase-mcp-server',
  stdio: 'inherit', // Show all output
  shell: true
});

// Handle process events
pythonProcess.on('error', (err) => {
  console.error('Failed to start Supabase MCP server:', err);
});

process.on('exit', () => {
  console.log('Exiting...');
  if (!pythonProcess.killed) {
    pythonProcess.kill();
  }
});

// Keep the Node.js process running while the Python server runs
console.log('Running MCP server...');
console.log('DO NOT CLOSE THIS WINDOW while using MCP in Cursor'); 