const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api', require('./routes/trade'));
app.use('/api', require('./routes/misc'));

// Simulate live price fluctuation (every 10 seconds in dev)
const db = require('./db');
setInterval(async () => {
  try {
    const [stocks] = await db.query('SELECT id, current_price FROM Stock');
    for (const s of stocks) {
      const fluctuation = (Math.random() - 0.48) * 0.012; // slight upward bias
      const newPrice = Math.max(1, parseFloat((s.current_price * (1 + fluctuation)).toFixed(2)));
      await db.query(
        'UPDATE Stock SET previous_close = current_price, current_price = ?, high_price = GREATEST(COALESCE(high_price, ?), ?), low_price = LEAST(COALESCE(low_price, ?), ?) WHERE id = ?',
        [newPrice, newPrice, newPrice, newPrice, newPrice, s.id]
      );
    }
  } catch (e) {
    // silent fail for price simulation
  }
}, 10000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TradeSphere X Backend running on http://localhost:${PORT}`);
});
