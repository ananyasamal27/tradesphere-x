import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  LineElement, PointElement, LinearScale, CategoryScale, Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Wallet, TrendingUp, TrendingDown, BarChart2, ArrowUpRight } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale, Filler);

const CHART_OPTIONS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor:'#1a2540', titleColor:'#e8edf5', bodyColor:'#8899b4' } },
  scales: {
    x: { grid: { color:'rgba(30,45,71,0.5)' }, ticks: { color:'#4a5d7a', font:{ family:'DM Mono' } } },
    y: { grid: { color:'rgba(30,45,71,0.5)' }, ticks: { color:'#4a5d7a', font:{ family:'DM Mono' } } }
  }
};

function generateHistory(base, points = 12) {
  const labels = [];
  const data = [];
  const now = new Date();
  let val = base * 0.85;
  for (let i = points; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-IN', { month:'short', day:'numeric' }));
    val = val * (1 + (Math.random() - 0.46) * 0.04);
    data.push(parseFloat(val.toFixed(2)));
  }
  data[data.length - 1] = base;
  return { labels, data };
}

export default function Dashboard() {
  const { user, updateWallet } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartHistory, setChartHistory] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.investorId) return;
    try {
      const [portRes, stocksRes] = await Promise.all([
        api.get(`/portfolio/${user.investorId}`),
        api.get('/stocks')
      ]);
      setPortfolio(portRes.data);
      setStocks(stocksRes.data.slice(0, 6));
      if (portRes.data.summary?.total_value > 0) {
        setChartHistory(generateHistory(portRes.data.summary.total_value));
      }
      updateWallet(portRes.data.summary?.wallet_balance ?? user.wallet);
    } catch {}
    setLoading(false);
  }, [user?.investorId]);

  useEffect(() => { loadData(); }, [loadData]);

  const summary = portfolio?.summary || {};
  const holdings = portfolio?.holdings || [];
  const totalAssets = (summary.total_value || 0) + (summary.wallet_balance || 0);

  const donutData = {
    labels: holdings.slice(0,5).map(h => h.symbol),
    datasets: [{
      data: holdings.slice(0,5).map(h => parseFloat(h.current_value)),
      backgroundColor: ['#00d4aa','#2196f3','#ffd32a','#ff4757','#9c27b0'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const lineData = chartHistory ? {
    labels: chartHistory.labels,
    datasets: [{
      data: chartHistory.data,
      borderColor: '#00d4aa',
      backgroundColor: 'rgba(0,212,170,0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    }]
  } : null;

  const topGainers = [...stocks].sort((a,b) => b.change_percent - a.change_percent).slice(0,3);

  return (
    <Layout title="Dashboard">
      {/* Ticker strip */}
      <div className="ticker-strip" style={{ marginBottom:24, borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
        <div className="ticker-inner">
          {[...stocks, ...stocks].map((s, i) => (
            <div key={i} className="ticker-item">
              <span style={{ color:'var(--text-secondary)', fontWeight:600 }}>{s.symbol}</span>
              <span style={{ fontFamily:'var(--font-mono)' }}>₹{Number(s.current_price).toLocaleString('en-IN')}</span>
              <span className={s.change_percent >= 0 ? 'positive' : 'negative'} style={{ fontSize:11 }}>
                {s.change_percent >= 0 ? '▲' : '▼'} {Math.abs(s.change_percent).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:20 }}>
        <StatCard
          title="Wallet Balance"
          value={`₹${Number(summary.wallet_balance || user?.wallet || 0).toLocaleString('en-IN', { minimumFractionDigits:2 })}`}
          icon={Wallet}
          sub="Available to invest"
          color="rgba(0,212,170,0.2)"
        />
        <StatCard
          title="Portfolio Value"
          value={`₹${Number(summary.total_value || 0).toLocaleString('en-IN', { minimumFractionDigits:2 })}`}
          icon={BarChart2}
          change={summary.pnl_percent || 0}
          sub="Invested stocks"
          color="rgba(33,150,243,0.2)"
        />
        <StatCard
          title="Total P&L"
          value={`${summary.total_pnl >= 0 ? '+' : ''}₹${Number(summary.total_pnl || 0).toLocaleString('en-IN', { minimumFractionDigits:2 })}`}
          icon={summary.total_pnl >= 0 ? TrendingUp : TrendingDown}
          change={summary.pnl_percent || 0}
          sub="All time"
          color={summary.total_pnl >= 0 ? 'rgba(0,212,170,0.2)' : 'rgba(255,71,87,0.2)'}
        />
        <StatCard
          title="Net Worth"
          value={`₹${Number(totalAssets).toLocaleString('en-IN', { minimumFractionDigits:2 })}`}
          icon={TrendingUp}
          sub="Wallet + Portfolio"
          color="rgba(255,211,42,0.2)"
        />
      </div>

      {/* Charts row */}
      <div className="two-col" style={{ marginBottom:20 }}>
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div className="card-title">Portfolio Performance</div>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--font-mono)' }}>
                ₹{Number(summary.total_value || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <span className={summary.pnl_percent >= 0 ? 'badge-up' : 'badge-down'}>
              {summary.pnl_percent >= 0 ? '+' : ''}{(summary.pnl_percent || 0).toFixed(2)}%
            </span>
          </div>
          <div style={{ height: 180 }}>
            {lineData ? (
              <Line data={lineData} options={CHART_OPTIONS} />
            ) : (
              <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:14 }}>
                {loading ? 'Loading...' : 'No portfolio data yet. Buy some stocks!'}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom:16 }}>Holdings Distribution</div>
          {holdings.length > 0 ? (
            <>
              <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Doughnut data={donutData} options={{
                  ...CHART_OPTIONS,
                  cutout:'68%',
                  plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:'#1a2540' } }
                }} />
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:12 }}>
                {holdings.slice(0,5).map((h,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11 }}>
                    <div style={{ width:8,height:8,borderRadius:'50%',
                      background:['#00d4aa','#2196f3','#ffd32a','#ff4757','#9c27b0'][i] }}/>
                    <span style={{ color:'var(--text-secondary)' }}>{h.symbol}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:14 }}>
              No holdings yet
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="two-col">
        {/* Top Gainers */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="card-title">Top Movers Today</div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/market')}>View All</button>
          </div>
          <table className="data-table">
            <thead><tr>
              <th>Symbol</th><th>Price</th><th>Change</th><th></th>
            </tr></thead>
            <tbody>
              {topGainers.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{s.symbol}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.company_name?.split(' ').slice(0,2).join(' ')}</div>
                  </td>
                  <td style={{ fontFamily:'var(--font-mono)' }}>₹{Number(s.current_price).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={s.change_percent >= 0 ? 'badge-up' : 'badge-down'}>
                      {s.change_percent >= 0 ? '+' : ''}{s.change_percent.toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/trade?symbol=${s.symbol}`)}>Buy</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Holdings */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="card-title">My Holdings</div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/portfolio')}>Full View</button>
          </div>
          {holdings.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {holdings.slice(0,4).map(h => (
                <div key={h.stock_id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 12px', background:'var(--bg-elevated)', borderRadius:'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{h.symbol}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{h.quantity} shares</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:14 }}>
                      ₹{Number(h.current_value).toLocaleString('en-IN', { minimumFractionDigits:2 })}
                    </div>
                    <div style={{ fontSize:11 }} className={h.pnl >= 0 ? 'positive' : 'negative'}>
                      {h.pnl >= 0 ? '+' : ''}₹{Number(h.pnl).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:180, gap:12 }}>
              <BarChart2 size={40} color="var(--text-muted)" />
              <p style={{ color:'var(--text-muted)', fontSize:14 }}>No holdings yet</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/market')}>
                <ArrowUpRight size={14}/> Start Trading
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
