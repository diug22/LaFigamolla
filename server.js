/**
 * Simple HTTP server for La Figamolla
 * This server serves the files in the current directory
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json'
};

// Port to listen on
const port = 3000;

// Create the server
const server = http.createServer((request, response) => {
    console.log(`Request: ${request.url}`);
    
    // Get the file path
    let filePath = '.' + request.url;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Get the file extension
    const extname = path.extname(filePath);
    let contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                fs.readFile('./index.html', (error, content) => {
                    if (error) {
                        // Can't even serve index.html
                        response.writeHead(500);
                        response.end('Error loading index.html');
                    } else {
                        // Serve index.html instead
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.end(content, 'utf-8');
                    }
                });
            } else {
                // Server error
                response.writeHead(500);
                response.end(`Server Error: ${error.code}`);
            }
        } else {
            // Success
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`Press Ctrl+C to stop the server`);
