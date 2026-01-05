// backend/src/repositories/reviewRepository.js
const db = require('../db');

// Tạo hoặc cập nhật đánh giá
async function createOrUpdateReview(cafeId, reviewData) {
  const { userId, rating, comment, is_public, is_child_friendly } = reviewData;

  // Validate inputs
  if (!userId || !cafeId || isNaN(cafeId) || isNaN(userId)) {
    throw new Error('Invalid userId or cafeId');
  }

  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5');
  }

  const result = await db.query(
    `INSERT INTO reviews (user_id, cafe_id, rating, comment, is_public, is_child_friendly)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, cafe_id)
     DO UPDATE SET
       rating = EXCLUDED.rating,
       comment = EXCLUDED.comment,
       is_public = EXCLUDED.is_public,
       is_child_friendly = EXCLUDED.is_child_friendly,
       updated_at = NOW()
     RETURNING *`,
    [
      parseInt(userId), 
      parseInt(cafeId), 
      parseInt(rating), 
      comment || null, 
      is_public !== false, 
      is_child_friendly || false
    ]
  );

  return result.rows[0];
}

// Lấy đánh giá của user cho một quán
async function getReviewByUserAndCafe(userId, cafeId) {
  const result = await db.query(
    `SELECT r.*, u.username, u.email
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.user_id = $1 AND r.cafe_id = $2`,
    [userId, cafeId]
  );

  return result.rows[0] || null;
}

// Lấy tất cả đánh giá của một quán (public only hoặc của user hiện tại)
async function getReviewsByCafe(cafeId, userId = null) {
  let query = `
    SELECT r.*, u.username
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.cafe_id = $1
  `;
  const params = [cafeId];

  if (userId) {
    // Nếu có userId, hiển thị cả public và private của user đó
    query += ` AND (r.is_public = TRUE OR r.user_id = $2)`;
    params.push(userId);
  } else {
    // Chỉ hiển thị public reviews
    query += ` AND r.is_public = TRUE`;
  }

  query += ` ORDER BY r.created_at DESC`;

  const result = await db.query(query, params);
  return result.rows;
}

// Tính rating trung bình của một quán
async function getAverageRating(cafeId) {
  const result = await db.query(
    `SELECT 
       AVG(rating) as avg_rating,
       COUNT(*) as review_count
     FROM reviews
     WHERE cafe_id = $1 AND is_public = TRUE`,
    [cafeId]
  );

  return {
    avg_rating: result.rows[0]?.avg_rating ? parseFloat(result.rows[0].avg_rating) : null,
    review_count: parseInt(result.rows[0]?.review_count || 0)
  };
}

// Xóa đánh giá
async function deleteReview(userId, cafeId) {
  const result = await db.query(
    `DELETE FROM reviews
     WHERE user_id = $1 AND cafe_id = $2
     RETURNING *`,
    [userId, cafeId]
  );

  return result.rows[0] || null;
}

// Lấy tất cả reviews của một user
async function getReviewsByUser(userId, limit = 20, offset = 0) {
  const result = await db.query(
    `SELECT r.*, c.name as cafe_name, c.address as cafe_address, c.lat, c.lng
     FROM reviews r
     JOIN cafes c ON r.cafe_id = c.id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM reviews WHERE user_id = $1`,
    [userId]
  );

  return {
    reviews: result.rows,
    total: parseInt(countResult.rows[0].total)
  };
}

module.exports = {
  createOrUpdateReview,
  getReviewByUserAndCafe,
  getReviewsByCafe,
  getAverageRating,
  deleteReview,
  getReviewsByUser
};

