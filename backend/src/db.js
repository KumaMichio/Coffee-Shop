const { Pool } = require('pg');
const config = require('./config');

// Tạo pool connection với config
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

// Kiểm tra kết nối
pool.connect((err, client, release) => {
  if (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error connecting to PostgreSQL', err.stack);
    }
  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Connected to PostgreSQL');
    }
    // trả client về pool
    release();
  }
});

module.exports = pool;
