const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'land.html' : req.url);

    // Get the file extension
    const extname = path.extname(filePath);

    // Set default content type based on file extension
    let contentType = 'text/html';
    if (extname === '.css') {
        contentType = 'text/css';
    } else if (extname === '.js') {
        contentType = 'application/javascript';
    } else if (extname === '.png') {
        contentType = 'image/png';
    } else if (extname === '.jpg') {
        contentType = 'image/jpg';
    } else if (extname === '.gif') {
        contentType = 'image/gif';
    }

    // Read the file from the system and send it
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>Page Not Found</h1>');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

// Set the server to listen on port 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
