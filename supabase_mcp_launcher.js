const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Supabase MCP Server...');

// Keep output visible for debugging
const pythonProcess = spawn('cmd', ['/c', 'cd C:\\MCP\\supabase-mcp-server && python -m supabase_mcp.main'], {
  detached: false, // Keep attached so process doesn't end
  stdio: 'inherit', // Show output for debugging
  windowsHide: false
});

// Handle process events
pythonProcess.on('error', (err) => {
  console.error('Failed to start Supabase MCP server:', err);
});

pythonProcess.on('exit', (code) => {
  console.log(`Supabase MCP server exited with code ${code}`);
});

console.log('Server running at http://localhost:3030');
console.log('DO NOT CLOSE THIS WINDOW while using MCP in Cursor'); 