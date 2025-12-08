// backend/src/repositories/userRepository.js
const pool = require('../db');

class UserRepository {
  // Tìm user theo email
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // Tìm user theo username
  async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }

  // Tìm user theo ID
  async findById(id) {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Tạo user mới
  async create(username, email, passwordHash) {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash]
    );
    return result.rows[0];
  }

  // Kiểm tra email hoặc username đã tồn tại
  async checkExists(email, username) {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    return result.rows.length > 0;
  }
}

module.exports = new UserRepository();
