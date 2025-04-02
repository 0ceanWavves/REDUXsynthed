// Coverage setup for Synthed code coverage analysis
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'istanbul';
const { Instrumenter, Collector, Reporter } = pkg;
import express from 'express';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a instrumentation instance
const instrumenter = new Instrumenter({
    embedSource: true,
    preserveComments: true
});

// Files to instrument
const filesToInstrument = [
    'public/js/amorphous-prism-init.js',
    'public/js/lockdown-fix.js',
    'public/js/emergency-shader-fix.js',
    'public/js/module-loader.js',
    'public/js/fix-hero-layout.js',
    'public/js/shader-extension-fix.js',
    'public/js/optimize-will-change.js',
    'src/scripts/amorphous-prism-init.js'
];

// Directory where to store the instrumented files
const instrumentedDir = path.join(__dirname, 'instrumented');

// Create the instrumented directory if it doesn't exist
if (!fs.existsSync(instrumentedDir)) {
    fs.mkdirSync(instrumentedDir, { recursive: true });
}

// Instrument each file
filesToInstrument.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        const code = fs.readFileSync(fullPath, 'utf8');
        const instrumentedCode = instrumenter.instrumentSync(code, fullPath);
        
        // Create directory structure in instrumented folder
        const relativePath = path.dirname(file);
        const targetDir = path.join(instrumentedDir, relativePath);
        
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Write instrumented file
        const targetFile = path.join(instrumentedDir, file);
        fs.writeFileSync(targetFile, instrumentedCode);
        
        console.log(`Instrumented: ${file}`);
    } else {
        console.error(`File not found: ${fullPath}`);
    }
});

// Create a simple server to collect coverage data
const app = express();

// Add CORS middleware to allow cross-origin requests
app.use((req, res, next) => {
    // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Allow the necessary methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    // Allow the necessary headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Serve static files with CORS headers
app.use('/instrumented', express.static(instrumentedDir, {
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        // For JavaScript files, set the correct content type
        res.setHeader('Content-Type', 'application/javascript');
    }
}));

// Coverage data storage
const coverageData = {};

// Endpoint to collect coverage data
app.post('/coverage/client', express.json(), (req, res) => {
    const clientCoverage = req.body;
    Object.keys(clientCoverage).forEach(filename => {
        coverageData[filename] = clientCoverage[filename];
    });
    res.sendStatus(200);
});

// Endpoint to get coverage report
app.get('/coverage/report', (req, res) => {
    const collector = new Collector();
    collector.add(coverageData);
    
    const reporter = new Reporter();
    reporter.addAll(['text', 'html']);
    
    const reportDir = path.join(__dirname, 'coverage');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    reporter.dir = reportDir;
    reporter.writeReport(collector, true);
    
    res.json({
        coverageData,
        reportUrl: '/coverage/index.html'
    });
});

// Serve coverage reports
app.use('/coverage', express.static(path.join(__dirname, 'coverage')));

// Start server
const port = 3001;
app.listen(port, () => {
    console.log(`Coverage server running at http://localhost:${port}`);
    console.log(`Access instrumented files at http://localhost:${port}/instrumented/`);
    console.log(`Get coverage report at http://localhost:${port}/coverage/report`);
}); 