const mysql = require("mysql2/promise");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "railway",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// Test connection
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
})();

// Initialize schema
async function initSchema() {
  try {
    let schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

    // remove database commands for Railway
    schema = schema.replace(/CREATE DATABASE.*?;/gi, "");
    schema = schema.replace(/USE .*?;/gi, "");

    await pool.query(schema);

    console.log("✅ Database schema initialized");
  } catch (err) {
    console.error("Schema init error:", err.message);
  }
}

initSchema();

module.exports = pool;