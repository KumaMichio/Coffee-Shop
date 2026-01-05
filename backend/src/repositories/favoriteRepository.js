// backend/src/repositories/favoriteRepository.js
const pool = require('../db');

class FavoriteRepository {
  // Thêm quán vào yêu thích
  async addFavorite(userId, cafeId) {
    const result = await pool.query(
      `INSERT INTO favorites (user_id, cafe_id) 
       VALUES ($1, $2) 
       RETURNING id, user_id, cafe_id, created_at`,
      [userId, cafeId]
    );
    return result.rows[0];
  }

  // Xóa quán khỏi yêu thích
  async removeFavorite(userId, cafeId) {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND cafe_id = $2 RETURNING *',
      [userId, cafeId]
    );
    return result.rows[0];
  }

  // Kiểm tra đã yêu thích chưa
  async isFavorite(userId, cafeId) {
    const result = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND cafe_id = $2',
      [userId, cafeId]
    );
    return result.rows.length > 0;
  }

  // Lấy danh sách quán yêu thích của user
  async getFavoritesByUser(userId) {
    const result = await pool.query(
      `SELECT 
        c.id, c.provider, c.provider_place_id, c.name, 
        c.address, c.lat, c.lng, c.rating, c.user_rating_count,
        f.created_at as favorited_at
       FROM favorites f
       JOIN cafes c ON f.cafe_id = c.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  // Lưu thông tin quán (nếu chưa có) và thêm vào yêu thích
  async saveCafeAndAddFavorite(userId, cafeData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Kiểm tra quán đã tồn tại chưa
      let cafe = await client.query(
        'SELECT id FROM cafes WHERE provider = $1 AND provider_place_id = $2',
        [cafeData.provider, cafeData.provider_place_id]
      );

      let cafeId;
      if (cafe.rows.length > 0) {
        cafeId = cafe.rows[0].id;
      } else {
        // Tạo mới quán
        const newCafe = await client.query(
          `INSERT INTO cafes (provider, provider_place_id, name, address, lat, lng, rating, user_rating_count, price_level)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [
            cafeData.provider,
            cafeData.provider_place_id,
            cafeData.name,
            cafeData.address,
            cafeData.lat,
            cafeData.lng,
            cafeData.rating,
            cafeData.user_rating_count,
            cafeData.price_level || null
          ]
        );
        cafeId = newCafe.rows[0].id;
      }

      // Thêm vào favorites (nếu chưa có)
      const favorite = await client.query(
        `INSERT INTO favorites (user_id, cafe_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, cafe_id) DO NOTHING
         RETURNING id`,
        [userId, cafeId]
      );

      await client.query('COMMIT');
      return { cafeId, favoriteId: favorite.rows[0]?.id };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new FavoriteRepository();
