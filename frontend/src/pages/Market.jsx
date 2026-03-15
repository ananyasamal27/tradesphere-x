import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Search, Filter, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const SECTOR_COLORS = {
  Technology: 'tag-tech', Finance: 'tag-finance', Energy: 'tag-energy',
  FMCG: 'tag-fmcg', Infrastructure: 'tag-infra', Consumer: 'tag-consumer'
};

export default function Market() {
  const [stocks, setStocks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const navigate = useNavigate();

  const loadStocks = useCallback(async () => {
    try {
      const res = await api.get('/stocks');
      setStocks(res.data);
      setLastRefresh(new Date());
    } catch {}
    setLoading(false);
  }, []);

  const loadSectors = async () => {
    try {
      const res = await api.get('/stocks/meta/sectors');
      setSectors(res.data);
    } catch {}
  };

  useEffect(() => { loadStocks(); loadSectors(); }, []);

  // Auto refresh every 10s
  useEffect(() => {
    const interval = setInterval(loadStocks, 10000);
    return () => clearInterval(interval);
  }, [loadStocks]);

  useEffect(() => {
    let result = stocks;
    if (search) result = result.filter(s =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.company_name?.toLowerCase().includes(search.toLowerCase())
    );
    if (sector) result = result.filter(s => s.sector === sector);
    setFiltered(result);
  }, [stocks, search, sector]);

  const totalGainers = stocks.filter(s => s.change_percent > 0).length;
  const totalLosers = stocks.filter(s => s.change_percent < 0).length;

  return (
    <Layout title="Stock Market">
      {/* Summary bar */}
      <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
        <div className="card" style={{ flex:1, minWidth:160 }}>
          <div className="card-title">Total Stocks</div>
          <div className="card-value" style={{ fontSize:24 }}>{stocks.length}</div>
          <div className="card-sub">Listed on NSE/BSE</div>
        </div>
        <div className="card" style={{ flex:1, minWidth:160 }}>
          <div className="card-title">Gainers</div>
          <div className="card-value" style={{ fontSize:24, color:'var(--green)' }}>{totalGainers}</div>
          <div className="card-sub">Stocks up today</div>
        </div>
        <div className="card" style={{ flex:1, minWidth:160 }}>
          <div className="card-title">Losers</div>
          <div className="card-value" style={{ fontSize:24, color:'var(--red)' }}>{totalLosers}</div>
          <div className="card-sub">Stocks down today</div>
        </div>
        <div className="card" style={{ flex:1, minWidth:160 }}>
          <div className="card-title">Last Updated</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:16, marginTop:4 }}>
            {lastRefresh.toLocaleTimeString('en-IN')}
          </div>
          <div className="card-sub">Auto-refreshes every 10s</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <div className="search-bar" style={{ flex:1, minWidth:220 }}>
            <Search size={16} color="var(--text-muted)"/>
            <input
              placeholder="Search by symbol or company name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Filter size={14} color="var(--text-muted)"/>
            <select className="input-field" style={{ margin:0, width:'auto', minWidth:140 }}
              value={sector} onChange={e => setSector(e.target.value)}>
              <option value="">All Sectors</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-outline btn-sm" onClick={loadStocks}>
            <RefreshCw size={14}/> Refresh
          </button>
          {(search || sector) && (
            <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setSector(''); }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div className="card-title">Market Overview</div>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>
            {filtered.length} stocks shown
          </span>
        </div>

        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
            Loading market data...
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead><tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Company</th>
                <th>Sector</th>
                <th>Price (₹)</th>
                <th>Change</th>
                <th>Volume</th>
                <th>Market Cap</th>
                <th>Action</th>
              </tr></thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color:'var(--text-muted)', fontSize:12 }}>{i + 1}</td>
                    <td>
                      <span style={{ fontWeight:700, fontFamily:'var(--font-mono)', fontSize:15 }}>
                        {s.symbol}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight:500 }}>{s.company_name}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.exchange_name}</div>
                    </td>
                    <td>
                      <span className={`tag ${SECTOR_COLORS[s.sector] || 'tag-tech'}`}>
                        {s.sector}
                      </span>
                    </td>
                    <td style={{ fontFamily:'var(--font-mono)', fontWeight:600 }}>
                      ₹{Number(s.current_price).toLocaleString('en-IN', { minimumFractionDigits:2 })}
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        {s.change_percent >= 0
                          ? <TrendingUp size={13} color="var(--green)"/>
                          : <TrendingDown size={13} color="var(--red)"/>
                        }
                        <span className={s.change_percent >= 0 ? 'positive' : 'negative'} style={{ fontFamily:'var(--font-mono)', fontSize:13 }}>
                          {s.change_percent >= 0 ? '+' : ''}{s.change_percent.toFixed(2)}%
                        </span>
                      </div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                        {s.change >= 0 ? '+' : ''}₹{Number(s.change).toFixed(2)}
                      </div>
                    </td>
                    <td style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-secondary)' }}>
                      {s.volume ? (s.volume / 1000000).toFixed(2) + 'M' : '-'}
                    </td>
                    <td style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-secondary)' }}>
                      {s.market_cap ? '₹' + (s.market_cap / 1e12).toFixed(2) + 'T' : '-'}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/trade?symbol=${s.symbol}`)}
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                      No stocks found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
