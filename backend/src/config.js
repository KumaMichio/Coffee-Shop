// backend/src/config.js
require('dotenv').config();

const config = {
  port: process.env.PORT || 5001,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'coffee_app',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || 'postgres')
  },
  goong: {
    restApiKey: process.env.GOONG_API_KEY || process.env.GOONG_REST_API_KEY || ''
  },
  google: {
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY || ''
  }
};

module.exports = config;
