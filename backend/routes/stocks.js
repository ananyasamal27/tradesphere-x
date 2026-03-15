const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /stocks
router.get('/', async (req, res) => {
  try {
    const { sector, search } = req.query;
    let query = `
      SELECT s.*, c.name AS company_name, c.sector, c.description, e.name AS exchange_name
      FROM Stock s
      JOIN Company c ON s.company_id = c.id
      LEFT JOIN StockExchange e ON s.exchange_id = e.id
    `;
    const params = [];
    const conditions = [];
    if (sector) { conditions.push('c.sector = ?'); params.push(sector); }
    if (search) { conditions.push('(s.symbol LIKE ? OR c.name LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY s.symbol ASC';
    const [rows] = await db.query(query, params);
    // Add change and change_percent
    const stocks = rows.map(s => ({
      ...s,
      change: parseFloat((s.current_price - s.previous_close).toFixed(2)),
      change_percent: s.previous_close ? parseFloat(((s.current_price - s.previous_close) / s.previous_close * 100).toFixed(2)) : 0
    }));
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /stocks/:symbol
router.get('/:symbol', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, c.name AS company_name, c.sector, c.description, c.headquarters, c.website
      FROM Stock s JOIN Company c ON s.company_id = c.id
      WHERE s.symbol = ?
    `, [req.params.symbol]);
    if (!rows.length) return res.status(404).json({ error: 'Stock not found' });
    const s = rows[0];
    res.json({
      ...s,
      change: parseFloat((s.current_price - s.previous_close).toFixed(2)),
      change_percent: s.previous_close ? parseFloat(((s.current_price - s.previous_close) / s.previous_close * 100).toFixed(2)) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /add-stock (admin)
router.post('/add-stock', auth, async (req, res) => {
  const { company_name, sector, symbol, current_price, exchange_id = 1 } = req.body;
  if (!company_name || !symbol || !current_price) {
    return res.status(400).json({ error: 'company_name, symbol, current_price required' });
  }
  try {
    // Insert or get company
    let companyId;
    const [existing] = await db.query('SELECT id FROM Company WHERE name = ?', [company_name]);
    if (existing.length) {
      companyId = existing[0].id;
    } else {
      const [r] = await db.query('INSERT INTO Company (name, sector) VALUES (?, ?)', [company_name, sector || 'Other']);
      companyId = r.insertId;
    }
    const [stockCheck] = await db.query('SELECT id FROM Stock WHERE symbol = ?', [symbol]);
    if (stockCheck.length) return res.status(409).json({ error: 'Symbol already exists' });

    await db.query(
      'INSERT INTO Stock (company_id, exchange_id, symbol, current_price, open_price, high_price, low_price, previous_close) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [companyId, exchange_id, symbol, current_price, current_price, current_price, current_price, current_price]
    );
    res.status(201).json({ message: 'Stock added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /stocks/:symbol/price (admin - update price)
router.patch('/:symbol/price', auth, async (req, res) => {
  const { price } = req.body;
  if (!price) return res.status(400).json({ error: 'price required' });
  try {
    const [rows] = await db.query('SELECT * FROM Stock WHERE symbol = ?', [req.params.symbol]);
    if (!rows.length) return res.status(404).json({ error: 'Stock not found' });
    const stock = rows[0];
    const high = Math.max(stock.high_price || price, price);
    const low = Math.min(stock.low_price || price, price);
    await db.query(
      'UPDATE Stock SET previous_close = current_price, current_price = ?, high_price = ?, low_price = ? WHERE symbol = ?',
      [price, high, low, req.params.symbol]
    );
    res.json({ message: 'Price updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /sectors
router.get('/meta/sectors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT sector FROM Company WHERE sector IS NOT NULL ORDER BY sector');
    res.json(rows.map(r => r.sector));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
