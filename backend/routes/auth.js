const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// POST /register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO Investor (name, email, password, phone, wallet_balance) VALUES (?, ?, ?, ?, 10000)',
      [name, email, hashed, phone || null]
    );
    const investorId = result.insertId;
    // Create portfolio
    await db.query('INSERT INTO Portfolio (investor_id, total_value, total_invested) VALUES (?, 0, 0)', [investorId]);
    // Create trading account
    const accNum = 'TSX' + Date.now();
    await db.query(
      'INSERT INTO TradingAccount (investor_id, broker_id, account_number, status) VALUES (?, 1, ?, "active")',
      [investorId, accNum]
    );
    // Audit
    await db.query('INSERT INTO AuditLog (investor_id, action, details) VALUES (?, "REGISTER", "New investor registered")', [investorId]);

    const token = jwt.sign({ id: investorId, email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ message: 'Registration successful', token, investorId, name, email, wallet: 10000 });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const [rows] = await db.query('SELECT * FROM Investor WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const investor = rows[0];
    const match = await bcrypt.compare(password, investor.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    await db.query('INSERT INTO AuditLog (investor_id, action) VALUES (?, "LOGIN")', [investor.id]);
    const token = jwt.sign({ id: investor.id, email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({
      token,
      investorId: investor.id,
      name: investor.name,
      email: investor.email,
      wallet: investor.wallet_balance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
