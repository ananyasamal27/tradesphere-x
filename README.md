# TradeSphere X 🚀

A professional fintech stock trading simulation platform built with Node.js, Express, MySQL, and React.

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Node.js + Express                 |
| Database  | MySQL 8+                          |
| Frontend  | React 18 + React Router           |
| Charts    | Chart.js + react-chartjs-2        |
| Auth      | JWT + bcryptjs                    |
| HTTP      | Axios                             |
| UI        | Custom dark fintech CSS           |
| Toasts    | react-hot-toast                   |
| QR        | html5-qrcode                      |

---

## 📁 Project Structure

```
tradesphere-x/
├── backend/
│   ├── server.js           # Express app + live price simulation
│   ├── db.js               # MySQL connection pool
│   ├── schema.sql          # Full DB schema + seed data
│   ├── .env                # Environment config
│   ├── middleware/
│   │   └── auth.js         # JWT middleware
│   └── routes/
│       ├── auth.js         # /register, /login
│       ├── stocks.js       # /stocks, /add-stock, price update
│       ├── trade.js        # /buy, /sell, /portfolio/:id, /transactions/:id
│       └── misc.js         # /leaderboard, /admin/stats, /investor/:id
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.jsx
        ├── index.js
        ├── index.css        # Full dark theme design system
        ├── context/
        │   └── AuthContext.jsx
        ├── utils/
        │   └── api.js       # Axios instance
        ├── components/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx
        │   ├── Topbar.jsx
        │   ├── StatCard.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Market.jsx
            ├── Trade.jsx
            ├── Portfolio.jsx
            ├── Transactions.jsx
            ├── Leaderboard.jsx
            └── Admin.jsx
```

---

## ⚡ Quick Start

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
source backend/schema.sql
```

Or:
```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env .env.local
# Edit .env with your MySQL credentials:
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=tradesphere

# Start server
npm run dev       # development (nodemon)
npm start         # production
```

Backend runs on: **http://localhost:3000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

Frontend runs on: **http://localhost:3001** (CRA default)

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint     | Description          |
|--------|-------------|----------------------|
| POST   | /api/register | Register investor   |
| POST   | /api/login    | Login investor      |

### Stocks
| Method | Endpoint                  | Description              |
|--------|--------------------------|--------------------------|
| GET    | /api/stocks               | All stocks (filterable)  |
| GET    | /api/stocks/:symbol       | Stock by symbol          |
| POST   | /api/stocks/add-stock     | Add new stock (auth)     |
| PATCH  | /api/stocks/:symbol/price | Update price (auth)      |
| GET    | /api/stocks/meta/sectors  | All sectors              |

### Trading
| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | /api/buy                    | Buy stocks (auth)     |
| POST   | /api/sell                   | Sell stocks (auth)    |
| GET    | /api/portfolio/:id          | Portfolio (auth)      |
| GET    | /api/transactions/:id       | Transactions (auth)   |
| POST   | /api/deposit                | Deposit funds (auth)  |

### Misc
| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| GET    | /api/leaderboard      | Top investors           |
| GET    | /api/admin/stats      | Admin stats (auth)      |
| POST   | /api/admin/company    | Add company (auth)      |
| GET    | /api/admin/companies  | All companies (auth)    |
| GET    | /api/investor/:id     | Investor profile (auth) |

---

## 🎮 Features

- **Live price simulation** — stock prices fluctuate every 10 seconds automatically
- **Wallet management** — deposit funds and track balance in real-time
- **Buy/Sell** — atomic transactions with portfolio tracking
- **Portfolio analytics** — doughnut chart, bar chart, P&L tracking
- **QR code scanner** — scan a QR with `?symbol=TICKER` to open trade page
- **Leaderboard** — top investors ranked by net worth with podium display
- **Admin panel** — manage companies, stocks, and prices
- **Ticker strip** — animated live price ticker on dashboard
- **Transaction history** — full trade history with filters
- **JWT auth** — protected routes with token-based authentication
- **Responsive** — works on mobile, tablet and desktop

---

## 🎨 Design System

- **Theme**: Dark fintech (Groww/Zerodha inspired)
- **Fonts**: Syne (display) + DM Mono (numbers/code)
- **Accent**: `#00d4aa` teal-green
- **Background**: `#080c14` near-black
- **Cards**: `#111827` with subtle borders

---

## 💡 Default Data

On first run, the schema seeds:
- 2 Stock Exchanges (NSE, BSE)
- 1 Broker
- 10 Companies (Reliance, TCS, Infosys, HDFC, etc.)
- 10 Stocks with realistic prices

New investor accounts start with **₹10,000** simulated balance.
