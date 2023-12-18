const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve index.html from the root directory for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
