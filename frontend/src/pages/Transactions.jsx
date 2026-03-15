import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowUpCircle, ArrowDownCircle, Filter } from 'lucide-react';

export default function Transactions() {
  const { user } = useAuth();
  const [txns, setTxns] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get(`/transactions/${user?.investorId}`)
      .then(r => { setTxns(r.data); setFiltered(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.investorId]);

  useEffect(() => {
    let res = txns;
    if (typeFilter !== 'all') res = res.filter(t => t.type === typeFilter);
    if (search) res = res.filter(t =>
      t.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      t.company_name?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(res);
  }, [txns, typeFilter, search]);

  const totalBought = txns.filter(t => t.type === 'buy').reduce((s, t) => s + parseFloat(t.total_amount), 0);
  const totalSold = txns.filter(t => t.type === 'sell').reduce((s, t) => s + parseFloat(t.total_amount), 0);
  const totalFees = txns.reduce((s, t) => s + parseFloat(t.fee || 0), 0);

  return (
    <Layout title="Transaction History">
      {/* Stats */}
      <div className="three-col" style={{ marginBottom:20 }}>
        <div className="card">
          <div className="card-title">Total Bought</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:22, color:'var(--red)', marginTop:8 }}>
            ₹{totalBought.toLocaleString('en-IN', { minimumFractionDigits:2 })}
          </div>
          <div className="card-sub">{txns.filter(t=>t.type==='buy').length} buy orders</div>
        </div>
        <div className="card">
          <div className="card-title">Total Sold</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:22, color:'var(--green)', marginTop:8 }}>
            ₹{totalSold.toLocaleString('en-IN', { minimumFractionDigits:2 })}
          </div>
          <div className="card-sub">{txns.filter(t=>t.type==='sell').length} sell orders</div>
        </div>
        <div className="card">
          <div className="card-title">Total Fees Paid</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:22, color:'var(--yellow)', marginTop:8 }}>
            ₹{totalFees.toLocaleString('en-IN', { minimumFractionDigits:2 })}
          </div>
          <div className="card-sub">Brokerage charges</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
          <div className="search-bar" style={{ flex:1, minWidth:200 }}>
            <Filter size={14} color="var(--text-muted)"/>
            <input placeholder="Search by symbol or company..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {['all','buy','sell'].map(t => (
              <button
                key={t}
                className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTypeFilter(t)}
              >
                {t === 'all' ? 'All' : t === 'buy' ? '🟢 Buy' : '🔴 Sell'}
              </button>
            ))}
          </div>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{filtered.length} records</span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>
            <ArrowUpCircle size={48} style={{ marginBottom:12, opacity:0.3 }}/>
            <p>No transactions found</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead><tr>
                <th>#</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Company</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Date & Time</th>
              </tr></thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id}>
                    <td style={{ color:'var(--text-muted)', fontSize:12 }}>{i + 1}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {t.type === 'buy'
                          ? <ArrowUpCircle size={14} color="var(--red)"/>
                          : <ArrowDownCircle size={14} color="var(--green)"/>
                        }
                        <span className={t.type === 'buy' ? 'badge-down' : 'badge-up'} style={{
                          color: t.type === 'buy' ? 'var(--red)' : 'var(--green)',
                          background: t.type === 'buy' ? 'var(--red-dim)' : 'var(--green-dim)'
                        }}>
                          {t.type.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight:700, fontFamily:'var(--font-mono)' }}>{t.symbol}</td>
                    <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{t.company_name}</td>
                    <td style={{ fontFamily:'var(--font-mono)' }}>{t.quantity}</td>
                    <td style={{ fontFamily:'var(--font-mono)' }}>₹{Number(t.price).toLocaleString('en-IN')}</td>
                    <td style={{ fontFamily:'var(--font-mono)', fontWeight:600 }}>
                      ₹{Number(t.total_amount).toLocaleString('en-IN', { minimumFractionDigits:2 })}
                    </td>
                    <td style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-muted)' }}>
                      ₹{Number(t.fee||0).toFixed(2)}
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)' }}>
                      {new Date(t.created_at).toLocaleString('en-IN', {
                        day:'2-digit', month:'short', year:'numeric',
                        hour:'2-digit', minute:'2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
