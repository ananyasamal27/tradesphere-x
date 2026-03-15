const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.id, i.name, i.email, i.wallet_balance,
        COALESCE(SUM(ps.quantity * s.current_price), 0) AS portfolio_value,
        COALESCE(SUM(ps.quantity * ps.avg_buy_price), 0) AS invested,
        (i.wallet_balance + COALESCE(SUM(ps.quantity * s.current_price), 0)) AS net_worth
      FROM Investor i
      LEFT JOIN Portfolio p ON i.id = p.investor_id
      LEFT JOIN PortfolioStock ps ON p.id = ps.portfolio_id
      LEFT JOIN Stock s ON ps.stock_id = s.id
      GROUP BY i.id
      ORDER BY net_worth DESC
      LIMIT 20
    `);
    const ranked = rows.map((r, idx) => ({
      rank: idx + 1,
      ...r,
      portfolio_value: parseFloat(r.portfolio_value),
      invested: parseFloat(r.invested),
      net_worth: parseFloat(r.net_worth),
      pnl: parseFloat(r.portfolio_value) - parseFloat(r.invested)
    }));
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/stats
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const [[{ total_investors }]] = await db.query('SELECT COUNT(*) AS total_investors FROM Investor');
    const [[{ total_stocks }]] = await db.query('SELECT COUNT(*) AS total_stocks FROM Stock');
    const [[{ total_transactions }]] = await db.query('SELECT COUNT(*) AS total_transactions FROM Transactions');
    const [[{ total_volume }]] = await db.query('SELECT COALESCE(SUM(total_amount),0) AS total_volume FROM Transactions');
    const [recent_trades] = await db.query(`
      SELECT t.*, i.name AS investor_name, s.symbol FROM Transactions t
      JOIN Investor i ON t.investor_id = i.id
      JOIN Stock s ON t.stock_id = s.id
      ORDER BY t.created_at DESC LIMIT 10
    `);
    res.json({ total_investors, total_stocks, total_transactions, total_volume, recent_trades });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/company
router.post('/admin/company', auth, async (req, res) => {
  const { name, sector, description, headquarters, website } = req.body;
  if (!name) return res.status(400).json({ error: 'Company name required' });
  try {
    const [r] = await db.query(
      'INSERT INTO Company (name, sector, description, headquarters, website) VALUES (?, ?, ?, ?, ?)',
      [name, sector, description, headquarters, website]
    );
    res.status(201).json({ message: 'Company created', id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/companies
router.get('/admin/companies', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Company ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /investor/:id
router.get('/investor/:id', auth, async (req, res) => {
  try {
    const [[investor]] = await db.query(
      'SELECT id, name, email, phone, wallet_balance, created_at FROM Investor WHERE id = ?',
      [req.params.id]
    );
    if (!investor) return res.status(404).json({ error: 'Investor not found' });
    res.json(investor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
