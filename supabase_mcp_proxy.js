const { spawn } = require('child_process');
const http = require('http');
const httpProxy = require('http-proxy');

// Start the actual Python MCP server (in the background)
console.log('Starting Supabase MCP Server...');

const pythonProcess = spawn('cmd', ['/c', 'cd C:\\MCP\\supabase-mcp-server && python -m supabase_mcp.main']);

// Wait for the server to start
setTimeout(() => {
  // Create a proxy server
  const proxy = httpProxy.createProxyServer({
    target: 'http://localhost:3030',
    ws: true // Enable WebSocket proxying
  });

  // Create an HTTP server to receive requests
  const server = http.createServer((req, res) => {
    // Proxy the request
    proxy.web(req, res, {}, (err) => {
      if (err) {
        console.error('Proxy error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Proxy error');
      }
    });
  });

  // Listen on WebSocket upgrade events
  server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
  });

  // Start listening on port 3031 (different from the Python server)
  server.listen(3031, () => {
    console.log('Proxy server running at http://localhost:3031');
    console.log('DO NOT CLOSE THIS WINDOW while using MCP in Cursor');
  });
}, 5000); // Give the Python server 5 seconds to start

// Handle process events
pythonProcess.on('error', (err) => {
  console.error('Failed to start Supabase MCP server:', err);
});

pythonProcess.stdout.on('data', (data) => {
  console.log(`MCP server output: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`MCP server error: ${data}`);
}); 