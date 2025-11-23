const express = require('express');
const cors = require('cors');
const cafeRoutes = require('./routes/cafeRoutes');
const goongRoutes = require('./routes/goongRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/cafes', cafeRoutes);
app.use('/api/goong', goongRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
