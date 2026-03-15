import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, CheckCircle } from 'lucide-react';

const perks = [
  '₹10,000 simulated starter balance',
  'Real-time stock price simulation',
  'Advanced portfolio analytics',
  'Compete on the global leaderboard',
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await api.post('/register', form);
      login(res.data);
      toast.success('Account created! Welcome to TradeSphere X 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div style={{
        flex: 1, background: 'linear-gradient(135deg, #080c14 0%, #0d1524 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: 40
      }}>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.06 }}>
          <defs>
            <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00d4aa" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
        </svg>
        <div style={{ position:'absolute', width:350, height:350, background:'radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)', top:'15%', right:'5%', borderRadius:'50%' }}/>

        <div style={{ position:'relative', maxWidth:380 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
            <div className="logo-icon" style={{ width:52, height:52, borderRadius:14 }}>
              <Zap size={26} color="#000" strokeWidth={2.5}/>
            </div>
            <span style={{ fontSize:22, fontWeight:800, background:'linear-gradient(135deg,#fff,var(--accent))',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>TradeSphere X</span>
          </div>

          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:12, lineHeight:1.2 }}>
            Start Your<br/>Trading Journey
          </h2>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:32 }}>
            Join thousands of investors already trading on the platform
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {perks.map((p, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <CheckCircle size={16} color="var(--accent)"/>
                <span style={{ fontSize:14, color:'var(--text-secondary)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width:480, display:'flex', alignItems:'center', justifyContent:'center',
        padding:40, background:'var(--bg-secondary)', borderLeft:'1px solid var(--border)' }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          <div style={{ marginBottom:28 }}>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Get your free trading account in seconds</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input-field" type="text" placeholder="John Doe"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input-field" type="email" placeholder="john@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Phone (optional)</label>
              <input className="input-field" type="tel" placeholder="+91 9876543210"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="input-field" type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters" style={{ paddingRight:40 }}
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:15, marginTop:4 }}>
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, color:'var(--text-secondary)', fontSize:14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
