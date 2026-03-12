import React, { useEffect, useState } from 'react';
import { subscribeProducts, subscribeTransactions } from '../../firebase/services';
import { format } from 'date-fns';
import {
  TrendingUp, Package, AlertTriangle, ShoppingBag,
  ArrowUpRight, Clock, DollarSign, Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const unsub1 = subscribeProducts(setProducts);
    const unsub2 = subscribeTransactions(setTransactions);
    return () => { unsub1(); unsub2(); };
  }, []);

  const todayTx = transactions.filter(t => t.date === today);
  const todaySales = todayTx.reduce((sum, t) => sum + (t.total || 0), 0);
  const lowStock = products.filter(p => p.stock <= 5);
  const recentTx = transactions.slice(0, 5);

  // Last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = format(d, 'yyyy-MM-dd');
    const total = transactions.filter(t => t.date === key).reduce((s, t) => s + (t.total || 0), 0);
    return { day: format(d, 'EEE'), total, key };
  });

  const stats = [
    { label: "Today's Sales", value: `₦${todaySales.toLocaleString()}`, sub: `${todayTx.length} transactions`, icon: DollarSign, color: 'cyan', gradient: 'linear-gradient(135deg, #00d4ff, #0099cc)' },
    { label: 'Total Products', value: products.length, sub: 'In catalog', icon: Package, color: 'emerald', gradient: 'linear-gradient(135deg, #00e5a0, #00b37a)' },
    { label: 'Low Stock', value: lowStock.length, sub: 'Items need restock', icon: AlertTriangle, color: 'amber', gradient: 'linear-gradient(135deg, #ffb800, #cc9200)' },
    { label: 'All Transactions', value: transactions.length, sub: 'Total records', icon: ShoppingBag, color: 'rose', gradient: 'linear-gradient(135deg, #ff4d6d, #cc3a54)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '26px', margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')} · Business Overview
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {stats.map((s, i) => (
          <div key={i} className={`glass-card stat-card glow-${s.color}`} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: s.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color="#050b14" strokeWidth={2.5} />
              </div>
              <ArrowUpRight size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ fontFamily: 'Syne', fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '6px' }}>
              {s.value}
            </div>
            <div style={{ fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Sales Chart */}
        <div className="glass-card" style={{ padding: '24px', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Sales – Last 7 Days
            </h2>
            <span className="badge badge-cyan">
              <TrendingUp size={10} /> Weekly
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7} barSize={28}>
              <XAxis dataKey="day" tick={{ fill: '#7aa8d4', fontSize: 11, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontFamily: 'DM Sans', fontSize: '13px' }}
                formatter={(v) => [`₦${v.toLocaleString()}`, 'Sales']}
                labelStyle={{ color: 'var(--text-secondary)' }}
                itemStyle={{ color: 'var(--accent-cyan)' }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {last7.map((e, i) => (
                  <Cell key={i} fill={e.key === today ? '#00d4ff' : 'rgba(0,212,255,0.25)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: '16px', fontWeight: 700, margin: 0 }}>Low Stock Alerts</h2>
            {lowStock.length > 0 && (
              <span className="badge badge-amber">
                <AlertTriangle size={10} /> {lowStock.length} items
              </span>
            )}
          </div>
          {lowStock.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <Package size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <p style={{ fontSize: '13px', margin: 0 }}>All products well stocked</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lowStock.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.12)', borderRadius: '10px' }}>
                  <div>
                    <p style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 600, margin: '0 0 2px', color: 'var(--text-primary)' }}>{p.name}</p>
                    <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)' }}>{p.category}</p>
                  </div>
                  <span className="badge badge-amber">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="glass-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: '16px', fontWeight: 700, margin: 0 }}>Recent Transactions</h2>
            <span className="badge badge-muted"><Clock size={10} /> Latest 5</span>
          </div>
          {recentTx.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <ShoppingBag size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <p style={{ fontSize: '13px', margin: 0 }}>No transactions yet</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Items</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ fontFamily: 'Syne', fontSize: '12px', color: 'var(--accent-cyan)' }}>#{tx.id.slice(-6).toUpperCase()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{tx.items?.length || 0} items</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{tx.customerName || 'Walk-in'}</td>
                    <td><span className="badge badge-emerald">{tx.paymentMethod || 'Cash'}</span></td>
                    <td style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--accent-emerald)' }}>₦{(tx.total || 0).toLocaleString()}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), 'HH:mm') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
