import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, TrendingUp, TrendingDown, RefreshCw, Crown } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaderboard');
      setData(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const myRank = data.find(d => d.id === user?.investorId);

  const medals = ['🥇','🥈','🥉'];

  return (
    <Layout title="Leaderboard">
      {/* Top 3 podium */}
      {data.length >= 3 && (
        <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:28, alignItems:'flex-end', flexWrap:'wrap' }}>
          {/* 2nd place */}
          <div style={{ textAlign:'center', width:160 }}>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
              borderRadius:'var(--radius)', padding:'20px 16px', position:'relative',
              borderColor:'rgba(192,192,192,0.3)' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🥈</div>
              <div style={{ width:48, height:48, borderRadius:'50%',
                background:'linear-gradient(135deg, #c0c0c0, #a0a0a0)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, fontWeight:700, margin:'0 auto 10px' }}>
                {data[1].name.charAt(0)}
              </div>
              <div style={{ fontWeight:600, fontSize:14 }}>{data[1].name}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#c0c0c0', marginTop:4 }}>
                ₹{Number(data[1].net_worth).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* 1st place */}
          <div style={{ textAlign:'center', width:180 }}>
            <div style={{ background:'var(--bg-card)', border:'2px solid rgba(255,215,0,0.5)',
              borderRadius:'var(--radius)', padding:'24px 16px', position:'relative',
              boxShadow:'0 0 30px rgba(255,215,0,0.15)' }}>
              <Crown size={20} color="#ffd700" style={{ position:'absolute', top:12, right:12 }}/>
              <div style={{ fontSize:36, marginBottom:8 }}>🥇</div>
              <div style={{ width:56, height:56, borderRadius:'50%',
                background:'linear-gradient(135deg, #ffd700, #ff9800)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:22, fontWeight:700, margin:'0 auto 10px' }}>
                {data[0].name.charAt(0)}
              </div>
              <div style={{ fontWeight:700, fontSize:16 }}>{data[0].name}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'#ffd700', marginTop:4 }}>
                ₹{Number(data[0].net_worth).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* 3rd place */}
          <div style={{ textAlign:'center', width:160 }}>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
              borderRadius:'var(--radius)', padding:'20px 16px',
              borderColor:'rgba(205,127,50,0.3)' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🥉</div>
              <div style={{ width:48, height:48, borderRadius:'50%',
                background:'linear-gradient(135deg, #cd7f32, #a0522d)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, fontWeight:700, margin:'0 auto 10px' }}>
                {data[2].name.charAt(0)}
              </div>
              <div style={{ fontWeight:600, fontSize:14 }}>{data[2].name}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#cd7f32', marginTop:4 }}>
                ₹{Number(data[2].net_worth).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My rank banner */}
      {myRank && (
        <div style={{ background:'var(--accent-dim)', border:'1px solid rgba(0,212,170,0.2)',
          borderRadius:'var(--radius)', padding:'14px 20px', marginBottom:20,
          display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Trophy size={20} color="var(--accent)"/>
            <span style={{ fontWeight:600 }}>Your Ranking</span>
          </div>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            <div>
              <span style={{ color:'var(--text-muted)', fontSize:12 }}>Rank: </span>
              <span style={{ fontFamily:'var(--font-mono)', color:'var(--accent)', fontWeight:700 }}>#{myRank.rank}</span>
            </div>
            <div>
              <span style={{ color:'var(--text-muted)', fontSize:12 }}>Net Worth: </span>
              <span style={{ fontFamily:'var(--font-mono)' }}>₹{Number(myRank.net_worth).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span style={{ color:'var(--text-muted)', fontSize:12 }}>P&L: </span>
              <span className={myRank.pnl >= 0 ? 'positive' : 'negative'} style={{ fontFamily:'var(--font-mono)' }}>
                {myRank.pnl >= 0 ? '+' : ''}₹{Number(myRank.pnl).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Full leaderboard table */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div className="card-title">Top Investors — All Time</div>
          <button className="btn btn-outline btn-sm" onClick={load}>
            <RefreshCw size={13}/> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Loading rankings...</div>
        ) : (
          <table className="data-table">
            <thead><tr>
              <th>Rank</th>
              <th>Investor</th>
              <th>Portfolio Value</th>
              <th>Wallet</th>
              <th>Net Worth</th>
              <th>P&L</th>
            </tr></thead>
            <tbody>
              {data.map(inv => {
                const isMe = inv.id === user?.investorId;
                return (
                  <tr key={inv.id} style={isMe ? { background:'var(--accent-dim)' } : {}}>
                    <td>
                      <span style={{ fontFamily:'var(--font-mono)', fontWeight:700,
                        color: inv.rank <= 3 ? ['#ffd700','#c0c0c0','#cd7f32'][inv.rank-1] : 'var(--text-secondary)' }}>
                        {medals[inv.rank - 1] || `#${inv.rank}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%',
                          background: isMe ? 'linear-gradient(135deg, var(--accent), #0099cc)' : 'linear-gradient(135deg, #2a3a5a, #1a2540)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:13, fontWeight:700 }}>
                          {inv.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:14 }}>
                            {inv.name} {isMe && <span style={{ color:'var(--accent)', fontSize:11 }}>(You)</span>}
                          </div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{inv.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily:'var(--font-mono)' }}>
                      ₹{Number(inv.portfolio_value).toLocaleString('en-IN', { minimumFractionDigits:2 })}
                    </td>
                    <td style={{ fontFamily:'var(--font-mono)' }}>
                      ₹{Number(inv.wallet_balance).toLocaleString('en-IN', { minimumFractionDigits:2 })}
                    </td>
                    <td style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--accent)' }}>
                      ₹{Number(inv.net_worth).toLocaleString('en-IN', { minimumFractionDigits:2 })}
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        {inv.pnl >= 0
                          ? <TrendingUp size={13} color="var(--green)"/>
                          : <TrendingDown size={13} color="var(--red)"/>
                        }
                        <span className={inv.pnl >= 0 ? 'positive' : 'negative'} style={{ fontFamily:'var(--font-mono)', fontSize:13 }}>
                          {inv.pnl >= 0 ? '+' : ''}₹{Number(inv.pnl).toFixed(2)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                  No investors found
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
