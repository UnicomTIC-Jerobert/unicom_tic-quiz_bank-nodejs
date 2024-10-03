const http = require('http');
const fs = require('fs').promises;
const path = require('path');


// Use environment port provided by Heroku or default to 3000
const port = process.env.PORT || 3000;


// Function to serve static files using async/await
const serveStaticFile = async (res, filePath, contentType) => {
    try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
};


// Create HTTP server with async/await handling
const server = http.createServer(async (req, res) => {
    try {
        if (req.url === '/') {
            await serveStaticFile(res, './public/index.html', 'text/html');
        } else if (req.url === '/script.js') {
            await serveStaticFile(res, './public/script.js', 'application/javascript');
        } else if (req.url === '/style.css') {
            await serveStaticFile(res, './public/style.css', 'text/css');
        } else if (req.url === '/questions') {
            // Async read questions.json and send response
            try {
                const data = await fs.readFile('./data/questions.json');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading questions.');
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});


// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
