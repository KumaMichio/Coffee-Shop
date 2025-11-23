const cafeService = require('../services/cafeService');

async function getAllCafes(req, res) {
  try {
    const cafes = await cafeService.getAllCafes();
    res.json({ status: 'success', data: cafes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
}

async function searchCafes(req, res) {
  try {
    const { keyword, lat, lng, radiusKm } = req.query;
    const cafes = await cafeService.searchCafes({
      keyword: keyword || '',
      lat,
      lng,
      radiusKm,
    });
    res.json({ status: 'success', data: cafes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
}

module.exports = {
  getAllCafes,
  searchCafes,
};
