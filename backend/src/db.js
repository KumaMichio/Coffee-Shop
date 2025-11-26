require('dotenv').config();
const { Pool } = require('pg');

// Lấy chuỗi kết nối từ file .env
const pool = new Pool({
  connectionString: process.env.DB_URI,
});

// Kiểm tra kết nối
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to PostgreSQL', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

module.exports = pool;
