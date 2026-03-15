import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, ShoppingCart, PieChart,
  History, Trophy, Shield, LogOut, Zap
} from 'lucide-react';

const navItems = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/market', icon: TrendingUp, label: 'Market' },
    { to: '/trade', icon: ShoppingCart, label: 'Trade' },
  ]},
  { section: 'Analytics', items: [
    { to: '/portfolio', icon: PieChart, label: 'Portfolio' },
    { to: '/transactions', icon: History, label: 'Transactions' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ]},
  { section: 'Admin', items: [
    { to: '/admin', icon: Shield, label: 'Admin Panel' },
  ]},
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={18} color="#000" strokeWidth={2.5} />
        </div>
        <span className="logo-text">TradeSphere X</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '16px 10px', borderTop: '1px solid var(--border)' }}>
        <div
          className="nav-item"
          onClick={() => { logout(); navigate('/login'); }}
          style={{ color: 'var(--red)' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </div>
      </div>
    </aside>
  );
}
