-- TradeSphere X Database Schema
-- Run this file to initialize the database

CREATE DATABASE IF NOT EXISTS tradesphere;
USE tradesphere;

-- Investors
CREATE TABLE IF NOT EXISTS Investor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  wallet_balance DECIMAL(15,2) DEFAULT 10000.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brokers
CREATE TABLE IF NOT EXISTS Broker (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50),
  commission_rate DECIMAL(5,4) DEFAULT 0.0020,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TradingAccounts
CREATE TABLE IF NOT EXISTS TradingAccount (
  id INT AUTO_INCREMENT PRIMARY KEY,
  investor_id INT NOT NULL,
  broker_id INT,
  account_number VARCHAR(50) UNIQUE,
  status ENUM('active','suspended','closed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investor_id) REFERENCES Investor(id),
  FOREIGN KEY (broker_id) REFERENCES Broker(id)
);

-- StockExchanges
CREATE TABLE IF NOT EXISTS StockExchange (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(50),
  timezone VARCHAR(50),
  open_time TIME DEFAULT '09:15:00',
  close_time TIME DEFAULT '15:30:00'
);

-- Companies
CREATE TABLE IF NOT EXISTS Company (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sector VARCHAR(100),
  description TEXT,
  founded_year INT,
  headquarters VARCHAR(100),
  website VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stocks
CREATE TABLE IF NOT EXISTS Stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  exchange_id INT,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  current_price DECIMAL(12,2) NOT NULL,
  open_price DECIMAL(12,2),
  high_price DECIMAL(12,2),
  low_price DECIMAL(12,2),
  previous_close DECIMAL(12,2),
  volume BIGINT DEFAULT 0,
  market_cap DECIMAL(20,2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES Company(id),
  FOREIGN KEY (exchange_id) REFERENCES StockExchange(id)
);

-- Orders
CREATE TABLE IF NOT EXISTS Orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  investor_id INT NOT NULL,
  stock_id INT NOT NULL,
  order_type ENUM('buy','sell') NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  status ENUM('pending','completed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investor_id) REFERENCES Investor(id),
  FOREIGN KEY (stock_id) REFERENCES Stock(id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS Transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  investor_id INT NOT NULL,
  stock_id INT NOT NULL,
  order_id INT,
  type ENUM('buy','sell','deposit','withdrawal') NOT NULL,
  quantity INT,
  price DECIMAL(12,2),
  total_amount DECIMAL(15,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investor_id) REFERENCES Investor(id),
  FOREIGN KEY (stock_id) REFERENCES Stock(id)
);

-- Portfolio
CREATE TABLE IF NOT EXISTS Portfolio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  investor_id INT NOT NULL UNIQUE,
  total_value DECIMAL(15,2) DEFAULT 0.00,
  total_invested DECIMAL(15,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (investor_id) REFERENCES Investor(id)
);

-- PortfolioStock
CREATE TABLE IF NOT EXISTS PortfolioStock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  portfolio_id INT NOT NULL,
  stock_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  avg_buy_price DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (portfolio_id) REFERENCES Portfolio(id),
  FOREIGN KEY (stock_id) REFERENCES Stock(id),
  UNIQUE KEY unique_portfolio_stock (portfolio_id, stock_id)
);

-- Dividend
CREATE TABLE IF NOT EXISTS Dividend (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stock_id INT NOT NULL,
  amount_per_share DECIMAL(10,4) NOT NULL,
  declared_date DATE,
  payment_date DATE,
  FOREIGN KEY (stock_id) REFERENCES Stock(id)
);

-- AuditLog
CREATE TABLE IF NOT EXISTS AuditLog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  investor_id INT,
  action VARCHAR(200) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investor_id) REFERENCES Investor(id)
);

-- Seed data
INSERT IGNORE INTO StockExchange (id, name, country, timezone) VALUES
(1, 'NSE', 'India', 'Asia/Kolkata'),
(2, 'BSE', 'India', 'Asia/Kolkata');

INSERT IGNORE INTO Broker (id, name, license_number, commission_rate) VALUES
(1, 'TradeSphere Broker', 'TSB001', 0.0020);

INSERT IGNORE INTO Company (id, name, sector, description) VALUES
(1, 'Reliance Industries', 'Energy', 'Largest conglomerate in India'),
(2, 'Tata Consultancy Services', 'Technology', 'Largest IT company in India'),
(3, 'Infosys', 'Technology', 'Global IT services company'),
(4, 'HDFC Bank', 'Finance', 'Leading private sector bank'),
(5, 'Bajaj Finance', 'Finance', 'Consumer finance company'),
(6, 'Hindustan Unilever', 'FMCG', 'FMCG market leader'),
(7, 'Wipro', 'Technology', 'IT services and consulting'),
(8, 'ITC Limited', 'FMCG', 'Diversified conglomerate'),
(9, 'Larsen & Toubro', 'Infrastructure', 'Engineering conglomerate'),
(10, 'Asian Paints', 'Consumer', 'Paint and coatings company');

INSERT IGNORE INTO Stock (id, company_id, exchange_id, symbol, current_price, open_price, high_price, low_price, previous_close, volume, market_cap) VALUES
(1, 1, 1, 'RELIANCE', 2456.75, 2440.00, 2480.50, 2435.00, 2440.20, 5823000, 16600000000000),
(2, 2, 1, 'TCS', 3987.40, 3950.00, 4005.00, 3940.00, 3960.00, 3210000, 14500000000000),
(3, 3, 1, 'INFY', 1567.80, 1555.00, 1580.00, 1548.00, 1558.50, 8900000, 6500000000000),
(4, 4, 1, 'HDFCBANK', 1654.30, 1640.00, 1670.00, 1635.00, 1648.00, 12300000, 12500000000000),
(5, 5, 1, 'BAJFINANCE', 7234.60, 7150.00, 7290.00, 7130.00, 7180.00, 1890000, 4370000000000),
(6, 6, 1, 'HINDUNILVR', 2789.50, 2760.00, 2810.00, 2745.00, 2768.00, 2100000, 6550000000000),
(7, 7, 1, 'WIPRO', 487.35, 482.00, 492.00, 479.00, 484.50, 9800000, 2670000000000),
(8, 8, 1, 'ITC', 456.80, 450.00, 462.00, 447.00, 452.00, 18700000, 5700000000000),
(9, 9, 1, 'LT', 3456.90, 3420.00, 3490.00, 3400.00, 3430.00, 2340000, 4870000000000),
(10, 10, 1, 'ASIANPAINT', 2987.20, 2950.00, 3010.00, 2930.00, 2960.00, 1760000, 2860000000000);
