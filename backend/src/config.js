// src/config.js
require('dotenv').config();  // Đảm bảo gọi dòng này trước khi sử dụng các biến môi trường

const port = process.env.PORT || 5001;
const dbUri = process.env.DB_URI;

console.log(`Server running on port ${port}`);
console.log(`Database URI: ${dbUri}`);
