import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/login', form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div style={{
        flex: 1, background: 'linear-gradient(135deg, #080c14 0%, #0d1524 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: 40
      }}>
        {/* Animated grid background */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00d4aa" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Glow orbs */}
        <div style={{ position:'absolute', width:300, height:300, background:'radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 70%)', top:'20%', left:'10%', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', width:200, height:200, background:'radial-gradient(circle, rgba(33,150,243,0.1) 0%, transparent 70%)', bottom:'20%', right:'15%', borderRadius:'50%' }}/>

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:32 }}>
            <div className="logo-icon" style={{ width:52, height:52, borderRadius:14, fontSize:24 }}>
              <Zap size={26} color="#000" strokeWidth={2.5}/>
            </div>
          </div>
          <h1 style={{ fontSize:42, fontWeight:800, lineHeight:1.1, marginBottom:16,
            background:'linear-gradient(135deg, #fff 30%, var(--accent))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Trade Smarter.<br/>Grow Faster.
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:15, lineHeight:1.7, marginBottom:40 }}>
            TradeSphere X gives you real-time simulated trading with professional-grade analytics.
          </p>
          {/* Fake mini chart */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>RELIANCE</span>
              <span style={{ fontSize:12, color:'var(--accent)', fontFamily:'var(--font-mono)' }}>+2.41%</span>
            </div>
            <svg viewBox="0 0 200 60" style={{ width:'100%' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#00d4aa" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,50 L20,42 L40,46 L60,35 L80,38 L100,28 L120,32 L140,20 L160,24 L180,12 L200,8"
                fill="none" stroke="#00d4aa" strokeWidth="2"/>
              <path d="M0,50 L20,42 L40,46 L60,35 L80,38 L100,28 L120,32 L140,20 L160,24 L180,12 L200,8 L200,60 L0,60Z"
                fill="url(#chartGrad)"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ width:480, display:'flex', alignItems:'center', justifyContent:'center',
        padding:40, background:'var(--bg-secondary)', borderLeft:'1px solid var(--border)' }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          <div style={{ marginBottom:32 }}>
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to your TradeSphere X account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input-field" type="email" placeholder="investor@tradesphere.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="input-field" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" style={{ paddingRight:40 }}
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:15, marginTop:8 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:24, color:'var(--text-secondary)', fontSize:14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>
              Create Account
            </Link>
          </p>

          <div style={{ marginTop:32, padding:16, background:'var(--bg-elevated)',
            borderRadius:10, border:'1px solid var(--border)', fontSize:12, color:'var(--text-muted)' }}>
            <strong style={{ color:'var(--text-secondary)' }}>Demo credentials:</strong><br/>
            Register a new account to get ₹10,000 starter balance
          </div>
        </div>
      </div>
    </div>
  );
}
