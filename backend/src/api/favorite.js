// backend/src/api/favorite.js
const express = require('express');
const favoriteRepository = require('../repositories/favoriteRepository');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// GET /api/favorites - Lấy danh sách quán yêu thích
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const favorites = await favoriteRepository.getFavoritesByUser(userId);

    res.json({
      message: 'Lấy danh sách yêu thích thành công',
      favorites
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get favorites error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/favorites - Thêm quán vào yêu thích
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      provider,
      provider_place_id,
      name,
      address,
      lat,
      lng,
      rating,
      user_rating_count,
      price_level
    } = req.body;

    // Validate input
    if (!provider || !provider_place_id || !name || lat === undefined || lng === undefined) {
      return res.status(400).json({
        error: 'Thiếu thông tin quán cà phê'
      });
    }

    // Lưu quán và thêm vào favorites
    const result = await favoriteRepository.saveCafeAndAddFavorite(userId, {
      provider,
      provider_place_id,
      name,
      address,
      lat,
      lng,
      rating,
      user_rating_count,
      price_level
    });

    res.status(201).json({
      message: 'Thêm vào yêu thích thành công',
      cafeId: result.cafeId,
      favoriteId: result.favoriteId
    });
  } catch (error) {
    // Lỗi duplicate (unique constraint) là case đã được xử lý business => không cần in full stack trong test
    if (error.code === '23505') {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('Duplicate favorite cafe for user:', {
          message: error.message,
          detail: error.detail
        });
      }
      return res.status(400).json({ error: 'Quán đã có trong danh sách yêu thích' });
    }

    // Các lỗi khác mới log là lỗi server
    if (process.env.NODE_ENV !== 'test') {
      console.error('Add favorite error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/favorites/:cafeId - Xóa quán khỏi yêu thích
router.delete('/:cafeId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const cafeId = parseInt(req.params.cafeId, 10);

    if (isNaN(cafeId)) {
      return res.status(400).json({ error: 'ID quán không hợp lệ' });
    }

    const result = await favoriteRepository.removeFavorite(userId, cafeId);

    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy trong danh sách yêu thích' });
    }

    res.json({
      message: 'Xóa khỏi yêu thích thành công'
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Remove favorite error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/favorites/check/:cafeId - Kiểm tra đã yêu thích chưa
router.get('/check/:cafeId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const cafeId = parseInt(req.params.cafeId, 10);

    if (isNaN(cafeId)) {
      return res.status(400).json({ error: 'ID quán không hợp lệ' });
    }

    const isFavorite = await favoriteRepository.isFavorite(userId, cafeId);

    res.json({ isFavorite });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Check favorite error:', error);
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
