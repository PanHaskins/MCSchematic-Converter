const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Statické soubory z složky public
app.use(express.static(path.join(__dirname, 'public')));

// Hlavní route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Spuštění serveru
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});