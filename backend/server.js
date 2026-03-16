const express = require('express');
const cors = require('cors');
require('dotenv').config();

const fs = require("fs");
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

connection.connect((err) => {
  if (err) {
    console.log("DB connection error:", err);
    return;
  }

  console.log("Connected to Aiven DB");

  const sql = fs.readFileSync("./Dump20260316.sql", "utf8");

  connection.query(sql, (err) => {
    if (err) console.log("Import error:", err);
    else console.log("Database imported successfully");
  });
});

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api', require('./routes/trade'));
app.use('/api', require('./routes/misc'));

// Simulate live price fluctuation (every 10 seconds in dev)
let db;
try {
  db = require('./db');
} catch (e) {
  console.log("DB not connected");
}

if (db) {
  setInterval(async () => {
    try {
      const [stocks] = await db.query('SELECT id, current_price FROM Stock');

      for (const s of stocks) {
        const fluctuation = (Math.random() - 0.48) * 0.012;
        const newPrice = Math.max(
          1,
          parseFloat((s.current_price * (1 + fluctuation)).toFixed(2))
        );

        await db.query(
          `UPDATE Stock 
           SET previous_close = current_price,
               current_price = ?,
               high_price = GREATEST(COALESCE(high_price,0), ?)
           WHERE id = ?`,
          [newPrice, newPrice, s.id]
        );
      }
    } catch (e) {
      console.log("Price simulation error");
    }
  }, 10000);
}

app.get("/", (req, res) => {
  res.send("TradeSphere X backend is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TradeSphere X Backend running on http://localhost:${PORT}`);
});
