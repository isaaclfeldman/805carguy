// 805 Car Guy — tiny static server for Railway
// Just serves index.html. No APIs, no database, no nothing.
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname, { extensions: ['html'] }));

// Fallback: send index.html for anything that didn't match a file.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`805 Car Guy running → http://localhost:${PORT}`);
});
