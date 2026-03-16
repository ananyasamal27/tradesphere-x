const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tradesphere',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
  });

  const fs = require("fs");
const path = require("path");

async function initSchema() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(schema);
    console.log("✅ Database schema initialized");
  } catch (err) {
    console.error("Schema init error:", err.message);
  }
}

initSchema();

module.exports = pool;
