import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, sub, change, icon: Icon, color, mono = true }) {
  const isPositive = typeof change === 'number' ? change >= 0 : null;
  return (
    <div className="card card-glow" style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div className="card-title">{title}</div>
        {Icon && (
          <div style={{
            width: 36, height: 36,
            background: `${color || 'var(--accent-dim)'}`,
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon size={18} color={color ? '#fff' : 'var(--accent)'} />
          </div>
        )}
      </div>
      <div className="card-value" style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)' }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        {change !== undefined && (
          <>
            {isPositive ? <TrendingUp size={13} color="var(--green)" /> : <TrendingDown size={13} color="var(--red)" />}
            <span className={isPositive ? 'badge-up' : 'badge-down'}>
              {isPositive ? '+' : ''}{typeof change === 'number' ? change.toFixed(2) : change}%
            </span>
          </>
        )}
        {sub && <span className="card-sub" style={{ marginLeft: change !== undefined ? 0 : 0 }}>{sub}</span>}
      </div>
    </div>
  );
}
