import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Convert ES module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

// Path to the dist directory (where Astro builds to)
const distDir = path.join(__dirname, 'dist');

// Serve the built Astro site from the dist directory
app.use(express.static(distDir));

// For any routes not found in static files, return index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// Check if dist directory exists, if not suggest building the site
import fs from 'fs';
if (!fs.existsSync(distDir)) {
  console.log('⚠️ Dist directory not found!');
  console.log('To build your Astro site, run: npm run build');
  console.log('This server will serve the built version of your site.');
  
  // Create a basic response for when dist doesn't exist
  app.get('*', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>SynthedXYZ - Build Required</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              line-height: 1.6;
              color: #333;
            }
            .card {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .cmd {
              background-color: #f5f5f5;
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 10px 15px;
              font-family: monospace;
              margin: 10px 0;
            }
            h1 { color: #0066cc; }
            .info { color: #666; }
            button {
              background-color: #0066cc;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
            }
            button:hover {
              background-color: #0055aa;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⚠️ Build Required</h1>
            <p>The built version of your Astro site was not found. To preview your complete site with ngrok, you need to build it first.</p>
            
            <h2>How to build your site:</h2>
            <p>Run this command in your terminal:</p>
            <div class="cmd">npm run build</div>
            
            <p>Once the build is complete, restart this server:</p>
            <div class="cmd">node server.js</div>
            
            <p class="info">Note: Your Astro project will build to the 'dist' directory, which this server will then serve.</p>
          </div>
        </body>
      </html>
    `);
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Access the ngrok Web Interface at: http://127.0.0.1:4040`);
  
  if (fs.existsSync(distDir)) {
    console.log('✅ Serving built Astro site from the dist directory');
  } else {
    console.log('⚠️ Dist directory not found - build your site with: npm run build');
  }
});
