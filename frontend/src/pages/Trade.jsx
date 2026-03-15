import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale,
  CategoryScale, Filler, Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { QrCode, TrendingUp, TrendingDown, ShoppingCart, ArrowDownCircle, X } from 'lucide-react';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

function generatePriceHistory(price, points = 20) {
  const labels = [];
  const data = [];
  let val = price * 0.92;
  for (let i = points; i >= 0; i--) {
    const t = new Date();
    t.setMinutes(t.getMinutes() - i * 15);
    labels.push(t.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }));
    val = val * (1 + (Math.random() - 0.47) * 0.015);
    data.push(parseFloat(val.toFixed(2)));
  }
  data[data.length - 1] = price;
  return { labels, data };
}

export default function Trade() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateWallet } = useAuth();
  const [symbol, setSymbol] = useState(params.get('symbol') || '');
  const [stock, setStock] = useState(null);
  const [allStocks, setAllStocks] = useState([]);
  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState('buy');
  const [loading, setLoading] = useState(false);
  const [priceHistory, setPriceHistory] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    api.get('/stocks').then(r => setAllStocks(r.data)).catch(() => {});
    api.get(`/portfolio/${user?.investorId}`).then(r => setPortfolio(r.data)).catch(() => {});
  }, [user?.investorId]);

  useEffect(() => {
    if (symbol) loadStock(symbol);
  }, [symbol]);

  const loadStock = async (sym) => {
    try {
      const res = await api.get(`/stocks/${sym}`);
      setStock(res.data);
      setPriceHistory(generatePriceHistory(res.data.current_price));
    } catch {
      toast.error('Stock not found');
      setStock(null);
    }
  };

  // Auto-refresh stock price every 10s
  useEffect(() => {
    if (!symbol) return;
    const interval = setInterval(() => loadStock(symbol), 10000);
    return () => clearInterval(interval);
  }, [symbol]);

  // QR Scanner
  useEffect(() => {
    if (!showQR) return;
    let scanner;
    const initQR = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 200 });
        scanner.render(
          (decoded) => {
            const match = decoded.match(/symbol=([A-Z]+)/);
            if (match) {
              setSymbol(match[1]);
              setShowQR(false);
              toast.success(`Scanned: ${match[1]}`);
            }
            scanner.clear().catch(() => {});
          },
          (err) => {}
        );
      } catch {}
    };
    initQR();
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [showQR]);

  const totalCost = stock ? (stock.current_price * qty).toFixed(2) : 0;
  const fee = stock ? (stock.current_price * qty * 0.002).toFixed(2) : 0;
  const totalWithFee = stock ? (parseFloat(totalCost) + parseFloat(fee)).toFixed(2) : 0;

  const holding = portfolio?.holdings?.find(h => h.symbol === symbol);

  const handleTrade = async () => {
    if (!stock || qty <= 0) return toast.error('Enter valid quantity');
    setLoading(true);
    try {
      const endpoint = mode === 'buy' ? '/buy' : '/sell';
      const res = await api.post(endpoint, { stock_id: stock.id, quantity: parseInt(qty) });
      toast.success(res.data.message);
      updateWallet(res.data.wallet_balance);
      api.get(`/portfolio/${user?.investorId}`).then(r => setPortfolio(r.data)).catch(() => {});
      loadStock(symbol);
      setQty(1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Trade failed');
    }
    setLoading(false);
  };

  const chartData = priceHistory ? {
    labels: priceHistory.labels,
    datasets: [{
      data: priceHistory.data,
      borderColor: stock?.change_percent >= 0 ? '#00d4aa' : '#ff4757',
      backgroundColor: stock?.change_percent >= 0 ? 'rgba(0,212,170,0.08)' : 'rgba(255,71,87,0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }]
  } : null;

  return (
    <Layout title="Trade">
      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:20 }}>

        {/* Left panel */}
        <div>
          {/* Stock selector */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div className="search-bar" style={{ flex:1 }}>
                <TrendingUp size={16} color="var(--text-muted)"/>
                <input
                  placeholder="Type a stock symbol (e.g. TCS, RELIANCE)..."
                  value={symbol}
                  onChange={e => setSymbol(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && loadStock(symbol)}
                />
              </div>
              <button className="btn btn-primary" onClick={() => loadStock(symbol)}>Go</button>
              <button className="btn btn-outline" onClick={() => setShowQR(true)} title="Scan QR Code">
                <QrCode size={16}/>
              </button>
            </div>
            {/* Quick picks */}
            <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
              {allStocks.slice(0,8).map(s => (
                <button
                  key={s.id}
                  className={`btn btn-sm ${symbol === s.symbol ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSymbol(s.symbol)}
                >
                  {s.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Stock detail + chart */}
          {stock && (
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                    <h2 style={{ fontSize:24, fontWeight:800 }}>{stock.symbol}</h2>
                    <span className={`tag ${stock.sector === 'Technology' ? 'tag-tech' : stock.sector === 'Finance' ? 'tag-finance' : 'tag-energy'}`}>
                      {stock.sector}
                    </span>
                  </div>
                  <div style={{ color:'var(--text-secondary)', fontSize:14 }}>{stock.company_name}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:28, fontWeight:600 }}>
                    ₹{Number(stock.current_price).toLocaleString('en-IN', { minimumFractionDigits:2 })}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end', marginTop:4 }}>
                    {stock.change_percent >= 0
                      ? <TrendingUp size={14} color="var(--green)"/>
                      : <TrendingDown size={14} color="var(--red)"/>
                    }
                    <span className={stock.change_percent >= 0 ? 'badge-up' : 'badge-down'}>
                      {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                    </span>
                    <span style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'var(--font-mono)' }}>
                      ({stock.change >= 0 ? '+' : ''}₹{Number(stock.change).toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              {/* OHLC */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
                {[['Open', stock.open_price], ['High', stock.high_price], ['Low', stock.low_price], ['Prev Close', stock.previous_close]].map(([label, val]) => (
                  <div key={label} style={{ background:'var(--bg-elevated)', borderRadius:8, padding:'8px 12px' }}>
                    <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:14 }}>
                      ₹{val ? Number(val).toLocaleString('en-IN') : '-'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              {chartData && (
                <div style={{ height:200 }}>
                  <Line data={chartData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend:{display:false}, tooltip:{ backgroundColor:'#1a2540' } },
                    scales: {
                      x: { grid:{color:'rgba(30,45,71,0.5)'}, ticks:{color:'#4a5d7a', font:{family:'DM Mono', size:10}, maxTicksLimit:8} },
                      y: { grid:{color:'rgba(30,45,71,0.5)'}, ticks:{color:'#4a5d7a', font:{family:'DM Mono'}} }
                    }
                  }}/>
                </div>
              )}

              {holding && (
                <div style={{ marginTop:16, padding:'12px 16px', background:'var(--accent-dim)',
                  border:'1px solid rgba(0,212,170,0.2)', borderRadius:10 }}>
                  <div style={{ fontSize:12, color:'var(--accent)', marginBottom:4 }}>Your Position</div>
                  <div style={{ display:'flex', gap:24 }}>
                    <div>
                      <span style={{ color:'var(--text-muted)', fontSize:12 }}>Qty: </span>
                      <span style={{ fontFamily:'var(--font-mono)', fontWeight:600 }}>{holding.quantity}</span>
                    </div>
                    <div>
                      <span style={{ color:'var(--text-muted)', fontSize:12 }}>Avg: </span>
                      <span style={{ fontFamily:'var(--font-mono)' }}>₹{Number(holding.avg_buy_price).toFixed(2)}</span>
                    </div>
                    <div>
                      <span style={{ color:'var(--text-muted)', fontSize:12 }}>P&L: </span>
                      <span className={holding.pnl >= 0 ? 'positive' : 'negative'} style={{ fontFamily:'var(--font-mono)' }}>
                        {holding.pnl >= 0 ? '+' : ''}₹{Number(holding.pnl).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!stock && !symbol && (
            <div className="card" style={{ textAlign:'center', padding:60 }}>
              <TrendingUp size={48} color="var(--text-muted)" style={{ marginBottom:16 }}/>
              <p style={{ color:'var(--text-muted)' }}>Search for a stock symbol above to begin trading</p>
            </div>
          )}
        </div>

        {/* Right panel - Order form */}
        <div>
          <div className="card" style={{ position:'sticky', top:80 }}>
            <div className="card-title" style={{ marginBottom:16 }}>Place Order</div>

            {/* Buy/Sell toggle */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'var(--bg-elevated)',
              borderRadius:10, padding:4, marginBottom:20 }}>
              <button
                className="btn"
                style={{ justifyContent:'center', borderRadius:8,
                  background: mode==='buy' ? 'var(--accent)' : 'transparent',
                  color: mode==='buy' ? '#000' : 'var(--text-secondary)' }}
                onClick={() => setMode('buy')}
              >
                <ShoppingCart size={14}/> Buy
              </button>
              <button
                className="btn"
                style={{ justifyContent:'center', borderRadius:8,
                  background: mode==='sell' ? 'var(--red)' : 'transparent',
                  color: mode==='sell' ? '#fff' : 'var(--text-secondary)' }}
                onClick={() => setMode('sell')}
              >
                <ArrowDownCircle size={14}/> Sell
              </button>
            </div>

            {stock ? (
              <>
                <div style={{ padding:'12px 16px', background:'var(--bg-elevated)', borderRadius:10, marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-muted)', fontSize:13 }}>{stock.symbol}</span>
                    <span style={{ fontFamily:'var(--font-mono)', color:'var(--accent)' }}>
                      ₹{Number(stock.current_price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Quantity</label>
                  <input className="input-field" type="number" min="1"
                    value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
                </div>

                {/* Quick qty */}
                <div style={{ display:'flex', gap:6, marginBottom:16 }}>
                  {[1,5,10,25].map(v => (
                    <button key={v} className="btn btn-outline btn-sm" onClick={() => setQty(v)}>
                      {v}
                    </button>
                  ))}
                </div>

                {/* Order summary */}
                <div style={{ background:'var(--bg-elevated)', borderRadius:10, padding:16, marginBottom:16 }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {[
                      ['Price per share', `₹${Number(stock.current_price).toLocaleString('en-IN')}`],
                      ['Quantity', qty],
                      ['Sub Total', `₹${Number(totalCost).toLocaleString('en-IN')}`],
                      ['Brokerage (0.2%)', `₹${fee}`],
                    ].map(([k,v]) => (
                      <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                        <span style={{ color:'var(--text-muted)' }}>{k}</span>
                        <span style={{ fontFamily:'var(--font-mono)' }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ borderTop:'1px solid var(--border)', paddingTop:8, display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontWeight:600 }}>Total {mode === 'buy' ? 'Cost' : 'Proceeds'}</span>
                      <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--accent)', fontSize:16 }}>
                        ₹{mode === 'buy' ? totalWithFee : (parseFloat(totalCost) - parseFloat(fee)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Wallet balance */}
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, fontSize:13 }}>
                  <span style={{ color:'var(--text-muted)' }}>Available Balance</span>
                  <span style={{ fontFamily:'var(--font-mono)', color:'var(--accent)' }}>
                    ₹{Number(user?.wallet || 0).toLocaleString('en-IN', { minimumFractionDigits:2 })}
                  </span>
                </div>

                <button
                  className="btn"
                  disabled={loading}
                  onClick={handleTrade}
                  style={{
                    width:'100%', justifyContent:'center', padding:'13px',
                    fontSize:15, fontWeight:700, borderRadius:10,
                    background: mode==='buy' ? 'var(--accent)' : 'var(--red)',
                    color: mode==='buy' ? '#000' : '#fff',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Processing...' : `${mode === 'buy' ? '🟢 Buy' : '🔴 Sell'} ${qty} × ${stock.symbol}`}
                </button>
              </>
            ) : (
              <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                <p>Select a stock to trade</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3>📷 Scan QR Code</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowQR(false)}>
                <X size={14}/>
              </button>
            </div>
            <div id="qr-reader" style={{ width:'100%' }}></div>
            <p style={{ textAlign:'center', color:'var(--text-muted)', fontSize:12, marginTop:12 }}>
              Scan a QR code containing a stock URL with ?symbol=TICKER
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
