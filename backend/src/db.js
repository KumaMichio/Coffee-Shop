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
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to PostgreSQL', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
    done();
  }
});

module.exports = pool;
