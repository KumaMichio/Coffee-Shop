const prisma = require('../config/prisma');
const { getDistanceKm } = require('../utils/distance');

async function getAllCafes() {
  return prisma.cafe.findMany();
}

/**
 * params: { keyword, lat, lng, radiusKm }
 */
async function searchCafes(params) {
  const { keyword = '', lat, lng, radiusKm } = params;

  // B1: filter theo tên (LIKE)
  let cafes = await prisma.cafe.findMany({
    where: {
      name: {
        contains: keyword,
        mode: 'insensitive',
      },
    },
  });

  // B2: nếu có lat/lng/radius → filter theo khoảng cách
  if (
    lat !== undefined &&
    lng !== undefined &&
    radiusKm !== undefined
  ) {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    const radiusNum = Number(radiusKm);

    cafes = cafes
      .map((c) => {
        const distance = getDistanceKm(latNum, lngNum, c.lat, c.lng);
        return { ...c, distance };
      })
      .filter((c) => c.distance <= radiusNum)
      .sort((a, b) => a.distance - b.distance);
  }

  return cafes;
}

module.exports = {
  getAllCafes,
  searchCafes,
};
