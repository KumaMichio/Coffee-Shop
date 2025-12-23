// backend/src/repositories/promotionRepository.js
const db = require('../db');

// Tạo promotion mới
async function createPromotion(promotionData) {
  const {
    cafe_id,
    title,
    description,
    discount_type,
    discount_value,
    start_date,
    end_date,
    is_active = true,
    target_radius = 5000,
    created_by
  } = promotionData;

  // Validate inputs
  if (!cafe_id || !title || !discount_type || !start_date || !end_date) {
    throw new Error('Missing required fields: cafe_id, title, discount_type, start_date, end_date');
  }

  if (new Date(end_date) <= new Date(start_date)) {
    throw new Error('end_date must be after start_date');
  }

  const validDiscountTypes = ['percentage', 'fixed_amount', 'free_item'];
  if (!validDiscountTypes.includes(discount_type)) {
    throw new Error('discount_type must be one of: percentage, fixed_amount, free_item');
  }

  const result = await db.query(
    `INSERT INTO promotions (
      cafe_id, title, description, discount_type, discount_value,
      start_date, end_date, is_active, target_radius, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      cafe_id,
      title,
      description || null,
      discount_type,
      discount_value || null,
      start_date,
      end_date,
      is_active,
      target_radius,
      created_by || null
    ]
  );

  return result.rows[0];
}

// Lấy promotions gần vị trí (trong bán kính)
async function getPromotionsNearby(lat, lng, radius = 5000) {
  // Sử dụng Haversine formula để tính khoảng cách
  // PostgreSQL: radians() = (degrees * PI / 180)
  const query = `
    SELECT 
      p.*,
      c.name as cafe_name,
      c.address as cafe_address,
      c.lat as cafe_lat,
      c.lng as cafe_lng,
      (
        6371000 * acos(
          LEAST(1.0, 
            cos(($1 * PI() / 180.0)) * cos((c.lat * PI() / 180.0)) *
            cos((c.lng * PI() / 180.0) - ($2 * PI() / 180.0)) +
            sin(($1 * PI() / 180.0)) * sin((c.lat * PI() / 180.0))
          )
        )
      ) as distance
    FROM promotions p
    JOIN cafes c ON p.cafe_id = c.id
    WHERE 
      p.is_active = TRUE
      AND NOW() BETWEEN p.start_date AND p.end_date
      AND (
        6371000 * acos(
          LEAST(1.0,
            cos(($1 * PI() / 180.0)) * cos((c.lat * PI() / 180.0)) *
            cos((c.lng * PI() / 180.0) - ($2 * PI() / 180.0)) +
            sin(($1 * PI() / 180.0)) * sin((c.lat * PI() / 180.0))
          )
        )
      ) <= LEAST(p.target_radius, $3)
    ORDER BY distance ASC, p.created_at DESC
  `;

  const result = await db.query(query, [lat, lng, radius]);
  return result.rows;
}

// Lấy promotions của một quán cụ thể
async function getPromotionsByCafe(cafeId, includeInactive = false) {
  let query = `
    SELECT 
      p.*,
      c.name as cafe_name,
      c.address as cafe_address,
      c.lat as cafe_lat,
      c.lng as cafe_lng
    FROM promotions p
    JOIN cafes c ON p.cafe_id = c.id
    WHERE p.cafe_id = $1
  `;

  const params = [cafeId];

  if (!includeInactive) {
    query += ` AND p.is_active = TRUE AND NOW() BETWEEN p.start_date AND p.end_date`;
  }

  query += ` ORDER BY p.start_date DESC, p.created_at DESC`;

  const result = await db.query(query, params);
  return result.rows;
}

// Lấy promotion theo ID
async function getPromotionById(promotionId) {
  const result = await db.query(
    `SELECT 
      p.*,
      c.name as cafe_name,
      c.address as cafe_address,
      c.lat as cafe_lat,
      c.lng as cafe_lng
    FROM promotions p
    JOIN cafes c ON p.cafe_id = c.id
    WHERE p.id = $1`,
    [promotionId]
  );

  return result.rows[0] || null;
}

// Cập nhật promotion
async function updatePromotion(promotionId, updateData) {
  const {
    title,
    description,
    discount_type,
    discount_value,
    start_date,
    end_date,
    is_active,
    target_radius
  } = updateData;

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(title);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(description);
  }
  if (discount_type !== undefined) {
    updates.push(`discount_type = $${paramCount++}`);
    values.push(discount_type);
  }
  if (discount_value !== undefined) {
    updates.push(`discount_value = $${paramCount++}`);
    values.push(discount_value);
  }
  if (start_date !== undefined) {
    updates.push(`start_date = $${paramCount++}`);
    values.push(start_date);
  }
  if (end_date !== undefined) {
    updates.push(`end_date = $${paramCount++}`);
    values.push(end_date);
  }
  if (is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(is_active);
  }
  if (target_radius !== undefined) {
    updates.push(`target_radius = $${paramCount++}`);
    values.push(target_radius);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  updates.push(`updated_at = NOW()`);
  values.push(promotionId);

  const result = await db.query(
    `UPDATE promotions 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

// Xóa promotion (soft delete bằng cách set is_active = false)
async function deletePromotion(promotionId) {
  const result = await db.query(
    `UPDATE promotions 
     SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [promotionId]
  );

  return result.rows[0] || null;
}

// Lấy tất cả promotions (cho admin)
async function getAllPromotions(limit = 50, offset = 0) {
  const result = await db.query(
    `SELECT 
      p.*,
      c.name as cafe_name,
      c.address as cafe_address,
      c.lat as cafe_lat,
      c.lng as cafe_lng
    FROM promotions p
    JOIN cafes c ON p.cafe_id = c.id
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM promotions`
  );

  return {
    promotions: result.rows,
    total: parseInt(countResult.rows[0].total)
  };
}

module.exports = {
  createPromotion,
  getPromotionsNearby,
  getPromotionsByCafe,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getAllPromotions
};

