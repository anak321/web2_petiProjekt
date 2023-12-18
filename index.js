const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();

// Serve static files from the "main" folder
app.use(express.static(path.join(__dirname, 'main')));

// Serve index.html from the "main" folder for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'main', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
