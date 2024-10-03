// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to handle CORS
app.use(cors());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to serve the items.json
app.get('/data/items.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'items.json'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
