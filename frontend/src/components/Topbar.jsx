import React, { useState } from 'react';
import { Wallet, Bell, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Topbar({ title }) {
  const { user, updateWallet } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || isNaN(amount) || amount <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      const res = await api.post('/deposit', { amount: parseFloat(amount) });
      updateWallet(res.data.wallet_balance);
      toast.success(`₹${amount} deposited!`);
      setShowDeposit(false);
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Deposit failed');
    }
    setLoading(false);
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">{title}</h1>
        </div>
        <div className="topbar-right">
          <div className="wallet-chip" onClick={() => setShowDeposit(true)}>
            <Wallet size={14} />
            ₹{user?.wallet ? Number(user.wallet).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
            <Plus size={12} />
          </div>
          <div style={{ position: 'relative' }}>
            <Bell size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
            <div className="notif-dot" />
          </div>
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      {showDeposit && (
        <div className="modal-overlay" onClick={() => setShowDeposit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 6, fontSize: 20 }}>💰 Add Funds</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Simulate a wallet deposit to your account
            </p>
            <div className="input-group">
              <label className="input-label">Amount (₹)</label>
              <input
                className="input-field"
                type="number"
                placeholder="10000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[1000, 5000, 10000, 25000].map(v => (
                <button
                  key={v}
                  className="btn btn-outline btn-sm"
                  onClick={() => setAmount(v)}
                >
                  +{v}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-primary" onClick={handleDeposit} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Processing...' : 'Deposit'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowDeposit(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
