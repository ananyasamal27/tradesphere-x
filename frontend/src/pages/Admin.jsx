import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, RefreshCw, Shield, TrendingUp, Users, Activity } from 'lucide-react';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const [newStock, setNewStock] = useState({ company_name:'', sector:'', symbol:'', current_price:'', exchange_id:1 });
  const [priceUpdate, setPriceUpdate] = useState({ symbol:'', price:'' });
  const [newCompany, setNewCompany] = useState({ name:'', sector:'', description:'', headquarters:'', website:'' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [statsRes, compsRes, stocksRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/companies'),
        api.get('/stocks'),
      ]);
      setStats(statsRes.data);
      setCompanies(compsRes.data);
      setStocks(stocksRes.data);
    } catch {}
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/stocks/add-stock', newStock);
      toast.success('Stock added successfully!');
      setNewStock({ company_name:'', sector:'', symbol:'', current_price:'', exchange_id:1 });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add stock');
    }
    setLoading(false);
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/stocks/${priceUpdate.symbol.toUpperCase()}/price`, { price: parseFloat(priceUpdate.price) });
      toast.success(`Price updated for ${priceUpdate.symbol}`);
      setPriceUpdate({ symbol:'', price:'' });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update price');
    }
    setLoading(false);
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/company', newCompany);
      toast.success('Company added!');
      setNewCompany({ name:'', sector:'', description:'', headquarters:'', website:'' });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add company');
    }
    setLoading(false);
  };

  const TABS = [
    { id:'overview', label:'Overview', icon:Activity },
    { id:'stocks', label:'Manage Stocks', icon:TrendingUp },
    { id:'companies', label:'Manage Companies', icon:Shield },
    { id:'price', label:'Update Prices', icon:RefreshCw },
  ];

  return (
    <Layout title="Admin Panel">
      {/* Admin badge */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20,
        padding:'10px 16px', background:'rgba(255,71,87,0.08)', border:'1px solid rgba(255,71,87,0.2)',
        borderRadius:'var(--radius)', width:'fit-content' }}>
        <Shield size={16} color="var(--red)"/>
        <span style={{ fontSize:13, color:'var(--red)', fontWeight:600 }}>Administrator Access</span>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--bg-secondary)',
        padding:4, borderRadius:10, border:'1px solid var(--border)', width:'fit-content' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="btn btn-sm"
            style={{ gap:6, background: activeTab===tab.id ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab===tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              border: activeTab===tab.id ? '1px solid var(--border-light)' : '1px solid transparent' }}>
            <tab.icon size={13}/> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && stats && (
        <div>
          <div className="stats-grid" style={{ marginBottom:20 }}>
            {[
              { label:'Total Investors', val:stats.total_investors, icon:Users, color:'rgba(33,150,243,0.2)' },
              { label:'Total Stocks', val:stats.total_stocks, icon:TrendingUp, color:'rgba(0,212,170,0.2)' },
              { label:'Total Transactions', val:stats.total_transactions, icon:Activity, color:'rgba(255,211,42,0.2)' },
              { label:'Trading Volume', val:`₹${Number(stats.total_volume||0).toLocaleString('en-IN',{maximumFractionDigits:0})}`, icon:Shield, color:'rgba(255,71,87,0.2)' },
            ].map(s => (
              <div key={s.label} className="card card-glow">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div className="card-title">{s.label}</div>
                  <div style={{ width:34, height:34, background:s.color, borderRadius:8,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <s.icon size={16} color="var(--text-secondary)"/>
                  </div>
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:26, fontWeight:600, marginTop:10 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Recent trades */}
          <div className="card">
            <div className="card-title" style={{ marginBottom:16 }}>Recent Trades</div>
            <table className="data-table">
              <thead><tr><th>Type</th><th>Investor</th><th>Symbol</th><th>Qty</th><th>Amount</th><th>Time</th></tr></thead>
              <tbody>
                {(stats.recent_trades||[]).map(t => (
                  <tr key={t.id}>
                    <td><span className={t.type==='buy' ? 'badge-down' : 'badge-up'}
                      style={{ color:t.type==='buy'?'var(--red)':'var(--green)',
                        background:t.type==='buy'?'var(--red-dim)':'var(--green-dim)' }}>
                      {t.type.toUpperCase()}
                    </span></td>
                    <td style={{ fontSize:13 }}>{t.investor_name}</td>
                    <td style={{ fontFamily:'var(--font-mono)', fontWeight:600 }}>{t.symbol}</td>
                    <td style={{ fontFamily:'var(--font-mono)' }}>{t.quantity}</td>
                    <td style={{ fontFamily:'var(--font-mono)' }}>₹{Number(t.total_amount).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>
                      {new Date(t.created_at).toLocaleString('en-IN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add stock tab */}
      {activeTab === 'stocks' && (
        <div className="two-col">
          <div className="card">
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <Plus size={16} color="var(--accent)"/>
              <div className="card-title" style={{ marginBottom:0 }}>Add New Stock</div>
            </div>
            <form onSubmit={handleAddStock}>
              {[
                ['company_name', 'Company Name', 'text', 'Tata Motors Limited'],
                ['sector', 'Sector', 'text', 'Automotive'],
                ['symbol', 'Stock Symbol', 'text', 'TATAMOTORS'],
                ['current_price', 'Current Price (₹)', 'number', '890.50'],
              ].map(([key, label, type, placeholder]) => (
                <div key={key} className="input-group">
                  <label className="input-label">{label}</label>
                  <input className="input-field" type={type} placeholder={placeholder}
                    value={newStock[key]} onChange={e => setNewStock({...newStock, [key]: e.target.value})} required />
                </div>
              ))}
              <div className="input-group">
                <label className="input-label">Exchange</label>
                <select className="input-field" value={newStock.exchange_id}
                  onChange={e => setNewStock({...newStock, exchange_id: e.target.value})}>
                  <option value={1}>NSE</option>
                  <option value={2}>BSE</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', justifyContent:'center' }}>
                <Plus size={14}/> {loading ? 'Adding...' : 'Add Stock'}
              </button>
            </form>
          </div>

          {/* Current stocks list */}
          <div className="card">
            <div className="card-title" style={{ marginBottom:16 }}>All Stocks ({stocks.length})</div>
            <div style={{ maxHeight:460, overflowY:'auto' }}>
              <table className="data-table">
                <thead><tr><th>Symbol</th><th>Company</th><th>Price</th></tr></thead>
                <tbody>
                  {stocks.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontFamily:'var(--font-mono)', fontWeight:600 }}>{s.symbol}</td>
                      <td style={{ fontSize:12 }}>{s.company_name}</td>
                      <td style={{ fontFamily:'var(--font-mono)', fontSize:13 }}>₹{Number(s.current_price).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Companies tab */}
      {activeTab === 'companies' && (
        <div className="two-col">
          <div className="card">
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <Plus size={16} color="var(--accent)"/>
              <div className="card-title" style={{ marginBottom:0 }}>Add New Company</div>
            </div>
            <form onSubmit={handleAddCompany}>
              {[
                ['name', 'Company Name', 'text', 'Tata Motors Limited'],
                ['sector', 'Sector', 'text', 'Automotive'],
                ['headquarters', 'Headquarters', 'text', 'Mumbai, India'],
                ['website', 'Website', 'url', 'https://tatamotors.com'],
              ].map(([key, label, type, placeholder]) => (
                <div key={key} className="input-group">
                  <label className="input-label">{label}</label>
                  <input className="input-field" type={type} placeholder={placeholder}
                    value={newCompany[key]} onChange={e => setNewCompany({...newCompany, [key]: e.target.value})}
                    required={key === 'name'} />
                </div>
              ))}
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" rows={3} placeholder="Company description..."
                  value={newCompany.description} onChange={e => setNewCompany({...newCompany, description: e.target.value})}
                  style={{ resize:'vertical' }}/>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', justifyContent:'center' }}>
                <Plus size={14}/> {loading ? 'Adding...' : 'Add Company'}
              </button>
            </form>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom:16 }}>All Companies ({companies.length})</div>
            <div style={{ maxHeight:460, overflowY:'auto' }}>
              <table className="data-table">
                <thead><tr><th>Name</th><th>Sector</th></tr></thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize:13 }}>{c.name}</td>
                      <td><span className="tag tag-tech" style={{ fontSize:10 }}>{c.sector}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Price update tab */}
      {activeTab === 'price' && (
        <div style={{ maxWidth:480 }}>
          <div className="card">
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <RefreshCw size={16} color="var(--accent)"/>
              <div className="card-title" style={{ marginBottom:0 }}>Update Stock Price</div>
            </div>
            <form onSubmit={handleUpdatePrice}>
              <div className="input-group">
                <label className="input-label">Stock Symbol</label>
                <input className="input-field" type="text" placeholder="e.g. RELIANCE"
                  value={priceUpdate.symbol} onChange={e => setPriceUpdate({...priceUpdate, symbol: e.target.value.toUpperCase()})} required />
              </div>
              <div className="input-group">
                <label className="input-label">New Price (₹)</label>
                <input className="input-field" type="number" step="0.01" min="0.01" placeholder="2500.00"
                  value={priceUpdate.price} onChange={e => setPriceUpdate({...priceUpdate, price: e.target.value})} required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', justifyContent:'center' }}>
                <RefreshCw size={14}/> {loading ? 'Updating...' : 'Update Price'}
              </button>
            </form>
            <div style={{ marginTop:20 }}>
              <div className="card-title" style={{ marginBottom:12 }}>Quick reference</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {stocks.slice(0,8).map(s => (
                  <button key={s.id} className="btn btn-outline btn-sm"
                    onClick={() => setPriceUpdate({ symbol: s.symbol, price: s.current_price })}>
                    {s.symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
