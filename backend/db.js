const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gondola.proxy.rlwy.net',
  port: process.env.DB_PORT || 55146,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'cXOnLZsSsBPkQzLIxGoDHOglHQstFRiU',
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

module.exports = pool;
