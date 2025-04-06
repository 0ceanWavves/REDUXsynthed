import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ES module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Path to the public directory
const publicDir = path.join(__dirname, 'public');

// Serve static files from the public directory
app.use(express.static(publicDir));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Serving files from: ${publicDir}`);
});