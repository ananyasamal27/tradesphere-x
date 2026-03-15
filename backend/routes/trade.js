const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// POST /buy
router.post('/buy', auth, async (req, res) => {
  const { stock_id, quantity } = req.body;
  const investor_id = req.investor.id;
  if (!stock_id || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'stock_id and quantity > 0 required' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // Get stock
    const [[stock]] = await conn.query('SELECT * FROM Stock WHERE id = ? FOR UPDATE', [stock_id]);
    if (!stock) { await conn.rollback(); return res.status(404).json({ error: 'Stock not found' }); }
    // Get investor
    const [[investor]] = await conn.query('SELECT * FROM Investor WHERE id = ? FOR UPDATE', [investor_id]);
    const fee = parseFloat((stock.current_price * quantity * 0.002).toFixed(2));
    const total = parseFloat((stock.current_price * quantity + fee).toFixed(2));

    if (investor.wallet_balance < total) {
      await conn.rollback();
      return res.status(400).json({ error: 'Insufficient wallet balance', required: total, available: investor.wallet_balance });
    }
    // Deduct wallet
    await conn.query('UPDATE Investor SET wallet_balance = wallet_balance - ? WHERE id = ?', [total, investor_id]);
    // Create order
    const [orderResult] = await conn.query(
      'INSERT INTO Orders (investor_id, stock_id, order_type, quantity, price, status) VALUES (?, ?, "buy", ?, ?, "completed")',
      [investor_id, stock_id, quantity, stock.current_price]
    );
    // Create transaction
    await conn.query(
      'INSERT INTO Transactions (investor_id, stock_id, order_id, type, quantity, price, total_amount, fee) VALUES (?, ?, ?, "buy", ?, ?, ?, ?)',
      [investor_id, stock_id, orderResult.insertId, quantity, stock.current_price, total, fee]
    );
    // Update portfolio stock
    const [[portfolio]] = await conn.query('SELECT id FROM Portfolio WHERE investor_id = ?', [investor_id]);
    if (!portfolio) {
      await conn.query('INSERT INTO Portfolio (investor_id, total_value, total_invested) VALUES (?, 0, 0)', [investor_id]);
    }
    const [[port]] = await conn.query('SELECT id FROM Portfolio WHERE investor_id = ?', [investor_id]);
    const [[existing]] = await conn.query('SELECT * FROM PortfolioStock WHERE portfolio_id = ? AND stock_id = ?', [port.id, stock_id]);
    if (existing) {
      const newQty = existing.quantity + quantity;
      const newAvg = ((existing.avg_buy_price * existing.quantity) + (stock.current_price * quantity)) / newQty;
      await conn.query('UPDATE PortfolioStock SET quantity = ?, avg_buy_price = ? WHERE id = ?', [newQty, newAvg, existing.id]);
    } else {
      await conn.query('INSERT INTO PortfolioStock (portfolio_id, stock_id, quantity, avg_buy_price) VALUES (?, ?, ?, ?)',
        [port.id, stock_id, quantity, stock.current_price]);
    }
    // Update portfolio total
    await conn.query('UPDATE Portfolio SET total_invested = total_invested + ? WHERE investor_id = ?', [stock.current_price * quantity, investor_id]);
    // Audit
    await conn.query('INSERT INTO AuditLog (investor_id, action, details) VALUES (?, "BUY", ?)',
      [investor_id, `Bought ${quantity} x ${stock.symbol} @ ₹${stock.current_price}`]);

    await conn.commit();
    const [[updatedInvestor]] = await db.query('SELECT wallet_balance FROM Investor WHERE id = ?', [investor_id]);
    res.json({
      message: `Successfully bought ${quantity} shares of ${stock.symbol}`,
      total_paid: total,
      fee,
      wallet_balance: updatedInvestor.wallet_balance
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// POST /sell
router.post('/sell', auth, async (req, res) => {
  const { stock_id, quantity } = req.body;
  const investor_id = req.investor.id;
  if (!stock_id || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'stock_id and quantity > 0 required' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[stock]] = await conn.query('SELECT * FROM Stock WHERE id = ?', [stock_id]);
    if (!stock) { await conn.rollback(); return res.status(404).json({ error: 'Stock not found' }); }

    const [[portfolio]] = await conn.query('SELECT id FROM Portfolio WHERE investor_id = ?', [investor_id]);
    if (!portfolio) { await conn.rollback(); return res.status(400).json({ error: 'Portfolio not found' }); }

    const [[ps]] = await conn.query('SELECT * FROM PortfolioStock WHERE portfolio_id = ? AND stock_id = ? FOR UPDATE', [portfolio.id, stock_id]);
    if (!ps || ps.quantity < quantity) {
      await conn.rollback();
      return res.status(400).json({ error: 'Insufficient shares', available: ps ? ps.quantity : 0 });
    }

    const fee = parseFloat((stock.current_price * quantity * 0.002).toFixed(2));
    const proceeds = parseFloat((stock.current_price * quantity - fee).toFixed(2));
    // Credit wallet
    await conn.query('UPDATE Investor SET wallet_balance = wallet_balance + ? WHERE id = ?', [proceeds, investor_id]);
    // Update portfolio stock
    const newQty = ps.quantity - quantity;
    if (newQty === 0) {
      await conn.query('DELETE FROM PortfolioStock WHERE id = ?', [ps.id]);
    } else {
      await conn.query('UPDATE PortfolioStock SET quantity = ? WHERE id = ?', [newQty, ps.id]);
    }
    // Update portfolio invested
    await conn.query('UPDATE Portfolio SET total_invested = GREATEST(0, total_invested - ?) WHERE investor_id = ?', [ps.avg_buy_price * quantity, investor_id]);
    // Order & transaction
    const [orderResult] = await conn.query(
      'INSERT INTO Orders (investor_id, stock_id, order_type, quantity, price, status) VALUES (?, ?, "sell", ?, ?, "completed")',
      [investor_id, stock_id, quantity, stock.current_price]
    );
    await conn.query(
      'INSERT INTO Transactions (investor_id, stock_id, order_id, type, quantity, price, total_amount, fee) VALUES (?, ?, ?, "sell", ?, ?, ?, ?)',
      [investor_id, stock_id, orderResult.insertId, quantity, stock.current_price, proceeds, fee]
    );
    await conn.query('INSERT INTO AuditLog (investor_id, action, details) VALUES (?, "SELL", ?)',
      [investor_id, `Sold ${quantity} x ${stock.symbol} @ ₹${stock.current_price}`]);

    await conn.commit();
    const [[updatedInvestor]] = await db.query('SELECT wallet_balance FROM Investor WHERE id = ?', [investor_id]);
    res.json({ message: `Successfully sold ${quantity} shares of ${stock.symbol}`, proceeds, fee, wallet_balance: updatedInvestor.wallet_balance });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET /portfolio/:id
router.get('/portfolio/:id', auth, async (req, res) => {
  try {
    const investorId = req.params.id;
    const [holdings] = await db.query(`
      SELECT ps.*, s.symbol, s.current_price, s.previous_close, c.name AS company_name, c.sector,
        (ps.quantity * s.current_price) AS current_value,
        (ps.quantity * ps.avg_buy_price) AS invested_value,
        ((s.current_price - ps.avg_buy_price) * ps.quantity) AS pnl,
        ((s.current_price - ps.avg_buy_price) / ps.avg_buy_price * 100) AS pnl_percent
      FROM PortfolioStock ps
      JOIN Portfolio p ON ps.portfolio_id = p.id
      JOIN Stock s ON ps.stock_id = s.id
      JOIN Company c ON s.company_id = c.id
      WHERE p.investor_id = ?
    `, [investorId]);

    const [[investor]] = await db.query('SELECT wallet_balance, name FROM Investor WHERE id = ?', [investorId]);
    const total_value = holdings.reduce((sum, h) => sum + parseFloat(h.current_value), 0);
    const total_invested = holdings.reduce((sum, h) => sum + parseFloat(h.invested_value), 0);
    const total_pnl = total_value - total_invested;

    res.json({
      investor: investor || {},
      holdings,
      summary: {
        total_value: parseFloat(total_value.toFixed(2)),
        total_invested: parseFloat(total_invested.toFixed(2)),
        total_pnl: parseFloat(total_pnl.toFixed(2)),
        pnl_percent: total_invested > 0 ? parseFloat((total_pnl / total_invested * 100).toFixed(2)) : 0,
        wallet_balance: investor ? investor.wallet_balance : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /transactions/:id
router.get('/transactions/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, s.symbol, c.name AS company_name
      FROM Transactions t
      JOIN Stock s ON t.stock_id = s.id
      JOIN Company c ON s.company_id = c.id
      WHERE t.investor_id = ?
      ORDER BY t.created_at DESC
      LIMIT 100
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /deposit
router.post('/deposit', auth, async (req, res) => {
  const { amount } = req.body;
  const investor_id = req.investor.id;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });
  try {
    await db.query('UPDATE Investor SET wallet_balance = wallet_balance + ? WHERE id = ?', [amount, investor_id]);
    await db.query('INSERT INTO AuditLog (investor_id, action, details) VALUES (?, "DEPOSIT", ?)',
      [investor_id, `Deposited ₹${amount}`]);
    const [[inv]] = await db.query('SELECT wallet_balance FROM Investor WHERE id = ?', [investor_id]);
    res.json({ message: 'Deposit successful', wallet_balance: inv.wallet_balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
