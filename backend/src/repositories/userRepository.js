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
      'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = $1',
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

  // Cập nhật thông tin user
  async update(id, updates) {
    const { username, email, avatar_url } = updates;
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (username !== undefined) {
      fields.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }

    if (email !== undefined) {
      fields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramCount}`);
      values.push(avatar_url);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users 
       SET ${fields.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, username, email, avatar_url, created_at, updated_at`,
      values
    );

    return result.rows[0];
  }

  // Cập nhật password
  async updatePassword(id, passwordHash) {
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1, updated_at = NOW() 
       WHERE id = $2
       RETURNING id, username, email, created_at`,
      [passwordHash, id]
    );
    return result.rows[0];
  }
}

module.exports = new UserRepository();
