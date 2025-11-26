// src/server.js
const app = require('./app');
const port = 5001;
require('dotenv').config();  // Tải biến môi trường từ file .env

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
