const express = require('express');
const router = express.Router();
const cafeController = require('../controllers/cafeController');

router.get('/', cafeController.getAllCafes);
router.get('/search', cafeController.searchCafes);

module.exports = router;
