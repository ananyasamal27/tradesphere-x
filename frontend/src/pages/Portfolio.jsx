import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale, Filler, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale, Filler, BarElement);

const COLORS = ['#00d4aa','#2196f3','#ffd32a','#ff4757','#9c27b0','#ff9800','#00bcd4','#8bc34a'];

export default function Portfolio() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get(`/portfolio/${user?.investorId}`);
      setData(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.investorId]);

  if (loading) return <Layout title="Portfolio"><div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading portfolio...</div></Layout>;

  const holdings = data?.holdings || [];
  const summary = data?.summary || {};

  const donutData = {
    labels: holdings.map(h => h.symbol),
    datasets: [{
      data: holdings.map(h => parseFloat(h.current_value)),
      backgroundColor: COLORS.slice(0, holdings.length),
      borderWidth: 0, hoverOffset: 8,
    }]
  };

  const barData = {
    labels: holdings.map(h => h.symbol),
    datasets: [
      {
        label: 'Invested',
        data: holdings.map(h => parseFloat(h.invested_value)),
        backgroundColor: 'rgba(33,150,243,0.6)',
        borderRadius: 6,
      },
      {
        label: 'Current Value',
        data: holdings.map(h => parseFloat(h.current_value)),
        backgroundColor: holdings.map(h => h.pnl >= 0 ? 'rgba(0,212,170,0.7)' : 'rgba(255,71,87,0.7)'),
        borderRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color:'#8899b4', font: { family:'DM Mono', size:11 } } },
      tooltip: { backgroundColor:'#1a2540', titleColor:'#e8edf5', bodyColor:'#8899b4' }
    },
    scales: {
      x: { grid:{color:'rgba(30,45,71,0.5)'}, ticks:{color:'#4a5d7a', font:{family:'DM Mono'}} },
      y: { grid:{color:'rgba(30,45,71,0.5)'}, ticks:{color:'#4a5d7a', font:{family:'DM Mono'}} }
    }
  };

  return (
    <Layout title="Portfolio Analytics">
      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom:20 }}>
        {[
          { label:'Portfolio Value', val:`₹${Number(summary.total_value||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`, color:'var(--accent)' },
          { label:'Total Invested', val:`₹${Number(summary.total_invested||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`, color:'#2196f3' },
          { label:'Total P&L', val:`${summary.total_pnl>=0?'+':''}₹${Number(summary.total_pnl||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`, color: summary.total_pnl>=0?'var(--green)':'var(--red)' },
          { label:'P&L %', val:`${summary.pnl_percent>=0?'+':''}${(summary.pnl_percent||0).toFixed(2)}%`, color: summary.pnl_percent>=0?'var(--green)':'var(--red)' },
        ].map(item => (
          <div key={item.label} className="card card-glow">
            <div className="card-title">{item.label}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:22, fontWeight:600, color:item.color, marginTop:8 }}>
              {item.val}
            </div>
          </div>
        ))}
      </div>

      {holdings.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:80 }}>
          <TrendingUp size={56} color="var(--text-muted)" style={{ marginBottom:16 }}/>
          <p style={{ color:'var(--text-muted)', fontSize:16 }}>Your portfolio is empty</p>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:8 }}>Buy stocks from the Market or Trade page</p>
        </div>
      ) : (
        <>
          <div className="two-col" style={{ marginBottom:20 }}>
            {/* Donut chart */}
            <div className="card">
              <div className="card-title" style={{ marginBottom:16 }}>Holdings Distribution</div>
              <div style={{ height:260, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Doughnut data={donutData} options={{
                  ...chartOptions,
                  cutout:'65%',
                  plugins:{ legend:{ position:'right', labels:{ color:'#8899b4', font:{family:'DM Mono',size:11} }  } ,
                  tooltip:{backgroundColor:'#1a2540'} }
                }}/>
              </div>
            </div>

            {/* Bar chart */}
            <div className="card">
              <div className="card-title" style={{ marginBottom:16 }}>Invested vs Current Value</div>
              <div style={{ height:260 }}>
                <Bar data={barData} options={chartOptions}/>
              </div>
            </div>
          </div>

          {/* Holdings table */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div className="card-title">Stock Holdings</div>
              <button className="btn btn-outline btn-sm" onClick={load}>
                <RefreshCw size={13}/> Refresh
              </button>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead><tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Sector</th>
                  <th>Qty</th>
                  <th>Avg Price</th>
                  <th>Current Price</th>
                  <th>Invested</th>
                  <th>Current Value</th>
                  <th>P&L</th>
                  <th>P&L %</th>
                  <th>Allocation</th>
                </tr></thead>
                <tbody>
                  {holdings.map(h => {
                    const alloc = summary.total_value > 0 ? (parseFloat(h.current_value) / summary.total_value * 100).toFixed(1) : 0;
                    return (
                      <tr key={h.stock_id}>
                        <td style={{ fontWeight:700, fontFamily:'var(--font-mono)' }}>{h.symbol}</td>
                        <td style={{ fontSize:13 }}>{h.company_name}</td>
                        <td><span className="tag tag-tech" style={{ fontSize:10 }}>{h.sector}</span></td>
                        <td style={{ fontFamily:'var(--font-mono)' }}>{h.quantity}</td>
                        <td style={{ fontFamily:'var(--font-mono)' }}>₹{Number(h.avg_buy_price).toFixed(2)}</td>
                        <td style={{ fontFamily:'var(--font-mono)' }}>₹{Number(h.current_price).toLocaleString('en-IN')}</td>
                        <td style={{ fontFamily:'var(--font-mono)' }}>₹{Number(h.invested_value).toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                        <td style={{ fontFamily:'var(--font-mono)' }}>₹{Number(h.current_value).toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                            {h.pnl >= 0 ? <TrendingUp size={12} color="var(--green)"/> : <TrendingDown size={12} color="var(--red)"/>}
                            <span className={h.pnl >= 0 ? 'positive' : 'negative'} style={{ fontFamily:'var(--font-mono)', fontSize:13 }}>
                              {h.pnl >= 0 ? '+' : ''}₹{Number(h.pnl).toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={h.pnl_percent >= 0 ? 'badge-up' : 'badge-down'}>
                            {h.pnl_percent >= 0 ? '+' : ''}{Number(h.pnl_percent).toFixed(2)}%
                          </span>
                        </td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div className="progress-bar" style={{ flex:1, minWidth:60 }}>
                              <div className="progress-fill" style={{ width:`${alloc}%` }}/>
                            </div>
                            <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)', minWidth:32 }}>
                              {alloc}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
