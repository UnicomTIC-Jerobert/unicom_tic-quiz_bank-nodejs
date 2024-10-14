const http = require('http');
const fs = require('fs').promises;
const fsSync = require('fs'); // For synchronous file operations
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

                const category = query.category;
                const index = parseInt(query.index, 10);

                // If category is present, filter the questions by category
                if (category) {
                    // If query parameter category is present, return the questions in that category
                    if (category && questions[category] && questions[category][index]) {
                        const question = questions[category][index];
                        question["total"] = questions[category].length;
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(question));
                    } else {
                        const filteredQuestions = category && questions[category]
                            ? questions[category]  // Return questions in the requested category
                            : [];  // Return empty array if category not found or not provided

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(filteredQuestions));
                    }
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
        }
        else if (pathname === '/attempts') {
            try {
                const data = await fs.readFile('./data/attempts.json'); // Assuming attempt data is stored in 'attempts.json'
                const attempts = JSON.parse(data);

                const category = query.category;  // Get category from query string

                // Filter attempts by category
                if (category) {
                    const filteredAttempts = attempts.filter(attempt => attempt.category === category);
                    if (filteredAttempts.length > 0) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(filteredAttempts));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify([])); // Return empty array if no attempts found for the category
                    }
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Category not provided' }));
                }
            } catch (err) {
                console.log(err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading attempts.');
            }
        }


        else if (req.method === 'POST' && pathname === '/save-attempt') {
            // Handle saving attempt data
            let body = '';

            // Collect the data from the request
            req.on('data', chunk => {
                body += chunk.toString();
            });

            // When all data is received
            req.on('end', async () => {
                try {
                    const attemptData = JSON.parse(body);

                    // Read the existing attempts from the file
                    const filePath = path.join(__dirname, 'data', 'attempts.json');
                    let attempts = [];

                    if (fsSync.existsSync(filePath)) {
                        const existingData = await fs.readFile(filePath, 'utf8');
                        attempts = existingData ? JSON.parse(existingData) : [];
                    }

                    // Add the new attempt
                    attempts.push(attemptData);

                    // Save back to the file
                    await fs.writeFile(filePath, JSON.stringify(attempts, null, 2));

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Attempt data saved successfully.' }));
                } catch (err) {
                    console.error(err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error saving attempt data.');
                }
            });
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
