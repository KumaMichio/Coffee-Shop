// backend/src/api/promotion.js
const express = require('express');
const promotionRepository = require('../repositories/promotionRepository');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/promotions/nearby - Lấy promotions gần vị trí (không cần auth)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'lat và lng là bắt buộc'
      });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseInt(radius) || 5000;

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusNum)) {
      return res.status(400).json({
        error: 'lat, lng và radius phải là số hợp lệ'
      });
    }

    const promotions = await promotionRepository.getPromotionsNearby(
      latNum,
      lngNum,
      radiusNum
    );

    res.json({ promotions });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get nearby promotions error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/promotions/cafe/:cafeId - Lấy promotions của một quán (không cần auth)
router.get('/cafe/:cafeId', async (req, res) => {
  try {
    const cafeId = parseInt(req.params.cafeId);

    if (isNaN(cafeId)) {
      return res.status(400).json({ error: 'ID quán không hợp lệ' });
    }

    const promotions = await promotionRepository.getPromotionsByCafe(cafeId);

    res.json({ promotions });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get promotions by cafe error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/promotions/:id - Lấy promotion theo ID (không cần auth)
router.get('/:id', async (req, res) => {
  try {
    const promotionId = parseInt(req.params.id);

    if (isNaN(promotionId)) {
      return res.status(400).json({ error: 'ID khuyến mãi không hợp lệ' });
    }

    const promotion = await promotionRepository.getPromotionById(promotionId);

    if (!promotion) {
      return res.status(404).json({ error: 'Không tìm thấy khuyến mãi' });
    }

    res.json({ promotion });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get promotion by id error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/promotions - Tạo promotion mới (cần auth - admin/chủ quán)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      cafe_id,
      title,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      is_active = true,
      target_radius = 5000
    } = req.body;

    // Validate required fields
    if (!cafe_id || !title || !discount_type || !start_date || !end_date) {
      return res.status(400).json({
        error: 'Thiếu thông tin bắt buộc: cafe_id, title, discount_type, start_date, end_date'
      });
    }

    // Validate discount_type
    const validDiscountTypes = ['percentage', 'fixed_amount', 'free_item'];
    if (!validDiscountTypes.includes(discount_type)) {
      return res.status(400).json({
        error: 'discount_type phải là một trong: percentage, fixed_amount, free_item'
      });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: 'start_date và end_date phải là định dạng ngày hợp lệ'
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        error: 'end_date phải sau start_date'
      });
    }

    const promotion = await promotionRepository.createPromotion({
      cafe_id: parseInt(cafe_id),
      title,
      description,
      discount_type,
      discount_value: discount_value ? parseFloat(discount_value) : null,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      is_active,
      target_radius: parseInt(target_radius) || 5000,
      created_by: userId
    });

    res.status(201).json({
      message: 'Khuyến mãi đã được tạo',
      promotion
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Create promotion error:', error);
    }
    res.status(500).json({ error: error.message || 'Lỗi server' });
  }
});

// PUT /api/promotions/:id - Cập nhật promotion (cần auth)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const promotionId = parseInt(req.params.id);
    const updateData = req.body;

    if (isNaN(promotionId)) {
      return res.status(400).json({ error: 'ID khuyến mãi không hợp lệ' });
    }

    // Validate dates nếu có
    if (updateData.start_date && updateData.end_date) {
      const startDate = new Date(updateData.start_date);
      const endDate = new Date(updateData.end_date);
      if (endDate <= startDate) {
        return res.status(400).json({
          error: 'end_date phải sau start_date'
        });
      }
    }

    const promotion = await promotionRepository.updatePromotion(promotionId, updateData);

    if (!promotion) {
      return res.status(404).json({ error: 'Không tìm thấy khuyến mãi' });
    }

    res.json({
      message: 'Khuyến mãi đã được cập nhật',
      promotion
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Update promotion error:', error);
    }
    res.status(500).json({ error: error.message || 'Lỗi server' });
  }
});

// DELETE /api/promotions/:id - Xóa promotion (cần auth)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const promotionId = parseInt(req.params.id);

    if (isNaN(promotionId)) {
      return res.status(400).json({ error: 'ID khuyến mãi không hợp lệ' });
    }

    const promotion = await promotionRepository.deletePromotion(promotionId);

    if (!promotion) {
      return res.status(404).json({ error: 'Không tìm thấy khuyến mãi' });
    }

    res.json({
      message: 'Khuyến mãi đã được xóa'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Delete promotion error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/promotions - Lấy tất cả promotions (cho admin, cần auth)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await promotionRepository.getAllPromotions(
      parseInt(limit),
      parseInt(offset)
    );

    res.json(result);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get all promotions error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;

