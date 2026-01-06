// backend/src/api/review.js
const express = require('express');
const reviewRepository = require('../repositories/reviewRepository');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// POST /api/reviews - Tạo hoặc cập nhật đánh giá
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cafe_id, cafe_data, rating, comment, is_public, is_child_friendly, images } = req.body;

    // Validate input
    if (!cafe_id || rating === undefined || rating === null) {
      return res.status(400).json({
        error: 'cafe_id và rating là bắt buộc'
      });
    }

    // Validate và convert rating thành integer
    const ratingInt = parseInt(rating);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return res.status(400).json({
        error: 'Rating phải là số nguyên từ 1 đến 5'
      });
    }

    // Validate images array
    if (images && !Array.isArray(images)) {
      return res.status(400).json({
        error: 'Images phải là một mảng'
      });
    }

    // Nếu cafe_id là string (provider_place_id), cần tìm hoặc tạo cafe trong DB
    let actualCafeId = parseInt(cafe_id);
    if (isNaN(actualCafeId)) {
      // cafe_id không phải là số, cần tìm hoặc tạo cafe
      if (!cafe_data || !cafe_data.provider || !cafe_data.provider_place_id) {
        return res.status(400).json({
          error: 'Thiếu thông tin cafe_data khi cafe_id không phải là số'
        });
      }

      const db = require('../db');
      // Tìm cafe theo provider và provider_place_id
      const cafeResult = await db.query(
        `SELECT id FROM cafes WHERE provider = $1 AND provider_place_id = $2`,
        [cafe_data.provider, cafe_data.provider_place_id]
      );

      if (cafeResult.rows.length > 0) {
        actualCafeId = cafeResult.rows[0].id;
      } else {
        // Tạo cafe mới nếu chưa có
        if (!cafe_data.name || cafe_data.lat == null || cafe_data.lng == null) {
          return res.status(400).json({
            error: 'Thiếu thông tin bắt buộc để tạo cafe mới (name, lat, lng)'
          });
        }

        const insertResult = await db.query(
          `INSERT INTO cafes (provider, provider_place_id, name, address, lat, lng, rating, user_rating_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (provider, provider_place_id)
           DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [
            cafe_data.provider,
            cafe_data.provider_place_id,
            cafe_data.name,
            cafe_data.address || null,
            cafe_data.lat,
            cafe_data.lng,
            cafe_data.rating || null,
            cafe_data.user_rating_count || null
          ]
        );
        actualCafeId = insertResult.rows[0].id;
      }
    }

    // Validate actualCafeId trước khi gọi repository
    if (!actualCafeId || isNaN(actualCafeId)) {
      return res.status(400).json({
        error: 'Không thể xác định cafe_id hợp lệ'
      });
    }

    const review = await reviewRepository.createOrUpdateReview(actualCafeId, {
      userId: userId,
      rating: ratingInt,
      comment: comment || null,
      is_public: is_public !== false,
      is_child_friendly: is_child_friendly || false,
      images: images || []
    });

    res.status(201).json({
      message: 'Đánh giá đã được lưu',
      review
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Create review error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/reviews/cafe/:cafeId - Lấy tất cả đánh giá của một quán
router.get('/cafe/:cafeId', async (req, res) => {
  try {
    const userId = req.user.userId;
    let actualCafeId = parseInt(req.params.cafeId);

    // Nếu cafeId không phải là số, có thể là provider_provider_place_id format
    if (isNaN(actualCafeId)) {
      const db = require('../db');
      const cafeIdParam = req.params.cafeId;
      
      // Parse format: provider_provider_place_id (ví dụ: "goong_skWIv1FNobZ1xCYtsGKc2mWsXay...")
      const firstUnderscoreIndex = cafeIdParam.indexOf('_');
      if (firstUnderscoreIndex === -1) {
        return res.status(400).json({ error: 'ID quán không hợp lệ' });
      }

      const provider = cafeIdParam.substring(0, firstUnderscoreIndex);
      const providerPlaceId = cafeIdParam.substring(firstUnderscoreIndex + 1);

      // Tìm cafe trong DB theo provider và provider_place_id
      const cafeResult = await db.query(
        `SELECT id FROM cafes WHERE provider = $1 AND provider_place_id = $2`,
        [provider, providerPlaceId]
      );

      if (cafeResult.rows.length === 0) {
        // Cafe chưa có trong DB, trả về reviews rỗng
        return res.json({
          reviews: [],
          average_rating: null,
          review_count: 0
        });
      }

      actualCafeId = cafeResult.rows[0].id;
    }

    const reviews = await reviewRepository.getReviewsByCafe(actualCafeId, userId);
    const avgRating = await reviewRepository.getAverageRating(actualCafeId);

    res.json({
      reviews,
      average_rating: avgRating.avg_rating,
      review_count: avgRating.review_count
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get reviews error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/reviews/my/:cafeId - Lấy đánh giá của user hiện tại cho một quán
router.get('/my/:cafeId', async (req, res) => {
  try {
    const userId = req.user.userId;
    let actualCafeId = parseInt(req.params.cafeId);

    // Nếu cafeId không phải là số, có thể là provider_provider_place_id format
    if (isNaN(actualCafeId)) {
      const db = require('../db');
      const cafeIdParam = req.params.cafeId;
      
      // Parse format: provider_provider_place_id (ví dụ: "goong_skWIv1FNobZ1xCYtsGKc2mWsXay...")
      const firstUnderscoreIndex = cafeIdParam.indexOf('_');
      if (firstUnderscoreIndex === -1) {
        return res.status(400).json({ error: 'ID quán không hợp lệ' });
      }

      const provider = cafeIdParam.substring(0, firstUnderscoreIndex);
      const providerPlaceId = cafeIdParam.substring(firstUnderscoreIndex + 1);

      // Tìm cafe trong DB theo provider và provider_place_id
      const cafeResult = await db.query(
        `SELECT id FROM cafes WHERE provider = $1 AND provider_place_id = $2`,
        [provider, providerPlaceId]
      );

      if (cafeResult.rows.length === 0) {
        // Cafe chưa có trong DB, chưa có review nào
        return res.json({ review: null });
      }

      actualCafeId = cafeResult.rows[0].id;
    }

    const review = await reviewRepository.getReviewByUserAndCafe(userId, actualCafeId);

    res.json({ review });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get my review error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/reviews/:cafeId - Xóa đánh giá
router.delete('/:cafeId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const cafeId = parseInt(req.params.cafeId);

    if (isNaN(cafeId)) {
      return res.status(400).json({ error: 'ID quán không hợp lệ' });
    }

    const review = await reviewRepository.deleteReview(userId, cafeId);

    if (!review) {
      return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
    }

    res.json({
      message: 'Đánh giá đã được xóa'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Delete review error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

