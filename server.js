const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

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
        const parsedUrl = url.parse(req.url, true); // Parse URL and query params
        const pathname = parsedUrl.pathname;
        const query = parsedUrl.query;

        if (pathname === '/') {
            await serveStaticFile(res, path.join(__dirname, 'public', 'index.html'), 'text/html');
        } else if (pathname === '/script.js') {
            await serveStaticFile(res, path.join(__dirname, 'public', 'script.js'), 'application/javascript');
        } else if (pathname === '/style.css') {
            await serveStaticFile(res, path.join(__dirname, 'public', 'style.css'), 'text/css');
        } else if (pathname === '/questions') {
            // Check if 'category' query parameter is provided
            try {
                const data = await fs.readFile('./data/questions.json');
                const questions = JSON.parse(data);
                // If category is present, filter the questions by category
                if (query.category) {
                    // If query parameter category is present, return the questions in that category
                    const category = query.category;
                    const filteredQuestions = category && questions[category]
                        ? questions[category]  // Return questions in the requested category
                        : [];  // Return empty array if category not found or not provided

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(filteredQuestions));
                } else {
                    // If no query parameter, return all questions
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                }
            } catch (err) {
                console.log(err)
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading questions.');
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    } catch (error) {
        console.log(error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
