import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg-primary)', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
      Loading TradeSphere X...
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}
